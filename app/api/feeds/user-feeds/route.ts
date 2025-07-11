import type { NextRequest } from "next/server";
import {
  withApiLogging,
  makeExternalApiCall,
  handleExternalApiResponse,
} from "@/lib/api-middleware";

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

    // Handle response and automatically throw ExternalApiError if needed
    return await handleExternalApiResponse(
      response,
      "Failed to fetch feeds",
      `${API_BASE_URL}/feed/user-feeds`
    );
  });
}
