import type { NextRequest } from "next/server"
import { withApiLogging, makeExternalApiCall } from "@/lib/api-middleware"

const API_BASE_URL = "https://rss-feed-processor.onrender.com"

export async function GET(request: NextRequest) {
  return withApiLogging(request, async (context) => {
    const { requestId, token } = context

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit") || "20"
    const offset = searchParams.get("offset") || "0"
    const sort = searchParams.get("sort") || "published_at"
    const order = searchParams.get("order") || "desc"

    // Make request to external API
    const apiUrl = `${API_BASE_URL}/feed/user-feed-items?limit=${limit}&offset=${offset}&sort=${sort}&order=${order}`
    const response = await makeExternalApiCall(
      apiUrl,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
      requestId,
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || "Failed to fetch feed items")
    }
    
    return response.json()
  })
}
