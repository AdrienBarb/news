import { PlanType } from "@prisma/client";
import { differenceInDays } from "date-fns";

const TRIAL_DURATION_DAYS = 7;

/**
 * Check if the user's trial period is still active (7 days from account creation)
 */
function isTrialActive(createdAt: Date | null | undefined): boolean {
  if (!createdAt) return false;
  const daysSinceCreation = differenceInDays(new Date(), createdAt);
  return daysSinceCreation < TRIAL_DURATION_DAYS;
}

/**
 * Check if the user has an active subscription or trial
 */
export function isSubscriptionActive(
  planType: PlanType | null | undefined,
  accessExpiresAt: Date | null | undefined,
  createdAt: Date | null | undefined
): boolean {
  // Check if trial is active first (even if planType is NONE)
  if (isTrialActive(createdAt)) {
    return true;
  }

  if (!planType || planType === PlanType.NONE) return false;

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
