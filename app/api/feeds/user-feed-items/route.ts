import { type NextRequest, NextResponse } from "next/server"
import { withApiLogging } from "@/lib/api-middleware"

async function handler(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // Extract all query parameters
  const limit = searchParams.get("limit") || "20"
  const offset = searchParams.get("offset") || "0"
  const sort = searchParams.get("sort") || "published_at"
  const order = searchParams.get("order") || "desc"

  // Extract filter parameters
  const title = searchParams.get("title")
  const feed_id = searchParams.get("feed_id")
  const feed_type = searchParams.get("feed_type")

  // Build query parameters for external API
  const queryParams = new URLSearchParams({
    limit,
    offset,
    sort,
    order,
  })

  // Add filter parameters if they exist
  if (title) queryParams.append("title", title)
  if (feed_id) queryParams.append("feed_id", feed_id)
  if (feed_type) queryParams.append("feed_type", feed_type)

  const externalUrl = `${process.env.EXTERNAL_API_URL}/feed/user-feed-items?${queryParams.toString()}`

  const response = await fetch(externalUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: request.headers.get("Authorization") || "",
    },
  })

  if (!response.ok) {
    throw new Error(`External API error: ${response.status}`)
  }

  const data = await response.json()
  return NextResponse.json(data)
}

export const GET = withApiLogging(handler)
