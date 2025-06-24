import type { NextRequest } from "next/server"
import { withApiLogging, makeExternalApiCall } from "@/lib/api-middleware"

const API_BASE_URL = "https://rss-feed-processor.onrender.com"

export async function DELETE(request: NextRequest, { params }: { params: { feedId: string } }) {
  return withApiLogging(request, async (context) => {
    const { requestId, token } = context

    const { feedId } = params

    // Make request to external API
    const response = await makeExternalApiCall(
      `${API_BASE_URL}/feed/user-feeds/${feedId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
      requestId,
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || "Failed to delete feed")
    }

    return response.json()
  })
}
