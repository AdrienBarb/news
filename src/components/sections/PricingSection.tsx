import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { SUBSCRIPTION } from "@/lib/constants/subscription";

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
            Simple pricing, built for founders
          </h2>
        </div>

        {/* Pricing Card */}
        <div className="max-w-xl mx-auto">
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
            </div>

            {/* Description */}
            <p className="text-lg text-foreground/70 mb-8">
              Everything you need to stay aligned with your market.
            </p>

            {/* CTA Button */}
            <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-14 text-lg rounded-full mb-10">
              <Link href={getStartedUrl}>Get Started for free</Link>
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
    </section>
  );
}
