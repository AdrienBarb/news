import { z } from "zod";

export const createMarketSchema = z.object({
  websiteUrl: z
    .string()
    .url("Please enter a valid URL")
    .refine(
      (url) => {
        try {
          const parsed = new URL(url);
          return ["http:", "https:"].includes(parsed.protocol);
        } catch {
          return false;
        }
      },
      { message: "URL must use http or https protocol" }
    ),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less")
    .optional(),
});

export type CreateMarketInput = z.infer<typeof createMarketSchema>;

