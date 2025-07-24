import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  withApiLogging,
  makeExternalApiCall,
  handleExternalApiResponse,
} from "@/lib/api-middleware";

const API_BASE_URL = process.env.EXTERNAL_API_URL;

export async function POST(request: NextRequest) {
  return withApiLogging(request, async (context) => {
    const { requestId, token } = context;

    try {
      const body = await request.json();
      const { priceId } = body;

      if (!priceId) {
        return NextResponse.json(
          {
            success: false,
            error: "Price ID is required",
          },
          { status: 400 }
        );
      }

      const origin = request.headers.get("origin") || "http://localhost:3000";

      // Prepare the checkout request with redirect URLs
      const checkoutData = {
        priceId,
        successUrl: `${origin}/subscription/success`,
        cancelUrl: `${origin}/subscription/cancel`,
      };

      // Make request to external API to create Stripe checkout session
      const response = await makeExternalApiCall(
        `${API_BASE_URL}/stripe/checkout`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(checkoutData),
        },
        requestId
      );
      console.log("Stripe checkout response:", response);
      // Handle response from external API and return the data directly
      return await handleExternalApiResponse(
        response,
        "Failed to create checkout session",
        `${API_BASE_URL}/stripe/checkout`
      );
    } catch (error) {
      console.error("Error creating checkout session:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create checkout session",
        },
        { status: 500 }
      );
    }
  });
}
