import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ACCESS } from "@/lib/constants/subscription";
import { cn } from "@/lib/utils";

export default function PricingSection({
  getStartedUrl,
}: {
  getStartedUrl: string;
}) {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <Badge className="bg-foreground text-background hover:bg-foreground/90 px-4 py-1.5">
            Pricing
          </Badge>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl text-foreground mb-4">
            Simple one-time pricing
          </h2>
          <p className="text-lg text-foreground/60">
            No subscriptions. Pay once, get full access for the duration you
            choose.
          </p>
        </div>

        {/* Pass Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {ACCESS.PASSES.map((pass) => {
            const isPopular = "popular" in pass && pass.popular;
            return (
              <div
                key={pass.id}
                className={cn(
                  "relative rounded-3xl p-8 shadow-lg border-2 transition-all duration-200 hover:scale-[1.02]",
                  isPopular
                    ? "bg-foreground text-background border-foreground"
                    : "bg-gradient-to-br from-card to-muted/50 border-foreground/10"
                )}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-secondary text-secondary-foreground px-4 py-1 text-sm">
                      Best Value
                    </Badge>
                  </div>
                )}

                {/* Pass Name */}
                <div className="mb-6">
                  <h3
                    className={cn(
                      "text-xl font-medium",
                      isPopular ? "text-background" : "text-foreground"
                    )}
                  >
                    {pass.name}
                  </h3>
                  <p
                    className={cn(
                      "text-sm mt-1",
                      isPopular ? "text-background/60" : "text-foreground/60"
                    )}
                  >
                    {pass.durationLabel} of full access
                  </p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span
                      className={cn(
                        "text-5xl font-bold",
                        isPopular ? "text-background" : "text-foreground"
                      )}
                    >
                      ${pass.price}
                    </span>
                    <span
                      className={cn(
                        "text-lg",
                        isPopular ? "text-background/60" : "text-foreground/60"
                      )}
                    >
                      one-time
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  asChild
                  className={cn(
                    "w-full h-12 text-base rounded-full mb-8",
                    isPopular
                      ? "bg-background text-foreground hover:bg-background/90"
                      : "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  )}
                >
                  <Link href={getStartedUrl}>Get {pass.durationLabel} access</Link>
                </Button>

                {/* Features List */}
                <div className="space-y-3">
                  {ACCESS.FEATURES.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <div
                          className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center",
                            isPopular ? "bg-background/20" : "bg-primary/20"
                          )}
                        >
                          <Check
                            className={cn(
                              "w-3 h-3",
                              isPopular ? "text-background" : "text-primary"
                            )}
                          />
                        </div>
                      </div>
                      <span
                        className={cn(
                          "text-sm",
                          isPopular ? "text-background/80" : "text-foreground/80"
                        )}
                      >
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <p className="text-sm text-foreground/50 text-center mt-10">
          One-time payment. No recurring charges. Full access included.
        </p>
      </div>
    </section>
  );
}
