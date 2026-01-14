import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function HeroSection({
  getStartedUrl,
}: {
  getStartedUrl: string;
}) {
  return (
    <section
      aria-label="Hero"
      className="relative overflow-hidden min-h-screen flex flex-col"
    >
      {/* Hero Content - Centered */}
      <div className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="flex justify-center mb-6">
              <Badge className="bg-[#FF4500]/10 text-[#FF4500] hover:bg-[#FF4500]/20 border-[#FF4500]/30 px-4 py-1.5">
                <Zap className="w-3 h-3 mr-1.5" />
                Pay once, get leads instantly
              </Badge>
            </div>

            {/* Headlines */}
            <div className="space-y-6 mb-10">
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-rethink-sans font-bold leading-tight text-foreground">
                Find High-Intent Leads on Reddit
              </h1>

              <p className="text-xl lg:text-2xl text-foreground/70 leading-relaxed max-w-3xl mx-auto">
                Enter your website. Pick a time window. Get a list of people{" "}
                <span className="text-foreground font-medium">
                  actively looking for solutions like yours
                </span>
                .
              </p>
            </div>

            {/* Value Props */}
            <div className="flex flex-wrap justify-center gap-6 mb-10">
              {[
                "No subscription",
                "Leads in minutes",
                "AI-scored relevance",
              ].map((prop) => (
                <div
                  key={prop}
                  className="flex items-center gap-2 text-foreground/70"
                >
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>{prop}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="flex flex-col items-center gap-3">
              <Button
                asChild
                className="bg-[#FF4500] hover:bg-[#FF4500]/90 text-white h-14 px-10 text-lg rounded-full shadow-lg shadow-[#FF4500]/25"
              >
                <Link href={getStartedUrl}>Get Your Leads Now</Link>
              </Button>
              <p className="text-sm text-foreground/50">
                Starting at $9.50 · No credit card to browse
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF4500]/5 via-transparent to-primary/5 -z-10"></div>
    </section>
  );
}
