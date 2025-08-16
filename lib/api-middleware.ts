import { type NextRequest, NextResponse } from "next/server";
import { logger } from "./logger";
import { randomUUID } from "crypto";
import { ExternalApiError } from "./api-errors";

export interface ApiContext {
  requestId: string;
  userId?: string;
  token: string;
  startTime: number;
}

const API_BASE_URL = process.env.EXTERNAL_API_URL;

export async function withApiLogging<T>(
  request: NextRequest,
  handler: (context: ApiContext) => Promise<T>
): Promise<NextResponse> {
  const requestId = randomUUID();
  const startTime = Date.now();
  const method = request.method;
  const endpoint = request.nextUrl.pathname;
  const userAgent = request.headers.get("user-agent") || "Unknown";
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "Unknown";

  try {
    // Log request start
    logger.apiRequest(method, endpoint, requestId, undefined, userAgent, ip);

    // Get and validate authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const duration = Date.now() - startTime;
      logger.apiResponse(method, endpoint, 401, duration, requestId);
      logger.authEvent(
        "Missing authorization header",
        undefined,
        requestId,
        false
      );

      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    // Instead of validating with Supabase here, let's validate by making a test call to the external API
    // This way we use the same validation logic as the external API
    try {
      const testResponse = await fetch(`${API_BASE_URL}/feed/user-feeds`, {
        method: "HEAD", // Use HEAD to avoid getting data, just test auth
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!testResponse.ok) {
        const duration = Date.now() - startTime;
        logger.apiResponse(method, endpoint, 401, duration, requestId);
        logger.authEvent(
          "Token validation failed with external API",
          undefined,
          requestId,
          false
        );
        logger.error(
          "Token validation failed",
          {
            status: testResponse.status,
            statusText: testResponse.statusText,
            tokenLength: token.length,
            tokenPrefix: token.substring(0, 20) + "...",
          },
          { requestId }
        );

        return NextResponse.json(
          { error: "Invalid or expired token" },
          { status: 401 }
        );
      }

      logger.authEvent(
        "Token validated with external API",
        undefined,
        requestId,
        true
      );
    } catch (validationError: any) {
      const duration = Date.now() - startTime;
      logger.apiResponse(method, endpoint, 401, duration, requestId);
      logger.error(
        "Token validation error",
        { error: validationError.message },
        { requestId }
      );
      return NextResponse.json(
        { error: "Token validation failed" },
        { status: 401 }
      );
    }

    // Create context
    const context: ApiContext = {
      requestId,
      token,
      startTime,
    };

    // Execute handler
    const result = await handler(context);

    const duration = Date.now() - startTime;
    logger.apiResponse(method, endpoint, 200, duration, requestId);

    return NextResponse.json(result);
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logger.apiError(method, endpoint, error, requestId);

    // Handle ExternalApiError differently to preserve status codes and details
    if (error instanceof ExternalApiError) {
      const clientStatusCode = error.getClientStatusCode();
      const clientResponse = error.getClientErrorResponse();

      logger.apiResponse(
        method,
        endpoint,
        clientStatusCode,
        duration,
        requestId
      );

      return NextResponse.json(clientResponse, { status: clientStatusCode });
    }

    // Handle all other errors as internal server errors
    logger.apiResponse(method, endpoint, 500, duration, requestId);

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function makeExternalApiCall(
  url: string,
  options: RequestInit,
  requestId: string
): Promise<Response> {
  const startTime = Date.now();
  const method = options.method || "GET";

  try {
    logger.debug("Making external API call", { url, method }, { requestId });

    const response = await fetch(url, options);
    const duration = Date.now() - startTime;

    logger.externalApiCall(url, method, response.status, duration, requestId);

    if (!response.ok) {
      logger.warn(
        "External API call failed",
        {
          url,
          status: response.status,
          statusText: response.statusText,
        },
        { requestId }
      );
    }

    return response;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logger.error(
      "External API call error",
      {
        url,
        error: error.message,
        duration,
      },
      { requestId }
    );
    throw error;
  }
}

/**
 * Helper function to handle external API responses and throw appropriate errors
 * Returns null for empty responses (like DELETE 204), otherwise tries to parse JSON
 * Use this instead of manually checking response.ok and throwing generic errors
 */
export async function handleExternalApiResponse(
  response: Response,
  fallbackErrorMessage: string,
  originalUrl?: string
): Promise<any> {
  if (!response.ok) {
    throw await ExternalApiError.fromResponse(
      response,
      fallbackErrorMessage,
      originalUrl
    );
  }

  if (
    response.status === 204 ||
    response.headers.get("content-length") === "0"
  ) {
    return null;
  }

  return response.json();
}
