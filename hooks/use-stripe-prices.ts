import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";
import { StripePrice, StripePricesResponse } from "@/types/stripe";

interface UseStripePricesReturn {
  prices: StripePrice[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useStripePrices(): UseStripePricesReturn {
  const [prices, setPrices] = useState<StripePrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      setError(null);

      const response: StripePricesResponse = await apiService.getStripePrices();

      if (response.success) {
        setPrices(response.data);
      } else {
        setError(response.error || "Failed to fetch prices");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  return {
    prices,
    loading,
    error,
    refetch: fetchPrices,
  };
}
