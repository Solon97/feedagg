import { type NextRequest, NextResponse } from "next/server"
import { logger } from "./logger"
import { apiDiagnostics } from "./api-diagnostics"
import { randomUUID } from "crypto"

export interface ApiContext {
  requestId: string
  userId?: string
  token: string
  startTime: number
}

const API_BASE_URL = "https://rss-feed-processor.onrender.com"

export async function withApiLogging<T>(
  request: NextRequest,
  handler: (context: ApiContext) => Promise<T>,
): Promise<NextResponse> {
  const requestId = randomUUID()
  const startTime = Date.now()
  const method = request.method
  const endpoint = request.nextUrl.pathname
  const userAgent = request.headers.get("user-agent") || "Unknown"
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "Unknown"

  // Diagnostic: Request received
  apiDiagnostics.log(requestId, "REQUEST_RECEIVED", true, {
    method,
    endpoint,
    userAgent,
    ip,
    headers: Object.fromEntries(request.headers.entries()),
  })

  try {
    // Log request start
    logger.apiRequest(method, endpoint, requestId, undefined, userAgent, ip)

    // Diagnostic: Checking authorization
    apiDiagnostics.log(requestId, "AUTH_CHECK_START", true)

    // Get and validate authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const duration = Date.now() - startTime

      apiDiagnostics.log(requestId, "AUTH_CHECK_FAILED", false, { authHeader: authHeader ? "present" : "missing" })

      logger.apiResponse(method, endpoint, 401, duration, requestId)
      logger.authEvent("Missing authorization header", undefined, requestId, false)

      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    apiDiagnostics.log(requestId, "TOKEN_EXTRACTED", true, { tokenLength: token.length })

    // Diagnostic: Token validation start
    apiDiagnostics.log(requestId, "TOKEN_VALIDATION_START", true, {
      apiBaseUrl: API_BASE_URL,
      tokenPrefix: token.substring(0, 20) + "...",
    })

    // Validate token with external API
    try {
      const validationStartTime = Date.now()

      const testResponse = await fetch(`${API_BASE_URL}/feed/user-feeds`, {
        method: "HEAD",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(10000), // 10 second timeout
      })

      const validationDuration = Date.now() - validationStartTime

      apiDiagnostics.log(
        requestId,
        "TOKEN_VALIDATION_RESPONSE",
        testResponse.ok,
        {
          status: testResponse.status,
          statusText: testResponse.statusText,
          headers: Object.fromEntries(testResponse.headers.entries()),
        },
        undefined,
        validationDuration,
      )

      if (!testResponse.ok) {
        const duration = Date.now() - startTime

        apiDiagnostics.log(requestId, "TOKEN_VALIDATION_FAILED", false, {
          status: testResponse.status,
          statusText: testResponse.statusText,
        })

        logger.apiResponse(method, endpoint, 401, duration, requestId)
        logger.authEvent("Token validation failed with external API", undefined, requestId, false)
        logger.error(
          "Token validation failed",
          {
            status: testResponse.status,
            statusText: testResponse.statusText,
            tokenLength: token.length,
            tokenPrefix: token.substring(0, 20) + "...",
          },
          { requestId },
        )

        return NextResponse.json(
          {
            error: "Invalid or expired token",
            debug:
              process.env.NODE_ENV === "development"
                ? {
                    externalApiStatus: testResponse.status,
                    externalApiResponse: testResponse.statusText,
                  }
                : undefined,
          },
          { status: 401 },
        )
      }

      apiDiagnostics.log(requestId, "TOKEN_VALIDATION_SUCCESS", true)
      logger.authEvent("Token validated with external API", undefined, requestId, true)
    } catch (validationError: any) {
      const duration = Date.now() - startTime

      apiDiagnostics.log(requestId, "TOKEN_VALIDATION_ERROR", false, undefined, validationError)

      logger.apiResponse(method, endpoint, 401, duration, requestId)
      logger.error("Token validation error", { error: validationError.message }, { requestId })

      return NextResponse.json(
        {
          error: "Token validation failed",
          debug:
            process.env.NODE_ENV === "development"
              ? {
                  validationError: validationError.message,
                  apiBaseUrl: API_BASE_URL,
                }
              : undefined,
        },
        { status: 401 },
      )
    }

    // Create context
    const context: ApiContext = {
      requestId,
      token,
      startTime,
    }

    apiDiagnostics.log(requestId, "HANDLER_EXECUTION_START", true)

    // Execute handler
    const handlerStartTime = Date.now()
    const result = await handler(context)
    const handlerDuration = Date.now() - handlerStartTime

    apiDiagnostics.log(
      requestId,
      "HANDLER_EXECUTION_SUCCESS",
      true,
      {
        resultType: typeof result,
        hasData: !!result,
      },
      undefined,
      handlerDuration,
    )

    const duration = Date.now() - startTime
    logger.apiResponse(method, endpoint, 200, duration, requestId)

    return NextResponse.json(result)
  } catch (error: any) {
    const duration = Date.now() - startTime

    apiDiagnostics.log(requestId, "REQUEST_ERROR", false, undefined, error, duration)

    logger.apiError(method, endpoint, error, requestId)
    logger.apiResponse(method, endpoint, 500, duration, requestId)

    // Enhanced error response for debugging
    const errorResponse = {
      error: error.message || "Internal server error",
      requestId,
      debug:
        process.env.NODE_ENV === "development"
          ? {
              stack: error.stack,
              name: error.name,
              cause: error.cause,
              diagnostics: apiDiagnostics.getDiagnostics(requestId),
            }
          : undefined,
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

export async function makeExternalApiCall(url: string, options: RequestInit, requestId: string): Promise<Response> {
  const startTime = Date.now()
  const method = options.method || "GET"

  apiDiagnostics.log(requestId, "EXTERNAL_API_CALL_START", true, {
    url,
    method,
    headers: options.headers,
  })

  try {
    logger.debug("Making external API call", { url, method }, { requestId })

    // Add timeout and better error handling
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    const duration = Date.now() - startTime

    apiDiagnostics.log(
      requestId,
      "EXTERNAL_API_CALL_RESPONSE",
      response.ok,
      {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url,
      },
      undefined,
      duration,
    )

    logger.externalApiCall(url, method, response.status, duration, requestId)

    if (!response.ok) {
      logger.warn(
        "External API call failed",
        {
          url,
          status: response.status,
          statusText: response.statusText,
        },
        { requestId },
      )
    }

    return response
  } catch (error: any) {
    const duration = Date.now() - startTime

    apiDiagnostics.log(requestId, "EXTERNAL_API_CALL_ERROR", false, { url }, error, duration)

    logger.error(
      "External API call error",
      {
        url,
        error: error.message,
        duration,
        isAbortError: error.name === "AbortError",
        isNetworkError: error.name === "TypeError",
      },
      { requestId },
    )
    throw error
  }
}
