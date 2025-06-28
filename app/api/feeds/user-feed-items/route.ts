import type { NextRequest } from "next/server"
import { withApiLogging, makeExternalApiCall } from "@/lib/api-middleware"

const API_BASE_URL = process.env.EXTERNAL_API_URL || "https://rss-feed-processor.onrender.com"

export async function GET(request: NextRequest) {
  return withApiLogging(request, async (context) => {
    const { requestId, token } = context

    try {
      // Get query parameters
      const { searchParams } = new URL(request.url)
      const limit = searchParams.get("limit") || "20"
      const offset = searchParams.get("offset") || "0"
      const sort = searchParams.get("sort") || "published_at"
      const order = searchParams.get("order") || "desc"

      // Get filter parameters
      const title = searchParams.get("title")
      const feed_id = searchParams.get("feed_id")
      const feed_type = searchParams.get("feed_type")

      // Build API URL with all parameters
      const apiParams = new URLSearchParams({
        limit,
        offset,
        sort,
        order,
      })

      // Add filter parameters if they exist
      if (title) apiParams.set("title", title)
      if (feed_id) apiParams.set("feed_id", feed_id)
      if (feed_type) apiParams.set("feed_type", feed_type)

      const apiUrl = `${API_BASE_URL}/feed/user-feed-items?${apiParams.toString()}`

      console.log(`[${requestId}] Making request to:`, apiUrl)

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
        const errorText = await response.text().catch(() => "Unknown error")
        console.error(`[${requestId}] External API error:`, {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        })

        throw new Error(`External API returned ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log(`[${requestId}] External API response:`, {
        itemsCount: data.items?.length || 0,
        total: data.total,
        filtered_total: data.filtered_total,
      })

      return Response.json(data)
    } catch (error) {
      console.error(`[${requestId}] Error in user-feed-items route:`, error)

      return Response.json(
        {
          error: error instanceof Error ? error.message : "Failed to fetch feed items",
          items: [],
          total: 0,
          filtered_total: 0,
        },
        { status: 500 },
      )
    }
  })
}
