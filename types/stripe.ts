export interface StripeProduct {
  id: string;
  object: string;
  active: boolean;
  attributes: string[];
  created: number;
  default_price: string;
  description: string | null;
  images: string[];
  livemode: boolean;
  marketing_features: any[];
  metadata: Record<string, any>;
  name: string;
  package_dimensions: any;
  shippable: boolean | null;
  statement_descriptor: string | null;
  tax_code: string | null;
  type: string;
  unit_label: string | null;
  updated: number;
  url: string | null;
}

export interface StripeRecurring {
  aggregate_usage: string | null;
  interval: "month" | "year" | "week" | "day";
  interval_count: number;
  meter: string | null;
  trial_period_days: number | null;
  usage_type: string;
}

// Simplified StripePrice for the API response format
export interface StripePrice {
  id: string;
  interval: "month" | "year";
  unit_amount: number;
  currency: string;
  // Add computed properties for compatibility
  recurring?: {
    interval: "month" | "year";
    interval_count: number;
  };
  product?: {
    name: string;
  };
}

// API response format from external service
export interface StripePricesApiResponse {
  monthly: {
    id: string;
    interval: "month";
    unit_amount: number;
    currency: string;
  };
  yearly: {
    id: string;
    interval: "year";
    unit_amount: number;
    currency: string;
  };
}

export interface StripePricesResponse {
  success: boolean;
  data: StripePricesApiResponse;
  error?: string;
}

export interface StripeCheckoutResponse {
  success: boolean;
  data?: {
    checkoutUrl: string;
  };
  error?: string;
}
