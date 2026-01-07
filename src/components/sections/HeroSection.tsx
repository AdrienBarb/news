import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import Link from "next/link";

export default function HeroSection({
  getStartedUrl,
}: {
  getStartedUrl: string;
}) {
  return (
    <div className="relative overflow-hidden min-h-screen flex flex-col">
      {/* Hero Content - Centered */}
      <div className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto text-center">
            {/* Badge */}
            <div className="flex justify-center mb-4">
              <Badge className="bg-[#FF4500]/10 text-[#FF4500] hover:bg-[#FF4500]/20 border-[#FF4500]/30">
                <Zap className="w-3 h-3 mr-1" />
                AI-Powered Reddit Lead Discovery
              </Badge>
            </div>

            {/* Headlines */}
            <div className="space-y-6 mb-8">
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-rethink-sans font-bold leading-tight text-foreground">
                Find High-Intent Leads on Reddit
              </h1>

              <p className="text-xl lg:text-2xl text-foreground/70 leading-relaxed max-w-4xl mx-auto">
                Our AI monitors Reddit 24/7, detects buying signals, and
                surfaces people actively looking for solutions like yours.
              </p>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center pt-4">
              <Button
                asChild
                className="bg-[#FF4500] hover:bg-[#FF4500]/90 text-white h-14 px-8 text-lg rounded-full"
              >
                <Link href={getStartedUrl}>Start Finding Leads</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF4500]/5 via-transparent to-primary/5 -z-10"></div>
    </div>
  );
}
