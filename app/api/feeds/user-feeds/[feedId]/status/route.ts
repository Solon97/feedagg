import type { NextRequest } from "next/server"
import { withApiLogging, makeExternalApiCall } from "@/lib/api-middleware"

const API_BASE_URL = "https://rss-feed-processor.onrender.com"

export async function PUT(request: NextRequest, { params }: { params: { feedId: string } }) {
  return withApiLogging(request, async (context) => {
    const { requestId, token } = context

    // Get request body
    const body = await request.json()
    const { feedId } = params

    // Make request to external API
    const response = await makeExternalApiCall(
      `${API_BASE_URL}/feed/user-feeds/${feedId}/status`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
      requestId,
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || "Failed to update feed status")
    }

    return response.json()
  })
}
