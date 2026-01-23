import { z } from "zod";

// Analyzed data structure (AI-prefilled fields from step 1)
export const analyzedDataSchema = z.object({
  productDescription: z.string(),
  problemSolved: z.string(),
  targetCustomer: z.string(),
  pricePoint: z.enum(["FREE", "UNDER_50", "50_TO_200", "200_TO_1000", "OVER_1000"]),
  businessType: z.enum(["B2B", "B2C", "BOTH"]),
  alternatives: z.string(),
});

export type AnalyzedData = z.infer<typeof analyzedDataSchema>;

// API schemas
export const analyzeInputSchema = z.object({
  input: z.string().min(10, "Input must be at least 10 characters"),
  source: z.string().optional(),
});

export const generateIcpSchema = z.object({
  reportId: z.string().cuid(),
  finalData: analyzedDataSchema,
});

export const sendEmailSchema = z.object({
  reportId: z.string().cuid(),
  email: z.string().email("Please enter a valid email address"),
});
