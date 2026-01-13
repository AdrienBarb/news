"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  TIME_WINDOW_CONFIG,
  formatPrice,
  type TimeWindow,
} from "@/lib/constants/timeWindow";
import {
  Loader2,
  ArrowRight,
  ArrowLeft,
  Zap,
  Search,
  FileSearch,
} from "lucide-react";

const TIME_WINDOW_ICONS = {
  LAST_7_DAYS: Zap,
  LAST_30_DAYS: Search,
  LAST_365_DAYS: FileSearch,
};

interface TimeWindowStepProps {
  selectedTimeWindow: TimeWindow | null;
  setSelectedTimeWindow: (tw: TimeWindow) => void;
  onSubmit: () => void;
  onBack: () => void;
  isCreating: boolean;
}

export default function TimeWindowStep({
  selectedTimeWindow,
  setSelectedTimeWindow,
  onSubmit,
  onBack,
  isCreating,
}: TimeWindowStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose your time window
        </h2>
        <p className="text-gray-600">
          How far back should we search for leads? Longer periods = more leads.
        </p>
      </div>

      {/* Time Window Options */}
      <div className="grid gap-4">
        {(Object.keys(TIME_WINDOW_CONFIG) as TimeWindow[]).map((tw) => {
          const config = TIME_WINDOW_CONFIG[tw];
          const Icon = TIME_WINDOW_ICONS[tw];
          const isSelected = selectedTimeWindow === tw;

          return (
            <button
              key={tw}
              type="button"
              onClick={() => setSelectedTimeWindow(tw)}
              className={cn(
                "relative flex items-center gap-4 p-6 rounded-2xl border-2 transition-all text-left cursor-pointer",
                isSelected
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 hover:border-orange-300 bg-white"
              )}
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  isSelected
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-500"
                )}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">
                    {config.label}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {config.description}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {tw === "LAST_7_DAYS" &&
                    "Fresh leads from recent discussions"}
                  {tw === "LAST_30_DAYS" &&
                    "Comprehensive search of the past month"}
                  {tw === "LAST_365_DAYS" &&
                    "Deep dive into a year of conversations"}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(config.price)}
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatPrice(config.price / 2)}
                  </span>
                </div>
                <div className="text-sm text-gray-500">one-time</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="text-gray-600"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!selectedTimeWindow || isCreating}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              Get Leads
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
