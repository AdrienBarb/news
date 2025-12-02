import { InteractionType } from "@prisma/client";

/**
 * Classifies view interaction type based on dwell time
 * Used when user doesn't explicitly like or bookmark
 */
export function classifyViewInteractionType(
  dwellTimeMs: number
): InteractionType {
  if (dwellTimeMs < 3000) {
    return InteractionType.skip_fast;
  }

  if (dwellTimeMs < 20000) {
    return InteractionType.view;
  }

  return InteractionType.view_long;
}
