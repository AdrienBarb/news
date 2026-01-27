"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useApi from "@/lib/hooks/useApi";
import {
  RUN_PACK_CONFIG,
  type RunPackKey,
  formatPrice,
} from "@/lib/constants/leadTiers";

interface BuyRunsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BuyRunsModal({ open, onOpenChange }: BuyRunsModalProps) {
  const { usePost } = useApi();
  const [selectedPack, setSelectedPack] = useState<RunPackKey | null>(null);

  const { mutate: purchaseRuns, isPending } = usePost("/run-packs/purchase", {
    onSuccess: (data: { checkoutUrl: string }) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
  });

  const handlePurchase = () => {
    if (!selectedPack) return;
    purchaseRuns({ runPack: selectedPack });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Buy Run Packs
          </DialogTitle>
          <p className="text-center text-gray-600 text-sm">
            Each run launches an AI agent that finds all qualified leads
          </p>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-4 mt-4">
          {(Object.keys(RUN_PACK_CONFIG) as RunPackKey[]).map((pack) => {
            const config = RUN_PACK_CONFIG[pack];
            const isSelected = selectedPack === pack;
            const perRunPrice = config.price / config.runs;

            return (
              <button
                key={pack}
                type="button"
                onClick={() => setSelectedPack(pack)}
                className={cn(
                  "relative rounded-2xl p-6 border-2 transition-all text-center",
                  isSelected
                    ? "border-orange-500 bg-orange-50 shadow-lg"
                    : "border-gray-200 bg-white hover:border-gray-300"
                )}
              >
                {config.badge && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold",
                        config.popular
                          ? "bg-orange-500 text-white"
                          : "bg-green-100 border border-green-300 text-green-700"
                      )}
                    >
                      {config.badge}
                    </span>
                  </div>
                )}

                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {config.label}
                </h3>

                <div className="mb-1">
                  <span className="text-4xl font-bold text-gray-900">
                    {config.runs}
                  </span>
                  <span className="text-gray-600 ml-1 text-sm">
                    run{config.runs > 1 ? "s" : ""}
                  </span>
                </div>

                <p className="text-xs text-gray-500 mb-3">
                  {config.estimatedLeads} per run
                </p>

                <div className="mb-1">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatPrice(config.price)}
                  </span>
                </div>

                <div className="text-xs text-gray-400">
                  {formatPrice(Math.round(perRunPrice))} per run
                </div>

                <div className="mt-4">
                  <div
                    className={cn(
                      "mx-auto w-5 h-5 rounded-full border-2 flex items-center justify-center",
                      isSelected
                        ? "border-orange-500 bg-orange-500"
                        : "border-gray-300 bg-white"
                    )}
                  >
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={handlePurchase}
            disabled={!selectedPack || isPending}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8"
          >
            {isPending ? "Redirecting..." : "Buy Runs"}
          </Button>
        </div>

        <p className="text-xs text-gray-400 text-center">
          Secure payment via Stripe
        </p>
      </DialogContent>
    </Dialog>
  );
}
