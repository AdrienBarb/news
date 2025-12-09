import { PlanType } from "@prisma/client";

export function isSubscriptionActive(
  planType: PlanType | null | undefined,
  accessExpiresAt: Date | null | undefined
): boolean {
  if (!planType) return false;

  // Lifetime plan is always active
  if (planType === PlanType.LIFETIME) {
    return true;
  }

  // Year plan requires valid expiration date
  if (planType === PlanType.YEAR) {
    if (!accessExpiresAt) return false;
    return new Date(accessExpiresAt) > new Date();
  }

  // No plan or other plan types
  return false;
}
