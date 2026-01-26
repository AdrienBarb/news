import { Badge } from "@/components/ui/badge";
import { Search, Target, Sparkles, Clock } from "lucide-react";

export default function WhatPrediqteDoesSection() {
  const painPoints = [
    {
      icon: Clock,
      pain: "Hours wasted scrolling forums and social media",
      solution: "We scan multiple platforms for you",
    },
    {
      icon: Search,
      pain: "No idea where your ICP hangs out",
      solution: "AI finds where your customers are",
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
              Your Future Customers Are Out There.
              <br />
              <span className="text-foreground/50 font-normal">
                Finding Them Is the Hard Part.
              </span>
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
        </div>
      </div>
    </section>
  );
}
