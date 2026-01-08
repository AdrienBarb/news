"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarketStatusBadge } from "./MarketStatusBadge";
import { UsersIcon, KeyIcon } from "lucide-react";
import type { MarketStatus } from "@prisma/client";

interface MarketCardProps {
  market: {
    id: string;
    name: string;
    websiteUrl: string;
    description: string | null;
    keywords: string[];
    status: MarketStatus;
    leadCount: number;
    unreadLeadCount: number;
    createdAt: Date | string;
  };
}

export function MarketCard({ market }: MarketCardProps) {
  return (
    <Link href={`/markets/${market.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg truncate">{market.name}</CardTitle>
              <p className="text-sm text-muted-foreground truncate mt-1">
                {market.description || market.websiteUrl}
              </p>
            </div>
            <MarketStatusBadge status={market.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Lead stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <UsersIcon className="h-4 w-4" />
              <span>{market.leadCount} leads</span>
            </div>
            {market.unreadLeadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {market.unreadLeadCount} new
              </Badge>
            )}
          </div>

          {/* Keywords preview */}
          {market.keywords.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <KeyIcon className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {market.keywords.slice(0, 3).join(", ")}
                {market.keywords.length > 3 && ` +${market.keywords.length - 3}`}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
