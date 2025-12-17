import { X, Check } from "lucide-react";

const comparisons = [
  {
    other: "Pull from a limited set of sources",
    us: "Scans tech news, social platforms, newsletters, videos, and podcasts",
  },
  {
    other: "Show raw links and headlines",
    us: "AI summarizes everything into clear, readable insights",
  },
  {
    other: "One-size-fits-all feeds",
    us: "Build your own personalized brief and newsletter",
  },
  {
    other: "Prioritize volume",
    us: "Surface only the most important stories",
  },
  {
    other: "Popularity-driven",
    us: "Relevance and impact-driven",
  },
  {
    other: "Fragmented experience",
    us: "One clean, distraction-free dashboard",
  },
  {
    other: "Reading-only",
    us: "Listen to stories with AI voice",
  },
  {
    other: "Designed for consumption",
    us: "Designed for understanding",
  },
  {
    other: "Try to keep you engaged",
    us: "Help you feel informed — then move on",
  },
];

export default function ComparisonSection() {
  return (
    <section className="relative py-24 bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl lg:text-5xl xl:text-6xl text-foreground mb-6">
            Not all tech aggregators are built the same way.
          </h2>
        </div>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center py-6 bg-foreground/5 rounded-2xl border-2 border-border">
              <h3 className="text-2xl text-muted-foreground">
                Other aggregators
              </h3>
            </div>
            <div className="text-center py-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl border-2 border-primary/30">
              <h3 className="text-2xl text-foreground">This dashboard</h3>
            </div>
          </div>
          <div className="space-y-4">
            {comparisons.map((item, index) => (
              <div key={index} className="grid grid-cols-2 gap-4 items-center">
                <div className="bg-card rounded-2xl p-2 border border-border flex items-center justify-center gap-4 h-full">
                  <p className="text-muted-foreground leading-relaxed text-center">
                    {item.other}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-background to-primary/5 rounded-2xl p-2 border-2 border-primary/20 flex items-center justify-center gap-4 h-full shadow-sm">
                  <p className="text-foreground leading-relaxed text-center">
                    {item.us}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="max-w-3xl mx-auto text-center mt-16">
          <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed">
            Designed to help you understand what matters — and confidently
            ignore the rest.
          </p>
        </div>
      </div>
    </section>
  );
}
