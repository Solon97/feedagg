import { type NextRequest, NextResponse } from "next/server"
import { logger } from "./logger"

interface ApiContext {
  requestId: string
  token: string
  userId?: string
}

export async function withApiLogging<T>(
  request: NextRequest,
  handler: (context: ApiContext) => Promise<T>,
): Promise<NextResponse> {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()

  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.apiError(
        request.method,
        request.nextUrl.pathname,
        new Error("Missing or invalid authorization header"),
        requestId,
      )
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const userAgent = request.headers.get("user-agent") || ""
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    logger.apiRequest(request.method, request.nextUrl.pathname, requestId, undefined, userAgent, ip)

    const context: ApiContext = {
      requestId,
      token,
    }

    const result = await handler(context)
    const duration = Date.now() - startTime

    logger.apiResponse(request.method, request.nextUrl.pathname, 200, duration, requestId)

    // If result is already a Response, return it directly
    if (result instanceof Response || result instanceof NextResponse) {
      return result as NextResponse
    }

    return NextResponse.json(result)
  } catch (error) {
    const duration = Date.now() - startTime
    logger.apiError(request.method, request.nextUrl.pathname, error, requestId)

    const statusCode = error instanceof Error && error.message.includes("Unauthorized") ? 401 : 500
    const errorMessage = error instanceof Error ? error.message : "Internal server error"

    logger.apiResponse(request.method, request.nextUrl.pathname, statusCode, duration, requestId)

    return NextResponse.json(
      {
        error: errorMessage,
        requestId,
      },
      { status: statusCode },
    )
  }
}

export async function makeExternalApiCall(
  url: string,
  options: RequestInit = {},
  requestId: string,
): Promise<Response> {
  const startTime = Date.now()

  try {
    logger.info(`Making external API call to: ${url}`, undefined, { requestId })

    const response = await fetch(url, {
      ...options,
      headers: {
        "User-Agent": "FeedAgg/1.0",
        ...options.headers,
      },
    })

    const duration = Date.now() - startTime
    logger.externalApiCall(url, options.method || "GET", response.status, duration, requestId)

    return response
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error(`External API call failed: ${url}`, error, { requestId, duration })
    throw error
  }
}
