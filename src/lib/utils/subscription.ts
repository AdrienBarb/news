/**
 * Check if the user has active access (access pass hasn't expired)
 */
export function hasActiveAccess(
  accessExpiresAt: Date | null | undefined
): boolean {
  if (!accessExpiresAt) {
    return false;
  }
  return new Date(accessExpiresAt) > new Date();
}

/**
 * Calculate the new expiration date when purchasing an access pass
 * If user already has active access, extend from current expiration
 * Otherwise, start from now
 */
export function calculateAccessExpiration(
  durationDays: number,
  currentExpiresAt: Date | null | undefined
): Date {
  const now = new Date();
  const startDate =
    currentExpiresAt && new Date(currentExpiresAt) > now
      ? new Date(currentExpiresAt)
      : now;

  return new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
}
