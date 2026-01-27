import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  RUN_PACK_CONFIG,
  type RunPackKey,
  formatPrice,
} from "@/lib/constants/leadTiers";

interface RunPackStepProps {
  selectedRunPack: RunPackKey | null;
  setSelectedRunPack: (pack: RunPackKey) => void;
  onSubmit: () => void;
  onBack: () => void;
  isCreating: boolean;
}

export default function RunPackStep({
  selectedRunPack,
  setSelectedRunPack,
  onSubmit,
  onBack,
  isCreating,
}: RunPackStepProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose your run pack
        </h2>
        <p className="text-gray-600">
          Each run launches an AI agent that finds all qualified leads for you
        </p>
      </div>

      {/* Run Pack Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {(Object.keys(RUN_PACK_CONFIG) as RunPackKey[]).map((pack) => {
          const config = RUN_PACK_CONFIG[pack];
          const isSelected = selectedRunPack === pack;
          const perRunPrice = config.price / config.runs;

          return (
            <button
              key={pack}
              type="button"
              onClick={() => setSelectedRunPack(pack)}
              className={cn(
                "relative rounded-3xl p-8 border-2 transition-all text-center",
                isSelected
                  ? "border-orange-500 bg-orange-50 shadow-xl scale-105"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
              )}
            >
              {/* Badge */}
              {config.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-4 py-1 text-xs font-semibold",
                      config.popular
                        ? "bg-orange-500 text-white"
                        : "bg-green-100 border border-green-300 text-green-700"
                    )}
                  >
                    {config.badge}
                  </span>
                </div>
              )}

              {/* Pack Name */}
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {config.label}
              </h3>

              {/* Runs Count */}
              <div className="mb-2">
                <span className="text-5xl font-bold text-gray-900">
                  {config.runs}
                </span>
                <span className="text-gray-600 ml-2">
                  run{config.runs > 1 ? "s" : ""}
                </span>
              </div>

              {/* Estimated leads */}
              <p className="text-sm text-gray-500 mb-4">
                {config.estimatedLeads} per run
              </p>

              {/* Price */}
              <div className="mb-2">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(config.price)}
                </span>
              </div>

              {/* Tagline */}
              <p className="text-sm text-gray-500 mb-4">{config.tagline}</p>

              {/* Per Run Price */}
              <div className="text-xs text-gray-400">
                {formatPrice(Math.round(perRunPrice))} per run
              </div>

              {/* Radio Indicator */}
              <div className="mt-6">
                <div
                  className={cn(
                    "mx-auto w-6 h-6 rounded-full border-2 flex items-center justify-center",
                    isSelected
                      ? "border-orange-500 bg-orange-500"
                      : "border-gray-300 bg-white"
                  )}
                >
                  {isSelected && (
                    <div className="w-3 h-3 rounded-full bg-white" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Features */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <p className="text-sm font-medium text-gray-600 text-center mb-4">
          WHAT&apos;S INCLUDED
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-700">
          {[
            "AI-powered relevance scoring",
            "Intent detection (recommendations, complaints, questions)",
            "AI explanation for why each lead matches your ICP",
            "Direct link to each lead",
            "Lead metadata (engagement, date, context)",
            "Email notification when ready",
          ].map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                <svg
                  className="w-2.5 h-2.5 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isCreating}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={!selectedRunPack || isCreating}
          className="gap-2 bg-orange-500 hover:bg-orange-600 text-white"
        >
          {isCreating ? "Creating..." : "Buy & Launch"}
        </Button>
      </div>

      {/* Trust Badge */}
      <p className="text-xs text-gray-400 text-center">
        Secure payment via Stripe · Leads delivered in minutes
      </p>
    </div>
  );
}
