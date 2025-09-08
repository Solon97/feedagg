/**
 * Subscription utilities for checking subscription status
 */

/**
 * Check if a subscription status is considered active
 * @param status - The subscription status from Stripe
 * @returns true if the subscription is active or trialing, false otherwise
 */
export function isSubscriptionActive(status?: string): boolean {
  if (!status) return false;

  const normalizedStatus = status.toLowerCase();
  return normalizedStatus === "active" || normalizedStatus === "trialing";
}

/**
 * Get subscription status display text
 * @param status - The subscription status from Stripe
 * @returns display text for the status
 */
export function getSubscriptionStatusText(status?: string): string {
  if (!status) return "inactive";

  const normalizedStatus = status.toLowerCase();

  switch (normalizedStatus) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "canceled":
    case "cancelled":
      return "cancelled";
    case "incomplete":
      return "incomplete";
    case "incomplete_expired":
      return "expired";
    case "past_due":
      return "past_due";
    case "unpaid":
      return "unpaid";
    default:
      return "inactive";
  }
}

/**
 * Check if subscription status represents a paid subscription
 * @param status - The subscription status from Stripe
 * @returns true if subscription is paid (active or trialing)
 */
export function isPaidSubscription(status?: string): boolean {
  return isSubscriptionActive(status);
}
