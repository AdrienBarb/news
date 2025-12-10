"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import useApi from "@/lib/hooks/useApi";
import toast from "react-hot-toast";
import { useClientPostHogEvent } from "@/lib/tracking/useClientPostHogEvent";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { PlanType } from "@prisma/client";

export default function SubscriptionPaymentContent() {
  const { usePost } = useApi();
  const { sendEvent } = useClientPostHogEvent();
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);

  const { mutate: createCheckoutSession } = usePost(
    "/checkout/create-session",
    {
      onSuccess: (data: { url: string }) => {
        sendEvent({
          eventName: "subscription_modal_checkout_session_created",
          properties: {
            plan: selectedPlan,
          },
        });
        if (data.url) {
          window.location.href = data.url;
        }
      },
      onError: (error: unknown) => {
        const errorMessage =
          error &&
          typeof error === "object" &&
          "response" in error &&
          error.response &&
          typeof error.response === "object" &&
          "data" in error.response &&
          error.response.data &&
          typeof error.response.data === "object" &&
          "error" in error.response.data
            ? String(error.response.data.error)
            : undefined;
        toast.error(errorMessage || "Failed to create checkout session");
        setIsCreatingCheckout(false);
      },
    }
  );

  const handleActivateTrial = (plan: PlanType) => {
    if (!plan) return;

    sendEvent({
      eventName: "subscription_modal_payment_initiated",
      properties: {
        plan: plan,
      },
    });
    setSelectedPlan(plan);
    setIsCreatingCheckout(true);
    createCheckoutSession({
      plan,
      successUrl: "/news",
      cancelUrl: "/news",
    });
  };

  const features = [
    "Only the 10 most important tech stories each day",
    "Ultra-clear AI summaries you can read in under 3 minutes",
    "Personalized feed based on your interests",
    "Noise-free experience — no clickbait, no endless scroll",
    "Save articles to read later",
    "Weekly recap so you never miss the big moves",
    "Search by company, topic or technology",
  ];

  return (
    <div className="flex flex-col">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold text-black">
          Stay sharp on tech in 3 minutes a day
        </h1>
        <p className="text-gray-600">
          Unlock your personal daily brief with one simple, no-subscription
          payment.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Features List */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-black mb-4">What you unlock</h2>
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li
                key={index}
                className="flex items-center justify-center gap-3"
              >
                <Check className="h-5 w-5 text-primary shrink-0" />
                <span className="text-black text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing Cards */}
        <div className="flex flex-col sm:flex-row gap-8 sm:gap-4">
          {/* 1-Year Pass Card */}
          <div className="flex-1 bg-gray-50 rounded-lg border border-gray-200 p-6 flex flex-col text-center">
            <h3 className="text-lg font-semibold text-black mb-4">
              1-Year Access
            </h3>
            <div className="mb-2">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-3xl font-bold text-black">55</span>
                <span className="text-gray-600 text-sm">EUR</span>
              </div>
            </div>
            <p className="text-gray-600 text-xs mb-6">
              One-time payment. No subscription
            </p>
            <Button
              onClick={() => handleActivateTrial(PlanType.YEAR)}
              disabled={isCreatingCheckout}
              className={cn(
                "w-full font-semibold uppercase mt-auto",
                isCreatingCheckout && "opacity-50 cursor-not-allowed"
              )}
            >
              {isCreatingCheckout && selectedPlan === PlanType.YEAR
                ? "Redirecting..."
                : "GET 1-YEAR ACCESS"}
            </Button>
          </div>

          {/* Lifetime Deal Card */}
          <div className="flex-1 bg-gray-50 rounded-lg border border-gray-200 p-6 flex flex-col relative text-center">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
              POPULAR
            </div>
            <h3 className="text-lg font-semibold text-black mb-4 mt-2">
              Lifetime Access
            </h3>
            <div className="mb-2">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-gray-500 text-lg line-through">149</span>
                <span className="text-3xl font-bold text-black">95</span>
                <span className="text-gray-600 text-sm">EUR</span>
              </div>
            </div>
            <p className="text-gray-600 text-xs mb-6">
              One-time payment. No subscription
            </p>
            <Button
              onClick={() => handleActivateTrial(PlanType.LIFETIME)}
              disabled={isCreatingCheckout}
              className={cn(
                "w-full font-semibold uppercase mt-auto",
                isCreatingCheckout && "opacity-50 cursor-not-allowed"
              )}
            >
              {isCreatingCheckout && selectedPlan === PlanType.LIFETIME
                ? "Redirecting..."
                : "GET LIFETIME ACCESS"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
