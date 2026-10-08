import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ADMIN_AUTH_COOKIE } from "@/lib/admin/session";

/** The customer's session on the public site. */
export async function createClient() {
  return client();
}

/** The admin panel's session — a separate cookie, see ADMIN_AUTH_COOKIE.
    Only the admin login actions and checkAdmin() may use this. */
export async function createAdminSessionClient() {
  return client(ADMIN_AUTH_COOKIE);
}

async function client(cookieName?: string) {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      ...(cookieName ? { cookieOptions: { name: cookieName } } : {}),
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // Server Components cannot set cookies; middleware refreshes the session instead.
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}
