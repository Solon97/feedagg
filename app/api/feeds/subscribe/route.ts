import type { NextRequest } from "next/server";
import { withApiLogging, makeExternalApiCall } from "@/lib/api-middleware";

const API_BASE_URL = process.env.EXTERNAL_API_URL;

export async function POST(request: NextRequest) {
  return withApiLogging(request, async (context) => {
    const { requestId, token } = context;

    // Get request body
    const body = await request.json();

    // Make request to external API
    const response = await makeExternalApiCall(
      `${API_BASE_URL}/feed/subscribe`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
      requestId
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to subscribe to feed");
    }

    return response.json();
  });
}
