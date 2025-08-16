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
      console.log("🧹 Clearing caches:", cacheNames);
      await Promise.all(
        cacheNames.map(async (cacheName) => {
          await caches.delete(cacheName);
          console.log(`🗑️ Deleted cache: ${cacheName}`);
        })
      );
    }
  } catch (error) {
    console.error("Failed to clear caches:", error);
  }
}

// Force hard refresh with cache bypass
function forceHardRefresh() {
  console.log("🔄 Force hard refresh with cache bypass");
  // Clear local/session storage if needed
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch (error) {
    console.warn("Could not clear storage:", error);
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
    console.log("🚀 Starting SW update with cache cleanup...");

    try {
      // Step 1: Clear all caches first
      await clearAllCaches();

      // Step 2: Message skip waiting to new SW
      wb.addEventListener("controlling", () => {
        console.log("✅ New SW is controlling, doing hard refresh...");
        forceHardRefresh();
      });

      // Step 3: Activate new service worker
      wb.messageSkipWaiting();
    } catch (error) {
      console.error("SW update failed:", error);
      // Fallback: force refresh anyway
      setTimeout(forceHardRefresh, 1000);
    }
  };

  // Handle waiting SW (most common case)
  wb.addEventListener("waiting", () => {
    console.log("🔄 SW waiting detected");
    onUpdate?.(createRefreshFunction());
  });

  // Handle external waiting SW (corrected event name)
  wb.addEventListener("waiting", () => {
    console.log("🔄 External SW waiting detected");
    onUpdate?.(createRefreshFunction());
  });

  // Additional: Handle SW updates that might not trigger waiting
  wb.addEventListener("installed", (event) => {
    if (!event.isUpdate) return;
    console.log("🆕 SW installed (update detected)");
    onUpdate?.(createRefreshFunction());
  });

  // Register and start periodic checks
  wb.register().then(() => {
    console.log("✅ SW registered successfully");

    // Periodic check for updates (every 30 seconds)
    setInterval(async () => {
      try {
        if ("serviceWorker" in navigator) {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            console.log("🔍 Checking for SW updates...");
            await registration.update();
          }
        }
      } catch (error) {
        console.warn("SW update check failed:", error);
      }
    }, 30000);
  });
}
