"use client";

import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

const PRICING_TIERS = [
  {
    name: "Starter",
    runs: 1,
    estimatedLeads: "~20-50 leads",
    price: 9.5,
    tagline: "Test it out",
    badge: null,
    popular: false,
  },
  {
    name: "Growth",
    runs: 3,
    estimatedLeads: "~60-150 leads",
    price: 24.5,
    tagline: "Most popular",
    badge: "Most popular",
    popular: true,
  },
  {
    name: "Scale",
    runs: 10,
    estimatedLeads: "~200-500 leads",
    price: 49.5,
    tagline: "Best value",
    badge: "Best value",
    popular: false,
  },
];

const FEATURES = [
  "AI-powered relevance scoring",
  "Intent detection (recommendations, complaints, questions)",
  "AI explanation for why each lead matches your ICP",
  "Direct link to each lead",
  "Lead metadata (engagement, date, context)",
  "Email notification when ready",
];

function formatPrice(price: number): string {
  return `$${price.toFixed(2).replace(/\.00$/, "")}`;
}

export default function PricingSection({
  getStartedUrl,
}: {
  getStartedUrl: string;
}) {
  return (
    <section
      id="pricing"
      className="py-24 px-6 bg-gradient-to-b from-background to-muted/30 scroll-mt-20"
    >
      <div className="max-w-5xl mx-auto">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <Badge className="bg-foreground text-background hover:bg-foreground/90 px-4 py-1.5">
            Simple pricing
          </Badge>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Pay Per Run. No Subscription.
          </h2>
          <p className="text-lg text-foreground/60">
            Buy runs, launch agents, get unlimited leads.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                "relative bg-card rounded-3xl p-8 border-2 transition-all",
                tier.popular
                  ? "border-[#FF4500] shadow-xl shadow-[#FF4500]/10 scale-105"
                  : "border-foreground/10 hover:border-foreground/20"
              )}
            >
              {/* Badge */}
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-4 py-1 text-xs font-semibold",
                      tier.popular
                        ? "bg-[#FF4500] text-white"
                        : "bg-green-100 border border-green-300 text-green-700"
                    )}
                  >
                    {tier.badge}
                  </span>
                </div>
              )}

              {/* Tier Name */}
              <h3 className="text-xl font-semibold text-foreground mb-2 text-center">
                {tier.name}
              </h3>

              {/* Runs Count */}
              <div className="text-center mb-2">
                <span className="text-5xl font-bold text-foreground">
                  {tier.runs}
                </span>
                <span className="text-foreground/60 ml-2">
                  run{tier.runs > 1 ? "s" : ""}
                </span>
              </div>

              {/* Estimated leads */}
              <p className="text-sm text-foreground/50 text-center mb-4">
                {tier.estimatedLeads} per run
              </p>

              {/* Price */}
              <div className="text-center mb-2">
                <span className="text-3xl font-bold text-foreground">
                  {formatPrice(tier.price)}
                </span>
              </div>

              {/* Per Run Price */}
              <p className="text-sm text-foreground/50 text-center mb-6">
                {formatPrice(tier.price / tier.runs)} per run
              </p>

              {/* CTA */}
              <Button
                asChild
                size="lg"
                className={cn(
                  "w-full h-12 rounded-full",
                  tier.popular
                    ? "bg-[#FF4500] hover:bg-[#FF4500]/90 text-white shadow-lg shadow-[#FF4500]/25"
                    : "bg-foreground text-background hover:bg-foreground/90"
                )}
              >
                <Link href={getStartedUrl}>
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="bg-card rounded-3xl border-2 border-foreground/10 p-8">
          <p className="text-sm font-medium text-foreground/60 text-center mb-6">
            WHAT&apos;S INCLUDED IN EVERY RUN
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

        {/* Trust badges */}
        <p className="text-sm text-foreground/40 mt-6 text-center">
          Secure payment via Stripe · Leads delivered in minutes
        </p>
      </div>
    </section>
  );
}
