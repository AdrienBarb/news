/**
 * Time window configuration for AI agents
 * Maps time windows to Apify parameters and pricing
 */
export const TIME_WINDOW_CONFIG = {
  LAST_7_DAYS: {
    id: "LAST_7_DAYS" as const,
    label: "Recent signals",
    description: "Last 7 days",
    price: 1900, // $19 in cents
    apifyTime: "week" as const,
    maxAgeDays: 7,
    limitPerKeyword: 10,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_7_DAYS_PRICE_ID,
  },
  LAST_30_DAYS: {
    id: "LAST_30_DAYS" as const,
    label: "Market scan",
    description: "Last 30 days",
    price: 4900, // $49 in cents
    apifyTime: "month" as const,
    maxAgeDays: 30,
    limitPerKeyword: 20,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_30_DAYS_PRICE_ID,
  },
  LAST_365_DAYS: {
    id: "LAST_365_DAYS" as const,
    label: "Deep research",
    description: "Last 12 months",
    price: 9900, // $99 in cents
    apifyTime: "year" as const,
    maxAgeDays: 365,
    limitPerKeyword: 30,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_365_DAYS_PRICE_ID,
  },
} as const;

export type TimeWindow = keyof typeof TIME_WINDOW_CONFIG;

/**
 * Get time window configuration by ID
 */
export function getTimeWindowConfig(timeWindow: TimeWindow) {
  return TIME_WINDOW_CONFIG[timeWindow];
}

/**
 * Format price for display (converts cents to dollars)
 */
export function formatPrice(priceInCents: number): string {
  return `$${priceInCents / 100}`;
}

