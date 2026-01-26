import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LEAD_TIER_CONFIG,
  type LeadTierKey,
  formatPrice,
} from "@/lib/constants/leadTiers";

interface LeadTierStepProps {
  selectedLeadTier: LeadTierKey | null;
  setSelectedLeadTier: (tier: LeadTierKey) => void;
  onSubmit: () => void;
  onBack: () => void;
  isCreating: boolean;
}

export default function LeadTierStep({
  selectedLeadTier,
  setSelectedLeadTier,
  onSubmit,
  onBack,
  isCreating,
}: LeadTierStepProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          How many leads do you need?
        </h2>
        <p className="text-gray-600">
          We guarantee qualified leads with relevance score 60+
        </p>
      </div>

      {/* Pricing Tiers */}
      <div className="grid md:grid-cols-3 gap-6">
        {(Object.keys(LEAD_TIER_CONFIG) as LeadTierKey[]).map((tier) => {
          const config = LEAD_TIER_CONFIG[tier];
          const isSelected = selectedLeadTier === tier;

          return (
            <button
              key={tier}
              type="button"
              onClick={() => setSelectedLeadTier(tier)}
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

              {/* Tier Name */}
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {config.label}
              </h3>

              {/* Lead Count */}
              <div className="mb-4">
                <span className="text-5xl font-bold text-gray-900">
                  {config.leadsIncluded}
                </span>
                <span className="text-gray-600 ml-2">leads</span>
              </div>

              {/* Price */}
              <div className="mb-2">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(config.price)}
                </span>
              </div>

              {/* Tagline */}
              <p className="text-sm text-gray-500 mb-4">{config.tagline}</p>

              {/* Per Lead Price */}
              <div className="text-xs text-gray-400">
                ~{formatPrice(Math.round(config.price / config.leadsIncluded))}{" "}
                per lead
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
          disabled={!selectedLeadTier || isCreating}
          className="gap-2 bg-orange-500 hover:bg-orange-600 text-white"
        >
          {isCreating ? "Creating..." : "Get Leads"}
        </Button>
      </div>

      {/* Trust Badge */}
      <p className="text-xs text-gray-400 text-center">
        Secure payment via Stripe · Leads delivered in minutes
      </p>
    </div>
  );
}
