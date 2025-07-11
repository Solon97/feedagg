import type { NextRequest } from "next/server";
import {
  withApiLogging,
  makeExternalApiCall,
  handleExternalApiResponse,
} from "@/lib/api-middleware";

const API_BASE_URL = process.env.EXTERNAL_API_URL;

export async function POST(request: NextRequest) {
  return withApiLogging(request, async (context) => {
    const { requestId, token } = context;

    // Get request body
    const body = await request.json();

    // Make request to external API
    const response = await makeExternalApiCall(
      `${API_BASE_URL}/feed/validate`,
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

    // Handle response and automatically throw ExternalApiError if needed
    return await handleExternalApiResponse(
      response,
      "Failed to validate feed",
      `${API_BASE_URL}/feed/validate`
    );
  });
}
