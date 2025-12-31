import { Ear, ListFilter, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HowItWorksSection() {
  const steps = [
    {
      number: 1,
      icon: Ear,
      title: "We listen",
      description:
        "We analyze real, public conversations where users naturally talk about tools, problems, and expectations.",
    },
    {
      number: 2,
      icon: ListFilter,
      title: "We find patterns",
      description:
        "We group repeated opinions, complaints, and comparisons to separate real signals from noise.",
    },
    {
      number: 3,
      icon: Sparkles,
      title: "We surface insights",
      description:
        "You get clear, structured insights you can use to guide product, positioning, and strategy.",
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
            Simple, continuous market insight — without extra work.
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="bg-card rounded-2xl p-8 shadow-sm border border-foreground/10 hover:shadow-md transition-shadow"
              >
                {/* Icon - Centered */}
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-muted border border-foreground/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-foreground/60" />
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

