import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { ADMIN_SESSION_COOKIE, sessionIsFresh } from "@/lib/admin/session";

// Keeps the Supabase session cookie fresh on every request so client
// components (AuthContext) and server components see a valid session
// instead of one that silently expired.
//
// It is also where /admin is guarded. Turning an unauthorised request away here
// means the dashboard's JavaScript is never sent to someone who cannot use it —
// the (dashboard) layout repeats the check for anything that slips past the
// matcher below.
export async function middleware(request: NextRequest) {
  const { response, user, supabase } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isAdminArea = pathname === "/admin" || pathname.startsWith("/admin/");
  const isLogin = pathname === "/admin/login";

  if (!isAdminArea || isLogin) return response;

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
