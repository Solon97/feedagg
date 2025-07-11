import type { NextRequest } from "next/server";
import {
  withApiLogging,
  makeExternalApiCall,
  handleExternalApiResponse,
} from "@/lib/api-middleware";

const API_BASE_URL = process.env.EXTERNAL_API_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  return withApiLogging(request, async (context) => {
    const { requestId, token } = context;

    const { userId } = await params;

    // Make request to external API
    const response = await makeExternalApiCall(
      `${API_BASE_URL}/subscriptions/user/${userId}/active`,
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
      "Failed to fetch subscription",
      `${API_BASE_URL}/subscriptions/user/${userId}/active`
    );
  });
}
