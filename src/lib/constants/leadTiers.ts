export const RUN_PACK_CONFIG = {
  STARTER: {
    id: "STARTER" as const,
    label: "Starter",
    description: "1 agent run",
    runs: 1,
    price: 950, // $9.50 in cents
    estimatedLeads: "~20-50 leads",
    tagline: "Test it out",
    badge: null,
    popular: false,
  },
  GROWTH: {
    id: "GROWTH" as const,
    label: "Growth",
    description: "3 agent runs",
    runs: 3,
    price: 2450, // $24.50 in cents
    estimatedLeads: "~60-150 leads",
    tagline: "Most popular",
    badge: "Most popular",
    popular: true,
  },
  SCALE: {
    id: "SCALE" as const,
    label: "Scale",
    description: "10 agent runs",
    runs: 10,
    price: 4950, // $49.50 in cents
    estimatedLeads: "~200-500 leads",
    tagline: "Best value",
    badge: "Best value",
    popular: false,
  },
} as const;

export type RunPackKey = keyof typeof RUN_PACK_CONFIG;

// Keep LeadTierKey as alias for backward compatibility with existing DB enum
export type LeadTierKey = RunPackKey;

export function getRunPackConfig(pack: RunPackKey) {
  return RUN_PACK_CONFIG[pack];
}

// Legacy alias
export function getLeadTierConfig(tier: LeadTierKey) {
  return RUN_PACK_CONFIG[tier];
}

export function formatPrice(priceInCents: number): string {
  return `$${(priceInCents / 100).toFixed(2).replace(/\.00$/, "")}`;
}
