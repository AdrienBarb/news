import { Badge } from "@/components/ui/badge";
import { Check, Clock } from "lucide-react";

const platforms = [
  {
    name: "Reddit",
    icon: (
      <svg
        className="w-8 h-8"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
      </svg>
    ),
    status: "live",
    color: "#FF4500",
  },
  {
    name: "HackerNews",
    icon: (
      <svg
        className="w-8 h-8"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0 0v24h24V0H0zm11.52 14.086V20h1.008v-5.914L16.5 5h-1.176l-3.288 7.446L8.724 5H7.5l3.9 8.988.12.098z" />
      </svg>
    ),
    status: "soon",
    color: "#FF6600",
  },
  {
    name: "Twitter",
    icon: (
      <svg
        className="w-8 h-8"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    status: "soon",
    color: "#000000",
  },
  {
    name: "LinkedIn",
    icon: (
      <svg
        className="w-8 h-8"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    status: "soon",
    color: "#0A66C2",
  },
];

export default function PlatformsSection() {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-6xl mx-auto">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <Badge className="bg-foreground text-background hover:bg-foreground/90 px-4 py-1.5">
            Where we find your leads
          </Badge>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            We Go Where Your Customers Are
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Different platforms, same result: people actively looking for what
            you sell.
          </p>
        </div>

        {/* Platform Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {platforms.map((platform) => {
            const isLive = platform.status === "live";
            return (
              <div
                key={platform.name}
                className={`
                  relative bg-card rounded-2xl p-6 border-2 transition-all text-center
                  ${
                    isLive
                      ? "border-foreground/10 hover:border-[#FF4500]/30 hover:shadow-lg"
                      : "border-foreground/5 opacity-60"
                  }
                `}
              >
                {/* Status Badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  {isLive ? (
                    <span className="inline-flex items-center gap-1 bg-green-100 border border-green-300 rounded-full px-3 py-1 text-xs font-medium text-green-700">
                      <Check className="w-3 h-3" />
                      Live
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-foreground/5 border border-foreground/10 rounded-full px-3 py-1 text-xs font-medium text-foreground/50">
                      <Clock className="w-3 h-3" />
                      Soon
                    </span>
                  )}
                </div>

                {/* Icon */}
                <div
                  className={`
                    w-16 h-16 rounded-2xl mx-auto mb-4 mt-2 flex items-center justify-center
                    ${isLive ? "bg-[#FF4500]/10 text-[#FF4500]" : "bg-foreground/5 text-foreground/40"}
                  `}
                >
                  {platform.icon}
                </div>

                {/* Name */}
                <h3
                  className={`
                    text-lg font-semibold
                    ${isLive ? "text-foreground" : "text-foreground/50"}
                  `}
                >
                  {platform.name}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
