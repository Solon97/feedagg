import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // Skip middleware for static assets
  if (
    url.pathname.startsWith("/_next/static") ||
    url.pathname.startsWith("/_next/image") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".jpeg") ||
    url.pathname.endsWith(".gif") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".woff") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".ttf") ||
    url.pathname.endsWith(".eot")
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  // Security: Check for tokens in URL and redirect to clean version
  const hasTokensInQuery =
    url.searchParams.has("access_token") ||
    url.searchParams.has("refresh_token") ||
    url.searchParams.has("id_token") ||
    url.searchParams.has("code");

  // If tokens are found in URL, redirect to auth callback to handle them securely
  // But only if we're not already on the callback page
  if (hasTokensInQuery && !url.pathname.startsWith("/auth/callback")) {
    // Preserve the tokens in the redirect to callback page
    const callbackUrl = new URL("/auth/callback", request.url);
    // Copy all search parameters to callback URL
    url.searchParams.forEach((value, key) => {
      callbackUrl.searchParams.set(key, value);
    });
    return NextResponse.redirect(callbackUrl);
  }

  // Add Cache-Control headers for API routes to prevent caching of authenticated responses
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // Default: no caching for API routes
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );

    // Allow caching only for specific public endpoints
    const publicEndpoints = ["/api/stripe/prices"];
    const isPublic = publicEndpoints.some(
      (endpoint) => request.nextUrl.pathname === endpoint
    );

    if (isPublic && request.method === "GET") {
      response.headers.set(
        "Cache-Control",
        "public, s-maxage=300, stale-while-revalidate=600"
      );
    }
  }

  // Add security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sw.js (service worker)
     * - manifest.webmanifest
     * - robots.txt, sitemap.xml
     * - Static assets (.css, .js, .png, etc.)
     */
    "/((?!api/|_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|robots.txt|sitemap.xml).*)$",
  ],
};
