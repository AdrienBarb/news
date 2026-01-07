import { Globe, Search, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HowItWorksSection() {
  const steps = [
    {
      number: 1,
      icon: Globe,
      title: "Enter your website",
      description:
        "We analyze your site to understand what you sell, who you help, and what keywords your customers use.",
    },
    {
      number: 2,
      icon: Search,
      title: "We scan Reddit daily",
      description:
        "Our AI searches Reddit every day for posts matching your product — people asking questions, comparing tools, or expressing frustration.",
    },
    {
      number: 3,
      icon: MessageSquare,
      title: "You engage & convert",
      description:
        "Review your leads, use our suggested replies, and engage manually. Turn conversations into customers.",
    },
  ];

  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <Badge className="bg-foreground text-background hover:bg-foreground/90 px-4 py-1.5">
            How it works
          </Badge>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl text-foreground mb-4">
            From website to warm leads in 3 steps
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="bg-card rounded-2xl p-8 shadow-sm border border-foreground/10 hover:shadow-md transition-shadow relative"
              >
                {/* Step Number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-[#FF4500] text-white flex items-center justify-center text-sm font-bold">
                  {step.number}
                </div>

                {/* Icon - Centered */}
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#FF4500]/10 border border-[#FF4500]/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#FF4500]" />
                  </div>
                </div>

                {/* Title - Centered */}
                <h3 className="text-xl text-foreground mb-3 text-center">
                  {step.title}
                </h3>

                {/* Description - Centered */}
                <p className="text-sm text-foreground/60 text-center">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
