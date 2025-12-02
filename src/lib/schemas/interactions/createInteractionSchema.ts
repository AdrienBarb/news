import { z } from "zod";

export const createInteractionSchema = z.object({
  articleId: z.string().min(1, "Article ID is required"),
  dwellTimeMs: z.number().min(0, "Dwell time must be non-negative"),
  isLiked: z.boolean(),
  isBookmarked: z.boolean(),
});
