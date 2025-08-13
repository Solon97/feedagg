import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { cleanCurrentUrl, urlContainsTokens } from "@/lib/url-security";
import { logger } from "@/lib/logger";

/**
 * Hook for secure handling of OAuth redirects and URL cleaning
 * This ensures tokens never remain visible in the browser URL or history
 */
export function useSecureAuth() {
  const router = useRouter();

  useEffect(() => {
    // Clean URLs on mount and when location changes
    const handleUrlSecurity = () => {
      if (
        typeof window !== "undefined" &&
        urlContainsTokens(window.location.href)
      ) {
        logger.info("Security: Cleaning tokens from URL");
        cleanCurrentUrl();
      }
    };

    // Clean immediately
    handleUrlSecurity();

    // Listen for navigation events
    const handleNavigation = () => handleUrlSecurity();

    // Clean on popstate (back/forward navigation)
    window.addEventListener("popstate", handleNavigation);

    // Clean on pushstate/replacestate (programmatic navigation)
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      originalPushState.apply(this, args);
      setTimeout(handleUrlSecurity, 0);
    };

    window.history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      setTimeout(handleUrlSecurity, 0);
    };

    // Cleanup
    return () => {
      window.removeEventListener("popstate", handleNavigation);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  return {
    /**
     * Navigate to a route while ensuring the current URL is clean
     */
    navigateSecure: (path: string) => {
      cleanCurrentUrl();
      router.push(path);
    },

    /**
     * Replace current route while ensuring the URL is clean
     */
    replaceSecure: (path: string) => {
      cleanCurrentUrl();
      router.replace(path);
    },
  };
}
