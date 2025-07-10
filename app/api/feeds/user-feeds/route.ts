import type { NextRequest } from "next/server";
import { withApiLogging, makeExternalApiCall } from "@/lib/api-middleware";

const API_BASE_URL = process.env.EXTERNAL_API_URL;

export async function GET(request: NextRequest) {
  return withApiLogging(request, async (context) => {
    const { requestId, token } = context;

    // Make request to external API
    const response = await makeExternalApiCall(
      `${API_BASE_URL}/feed/user-feeds`,
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
      throw new Error(errorData.message || "Failed to fetch feeds");
    }

    return response.json();
  });
}
