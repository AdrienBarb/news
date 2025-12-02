import { InteractionType } from "@prisma/client";

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
