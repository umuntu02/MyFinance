import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// ─────────────────────────────────────────────────────────────────────────────
// Route protection (Next.js 16: the `middleware` convention is now `proxy`).
//
// Optimistic guard: if there is no Better Auth session cookie, redirect the
// visitor to /login. This only checks for the cookie's presence (fast, no DB
// hit); the real session validation still happens server-side in the route
// handlers and Server Components. /login and /register are NOT matched here,
// so they stay reachable without a session.
// ─────────────────────────────────────────────────────────────────────────────
export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // All authenticated (app) routes. "/" is included because app/page.tsx
  // redirects to /dashboard. Auth pages, /api, and static assets are excluded.
  matcher: [
    "/",
    "/dashboard/:path*",
    "/income/:path*",
    "/expenses/:path*",
    "/savings-goals/:path*",
    "/monthly-report/:path*",
    "/categories/:path*",
    "/settings/:path*",
  ],
};
