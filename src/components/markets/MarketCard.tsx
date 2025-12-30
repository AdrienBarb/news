"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketStatusBadge } from "./MarketStatusBadge";
import { SignalIcon, MessageSquareIcon } from "lucide-react";
import type { MarketStatus } from "@prisma/client";

interface MarketCardProps {
  market: {
    id: string;
    name: string;
    websiteUrl: string;
    category: string | null;
    status: MarketStatus;
    signalCount: number;
    conversationCount: number;
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
                {market.category || market.websiteUrl}
              </p>
            </div>
            <MarketStatusBadge status={market.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <SignalIcon className="h-4 w-4" />
              <span>{market.signalCount} signals</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageSquareIcon className="h-4 w-4" />
              <span>{market.conversationCount} conversations</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

