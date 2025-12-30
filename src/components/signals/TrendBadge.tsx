"use client";

import { Badge } from "@/components/ui/badge";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
  SparklesIcon,
} from "lucide-react";
import type { SignalTrend } from "@prisma/client";

interface TrendBadgeProps {
  trend: SignalTrend;
  showLabel?: boolean;
}

const trendConfig: Record<
  SignalTrend,
  {
    label: string;
    icon: React.ElementType;
    className: string;
  }
> = {
  new: {
    label: "New",
    icon: SparklesIcon,
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  },
  rising: {
    label: "Rising",
    icon: ArrowUpIcon,
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  stable: {
    label: "Stable",
    icon: MinusIcon,
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  },
  fading: {
    label: "Fading",
    icon: ArrowDownIcon,
    className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  },
};

export function TrendBadge({ trend, showLabel = true }: TrendBadgeProps) {
  const config = trendConfig[trend];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={config.className}>
      <Icon className="h-3 w-3 mr-1" />
      {showLabel && config.label}
    </Badge>
  );
}

