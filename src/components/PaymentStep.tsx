"use client";

import { Button } from "@/components/ui/button";
import { useClientPostHogEvent } from "@/lib/tracking/useClientPostHogEvent";
import { Check } from "lucide-react";
import { PlanType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { TRACKING_EVENTS } from "@/lib/constants/tracking";

export default function PaymentStep() {
  const { sendEvent } = useClientPostHogEvent();

  const router = useRouter();
  const handleActivateTrial = (plan: PlanType) => {
    if (!plan) return;

    sendEvent({
      eventName: TRACKING_EVENTS.ONBOARDING_TRIAL_STARTED,
      properties: {
        plan: plan,
      },
    });

    router.push("/news");
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
    <div className="flex-1 flex flex-col">
      <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
        <div className="text-center space-y-2 mb-4">
          <h1 className="text-3xl font-bold text-black">
            Start your 7-day free trial
          </h1>
          <p className="text-gray-600">
            Get full access to your daily tech brief for 7 days. Choose how you
            want to continue afterward with a simple one-time payment, no
            subscription.
          </p>
          <p className="text-xs text-gray-500">
            You&apos;ll only pay if you decide to continue after your 7-day
            trial.
          </p>
        </div>

        <div className="text-center mb-8">
          <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 border border-green-100">
            7-day free trial on every plan
          </span>
        </div>

        <div className="flex flex-col gap-8">
          {/* Features List - Not a card */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-black mb-4">
              What you get during your trial
            </h2>
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
            {/* 1-Year Access Card */}
            <div className="relative flex-1 bg-gray-50 rounded-lg border border-gray-200 p-6 flex flex-col text-center">
              <h3 className="text-lg font-semibold text-black mb-4 mt-2">
                1-Year Access
              </h3>
              <div className="mb-2">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-3xl font-bold text-black">55</span>
                  <span className="text-gray-600 text-sm">EUR</span>
                </div>
              </div>
              <p className="text-gray-600 text-xs mb-6">
                After your 7-day free trial, unlock 12 months of full access
                with a single 55€ payment. No subscription, no auto-renew.
              </p>
              <Button
                onClick={() => handleActivateTrial(PlanType.YEAR)}
                className="w-full font-semibold uppercase mt-auto"
              >
                START 7-DAY TRIAL
              </Button>
            </div>

            <div className="relative flex-1 bg-gray-50 rounded-lg border border-gray-200 p-6 flex flex-col text-center">
              <h3 className="text-lg font-semibold text-black mb-4 mt-2">
                Lifetime Access
              </h3>
              <div className="mb-2">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-gray-500 text-lg line-through">
                    149
                  </span>
                  <span className="text-3xl font-bold text-black">95</span>
                  <span className="text-gray-600 text-sm">EUR</span>
                </div>
              </div>
              <p className="text-gray-600 text-xs mb-6">
                Lock in lifetime access after your 7-day free trial for a
                one-time 95€ payment instead of 149€. No subscription, no
                recurring fees.
              </p>
              <Button
                onClick={() => handleActivateTrial(PlanType.LIFETIME)}
                className="w-full font-semibold uppercase mt-auto"
              >
                START 7-DAY TRIAL
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
