export const LEAD_TIER_CONFIG = {
  STARTER: {
    id: "STARTER" as const,
    label: "Starter",
    description: "10 qualified leads",
    leadsIncluded: 10,
    price: 950, // $9.50 in cents
    tagline: "Test it out",
    badge: null,
    popular: false,
    maxAgeDays: 30, // Search depth: 30 days
  },
  GROWTH: {
    id: "GROWTH" as const,
    label: "Growth",
    description: "30 qualified leads",
    leadsIncluded: 30,
    price: 2450, // $24.50 in cents
    tagline: "Most popular",
    badge: "Most popular",
    popular: true,
    maxAgeDays: 90, // Search depth: 90 days
  },
  SCALE: {
    id: "SCALE" as const,
    label: "Scale",
    description: "75 qualified leads",
    leadsIncluded: 75,
    price: 4950, // $49.50 in cents
    tagline: "Best value",
    badge: "Best value",
    popular: false,
    maxAgeDays: 365, // Search depth: 365 days
  },
} as const;

export type LeadTierKey = keyof typeof LEAD_TIER_CONFIG;

export function getLeadTierConfig(tier: LeadTierKey) {
  return LEAD_TIER_CONFIG[tier];
}

export function formatPrice(priceInCents: number): string {
  return `$${(priceInCents / 100).toFixed(2).replace(/\.00$/, "")}`;
}
