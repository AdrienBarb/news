"use client";

import { MarketCard } from "@/components/markets/MarketCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import useApi from "@/lib/hooks/useApi";
import { SearchIcon, PlusCircleIcon } from "lucide-react";
import Link from "next/link";

interface Market {
  id: string;
  name: string;
  websiteUrl: string;
  description: string | null;
  keywords: string[];
  status: "pending" | "analyzing" | "active" | "paused" | "error";
  leadCount: number;
  unreadLeadCount: number;
  createdAt: string;
}

export default function MarketsPage() {
  const { useGet } = useApi();
  const { data, isLoading, error } = useGet("/markets");

  const markets: Market[] = data?.markets || [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Your Markets</h1>
        <p className="text-muted-foreground">
          Monitor Reddit for leads related to your product
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-destructive">Failed to load markets</p>
        </div>
      ) : markets.length === 0 ? (
        <div className="text-center py-16 border rounded-lg bg-muted/20">
          <SearchIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No markets yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first market to start finding leads on Reddit
          </p>
          <Link href="/markets/new">
            <Button>
              <PlusCircleIcon className="mr-2 h-4 w-4" />
              Create Your First Market
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {markets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      )}
    </div>
  );
}
