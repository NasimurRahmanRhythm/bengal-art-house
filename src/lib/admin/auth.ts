import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_SESSION_COOKIE, sessionIsFresh } from "./session";

export type AdminCheck =
  | { ok: true; email: string }
  | { ok: false; reason: "signed-out" | "expired" | "not-admin" };

/**
 * The authoritative check, used by the dashboard layout.
 *
 * Three things all have to hold: a real Supabase session, the admin role on
 * that account, and a sign-in stamp inside the sign-in window. The role is
 * read fresh on every request rather than trusted from the token, so removing
 * someone from the allowlist locks them out on their next click instead of
 * whenever their token happens to expire.
 */
export async function checkAdmin(): Promise<AdminCheck> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, reason: "signed-out" };

  const jar = await cookies();
  if (!sessionIsFresh(jar.get(ADMIN_SESSION_COOKIE)?.value)) {
    return { ok: false, reason: "expired" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { ok: false, reason: "not-admin" };
  return { ok: true, email: user.email ?? "" };
}
