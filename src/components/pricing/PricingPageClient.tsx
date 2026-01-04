"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useClientPostHogEvent } from "@/lib/tracking/useClientPostHogEvent";
import { useUser } from "@/lib/hooks/useUser";
import { SUBSCRIPTION } from "@/lib/constants/subscription";

export default function PricingPageClient() {
  const { sendEvent } = useClientPostHogEvent();
  const { user } = useUser();

  const handleStartTrial = () => {
    sendEvent({
      eventName: "pricing_page_trial_started",
    });

    const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PRICE_LINK_MONTHLY;
    if (paymentLink) {
      const url = new URL(paymentLink);
      if (user?.email) {
        url.searchParams.set("prefilled_email", user.email);
      }
      window.location.href = url.toString();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center py-16 px-6">
        <div className="max-w-xl w-full">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <Badge className="bg-foreground text-background hover:bg-foreground/90 px-4 py-1.5">
              Start your free trial
            </Badge>
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl text-foreground mb-4">
              Try Prediqte free for {SUBSCRIPTION.TRIAL_DAYS} days
            </h1>
          </div>

          {/* Pricing Card */}
          <div className="bg-gradient-to-br from-card to-muted/50 rounded-3xl p-10 shadow-lg border-2 border-foreground/10">
            {/* Plan Name */}
            <div className="mb-8">
              <h3 className="text-2xl text-foreground">
                {SUBSCRIPTION.PLAN_NAME}
              </h3>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-6xl text-foreground">
                  ${SUBSCRIPTION.PRICE_MONTHLY}
                </span>
                <span className="text-2xl text-foreground/60">/ month</span>
              </div>
              <p className="text-sm text-primary mt-2">
                After your {SUBSCRIPTION.TRIAL_DAYS}-day free trial
              </p>
            </div>

            {/* Description */}
            <p className="text-lg text-foreground/70 mb-8">
              Everything you need to stay aligned with your market.
            </p>

            {/* CTA Button */}
            <Button
              onClick={handleStartTrial}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-14 text-lg rounded-full mb-10"
            >
              Start {SUBSCRIPTION.TRIAL_DAYS}-day free trial
            </Button>

            {/* Features List */}
            <div className="space-y-4 mb-8">
              {SUBSCRIPTION.FEATURES.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                  </div>
                  <span className="text-foreground/80">{feature}</span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <p className="text-sm text-foreground/50 text-center">
              Cancel anytime. No long-term commitment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
