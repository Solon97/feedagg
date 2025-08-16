/* Build Workbox Service Worker into public/sw.js */
import fs from "node:fs";
import path from "node:path";
import { generateSW } from "workbox-build";

const runtimeBase = process.env.NEXT_PUBLIC_BASE_PATH
  ? process.env.NEXT_PUBLIC_BASE_PATH.startsWith("/")
    ? process.env.NEXT_PUBLIC_BASE_PATH
    : "/" + process.env.NEXT_PUBLIC_BASE_PATH
  : "";

const swDest = path.join(process.cwd(), "public", "sw.js");
const buildId = Date.now().toString();

(async () => {
  const { warnings, count, size, filePaths } = await generateSW({
    swDest,
    globDirectory: "public",
    globPatterns: ["**/*.{js,css,html,svg,png,webp,ico,webmanifest}"],
    additionalManifestEntries: [
      { url: runtimeBase + "/", revision: buildId },
      { url: runtimeBase + "/offline", revision: buildId },
    ],
    skipWaiting: true,
    clientsClaim: true,
    cleanupOutdatedCaches: true,
    // Important: don't use navigateFallback here. We'll handle offline fallback
    // through the NetworkFirst strategy for navigation requests.
    runtimeCaching: [
      // Next.js static assets
      {
        urlPattern: new RegExp("^" + runtimeBase + "/_next/static/"),
        handler: "CacheFirst",
        options: {
          cacheName: "static-v1",
          expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 365 },
          matchOptions: { ignoreVary: true },
        },
      },
      // Google fonts (woff2)
      {
        urlPattern: /https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "static-v1",
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 365 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // Local images and icons
      {
        urlPattern: ({ url }) =>
          url.origin === self.location.origin &&
          /\.(?:png|svg|webp|gif|ico|jpg|jpeg)$/i.test(url.pathname),
        handler: "CacheFirst",
        options: {
          cacheName: "static-v1",
          expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 180 },
        },
      },
      // External images
      {
        urlPattern: /https?:.*\.(?:png|jpg|jpeg|gif|svg|webp)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "img-v1",
          expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
      // HTML navigations (NetworkFirst with shorter cache time)
      {
        urlPattern: ({ request }) => request.mode === "navigate",
        handler: "NetworkFirst",
        options: {
          cacheName: "pages-v1",
          networkTimeoutSeconds: 2,
          expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 },
        },
      },
      // API GETs only (avoid caching authenticated/private responses)
      {
        urlPattern: new Function(
          "{ url, request }",
          "const BASE = " +
            JSON.stringify(runtimeBase) +
            ";\n" +
            'const isApi = url.pathname.startsWith(BASE + "/api/");\n' +
            "if (!isApi) return false;\n" +
            'if (request.method !== "GET") return false;\n' +
            'const hasAuth = request.headers.get("authorization") || request.headers.get("cookie");\n' +
            "return !hasAuth;\n"
        ),
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "api-v1",
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 6 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // External feeds (RSS/Atom/JSON)
      {
        urlPattern: /https?:.*\.(?:rss|atom|xml|json)(\?.*)?$/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "feeds-v1",
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
          cacheableResponse: { statuses: [200] },
        },
      },
    ],
  });

  if (warnings && warnings.length) {
    console.warn("Workbox warnings:", warnings);
  }
  console.log(
    `Generated ${swDest} with ${count} precached entries, total size ${size}.`
  );

  // For Workbox 7.2.0+, offline fallback is handled automatically by the NetworkFirst strategy
  // No need to inject setCatchHandler as it's no longer available in this version

  // Append activation cleanup for old caches by prefix
  const cleanupCode = `\nself.addEventListener('activate', (event) => {\n  const keep = new Set(['static-v1', 'img-v1', 'pages-v1', 'api-v1', 'feeds-v1']);\n  event.waitUntil((async () => {\n    const names = await caches.keys();\n    await Promise.all(names.map((n) => {\n      const keepIt = n.startsWith('workbox-precache') || Array.from(keep).some(k => n.includes(k));\n      if (!keepIt) { return caches.delete(n); }\n    }));\n  })());\n});\n`;
  fs.appendFileSync(swDest, cleanupCode);
})();
