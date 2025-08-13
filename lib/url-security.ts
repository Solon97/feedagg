/**
 * Security utility functions for handling URLs and preventing token exposure
 */

/**
 * Removes authentication tokens from URL to prevent exposure in browser history
 * @param url - The URL to clean
 * @returns Clean URL without sensitive parameters
 */
export function cleanTokensFromUrl(url: string): string {
  try {
    const urlObject = new URL(url);

    // Remove hash fragments (where OAuth tokens are typically placed)
    urlObject.hash = "";

    // Remove sensitive query parameters
    const sensitiveParams = [
      "access_token",
      "refresh_token",
      "token_type",
      "expires_in",
      "id_token",
      "state",
      "code",
    ];

    sensitiveParams.forEach((param) => {
      urlObject.searchParams.delete(param);
    });

    return urlObject.toString();
  } catch (error) {
    // If URL parsing fails, return the original URL
    return url;
  }
}

/**
 * Cleans the current browser URL from tokens and updates history
 * This prevents tokens from appearing in browser history or being accidentally shared
 */
export function cleanCurrentUrl(): void {
  if (typeof window !== "undefined") {
    const currentUrl = window.location.href;
    const cleanUrl = cleanTokensFromUrl(currentUrl);

    // Only update history if the URL actually changed
    if (cleanUrl !== currentUrl) {
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }
}

/**
 * Checks if a URL contains authentication tokens
 * @param url - The URL to check
 * @returns True if the URL contains tokens
 */
export function urlContainsTokens(url: string): boolean {
  try {
    const urlObject = new URL(url);

    // Check hash fragment for tokens (OAuth implicit flow)
    const hashContainsTokens =
      urlObject.hash.includes("access_token") ||
      urlObject.hash.includes("refresh_token") ||
      urlObject.hash.includes("id_token");

    // Check query parameters for tokens (OAuth authorization code flow)
    const queryContainsTokens =
      urlObject.searchParams.has("access_token") ||
      urlObject.searchParams.has("refresh_token") ||
      urlObject.searchParams.has("id_token") ||
      urlObject.searchParams.has("code");

    return hashContainsTokens || queryContainsTokens;
  } catch (error) {
    return false;
  }
}
