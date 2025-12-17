import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function HeroSection({
  getStartedUrl,
}: {
  getStartedUrl: string;
}) {
  return (
    <div className="relative overflow-hidden min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto text-center space-y-12">
            <div className="flex justify-center">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/30">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered News Curation
              </Badge>
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl xl:text-7xl leading-tight text-foreground">
                Stay informed about tech — without spending your day on it.
              </h1>

              <p className="text-xl lg:text-2xl text-foreground/70 leading-relaxed max-w-3xl mx-auto">
                An AI-curated dashboard that shows only the tech news that
                actually matters
              </p>
            </div>

            <div className="flex justify-center pt-4">
              <Button
                asChild
                size="lg"
                className="text-lg px-12 py-6 bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                <Link href={getStartedUrl}>Start Free Trial</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 -z-10"></div>
    </div>
  );
}
