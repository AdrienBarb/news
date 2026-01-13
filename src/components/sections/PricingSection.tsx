"use client";

import { useState } from "react";
import { Check, Zap, Search, FileSearch, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { TIME_WINDOW_CONFIG, formatPrice } from "@/lib/constants/timeWindow";
import { cn } from "@/lib/utils";

type TimeWindowKey = keyof typeof TIME_WINDOW_CONFIG;

const TIME_WINDOW_OPTIONS: {
  key: TimeWindowKey;
  icon: typeof Zap;
  tagline: string;
}[] = [
  {
    key: "LAST_7_DAYS",
    icon: Zap,
    tagline: "Fresh conversations",
  },
  {
    key: "LAST_30_DAYS",
    icon: Search,
    tagline: "Most popular",
  },
  {
    key: "LAST_365_DAYS",
    icon: FileSearch,
    tagline: "Maximum coverage",
  },
];

const FEATURES = [
  "AI-powered relevance scoring",
  "Intent detection (recommendations, alternatives, complaints)",
  "AI reasoning for each lead",
  "Post metadata (upvotes, comments, date)",
  "Direct links to Reddit posts",
  "Email notification when ready",
];

export default function PricingSection({
  getStartedUrl,
}: {
  getStartedUrl: string;
}) {
  const [selected, setSelected] = useState<TimeWindowKey>("LAST_30_DAYS");
  const config = TIME_WINDOW_CONFIG[selected];
  const originalPrice = config.price;
  const discountedPrice = config.price / 2;

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-4xl mx-auto">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <Badge className="bg-foreground text-background hover:bg-foreground/90 px-4 py-1.5">
            Simple pricing
          </Badge>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl text-foreground mb-4">
            One price. One search. All the leads.
          </h2>
          <p className="text-lg text-foreground/60">
            No subscriptions. No monthly fees. Pay once, get your leads.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="bg-card rounded-3xl border-2 border-foreground/10 shadow-xl overflow-hidden">
          {/* Time Window Selector */}
          <div className="bg-muted/50 p-6 border-b border-foreground/10">
            <p className="text-sm text-foreground/60 text-center mb-4">
              How far back should we search?
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {TIME_WINDOW_OPTIONS.map((option) => {
                const Icon = option.icon;
                const optionConfig = TIME_WINDOW_CONFIG[option.key];
                const isSelected = selected === option.key;

                return (
                  <button
                    key={option.key}
                    onClick={() => setSelected(option.key)}
                    className={cn(
                      "flex-1 rounded-xl p-4 border-2 transition-all cursor-pointer",
                      isSelected
                        ? "border-[#FF4500] bg-[#FF4500]/5"
                        : "border-transparent bg-background hover:border-foreground/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          isSelected
                            ? "bg-[#FF4500] text-white"
                            : "bg-foreground/10 text-foreground/60"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p
                          className={cn(
                            "font-medium",
                            isSelected ? "text-foreground" : "text-foreground/70"
                          )}
                        >
                          {optionConfig.description}
                        </p>
                        <p className="text-xs text-foreground/50">
                          {option.tagline}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Display */}
          <div className="p-8 text-center">
            {/* Launch Discount Badge */}
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 mb-6">
              <span className="text-green-600 font-medium text-sm">
                🎉 Launch offer — 50% off
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-2xl text-foreground/40 line-through">
                {formatPrice(originalPrice)}
              </span>
              <span className="text-6xl font-bold text-foreground">
                {formatPrice(discountedPrice)}
              </span>
            </div>
            <p className="text-foreground/50 mb-8">one-time payment</p>

            {/* CTA */}
            <Button
              asChild
              size="lg"
              className="bg-[#FF4500] hover:bg-[#FF4500]/90 text-white h-14 px-10 text-lg rounded-full shadow-lg shadow-[#FF4500]/25"
            >
              <Link href={getStartedUrl}>
                Get Your Leads
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>

            {/* Trust badges */}
            <p className="text-sm text-foreground/40 mt-4">
              Secure payment via Stripe · Leads delivered in minutes
            </p>
          </div>

          {/* Features */}
          <div className="bg-muted/30 p-8 border-t border-foreground/10">
            <p className="text-sm font-medium text-foreground/60 text-center mb-4">
              WHAT&apos;S INCLUDED
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {FEATURES.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-foreground/70 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comparison note */}
        <div className="mt-8 text-center">
          <p className="text-foreground/50 text-sm">
            💡 Tip: The{" "}
            <span className="text-foreground font-medium">30-day search</span>{" "}
            gives you the best balance of fresh leads and volume.
          </p>
        </div>
      </div>
    </section>
  );
}
