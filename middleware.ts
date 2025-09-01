import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security: Check for tokens in URL and redirect to clean version
  const url = request.nextUrl;
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
    // All API routes require authentication - no public caching
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
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
     */
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|robots.txt|sitemap.xml).*)",
  ],
};
