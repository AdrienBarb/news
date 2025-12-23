import { X } from "lucide-react";

export default function PainSection() {
  const problems = [
    "scroll Reddit for hours",
    "skim reviews",
    "bookmark tweets",
    "trust gut feelings",
  ];

  return (
    <section className="relative py-32 overflow-hidden bg-gradient-to-br from-foreground to-foreground/80">
      {/* Background decorative elements */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Headline */}
          <div className="mb-16">
            <h2 className="text-4xl lg:text-5xl xl:text-6xl text-background leading-tight">
              Most SaaS founders fail for one reason.
            </h2>
          </div>

          {/* Main Copy */}
          <div className="space-y-12 mb-16">
            <div className="space-y-4">
              <p className="text-2xl lg:text-3xl text-background/90 leading-relaxed">
                You don't fail because of bad code.
              </p>
              <p className="text-2xl lg:text-3xl text-secondary leading-relaxed">
                You fail because nobody really wanted the product.
              </p>
            </div>

            <div className="pt-4">
              <p className="text-xl text-background/60 mb-8">So you:</p>

              {/* Problem List */}
              <div className="space-y-4 max-w-md mx-auto">
                {problems.map((problem, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-center gap-3"
                  >
                    <X className="w-5 h-5 text-background/40 flex-shrink-0" />
                    <p className="text-lg text-background/70">{problem}</p>
                  </div>
                ))}
              </div>

              <p className="text-xl text-background/60 mt-8 italic">
                And still guess.
              </p>
            </div>
          </div>

          {/* Closing Line */}
          <div className="pt-8 border-t border-background/10">
            <p className="text-xl lg:text-2xl text-background/90">
              Guessing is expensive.{" "}
              <span className="text-primary">We replace it with evidence.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

