import { type NextRequest, NextResponse } from "next/server"
import { apiDiagnostics } from "@/lib/api-diagnostics"
import { logger } from "@/lib/logger"

const API_BASE_URL = "https://rss-feed-processor.onrender.com"

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Test external API connectivity
    const externalApiTest = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    }).catch((error) => ({
      ok: false,
      status: 0,
      statusText: error.message,
      error: error.name,
    }))

    // Test with a dummy token to see auth behavior
    const authTest = await fetch(`${API_BASE_URL}/feed/user-feeds`, {
      method: "HEAD",
      headers: {
        Authorization: "Bearer dummy-token",
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(5000),
    }).catch((error) => ({
      ok: false,
      status: 0,
      statusText: error.message,
      error: error.name,
    }))

    const duration = Date.now() - startTime
    const recentErrors = apiDiagnostics.getLastErrors(5)

    const healthData = {
      status: "ok",
      timestamp: new Date().toISOString(),
      duration,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        apiBaseUrl: API_BASE_URL,
      },
      externalApi: {
        baseUrl: API_BASE_URL,
        healthCheck: {
          status: externalApiTest.status || 0,
          ok: externalApiTest.ok,
          statusText: externalApiTest.statusText,
          error: externalApiTest.error,
        },
        authTest: {
          status: authTest.status || 0,
          ok: authTest.ok,
          statusText: authTest.statusText,
          error: authTest.error,
          expectedStatus: 401, // We expect 401 with dummy token
        },
      },
      diagnostics: {
        recentErrorCount: recentErrors.length,
        recentErrors: recentErrors.map((error) => ({
          timestamp: error.timestamp,
          step: error.step,
          error: error.error?.message,
        })),
      },
    }

    logger.info("Health check completed", healthData)

    return NextResponse.json(healthData)
  } catch (error: any) {
    const duration = Date.now() - startTime

    logger.error("Health check failed", { error: error.message, duration })

    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        duration,
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
