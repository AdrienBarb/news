import { Badge } from "@/components/ui/badge";
import { Search, Target, Sparkles, Clock } from "lucide-react";

export default function WhatPrediqteDoesSection() {
  const painPoints = [
    {
      icon: Clock,
      pain: "Hours wasted scrolling Reddit",
      solution: "We do the searching for you",
    },
    {
      icon: Search,
      pain: "Missing relevant conversations",
      solution: "AI finds posts you'd never find",
    },
    {
      icon: Target,
      pain: "Low-quality, random leads",
      solution: "Every lead scored for relevance",
    },
    {
      icon: Sparkles,
      pain: "No idea why a lead matters",
      solution: "AI explains why each lead is relevant",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-[#FF4500]/5">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <Badge className="bg-foreground text-background hover:bg-foreground/90 px-4 py-1.5">
              The problem
            </Badge>
          </div>

          {/* Heading */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Reddit Has Your Customers.
              <br />
              <span className="text-foreground/50 font-normal">Finding them is the hard part.</span>
            </h2>
          </div>

          {/* Pain → Solution Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {painPoints.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="bg-card rounded-2xl p-6 shadow-sm border border-foreground/10 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#FF4500]/10 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-[#FF4500]" />
                    </div>
                    <div>
                      <p className="text-foreground/50 line-through text-sm mb-1">
                        {item.pain}
                      </p>
                      <p className="text-foreground font-medium text-lg">
                        {item.solution}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom stat */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-full px-6 py-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-600 font-medium">
                Founders find 10-50 qualified leads per search
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
