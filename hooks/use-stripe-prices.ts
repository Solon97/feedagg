import { useState, useEffect, useCallback } from "react";
import { apiService } from "@/lib/api";
import { StripePrice } from "@/types/stripe";

interface UseStripePricesReturn {
  prices: StripePrice[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getYearlyPriceDiscount: () => number;
}

export function useStripePrices(): UseStripePricesReturn {
  const [prices, setPrices] = useState<StripePrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getStripePrices();

      if (response.success) {
        // Convert the API response format to an array
        const pricesArray: StripePrice[] = [
          {
            id: response.data.monthly.id,
            interval: response.data.monthly.interval,
            unit_amount: response.data.monthly.unit_amount,
            currency: response.data.monthly.currency,
            recurring: {
              interval: response.data.monthly.interval,
              interval_count: 1,
            },
            product: {
              name: "Monthly",
            },
          },
          {
            id: response.data.yearly.id,
            interval: response.data.yearly.interval,
            unit_amount: response.data.yearly.unit_amount,
            currency: response.data.yearly.currency,
            recurring: {
              interval: response.data.yearly.interval,
              interval_count: 1,
            },
            product: {
              name: "Yearly",
            },
          },
        ];

        setPrices(pricesArray);
      } else {
        setError(response.error || "Failed to fetch prices");
      }
    } catch (err) {
      console.error("Error fetching prices:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const getYearlyPriceDiscount = useCallback((): number => {
    const monthlyUnitAmount =
      prices.find((price) => price.interval === "month")?.unit_amount || 0;
    const yearlyUnitAmount =
      prices.find((price) => price.interval === "year")?.unit_amount || 0;
    if (monthlyUnitAmount === 0 || yearlyUnitAmount === 0) {
      return 0;
    }
    const monthlyPrice = monthlyUnitAmount / 100;
    const yearlyPrice = yearlyUnitAmount / 100;
    const totalMonthlyCost = monthlyPrice * 12;
    const discount =
      ((totalMonthlyCost - yearlyPrice) / totalMonthlyCost) * 100;
    return discount;
  }, [prices]);

  return {
    prices,
    loading,
    error,
    refetch: fetchPrices,
    getYearlyPriceDiscount,
  };
}
