"use client";

import { Badge } from "@/components/ui/badge";
import type { MarketStatus } from "@prisma/client";

interface MarketStatusBadgeProps {
  status: MarketStatus;
}

const statusConfig: Record<
  MarketStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending: { label: "Pending", variant: "secondary" },
  analyzing: { label: "Analyzing", variant: "outline" },
  active: { label: "Active", variant: "default" },
  paused: { label: "Paused", variant: "secondary" },
  archived: { label: "Archived", variant: "outline" },
  error: { label: "Error", variant: "destructive" },
};

export function MarketStatusBadge({ status }: MarketStatusBadgeProps) {
  const config = statusConfig[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

