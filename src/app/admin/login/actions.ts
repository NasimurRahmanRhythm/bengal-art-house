"use server";

import { cookies } from "next/headers";
import { createAdminSessionClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ADMIN_SESSION_COOKIE, adminCookieOptions } from "@/lib/admin/session";

// The same answer whether or not the address is an admin. An admin panel that
// says "no such admin" is an admin panel that will tell an attacker which
// addresses are worth attacking, so the reply below is deliberately identical
// for a real admin, a customer, and a typo.
const NEUTRAL = "If that address can sign in, a code is on its way.";

type Result = { ok: boolean; message: string };

function configured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

/** Step one: email a six-digit code, but only to an allowlisted address. */
export async function requestCode(email: string): Promise<Result> {
  const address = email.trim().toLowerCase();
  if (!address.includes("@")) return { ok: false, message: "Enter your email address." };
  if (!configured()) {
    return { ok: false, message: "This site has no database connection configured." };
  }

  // Checked with the service-role key: is_admin_email is deliberately not
  // callable by anon, precisely so the browser can never ask this question.
  const { data: allowed, error } = await createAdminClient().rpc("is_admin_email", {
    check_email: address,
  });

  if (error) return { ok: false, message: error.message };

  // Not on the list: say the same thing, send nothing. Skipping the send is
  // what stops this form from creating accounts for strangers.
  if (!allowed) return { ok: true, message: NEUTRAL };

  const supabase = await createAdminSessionClient();
  const { error: otpError } = await supabase.auth.signInWithOtp({
    email: address,
    // First-time admins have no account yet; the allowlist has already decided
    // they are allowed one, and the handle_new_user trigger stamps the role.
    options: { shouldCreateUser: true },
  });

  if (otpError) return { ok: false, message: otpError.message };
  return { ok: true, message: NEUTRAL };
}

/** Step two: exchange the code for a session and stamp the sign-in window. */
export async function verifyCode(email: string, token: string): Promise<Result> {
  const address = email.trim().toLowerCase();
  const code = token.replace(/\D/g, "");
  if (code.length !== 6) return { ok: false, message: "Enter the six-digit code." };

  const supabase = await createAdminSessionClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email: address,
    token: code,
    type: "email",
  });

  if (error) {
    return {
      ok: false,
      message: /expired|invalid/i.test(error.message)
        ? "That code is wrong or has expired. Ask for a new one."
        : error.message,
    };
  }

  // A signed-in account is not yet an admin account. Someone on the customer
  // side who reached this form would get a valid session here, so the role is
  // checked before the admin stamp is written — and they are signed straight
  // back out if it is not there.
  const userId = data.user?.id;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId ?? "")
    .single();

  if (profile?.role !== "admin") {
    await supabase.auth.signOut({ scope: "local" });
    return { ok: false, message: "That account does not have admin access." };
  }

  const jar = await cookies();
  jar.set(ADMIN_SESSION_COOKIE, String(Date.now()), adminCookieOptions());

  return { ok: true, message: "" };
}

export async function signOutAdmin(): Promise<void> {
  const supabase = await createAdminSessionClient();
  // "local": ends this dashboard session only, not every session the account
  // has open elsewhere.
  await supabase.auth.signOut({ scope: "local" });
  (await cookies()).delete(ADMIN_SESSION_COOKIE);
}
