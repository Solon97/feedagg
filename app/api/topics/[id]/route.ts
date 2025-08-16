import type { NextRequest } from "next/server";
import {
  withApiLogging,
  makeExternalApiCall,
  handleExternalApiResponse,
} from "@/lib/api-middleware";

const API_BASE_URL = process.env.EXTERNAL_API_URL;

// DELETE /api/topics/[id] - Deletar tópico
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withApiLogging(request, async (context) => {
    const { requestId, token } = context;
    const { id } = params;

    // Validate topic ID
    if (!id || typeof id !== "string" || id.trim().length === 0) {
      throw new Error("Topic ID is required");
    }

    // Make request to external API
    const response = await makeExternalApiCall(
      `${API_BASE_URL}/topics/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
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
      "Failed to delete topic",
      `${API_BASE_URL}/topics/${id}`
    );
  });
}
