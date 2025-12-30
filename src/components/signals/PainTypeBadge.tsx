"use client";

import { Badge } from "@/components/ui/badge";
import type { PainType } from "@prisma/client";

interface PainTypeBadgeProps {
  painType: PainType;
}

const painTypeLabels: Record<PainType, string> = {
  frustration: "Frustration",
  limitation: "Limitation",
  unmet_expectation: "Unmet Expectation",
  comparison: "Comparison",
  switching_intent: "Switching Intent",
  feature_request: "Feature Request",
  pricing: "Pricing",
  support: "Support",
  performance: "Performance",
  other: "Other",
};

export function PainTypeBadge({ painType }: PainTypeBadgeProps) {
  return (
    <Badge variant="secondary" className="text-xs">
      {painTypeLabels[painType]}
    </Badge>
  );
}

