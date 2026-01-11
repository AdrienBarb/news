import { z } from "zod";

export const createMarketSchema = z.object({
  websiteUrl: z
    .string()
    .min(1, "Website URL is required")
    .refine(
      (url) => {
        // Allow URLs without protocol
        const urlToCheck = url.startsWith("http") ? url : `https://${url}`;
        try {
          const parsed = new URL(urlToCheck);
          return ["http:", "https:"].includes(parsed.protocol);
        } catch {
          return false;
        }
      },
      { message: "Please enter a valid website URL" }
    ),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less")
    .optional(),
  description: z
    .string()
    .max(800, "Description must be 800 characters or less")
    .optional(),
  keywords: z
    .array(z.string().min(1).max(100))
    .max(30, "Maximum 30 keywords allowed")
    .optional(),
  competitorUrls: z
    .array(z.string().min(1).max(200))
    .max(3, "Maximum 3 competitor URLs allowed")
    .optional(),
});

export type CreateMarketInput = z.infer<typeof createMarketSchema>;
