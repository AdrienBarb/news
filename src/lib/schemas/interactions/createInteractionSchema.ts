import { z } from "zod";

export const createInteractionSchema = z.object({
  articleId: z.string().min(1, "Article ID is required"),
  isLiked: z.boolean(),
  isBookmarked: z.boolean(),
});
