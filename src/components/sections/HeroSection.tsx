import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  getStartedUrl: string;
}

export default function HeroSection({ getStartedUrl }: HeroSectionProps) {
  return (
    <section className="container mx-auto px-4 py-20 md:py-32">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl mb-6">
          Tech Moves Fast. Stay Ahead in 3 Minutes a Day.
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          10 curated tech stories a day. Stay sharp, informed, and ahead — in
          minutes.
        </p>
        <div className="mb-6 flex justify-center max-w-lg mx-auto">
          <Image
            src="/home.png"
            alt="Tech news illustration"
            width={800}
            height={400}
            className="w-full max-w-4xl h-auto"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="font-bold" asChild>
            <Link href={getStartedUrl}>Get Started</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
