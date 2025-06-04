import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Public routes that don't require authentication
  const publicRoutes = ["/auth"];
  const isPublicRoute = publicRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  // Auth routes that should redirect if user is already logged in
  const authRoutes = ["/auth"];
  const isAuthRoute = authRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  // Redirect to dashboard if trying to access auth route with active session
  if (isAuthRoute && session) {
    const redirectTo = req.nextUrl.searchParams.get("redirectTo");
    const redirectUrl = redirectTo
      ? new URL(redirectTo, req.url)
      : new URL("/dashboard", req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect to auth if trying to access any route without session (except public routes)
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL("/auth", req.url);
    redirectUrl.searchParams.set("redirectTo", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api/auth (authentication API routes)
     * - api/validate-url (URL validation API)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api/auth|api/validate-url).*)",
  ],
};
