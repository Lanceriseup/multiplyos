import { NextResponse, type NextRequest } from "next/server";
import { sessionCookieName, verifySessionToken } from "@/lib/admin/session";

/**
 * Guards the admin dashboard. Every /admin page and /api/admin route needs a
 * valid signed session cookie, except the sign-in page and the login/logout
 * routes. Admin responses are never cached or indexed.
 */
const OPEN_PATHS = new Set(["/admin/login", "/api/admin/login", "/api/admin/logout"]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const signedIn = await verifySessionToken(
    request.cookies.get(sessionCookieName())?.value,
    process.env.ADMIN_SESSION_SECRET
  );

  let response: NextResponse;
  if (pathname === "/admin/login" && signedIn) {
    response = NextResponse.redirect(new URL("/admin", request.url));
  } else if (OPEN_PATHS.has(pathname) || signedIn) {
    response = NextResponse.next();
  } else if (pathname.startsWith("/api/")) {
    response = NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  } else {
    response = NextResponse.redirect(new URL("/admin/login", request.url));
  }

  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
