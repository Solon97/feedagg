"use client";
import { Workbox } from "workbox-window";

const isProd = process.env.NODE_ENV === "production";
const disabled =
  typeof process !== "undefined" &&
  (process.env.NEXT_PUBLIC_PWA_DISABLE === "1" ||
    process.env.NEXT_PUBLIC_PWA_DISABLE === "true");

// Aggressive cache cleanup function
async function clearAllCaches() {
  try {
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(async (cacheName) => {
          await caches.delete(cacheName);
        })
      );
    }
  } catch (error) {
    // Silent error handling
  }
}

// Force hard refresh with cache bypass
function forceHardRefresh() {
  // Clear local/session storage if needed
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch (error) {
    // Silent error handling
  }

  // Multiple reload strategies for maximum effectiveness
  if ("location" in window) {
    // Method 1: location.replace with cache buster
    const url = new URL(window.location.href);
    url.searchParams.set("_swupdate", Date.now().toString());
    window.location.replace(url.toString());
  }
}

export function registerSW(onUpdate?: (refresh: () => void) => void) {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  if (!isProd || disabled) return;

  // Support basePath via NEXT_PUBLIC_BASE_PATH
  const basePath =
    process.env.NEXT_PUBLIC_BASE_PATH &&
    process.env.NEXT_PUBLIC_BASE_PATH !== "/"
      ? process.env.NEXT_PUBLIC_BASE_PATH!.startsWith("/")
        ? process.env.NEXT_PUBLIC_BASE_PATH!
        : "/" + process.env.NEXT_PUBLIC_BASE_PATH!
      : "";

  const swUrl = `${basePath}/sw.js`;
  const wb = new Workbox(swUrl);

  // Enhanced refresh function with cache clearing
  const createRefreshFunction = () => async () => {
    try {
      // Step 1: Clear all caches first
      await clearAllCaches();

      // Step 2: Message skip waiting to new SW
      wb.addEventListener("controlling", () => {
        forceHardRefresh();
      });

      // Step 3: Activate new service worker
      wb.messageSkipWaiting();
    } catch (error) {
      // Fallback: force refresh anyway
      setTimeout(forceHardRefresh, 1000);
    }
  };

  // Handle waiting SW (most common case)
  wb.addEventListener("waiting", () => {
    onUpdate?.(createRefreshFunction());
  });

  // Handle external waiting SW (corrected event name)
  wb.addEventListener("waiting", () => {
    onUpdate?.(createRefreshFunction());
  });

  // Additional: Handle SW updates that might not trigger waiting
  wb.addEventListener("installed", (event) => {
    if (!event.isUpdate) return;
    onUpdate?.(createRefreshFunction());
  });

  // Register and start periodic checks
  wb.register().then(() => {
    // Periodic check for updates (every 30 seconds)
    setInterval(async () => {
      try {
        if ("serviceWorker" in navigator) {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            await registration.update();
          }
        }
      } catch (error) {
        // Silent error handling
      }
    }, 30000);
  });
}
