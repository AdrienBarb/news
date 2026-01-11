"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { ACCESS } from "@/lib/constants/subscription";
import { useUser } from "@/lib/hooks/useUser";
import { cn } from "@/lib/utils";

export default function SubscriptionPaymentContent() {
  const { user } = useUser();

  const handleGetAccess = (checkoutLink?: string) => {
    if (checkoutLink) {
      const url = new URL(checkoutLink);
      if (user?.email) {
        url.searchParams.set("prefilled_email", user.email);
      }
      window.open(url.toString(), "_self");
    }
  };

  return (
    <div className="flex flex-col">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Get access to Prediqte
        </h1>
        <p className="text-muted-foreground">
          One-time payment. No subscriptions. Full access included.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {ACCESS.PASSES.map((pass) => {
          const isPopular = "popular" in pass && pass.popular;
          return (
            <div
              key={pass.id}
              className={cn(
                "relative rounded-2xl border p-6",
                isPopular
                  ? "bg-foreground text-background border-foreground"
                  : "bg-muted/50 border-border"
              )}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-2.5 left-4">
                  <Badge className="bg-secondary text-secondary-foreground px-3 py-0.5 text-xs">
                    Best Value
                  </Badge>
                </div>
              )}

              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3
                    className={cn(
                      "text-lg font-semibold",
                      isPopular ? "text-background" : "text-foreground"
                    )}
                  >
                    {pass.name}
                  </h3>
                  <p
                    className={cn(
                      "text-sm",
                      isPopular ? "text-background/60" : "text-muted-foreground"
                    )}
                  >
                    {pass.durationLabel} of full access
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span
                      className={cn(
                        "text-2xl font-bold",
                        isPopular ? "text-background" : "text-foreground"
                      )}
                    >
                      ${pass.price}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleGetAccess(pass.checkoutLink)}
                    size="sm"
                    className={cn(
                      "rounded-full px-6",
                      isPopular
                        ? "bg-background text-foreground hover:bg-background/90"
                        : "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                    )}
                  >
                    Get Access
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Features List */}
      <div className="mt-8 pt-6 border-t border-border">
        <p className="text-sm font-medium text-foreground mb-4">
          All passes include:
        </p>
        <div className="grid grid-cols-2 gap-3">
          {ACCESS.FEATURES.map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-primary" />
                </div>
              </div>
              <span className="text-foreground/80 text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-6 text-center">
        One-time payment. No recurring charges.
      </p>
    </div>
  );
}
