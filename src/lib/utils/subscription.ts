import { SubscriptionStatus } from "@prisma/client";

export function isSubscriptionActive(
  status: SubscriptionStatus | null | undefined
): boolean {
  if (!status) return false;
  return (
    status === SubscriptionStatus.ACTIVE ||
    status === SubscriptionStatus.TRIALING
  );
}
