import { useRouter } from "next/navigation";
import { cleanCurrentUrl, urlContainsTokens } from "@/lib/url-security";
import { logger } from "@/lib/logger";

/**
 * Hook for secure handling of OAuth redirects and URL cleaning
 * This ensures tokens never remain visible in the browser URL or history
 */
export function useSecureAuth() {
  const router = useRouter();

  return {
    /**
     * Navigate to a route while ensuring the current URL is clean
     */
    navigateSecure: (path: string) => {
      if (
        typeof window !== "undefined" &&
        urlContainsTokens(window.location.href)
      ) {
        cleanCurrentUrl();
      }
      router.push(path);
    },

    /**
     * Replace current route while ensuring the URL is clean
     */
    replaceSecure: (path: string) => {
      if (
        typeof window !== "undefined" &&
        urlContainsTokens(window.location.href)
      ) {
        cleanCurrentUrl();
      }
      router.replace(path);
    },
  };
}
