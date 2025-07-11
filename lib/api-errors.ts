/**
 * Custom error class for external API errors
 * Preserves status code and additional context from external API responses
 */
export class ExternalApiError extends Error {
  public readonly statusCode: number;
  public readonly responseData: any;
  public readonly originalUrl: string;

  constructor(
    message: string,
    statusCode: number,
    responseData?: any,
    originalUrl?: string
  ) {
    super(message);
    this.name = "ExternalApiError";
    this.statusCode = statusCode;
    this.responseData = responseData;
    this.originalUrl = originalUrl || "";

    // Maintains proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ExternalApiError);
    }
  }

  /**
   * Creates an ExternalApiError from a failed fetch response
   */
  static async fromResponse(
    response: Response,
    fallbackMessage: string,
    originalUrl?: string
  ): Promise<ExternalApiError> {
    let responseData: any = {};
    let message = fallbackMessage;

    try {
      responseData = await response.json();
      message = responseData.message || responseData.error || fallbackMessage;
    } catch {
      // If response body is not JSON, use fallback message
      message = fallbackMessage;
    }

    return new ExternalApiError(
      message,
      response.status,
      responseData,
      originalUrl
    );
  }

  /**
   * Returns appropriate HTTP status code for client response
   * Maps external API status codes to appropriate client-facing codes
   */
  getClientStatusCode(): number {
    // Pass through client errors (4xx) as they are usually user-related
    if (this.statusCode >= 400 && this.statusCode < 500) {
      return this.statusCode;
    }

    // Convert server errors (5xx) to 502 Bad Gateway to indicate external service issue
    if (this.statusCode >= 500) {
      return 502;
    }

    // Default to 500 for unknown errors
    return 500;
  }

  /**
   * Returns client-safe error response data
   */
  getClientErrorResponse(): { error: string; details?: any } {
    const response: { error: string; details?: any } = {
      error: this.message,
    };

    // Include additional details for client errors (4xx)
    // These are usually safe to expose as they relate to user input
    if (this.statusCode >= 400 && this.statusCode < 500 && this.responseData) {
      const { message, error, details, ...otherData } = this.responseData;

      if (details) {
        response.details = details;
      } else if (Object.keys(otherData).length > 0) {
        response.details = otherData;
      }
    }

    return response;
  }
}
