"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SignalCard } from "@/components/signals/SignalCard";
import useApi from "@/lib/hooks/useApi";
import { ArrowLeftIcon, SignalIcon, ClockIcon } from "lucide-react";
import type { PainType } from "@prisma/client";

interface PageProps {
  params: Promise<{ marketId: string }>;
}

interface Signal {
  id: string;
  title: string;
  description: string | null;
  painType: PainType;
  frequency: number;
}

export default function SignalsPage({ params }: PageProps) {
  const { marketId } = use(params);
  const router = useRouter();
  const { useGet } = useApi();

  const { data: marketData, isLoading: marketLoading } = useGet(
    `/markets/${marketId}`
  );

  const { data: signalsData, isLoading: signalsLoading } = useGet(
    `/markets/${marketId}/signals`,
    {},
    { refetchInterval: 10000 }
  );

  const market = marketData?.market;
  const signals: Signal[] = signalsData?.signals || [];

  if (marketLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <p className="text-muted-foreground">Market not found</p>
          <Button variant="link" onClick={() => router.push("/markets")}>
            Back to Markets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/markets/${marketId}`)}
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Signals</h1>
          <p className="text-muted-foreground">{market.name}</p>
        </div>
      </div>

      {/* Signals Grid */}
      {signalsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : signals.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <SignalIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No signals yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Signals are created at 2:00 AM UTC when we cluster similar pain
            statements together. Once you have pain statements, signals will
            appear here.
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-muted-foreground">
            <ClockIcon className="h-3 w-3" />
            <span>Auto-refreshing every 10 seconds</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {signals.length} signal{signals.length !== 1 ? "s" : ""} detected
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {signals.map((signal) => (
              <SignalCard
                key={signal.id}
                signal={signal}
                marketId={marketId}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

