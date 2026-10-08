// The sign-in window, and nothing else.
//
// Kept free of next/headers and of any Supabase import on purpose: middleware
// runs on the edge runtime and the sign-in page runs in the browser, and both
// need these values. checkAdmin() — the part that actually reads a session —
// lives in auth.ts, which only the dashboard layout imports.

// Supabase's own refresh token outlives this by a long way, so the window is
// enforced here rather than there: the cookie is stamped once, at the moment
// the code is accepted, and never renewed by activity. The admin is signed out
// this many days after signing in whether they have been using the panel or
// not — which is the point of a fixed window, and why it is not a rolling one.
//
// Every number and every line of copy that mentions the window reads from here,
// so changing it is a one-line change.
export const ADMIN_SESSION_DAYS = 14;

/** The admin panel's own Supabase session cookie.
 *
 *  The public site keeps Supabase's default cookie (sb-<project>-auth-token);
 *  the admin panel stores its session under this name instead. Two cookies,
 *  two independent sign-ins: signing in to the dashboard does not sign anyone
 *  in on the shop, and a customer's session on the shop is never read by the
 *  dashboard — even when both happen in the same browser. */
export const ADMIN_AUTH_COOKIE = "gh-admin-auth";
export const ADMIN_SESSION_COOKIE = "gh_admin_since";
export const ADMIN_SESSION_MAX_AGE = ADMIN_SESSION_DAYS * 24 * 60 * 60;

export function adminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  };
}

/** True while the stamp is present and inside the window. */
export function sessionIsFresh(startedAt: string | undefined): boolean {
  if (!startedAt) return false;
  const started = Number(startedAt);
  if (!Number.isFinite(started)) return false;
  return Date.now() - started < ADMIN_SESSION_MAX_AGE * 1000;
}
