import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Simulating the external Stripe API call
    // In a real implementation, you would make a call to your external API
    // that fetches prices from Stripe

    // For now, we'll return the mock data from the prices-response.json
    const mockPrices = [
      {
        id: "price_1RkwwVPE5ZymH20JH3F8nZbi",
        object: "price",
        active: true,
        billing_scheme: "per_unit",
        created: 1752540119,
        currency: "usd",
        custom_unit_amount: null,
        livemode: false,
        lookup_key: null,
        metadata: {},
        nickname: null,
        product: {
          id: "prod_SgJZb3lyKxNMlC",
          object: "product",
          active: true,
          attributes: [],
          created: 1752540118,
          default_price: "price_1RkwwVPE5ZymH20JH3F8nZbi",
          description: null,
          images: [],
          livemode: false,
          marketing_features: [],
          metadata: {},
          name: "Yearly",
          package_dimensions: null,
          shippable: null,
          statement_descriptor: null,
          tax_code: null,
          type: "service",
          unit_label: null,
          updated: 1752540119,
          url: null,
        },
        recurring: {
          aggregate_usage: null,
          interval: "year",
          interval_count: 1,
          meter: null,
          trial_period_days: null,
          usage_type: "licensed",
        },
        tax_behavior: "unspecified",
        tiers_mode: null,
        transform_quantity: null,
        type: "recurring",
        unit_amount: 3000,
        unit_amount_decimal: "3000",
      },
      {
        id: "price_1RkwsBPE5ZymH20JRJIOMZWq",
        object: "price",
        active: true,
        billing_scheme: "per_unit",
        created: 1752539851,
        currency: "usd",
        custom_unit_amount: null,
        livemode: false,
        lookup_key: null,
        metadata: {},
        nickname: null,
        product: {
          id: "prod_SgJVBb7qHgbIJJ",
          object: "product",
          active: true,
          attributes: [],
          created: 1752539850,
          default_price: "price_1RkwsBPE5ZymH20JRJIOMZWq",
          description: null,
          images: [],
          livemode: false,
          marketing_features: [],
          metadata: {},
          name: "Monthly",
          package_dimensions: null,
          shippable: null,
          statement_descriptor: null,
          tax_code: null,
          type: "service",
          unit_label: null,
          updated: 1752540085,
          url: null,
        },
        recurring: {
          aggregate_usage: null,
          interval: "month",
          interval_count: 1,
          meter: null,
          trial_period_days: null,
          usage_type: "licensed",
        },
        tax_behavior: "unspecified",
        tiers_mode: null,
        transform_quantity: null,
        type: "recurring",
        unit_amount: 500,
        unit_amount_decimal: "500",
      },
    ];

    // Filter only active prices
    const activePrices = mockPrices.filter((price) => price.active);

    return NextResponse.json({
      success: true,
      data: activePrices,
    });
  } catch (error) {
    console.error("Error fetching Stripe prices:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch pricing data",
      },
      { status: 500 }
    );
  }
}
