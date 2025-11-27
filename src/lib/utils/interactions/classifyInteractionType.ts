import { Reaction } from "@/lib/types/interactions";
import { InteractionType } from "@prisma/client";

interface ClassifyParams {
  dwellTimeMs: number;
  reaction: Reaction;
}

export function classifyInteractionType({
  dwellTimeMs,
  reaction,
}: ClassifyParams): InteractionType {
  if (reaction === "up") {
    return InteractionType.like;
  }

  if (reaction === "down") {
    return InteractionType.hide_topic;
  }

  if (dwellTimeMs < 3000) {
    return InteractionType.skip_fast;
  }

  if (dwellTimeMs < 20000) {
    return InteractionType.view;
  }

  return InteractionType.view_long;
}
