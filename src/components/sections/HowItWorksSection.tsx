import { Globe, Sparkles, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HowItWorksSection() {
  const steps = [
    {
      number: 1,
      icon: Globe,
      title: "Enter your website",
      description:
        "We analyze your site in seconds to understand your product and generate relevant keywords.",
      time: "30 seconds",
    },
    {
      number: 2,
      icon: Sparkles,
      title: "Pick your time window",
      description:
        "Last 7 days, 30 days, or full year. Longer windows = more leads. Pay once.",
      time: "10 seconds",
    },
    {
      number: 3,
      icon: ListChecks,
      title: "Get your leads",
      description:
        "Our AI scans Reddit, scores each post, and delivers a curated list within minutes.",
      time: "2-5 minutes",
    },
  ];

  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <Badge className="bg-foreground text-background hover:bg-foreground/90 px-4 py-1.5">
            How it works
          </Badge>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl text-foreground mb-4">
            From website to leads in under 5 minutes
          </h2>
          <p className="text-lg text-foreground/60">
            No setup. No learning curve. Just results.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-foreground/10 to-transparent -translate-y-1/2" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative">
                  <div className="bg-card rounded-2xl p-8 shadow-sm border border-foreground/10 hover:shadow-lg transition-shadow text-center h-full">
                    {/* Step Number */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#FF4500] text-white flex items-center justify-center text-sm font-bold shadow-lg">
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div className="flex justify-center mb-4 mt-2">
                      <div className="w-14 h-14 rounded-2xl bg-[#FF4500]/10 border border-[#FF4500]/20 flex items-center justify-center">
                        <Icon className="w-7 h-7 text-[#FF4500]" />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-foreground/60 mb-4">{step.description}</p>

                    {/* Time Badge */}
                    <div className="inline-flex items-center gap-1.5 bg-foreground/5 rounded-full px-3 py-1 text-sm text-foreground/50">
                      <span>⏱</span>
                      <span>{step.time}</span>
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
