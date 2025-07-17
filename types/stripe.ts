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

export interface StripePrice {
  id: string;
  object: string;
  active: boolean;
  billing_scheme: string;
  created: number;
  currency: string;
  custom_unit_amount: any;
  livemode: boolean;
  lookup_key: string | null;
  metadata: Record<string, any>;
  nickname: string | null;
  product: StripeProduct;
  recurring: StripeRecurring;
  tax_behavior: string;
  tiers_mode: string | null;
  transform_quantity: any;
  type: string;
  unit_amount: number;
  unit_amount_decimal: string;
}

export interface StripePricesResponse {
  success: boolean;
  data: StripePrice[];
  error?: string;
}

export interface StripeCheckoutResponse {
  success: boolean;
  data?: {
    checkoutUrl: string;
  };
  error?: string;
}
