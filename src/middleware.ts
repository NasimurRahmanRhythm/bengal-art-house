import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import {
  ADMIN_AUTH_COOKIE,
  ADMIN_SESSION_COOKIE,
  sessionIsFresh,
} from "@/lib/admin/session";

/** The customer's Supabase auth cookies (sb-<project>-auth-token, possibly
    split into .0, .1 … chunks). */
const isSiteAuthCookie = (name: string) => name.startsWith("sb-") && name.includes("-auth-token");

/**
 * Admin sign-ins used to share the customer's session cookie, so signing in
 * to the dashboard also signed the browser in on the shop. A browser that
 * still carries one of those — the admin stamp is there but the admin's own
 * cookie is not — has its old shared session cleared once, so the shop stops
 * showing the admin as a signed-in customer. A real customer never has the
 * admin stamp, and an admin who signed in after this change has the admin
 * cookie, so neither is touched.
 */
function clearLegacyAdminSession(request: NextRequest, response: NextResponse) {
  const cookies = request.cookies.getAll();
  const hasStamp = cookies.some((c) => c.name === ADMIN_SESSION_COOKIE);
  const hasAdminAuth = cookies.some((c) => c.name.startsWith(ADMIN_AUTH_COOKIE));
  if (!hasStamp || hasAdminAuth) return response;

  const redirect = NextResponse.redirect(request.nextUrl);
  for (const c of cookies) {
    if (isSiteAuthCookie(c.name) || c.name === ADMIN_SESSION_COOKIE) {
      redirect.cookies.delete(c.name);
    }
  }
  return redirect;
}

// Keeps the Supabase session cookie fresh on every request so client
// components (AuthContext) and server components see a valid session
// instead of one that silently expired.
//
// It is also where /admin is guarded. Turning an unauthorised request away here
// means the dashboard's JavaScript is never sent to someone who cannot use it —
// the (dashboard) layout repeats the check for anything that slips past the
// matcher below.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminArea = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminApi = pathname.startsWith("/api/admin/");
  const isLogin = pathname === "/admin/login";

  // The admin panel and the shop have separate sessions (see
  // ADMIN_AUTH_COOKIE): each area refreshes, and is guarded by, its own.
  const { response, user, supabase } = await updateSession(request, isAdminArea || isAdminApi);

  if (!isAdminArea) {
    // Page requests only: a redirect answering an API call or a server
    // action would break it, and the next page load does the clean-up anyway.
    const isPage = request.method === "GET" && !pathname.startsWith("/api/");
    return isPage ? clearLegacyAdminSession(request, response) : response;
  }
  if (isLogin) return response;

  const deny = (expired = false) => {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = expired ? "?expired=1" : "";
    return NextResponse.redirect(url);
  };

  if (!user) return deny();

  // The sign-in window. The cookie's own max-age means the browser usually
  // drops it first, so a missing stamp is treated exactly like an old one.
  if (!sessionIsFresh(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) return deny(true);

  // Read fresh rather than trusted from the token: an address removed from the
  // allowlist loses the dashboard on its next click, not whenever the token
  // it was carrying happens to run out.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return deny();

  return response;
}

// api/payment is excluded deliberately. Those four routes are called by
// SSLCommerz, not by a browser: there is no session cookie to refresh, and
// making them wait on a Supabase round trip only adds latency to the leg that
// settles a customer's money.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/payment|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
