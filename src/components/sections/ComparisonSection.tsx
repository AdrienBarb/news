const traditionalTools = [
  "Show what already happened",
  "Focus on numbers, not intent",
  "Miss early demand signals",
];

const ourPlatform = [
  "Detects pain before traffic exists",
  "Reads conversations, not just clicks",
  "Surfaces demand before markets are obvious",
];

export default function ComparisonSection() {
  const comparisons = traditionalTools.map((other, index) => ({
    other,
    us: ourPlatform[index],
  }));

  return (
    <section className="relative py-24 bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl lg:text-5xl xl:text-6xl text-foreground mb-6">
            This is not another analytics or SEO tool.
          </h2>
        </div>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center py-6 bg-foreground/5 rounded-2xl border-2 border-border">
              <h3 className="text-2xl text-muted-foreground">
                Traditional tools
              </h3>
            </div>
            <div className="text-center py-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl border-2 border-primary/30">
              <h3 className="text-2xl text-foreground">Our platform</h3>
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
