// URL Validation Use Case - Clean Architecture
import { UrlValidator } from "@/lib/url-validator";

export interface UrlValidationResult {
  isValid: boolean;
  type?: "rss" | "youtube";
  error?: string;
  rssUrl?: string;
  preview?: {
    title: string;
    description: string;
    favicon?: string;
  };
}

export interface UrlValidationRequest {
  url: string;
}

export class UrlValidationUseCases {
  /**
   * Validates a URL to determine if it's a valid RSS feed or YouTube channel
   */
  async validateUrl(
    request: UrlValidationRequest
  ): Promise<UrlValidationResult> {
    try {
      if (!request.url?.trim()) {
        return {
          isValid: false,
          error: "URL is required",
        };
      }

      // Use the existing UrlValidator which already has robust validation
      const result = await UrlValidator.validateUrl(request.url);

      return {
        isValid: result.isValid,
        type: result.type as "rss" | "youtube",
        error: result.error,
        rssUrl: result.rssUrl,
        preview: result.preview,
      };
    } catch (error) {
      return {
        isValid: false,
        error:
          error instanceof Error ? error.message : "Unknown validation error",
      };
    }
  }

  /**
   * Validates multiple URLs in batch
   */
  async validateUrls(urls: string[]): Promise<UrlValidationResult[]> {
    return Promise.all(urls.map((url) => this.validateUrl({ url })));
  }

  /**
   * Extracts feed information from a URL without full validation
   */
  async extractFeedInfo(request: UrlValidationRequest): Promise<{
    title?: string;
    description?: string;
    favicon?: string;
  } | null> {
    try {
      const result = await this.validateUrl(request);
      return result.preview || null;
    } catch (error) {
      console.error("Error extracting feed info:", error);
      return null;
    }
  }
}
