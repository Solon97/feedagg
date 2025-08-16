/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Respect basePath if configured via env (NEXT_PUBLIC_BASE_PATH)
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  // Prevent caching of HTML navigations to avoid stale SW issues
  headers: async () => [
    {
      source:
        "/((?!api|_next/static|_next/image|favicon.ico|sw.js|workbox-).*)",
      headers: [
        {
          key: "Cache-Control",
          value: "no-store, must-revalidate",
        },
      ],
    },
  ],
};

export default nextConfig;
