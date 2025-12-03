"use client";

import { ChevronDown } from "lucide-react";

export default function WelcomeCard() {
  return (
    <div className="aspect-[4/5] w-full rounded-lg bg-background overflow-hidden flex flex-col items-center gap-2">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold text-primary font-playfair-display">
            Hello!
          </h2>
          <p className="text-xl font-bold font-playfair-display text-muted-foreground">
            Swipe up to start reading today&apos;s news
          </p>
        </div>
        <div className="flex justify-center pb-4">
          <ChevronDown className="w-6 h-6 text-muted-foreground animate-bounce" />
        </div>
      </div>
    </div>
  );
}
