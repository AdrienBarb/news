import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Star } from "lucide-react";
import Image from "next/image";
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
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/30">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered Market Intelligence
              </Badge>
            </div>

            {/* Headlines */}
            <div className="space-y-6 mb-8">
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-rethink-sans font-bold leading-tight text-foreground">
                Know what users want — before you build.
              </h1>

              <p className="text-xl lg:text-2xl text-foreground/70 leading-relaxed max-w-4xl mx-auto">
                Prediqte helps SaaS founders understand user pain, expectations,
                and opportunities across their market.
              </p>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center pt-4">
              <Button
                asChild
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground h-14 px-8 text-lg rounded-full"
              >
                <Link href={getStartedUrl}>Get Started for free</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 -z-10"></div>
    </div>
  );
}
