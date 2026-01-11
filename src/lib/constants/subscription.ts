const PASSES_LIST = [
  {
    id: "trial_7_days" as const,
    name: "7-Day Access",
    durationDays: 7,
    durationLabel: "7 days",
    price: 9,
    checkoutLink: process.env.NEXT_PUBLIC_STRIPE_7_DAYS_ACCESS_PAYMENT_LINK,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_7_DAYS_PRICE_ID,
  },
  {
    id: "month_1" as const,
    name: "1 Month Access",
    durationDays: 30,
    durationLabel: "1 month",
    price: 29,
    popular: true,
    checkoutLink: process.env.NEXT_PUBLIC_STRIPE_1_MONTH_ACCESS_PAYMENT_LINK,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_1_MONTH_PRICE_ID,
  },
  {
    id: "year_1" as const,
    name: "1 Year Access",
    durationDays: 365,
    durationLabel: "1 year",
    price: 199,
    checkoutLink: process.env.NEXT_PUBLIC_STRIPE_1_YEAR_ACCESS_PAYMENT_LINK,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_1_YEAR_PRICE_ID,
  },
] as const;

export const ACCESS = {
  LIMITS: {
    domains: 1,
    keywords: 10,
    aiRunFrequencyHours: 24,
  },
  FEATURES: [
    "1 domain",
    "10 keywords tracked",
    "AI agent runs every 24h",
    "Reddit lead monitoring",
    "AI-powered intent signal detection",
    "Daily lead alerts",
    "AI-suggested reply drafts",
  ],
  PASSES: PASSES_LIST,
} as const;

export type PassId = (typeof PASSES_LIST)[number]["id"];
