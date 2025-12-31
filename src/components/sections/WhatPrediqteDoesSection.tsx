import { Badge } from "@/components/ui/badge";

export default function WhatPrediqteDoesSection() {
  const features = [
    {
      title: "Repeated user pain",
      description:
        "See the problems users complain about again and again - not one-off opinions.",
      visual: "pain",
    },
    {
      title: "Unmet expectations",
      description:
        "Understand what users expected from tools like yours - and what's missing.",
      visual: "expectations",
    },
    {
      title: "Why users compare tools",
      description:
        "See why users compare products, hesitate to choose, or switch to alternatives.",
      visual: "compare",
    },
    {
      title: "Emerging opportunities",
      description:
        "Spot new needs, rising demand, and changes in what users care about.",
      visual: "opportunities",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-primary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <Badge className="bg-foreground text-background hover:bg-foreground/90 px-4 py-1.5">
              What Prediqte does
            </Badge>
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h2 className="text-4xl lg:text-5xl text-foreground mb-4">
              See what users want, complain about, and compare - at scale.
            </h2>
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
              Prediqte turns real user conversations into clear market insight.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 gap-6 mt-16 mb-12">
            {features.map((feature, index) => {
              return (
                <div
                  key={index}
                  className="bg-card rounded-2xl p-8 shadow-sm border border-foreground/10 hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-rethink-sans font-bold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-foreground/60">
                      {feature.description}
                    </p>
                  </div>

                  {/* Visual Data */}
                  {feature.visual === "pain" && <PainVisual />}
                  {feature.visual === "expectations" && <ExpectationsVisual />}
                  {feature.visual === "compare" && <CompareVisual />}
                  {feature.visual === "opportunities" && (
                    <OpportunitiesVisual />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function PainVisual() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-foreground/60">Top complaints</span>
        <span className="text-xs text-foreground/40">Mentions</span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-foreground/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
              style={{ width: "78%" }}
            ></div>
          </div>
          <span className="text-sm font-medium text-foreground w-12 text-right">
            342
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-foreground/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
              style={{ width: "62%" }}
            ></div>
          </div>
          <span className="text-sm font-medium text-foreground w-12 text-right">
            271
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-foreground/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
              style={{ width: "45%" }}
            ></div>
          </div>
          <span className="text-sm font-medium text-foreground w-12 text-right">
            198
          </span>
        </div>
      </div>
    </div>
  );
}

function ExpectationsVisual() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground/60">
          User expectations gap
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="mb-2">
            <div className="text-2xl font-semibold text-foreground">62%</div>
            <div className="text-xs text-foreground/50">Expected</div>
          </div>
          <div className="h-24 bg-gradient-to-t from-secondary to-secondary/40 rounded-lg"></div>
        </div>
        <div className="text-center">
          <div className="mb-2">
            <div className="text-2xl font-semibold text-foreground">31%</div>
            <div className="text-xs text-foreground/50">Delivered</div>
          </div>
          <div
            className="bg-gradient-to-t from-primary to-primary/40 rounded-lg"
            style={{ height: "48px" }}
          ></div>
        </div>
        <div className="text-center">
          <div className="mb-2">
            <div className="text-2xl font-semibold text-primary">31%</div>
            <div className="text-xs text-foreground/50">Gap</div>
          </div>
          <div
            className="bg-gradient-to-t from-foreground/10 to-foreground/5 rounded-lg border-2 border-dashed border-primary/30"
            style={{ height: "48px" }}
          ></div>
        </div>
      </div>
    </div>
  );
}

function CompareVisual() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-foreground/60">Comparison reasons</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
          <div className="text-2xl font-semibold text-foreground mb-1">156</div>
          <div className="text-xs text-foreground/60">Pricing concerns</div>
        </div>
        <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl p-4 border border-secondary/20">
          <div className="text-2xl font-semibold text-foreground mb-1">143</div>
          <div className="text-xs text-foreground/60">Missing features</div>
        </div>
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
          <div className="text-2xl font-semibold text-foreground mb-1">89</div>
          <div className="text-xs text-foreground/60">Poor UX</div>
        </div>
        <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl p-4 border border-secondary/20">
          <div className="text-2xl font-semibold text-foreground mb-1">67</div>
          <div className="text-xs text-foreground/60">Integrations</div>
        </div>
      </div>
    </div>
  );
}

function OpportunitiesVisual() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-foreground/60">Demand trend</span>
        <span className="text-sm font-medium text-primary">+127%</span>
      </div>
      <div className="relative h-24">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Area fill under the line */}
          <path
            d="M0,75 L8,68 L17,72 L25,62 L33,55 L42,58 L50,48 L58,40 L67,45 L75,32 L83,22 L92,28 L100,20 L100,100 L0,100 Z"
            fill="url(#gradient)"
            className="opacity-30"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop
                offset="0%"
                stopColor="currentColor"
                className="text-primary"
              />
              <stop
                offset="100%"
                stopColor="currentColor"
                className="text-primary"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>
          {/* Line */}
          <polyline
            points="0,75 8,68 17,72 25,62 33,55 42,58 50,48 58,40 67,45 75,32 83,22 92,28 100,20"
            fill="none"
            stroke="currentColor"
            className="text-primary"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="flex items-center justify-between text-xs text-foreground/40 pt-2">
        <span>Jan</span>
        <span>Dec</span>
      </div>
    </div>
  );
}
