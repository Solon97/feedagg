import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

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
     */
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|robots.txt|sitemap.xml).*)",
  ],
};
