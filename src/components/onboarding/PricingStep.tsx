"use client";

import { Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useClientPostHogEvent } from "@/lib/tracking/useClientPostHogEvent";
import { TRACKING_EVENTS } from "@/lib/constants/tracking";
import { ACCESS, PassId } from "@/lib/constants/subscription";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/better-auth/auth-client";

interface PricingStepProps {
  onBack: () => void;
}

export default function PricingStep({ onBack }: PricingStepProps) {
  const { sendEvent } = useClientPostHogEvent();
  const { data: session } = useSession();

  const handleGetAccess = (passId: PassId, checkoutLink?: string) => {
    sendEvent({
      eventName: TRACKING_EVENTS.FREE_TRIAL_STARTED,
      properties: { pass: passId },
    });

    if (checkoutLink) {
      // Append user email to prefill Stripe checkout
      const url = new URL(checkoutLink);
      if (session?.user?.email) {
        url.searchParams.set("prefilled_email", session.user.email);
      }
      // The checkout link will redirect back to our app after payment
      // The webhook will handle creating the market with stored onboarding data
      window.open(url.toString(), "_self");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Choose your plan
        </h1>
        <p className="text-gray-600">
          One-time payment. No recurring charges. Start finding leads today.
        </p>
      </div>

      {/* Pass Cards */}
      <div className="space-y-4">
        {ACCESS.PASSES.map((pass) => {
          const isPopular = "popular" in pass && pass.popular;
          return (
            <div
              key={pass.id}
              className={cn(
                "relative rounded-2xl p-5 border-2 transition-all duration-200 hover:scale-[1.01] cursor-pointer",
                isPopular
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white border-gray-200 hover:border-orange-300"
              )}
              onClick={() => handleGetAccess(pass.id, pass.checkoutLink)}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-2.5 left-4">
                  <Badge className="bg-orange-500 text-white px-3 py-0.5 text-xs">
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className={cn(
                      "font-semibold",
                      isPopular ? "text-white" : "text-gray-900"
                    )}
                  >
                    {pass.name}
                  </h3>
                  <p
                    className={cn(
                      "text-sm",
                      isPopular ? "text-gray-400" : "text-gray-500"
                    )}
                  >
                    {pass.durationLabel} of full access
                  </p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span
                    className={cn(
                      "text-3xl font-bold",
                      isPopular ? "text-white" : "text-gray-900"
                    )}
                  >
                    ${pass.price}
                  </span>
                  <span
                    className={cn(
                      "text-sm",
                      isPopular ? "text-gray-400" : "text-gray-500"
                    )}
                  >
                    one-time
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Features List */}
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">
          All plans include:
        </p>
        <div className="grid grid-cols-2 gap-2">
          {ACCESS.FEATURES.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-shrink-0 w-4 h-4 rounded-full bg-orange-100 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-orange-600" />
              </div>
              <span className="text-xs text-gray-600">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="text-gray-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <p className="text-xs text-gray-400">
          Secure payment via Stripe
        </p>
      </div>
    </div>
  );
}

