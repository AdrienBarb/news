/**
 * Check if the user has an active subscription
 * Simple boolean check - Stripe webhooks manage the isSubscribed state
 */
export function isSubscriptionActive(
  isSubscribed: boolean | null | undefined
): boolean {
  return isSubscribed === true;
}
