import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "./supabase"
import { logger } from "./logger"
import { randomUUID } from "crypto"

export interface ApiContext {
  requestId: string
  userId?: string
  token: string
  startTime: number
}

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

  try {
    // Log request start
    logger.apiRequest(method, endpoint, requestId, undefined, userAgent, ip)

    // Get and validate authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const duration = Date.now() - startTime
      logger.apiResponse(method, endpoint, 401, duration, requestId)
      logger.authEvent("Missing authorization header", undefined, requestId, false)

      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]

    // Create server-side Supabase client
    const supabase = createServerSupabaseClient()

    // Verify token with Supabase
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      const duration = Date.now() - startTime
      logger.apiResponse(method, endpoint, 401, duration, requestId)
      logger.authEvent("Invalid token", user?.id, requestId, false)
      logger.error(
        "Token validation failed",
        {
          error: authError?.message,
          tokenLength: token.length,
          tokenPrefix: token.substring(0, 20) + "...",
        },
        { requestId },
      )

      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    logger.authEvent("Token validated", user.id, requestId, true)

    // Create context
    const context: ApiContext = {
      requestId,
      userId: user.id,
      token,
      startTime,
    }

    // Execute handler
    const result = await handler(context)

    const duration = Date.now() - startTime
    logger.apiResponse(method, endpoint, 200, duration, requestId, user.id)

    return NextResponse.json(result)
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.apiError(method, endpoint, error, requestId)
    logger.apiResponse(method, endpoint, 500, duration, requestId)

    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function makeExternalApiCall(url: string, options: RequestInit, requestId: string): Promise<Response> {
  const startTime = Date.now()
  const method = options.method || "GET"

  try {
    logger.debug("Making external API call", { url, method }, { requestId })

    const response = await fetch(url, options)
    const duration = Date.now() - startTime

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
    logger.error(
      "External API call error",
      {
        url,
        error: error.message,
        duration,
      },
      { requestId },
    )
    throw error
  }
}
