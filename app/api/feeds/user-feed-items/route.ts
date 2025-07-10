import type { NextRequest } from "next/server";
import { withApiLogging, makeExternalApiCall } from "@/lib/api-middleware";

const API_BASE_URL = process.env.EXTERNAL_API_URL;

export async function GET(request: NextRequest) {
  return withApiLogging(request, async (context) => {
    const { requestId, token } = context;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "20";
    const offset = searchParams.get("offset") || "0";
    const sort = searchParams.get("sort") || "published_at";
    const order = searchParams.get("order") || "desc";

    // Get filter parameters
    const title = searchParams.get("title");
    const feed_id = searchParams.get("feed_id");
    const feed_type = searchParams.get("feed_type");

    // Build API URL with all parameters
    const apiParams = new URLSearchParams({
      limit,
      offset,
      sort,
      order,
    });

    // Add filter parameters if they exist
    if (title) apiParams.set("title", title);
    if (feed_id) apiParams.set("feed_id", feed_id);
    if (feed_type) apiParams.set("feed_type", feed_type);

    const apiUrl = `${API_BASE_URL}/feed/user-feed-items?${apiParams.toString()}`;

    const response = await makeExternalApiCall(
      apiUrl,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
      requestId
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch feed items");
    }

    return response.json();
  });
}
