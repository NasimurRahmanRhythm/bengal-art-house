import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Keeps the Supabase session cookie fresh on every request so client
// components (AuthContext) and server components see a valid session
// instead of one that silently expired.
export async function middleware(request: NextRequest) {
  const { response } = await updateSession(request);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
