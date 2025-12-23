import { Search, TrendingDown, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Demand & Pain Detection",
    description: "Surface the problems people actively struggle with.",
    color: "primary",
  },
  {
    icon: TrendingDown,
    title: "Competitive Weakness Analysis",
    description:
      "See where existing solutions fail users — and why they churn.",
    color: "secondary",
  },
  {
    icon: BarChart3,
    title: "Market Signal Scoring",
    description:
      "Understand which pains are real, rising, and worth building for.",
    color: "primary",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl xl:text-6xl text-foreground mb-6 leading-tight">
              A complete market intelligence engine — without the noise.
            </h2>
            <p className="text-xl lg:text-2xl text-foreground/70">
              We turn public web signals into clear market truth.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isPrimary = feature.color === "primary";
              return (
                <div key={index} className="text-center group">
                  {/* Icon */}
                  <div className="mb-6 inline-flex items-center justify-center">
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                        isPrimary ? "bg-primary/20" : "bg-secondary/20"
                      }`}
                    >
                      <Icon
                        className={`w-8 h-8 ${
                          isPrimary ? "text-primary" : "text-secondary"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="text-xl lg:text-2xl text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-foreground/70 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Authority Line */}
          <div className="text-center pt-12 border-t border-foreground/10">
            <p className="text-lg text-foreground/60 max-w-3xl mx-auto">
              Powered by a proprietary AI model built specifically for market
              signal detection — not generic summaries.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
