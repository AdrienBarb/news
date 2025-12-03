import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  getStartedUrl: string;
}

export default function HeroSection({ getStartedUrl }: HeroSectionProps) {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center justify-center">
        <div className="max-w-xl text-center flex flex-col items-center justify-center lg:text-left lg:items-start">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl mb-6">
            Tech Moves Fast. Stay Ahead in 3 Minutes a Day.
          </h1>
          <p className="text-xl text-muted-foreground mb-4 max-w-2xl">
            10 curated tech stories a day. Stay sharp, informed, and ahead — in
            minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="font-bold" asChild>
              <Link href={getStartedUrl}>Get Started</Link>
            </Button>
          </div>
        </div>

        <div className="flex-1 w-full max-w-md">
          <div className="rounded-lg overflow-hidden">
            <Image
              src="/home2.png"
              alt="Tech news preview"
              width={900}
              height={600}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
