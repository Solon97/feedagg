import type { NextRequest } from "next/server";
import {
  withApiLogging,
  makeExternalApiCall,
  handleExternalApiResponse,
} from "@/lib/api-middleware";

const API_BASE_URL = process.env.EXTERNAL_API_URL;

// GET /api/topics - Listar tópicos do usuário
export async function GET(request: NextRequest) {
  return withApiLogging(request, async (context) => {
    const { requestId, token } = context;

    // Make request to external API
    const response = await makeExternalApiCall(
      `${API_BASE_URL}/topics`,
      {
        method: "GET",
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
      "Failed to fetch topics",
      `${API_BASE_URL}/topics`
    );
  });
}

// POST /api/topics - Criar novo tópico
export async function POST(request: NextRequest) {
  return withApiLogging(request, async (context) => {
    const { requestId, token } = context;

    // Get request body
    const body = await request.json();
    const { name, color } = body;

    // Validate input
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      throw new Error("Topic name is required");
    }

    if (name.trim().length > 50) {
      throw new Error("Topic name must be 50 characters or less");
    }

    if (
      color &&
      (typeof color !== "string" || !color.match(/^#[0-9A-Fa-f]{6}$/))
    ) {
      throw new Error("Color must be a valid hex color (e.g., #FF5733)");
    }

    // Make request to external API
    const response = await makeExternalApiCall(
      `${API_BASE_URL}/topics`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          ...(color && { color }),
        }),
      },
      requestId
    );

    // Handle response and automatically throw ExternalApiError if needed
    return await handleExternalApiResponse(
      response,
      "Failed to create topic",
      `${API_BASE_URL}/topics`
    );
  });
}
