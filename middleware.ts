import { NextRequest, NextResponse } from "next/server";

// Routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/feeds",
  "/news",
  "/saved-content",
  "/settings",
  "/content",
  "/api/content-items",
  "/api/content-sources",
  "/api/saved-content",
  "/api/profile",
];

// Routes that should redirect authenticated users away
const authRoutes = ["/auth"];

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/session",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/refresh",
  "/api/validate-url",
];

function checkAuthentication(request: NextRequest): boolean {
  const cookies = request.cookies;

  // Check for standard Supabase authentication cookies
  const sbAccessToken = cookies.get("sb-access-token")?.value;
  const sbRefreshToken = cookies.get("sb-refresh-token")?.value;

  // Validate that we have both access and refresh tokens for a complete session
  const isAuthenticated = !!(sbAccessToken && sbRefreshToken);

  if (process.env.NODE_ENV === "development") {
    console.log(`[Middleware] Auth check:`, {
      hasAccessToken: !!sbAccessToken,
      hasRefreshToken: !!sbRefreshToken,
      isAuthenticated,
    });
  }

  return isAuthenticated;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and internal Next.js routes
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/_") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const isAuthenticated = checkAuthentication(request);
  // Debug logging in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[Middleware] ${pathname}`);
    console.log(`  - Is authenticated:`, isAuthenticated);
  }

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if current route is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Check if current route is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route)
  );

  // Handle auth route logic first
  if (isAuthRoute) {
    // If user is authenticated, redirect to dashboard
    if (isAuthenticated) {
      const redirectUrl = request.nextUrl.searchParams.get("redirect");
      const targetUrl =
        redirectUrl && redirectUrl !== "/auth" ? redirectUrl : "/dashboard";
      return NextResponse.redirect(new URL(targetUrl, request.url));
    }
    // Allow access to auth routes for non-authenticated users
    return NextResponse.next();
  }

  // Handle protected routes - redirect to auth if not authenticated
  if (isProtectedRoute && !isAuthenticated) {
    const authUrl = new URL("/auth", request.url);
    // Add redirect query param to redirect back after login
    authUrl.searchParams.set("redirect", pathname);

    if (process.env.NODE_ENV === "development") {
      console.log(
        `  - Redirecting unauthenticated user to: ${authUrl.toString()}`
      );
    }

    return NextResponse.redirect(authUrl);
  }

  // For API routes, return 401 if not authenticated and route is protected
  if (pathname.startsWith("/api/") && isProtectedRoute && !isAuthenticated) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  // Allow access to public routes and authenticated users to protected routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
