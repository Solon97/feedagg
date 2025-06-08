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

  // Check if user is authenticated by looking for Supabase session cookies
  const accessToken =
    request.cookies.get("sb-access-token")?.value ||
    request.cookies.get("supabase-access-token")?.value ||
    request.cookies.get("sb-localhost-auth-token")?.value;

  const refreshToken =
    request.cookies.get("sb-refresh-token")?.value ||
    request.cookies.get("supabase-refresh-token")?.value ||
    request.cookies.get("sb-localhost-refresh-token")?.value;

  // More reliable authentication check - look for standard Supabase cookie names
  const sbAccessToken = request.cookies.get("sb-access-token")?.value;
  const sbRefreshToken = request.cookies.get("sb-refresh-token")?.value;

  // Check for development/localhost specific auth tokens
  const sbDevAuthToken =
    request.cookies.get("sb-127-auth-token")?.value ||
    request.cookies.get("sb-localhost-auth-token")?.value;

  // Check for any auth token existence
  const hasAuthTokens = !!(
    accessToken ||
    refreshToken ||
    sbAccessToken ||
    sbRefreshToken ||
    sbDevAuthToken
  );

  // For more accurate check, also look for common Supabase cookie patterns
  const cookieNames = request.cookies.getAll().map((cookie) => cookie.name);
  const hasSupabaseCookies = cookieNames.some(
    (name) =>
      name.includes("supabase") ||
      name.startsWith("sb-") ||
      name.includes("auth-token")
  );

  // Authentication check - accept either production tokens or development tokens
  const isAuthenticated = hasAuthTokens && hasSupabaseCookies;

  // Debug logging in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[Middleware] ${pathname}`);
    console.log(`  - Cookies found:`, cookieNames);
    console.log(`  - Auth tokens:`, {
      accessToken: !!accessToken,
      refreshToken: !!refreshToken,
      sbDevAuthToken: !!sbDevAuthToken,
    });
    console.log(`  - Supabase cookies:`, hasSupabaseCookies);
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
    // If user is definitely authenticated, redirect to dashboard
    if (isAuthenticated) {
      const redirectUrl = request.nextUrl.searchParams.get("redirect");
      const targetUrl =
        redirectUrl && redirectUrl !== "/auth" ? redirectUrl : "/dashboard";
      return NextResponse.redirect(new URL(targetUrl, request.url));
    }
    // Allow access to auth routes for non-authenticated users
    return NextResponse.next();
  }

  // Handle protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const authUrl = new URL("/auth", request.url);
    // Add redirect query param to redirect back after login
    authUrl.searchParams.set("redirect", pathname);

    if (process.env.NODE_ENV === "development") {
      console.log(`  - Redirecting to: ${authUrl.toString()}`);
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
