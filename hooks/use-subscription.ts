import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";
import { Subscription, UserSubscriptionStatus } from "@/types/api";
import { isSubscriptionActive } from "@/lib/subscription-utils";

export function useSubscription(
  userId?: string
): UserSubscriptionStatus & { loading: boolean; error: string | null } {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubscription() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getUserSubscriptionStatus(userId);
        setSubscription(response || null);
      } catch (err) {
        console.error("Error fetching subscription:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch subscription"
        );
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, [userId]);

  const isActive = isSubscriptionActive(subscription?.status);
  const currentPeriodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end)
    : null;
  const manageUrl = "/subscribe"; // This could be dynamic based on your subscription provider

  return {
    isActive,
    status: subscription?.status || null,
    currentPeriodEnd,
    manageUrl,
    loading,
    error,
  };
}
