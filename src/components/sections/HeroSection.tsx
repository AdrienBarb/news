import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import HeroGetInsightsButton from "./HeroGetInsightsButton";

export default function HeroSection({
  getStartedUrl,
}: {
  getStartedUrl: string;
}) {
  return (
    <div className="relative overflow-hidden min-h-screen flex flex-col">
      {/* Hero Content - Centered */}
      <div className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto text-center space-y-12">
            {/* Badge */}
            <div className="flex justify-center">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/30">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered Market Intelligence
              </Badge>
            </div>

            {/* Headlines */}
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl xl:text-7xl leading-tight text-foreground">
                Stop building products nobody wants.
              </h1>

              <p className="text-xl lg:text-2xl text-foreground/70 leading-relaxed max-w-4xl mx-auto">
                We analyze real user complaints across the web to validate
                demand and expose weak competitors — before you build.
              </p>
            </div>

            {/* Search Input Group */}
            <div className="flex justify-center pt-4">
              <div className="relative w-full max-w-2xl">
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-foreground/5 backdrop-blur-sm rounded-2xl md:rounded-full p-2 border-2 border-foreground/10 hover:border-primary/30 transition-all shadow-lg">
                  {/* Search Icon and Input Container */}
                  <div className="flex items-center gap-3 flex-1">
                    {/* Search Icon */}
                    <div className="pl-2 md:pl-4">
                      <svg
                        className="w-6 h-6 text-foreground/50"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>

                    {/* Input */}
                    <input
                      type="text"
                      placeholder="Enter a domain"
                      className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-foreground/40 text-base md:text-lg px-2 py-3 md:py-0"
                    />
                  </div>

                  {/* Button */}
                  <HeroGetInsightsButton getStartedUrl={getStartedUrl} />
                </div>
              </div>
            </div>

            {/* <div className="flex items-center justify-center gap-3 pt-8">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 border-2 border-background flex items-center justify-center overflow-hidden">
                  <Image
                    src="/peoples/people-1.jpg"
                    alt="User"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-foreground to-foreground/60 border-2 border-background flex items-center justify-center overflow-hidden">
                  <Image
                    src="/peoples/people-2.jpg"
                    alt="User"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-secondary/60 border-2 border-background flex items-center justify-center overflow-hidden">
                  <Image
                    src="/peoples/people-3.jpg"
                    alt="User"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-background flex items-center justify-center overflow-hidden">
                  <Image
                    src="/peoples/people-4.jpg"
                    alt="User"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-foreground to-primary border-2 border-background flex items-center justify-center overflow-hidden">
                  <Image
                    src="/peoples/people-5.jpg"
                    alt="User"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="flex gap-0.5">
                <Star className="w-5 h-5 fill-foreground text-foreground" />
                <Star className="w-5 h-5 fill-foreground text-foreground" />
                <Star className="w-5 h-5 fill-foreground text-foreground" />
                <Star className="w-5 h-5 fill-foreground text-foreground" />
                <Star className="w-5 h-5 fill-foreground text-foreground" />
              </div>

              <p className="text-foreground">
                <span className="font-semibold">500+</span>{" "}
                <span className="text-foreground/70">
                  SaaS founders finding proven problems
                </span>
              </p>
            </div> */}
          </div>
        </div>
      </div>

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 -z-10"></div>
    </div>
  );
}
