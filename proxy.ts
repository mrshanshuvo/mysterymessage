import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  const isAuthPage =
    pathname === "/" ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/verify");

  const isDashboard = pathname.startsWith("/dashboard");

  // logged-in user should not visit auth pages
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // logged-out user should not visit dashboard
  if (!token && isDashboard) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // allow normal request
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/sign-in", "/sign-up", "/verify/:path*", "/dashboard/:path*"],
};
