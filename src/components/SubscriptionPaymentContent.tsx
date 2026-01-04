"use client";

import { Button } from "@/components/ui/button";
import { useClientPostHogEvent } from "@/lib/tracking/useClientPostHogEvent";
import { Check } from "lucide-react";
import { SUBSCRIPTION } from "@/lib/constants/subscription";
import { useUser } from "@/lib/hooks/useUser";

interface SubscriptionPaymentContentProps {
  hasStartedTrial: boolean;
}

export default function SubscriptionPaymentContent({
  hasStartedTrial,
}: SubscriptionPaymentContentProps) {
  const { sendEvent } = useClientPostHogEvent();
  const { user } = useUser();

  const handleSubscribe = () => {
    sendEvent({
      eventName: hasStartedTrial
        ? "subscription_modal_payment_initiated"
        : "subscription_modal_trial_started",
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
    <div className="flex flex-col">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          {hasStartedTrial
            ? "Your trial has ended"
            : `Start your ${SUBSCRIPTION.TRIAL_DAYS}-day free trial`}
        </h1>
        <p className="text-muted-foreground">
          {hasStartedTrial
            ? "Subscribe to continue getting market insights."
            : `Get full access to Prediqte for ${SUBSCRIPTION.TRIAL_DAYS} days. No charge until your trial ends.`}
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Pricing Card */}
        <div className="bg-muted/50 rounded-2xl border border-border p-8 text-center">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            {SUBSCRIPTION.PLAN_NAME}
          </h3>
          <div className="mb-4">
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-bold text-foreground">
                ${SUBSCRIPTION.PRICE_MONTHLY}
              </span>
              <span className="text-muted-foreground">/ month</span>
            </div>
          </div>

          {/* Features List */}
          <ul className="space-y-3 mb-8 text-left max-w-xs mx-auto">
            {SUBSCRIPTION.FEATURES.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                </div>
                <span className="text-foreground/80 text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            onClick={handleSubscribe}
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12 text-base rounded-full"
          >
            {hasStartedTrial
              ? "Subscribe Now"
              : `Start ${SUBSCRIPTION.TRIAL_DAYS}-Day Free Trial`}
          </Button>

          <p className="text-xs text-muted-foreground mt-4">
            {hasStartedTrial
              ? "Cancel anytime. No long-term commitment."
              : `After your ${SUBSCRIPTION.TRIAL_DAYS}-day free trial. Cancel anytime.`}
          </p>
        </div>
      </div>
    </div>
  );
}
