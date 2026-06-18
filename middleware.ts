// middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─── Protected Routes ─────────────────────────────────────────
const protectedRoutes = ["/dashboard"];
const authRoutes = ["/"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // تحقق من وجود Firebase session cookie
  const token =
    request.cookies.get("__session")?.value ||
    request.cookies.get("firebase-auth-token")?.value;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // لو على route محمية ومفيش token — روح للـ home
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/verify-email/:path*"],
};