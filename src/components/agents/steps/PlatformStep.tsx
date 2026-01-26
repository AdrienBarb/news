import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLATFORM_CONFIG, type PlatformKey } from "@/lib/constants/platforms";

interface PlatformSuggestion {
  platform: PlatformKey;
  reason: string;
  confidence: "high" | "medium" | "low";
}

interface PlatformStepProps {
  selectedPlatform: PlatformKey | null;
  setSelectedPlatform: (platform: PlatformKey) => void;
  suggestedPlatforms: PlatformSuggestion[];
  onSubmit: () => void;
  onBack: () => void;
}

export default function PlatformStep({
  selectedPlatform,
  setSelectedPlatform,
  suggestedPlatforms,
  onSubmit,
  onBack,
}: PlatformStepProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Where should we find leads?
        </h2>
        <p className="text-gray-600">
          Select the platform where our AI will search for high-intent conversations.
        </p>
      </div>

      {/* Platform Cards */}
      <div className="grid gap-4">
        {/* Sort platforms: enabled first, then by suggestion confidence */}
        {(Object.keys(PLATFORM_CONFIG) as PlatformKey[])
          .sort((a, b) => {
            const aEnabled = PLATFORM_CONFIG[a].enabled ? 1 : 0;
            const bEnabled = PLATFORM_CONFIG[b].enabled ? 1 : 0;
            return bEnabled - aEnabled;
          })
          .map((key) => {
          const config = PLATFORM_CONFIG[key];
          const isEnabled = config.enabled;
          const isSelected = selectedPlatform === key;
          const suggestion = suggestedPlatforms.find((s) => s.platform === key);

          return (
            <button
              key={key}
              type="button"
              disabled={!isEnabled}
              onClick={() => isEnabled && setSelectedPlatform(key)}
              className={cn(
                "relative flex items-start gap-4 p-6 rounded-2xl border-2 transition-all text-left",
                isEnabled
                  ? "cursor-pointer hover:shadow-md"
                  : "cursor-not-allowed opacity-50",
                isSelected
                  ? "border-orange-500 bg-orange-50 shadow-md"
                  : "border-gray-200 bg-white"
              )}
            >
              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                {isEnabled ? (
                  <Badge className="bg-green-100 border border-green-300 text-green-700">
                    Live
                  </Badge>
                ) : (
                  <Badge variant="secondary">Coming Soon</Badge>
                )}
              </div>

              {/* Radio Circle */}
              <div
                className={cn(
                  "mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                  isSelected
                    ? "border-orange-500 bg-orange-500"
                    : "border-gray-300 bg-white"
                )}
              >
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-2 pr-16">
                <h3
                  className={cn(
                    "font-semibold text-lg",
                    isSelected ? "text-orange-700" : "text-gray-900"
                  )}
                >
                  {config.label}
                </h3>
                <p className="text-sm text-gray-600">{config.description}</p>

                {/* AI Suggestion */}
                {suggestion && (
                  <div
                    className={cn(
                      "mt-2 text-xs p-2 rounded-lg",
                      suggestion.confidence === "high"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : suggestion.confidence === "medium"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-gray-50 text-gray-600 border border-gray-200"
                    )}
                  >
                    <span className="font-medium">AI Suggested:</span>{" "}
                    {suggestion.reason}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={!selectedPlatform}
          className="gap-2 bg-orange-500 hover:bg-orange-600 text-white"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
