import { Badge } from "@/components/ui/badge";

export default function WhatPrediqteDoesSection() {
  const features = [
    {
      title: "Find warm leads on autopilot",
      description:
        "AI monitors Reddit 24/7 for people expressing problems, asking for recommendations, or comparing tools.",
      visual: "leads",
    },
    {
      title: "Detect buying intent signals",
      description:
        "Surface posts where people are actively searching for solutions — not just talking about problems.",
      visual: "intent",
    },
    {
      title: "Track competitor mentions",
      description:
        "See when people complain about competitors, ask for alternatives, or consider switching.",
      visual: "competitors",
    },
    {
      title: "Engage at the right moment",
      description:
        "Get notified when fresh opportunities appear. Timing matters — reply while the conversation is active.",
      visual: "timing",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-[#FF4500]/5">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <Badge className="bg-foreground text-background hover:bg-foreground/90 px-4 py-1.5">
              What we do
            </Badge>
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h2 className="text-4xl lg:text-5xl text-foreground mb-4">
              Turn Reddit into your #1 inbound lead channel
            </h2>
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
              Every day, people on Reddit ask for exactly what you sell. We help you find them.
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
                  {feature.visual === "leads" && <LeadsVisual />}
                  {feature.visual === "intent" && <IntentVisual />}
                  {feature.visual === "competitors" && <CompetitorsVisual />}
                  {feature.visual === "timing" && <TimingVisual />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function LeadsVisual() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-foreground/60">New leads this week</span>
        <span className="text-xs text-[#FF4500] font-medium">+24%</span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#FF4500]/20 flex items-center justify-center text-xs font-bold text-[#FF4500]">r/</div>
          <div className="flex-1">
            <div className="text-sm font-medium text-foreground">Looking for CRM alternatives</div>
            <div className="text-xs text-foreground/50">r/SaaS · 2h ago</div>
          </div>
          <span className="text-xs bg-green-500/20 text-green-600 px-2 py-1 rounded-full">High intent</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#FF4500]/20 flex items-center justify-center text-xs font-bold text-[#FF4500]">r/</div>
          <div className="flex-1">
            <div className="text-sm font-medium text-foreground">Frustrated with current tool</div>
            <div className="text-xs text-foreground/50">r/startups · 4h ago</div>
          </div>
          <span className="text-xs bg-yellow-500/20 text-yellow-600 px-2 py-1 rounded-full">Medium</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#FF4500]/20 flex items-center justify-center text-xs font-bold text-[#FF4500]">r/</div>
          <div className="flex-1">
            <div className="text-sm font-medium text-foreground">Need recommendation for...</div>
            <div className="text-xs text-foreground/50">r/Entrepreneur · 6h ago</div>
          </div>
          <span className="text-xs bg-green-500/20 text-green-600 px-2 py-1 rounded-full">High intent</span>
        </div>
      </div>
    </div>
  );
}

function IntentVisual() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground/60">Intent signals detected</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-[#FF4500]/10 to-[#FF4500]/5 rounded-xl p-4 border border-[#FF4500]/20">
          <div className="text-2xl font-semibold text-foreground mb-1">47</div>
          <div className="text-xs text-foreground/60">&quot;Looking for&quot;</div>
        </div>
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
          <div className="text-2xl font-semibold text-foreground mb-1">32</div>
          <div className="text-xs text-foreground/60">&quot;Alternative to&quot;</div>
        </div>
        <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl p-4 border border-secondary/20">
          <div className="text-2xl font-semibold text-foreground mb-1">28</div>
          <div className="text-xs text-foreground/60">&quot;Recommend&quot;</div>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl p-4 border border-green-500/20">
          <div className="text-2xl font-semibold text-foreground mb-1">19</div>
          <div className="text-xs text-foreground/60">&quot;Switching from&quot;</div>
        </div>
      </div>
    </div>
  );
}

function CompetitorsVisual() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-foreground/60">Competitor mentions</span>
        <span className="text-xs text-foreground/40">This week</span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-foreground/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF4500] to-[#FF4500]/60 rounded-full"
              style={{ width: "78%" }}
            ></div>
          </div>
          <span className="text-sm font-medium text-foreground w-20 text-right">
            Competitor A
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-foreground/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF4500] to-[#FF4500]/60 rounded-full"
              style={{ width: "52%" }}
            ></div>
          </div>
          <span className="text-sm font-medium text-foreground w-20 text-right">
            Competitor B
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-foreground/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF4500] to-[#FF4500]/60 rounded-full"
              style={{ width: "35%" }}
            ></div>
          </div>
          <span className="text-sm font-medium text-foreground w-20 text-right">
            Competitor C
          </span>
        </div>
      </div>
      <div className="text-xs text-foreground/50 text-center pt-2">
        23 posts mention frustration with competitors
      </div>
    </div>
  );
}

function TimingVisual() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-foreground/60">Best time to engage</span>
        <span className="text-sm font-medium text-green-500">Now</span>
      </div>
      <div className="relative">
        <div className="flex items-end justify-between h-20 gap-1">
          {[40, 65, 85, 100, 75, 50, 30].map((height, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t transition-all ${
                i === 3 ? "bg-[#FF4500]" : "bg-foreground/10"
              }`}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-foreground/40 mt-2">
          <span>0h</span>
          <span>6h</span>
          <span>12h</span>
          <span>24h</span>
        </div>
      </div>
      <div className="text-xs text-foreground/50 text-center">
        Reply rates drop 70% after 6 hours
      </div>
    </div>
  );
}
