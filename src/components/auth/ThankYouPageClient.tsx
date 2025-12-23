"use client";

import { CheckCircle2, Mail, Sparkles, Rocket } from "lucide-react";

export default function ThankYouPageClient() {
  return (
    <div className="relative min-h-[calc(100vh-12rem)] flex items-center justify-center overflow-hidden bg-background">
      <div className="relative z-10 container mx-auto px-4 py-16 max-w-2xl">
        <div className="text-center space-y-8 transition-all duration-1000 opacity-100 translate-y-0">
          {/* Success Icon with Animation */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
              <div className="relative bg-primary rounded-full p-6 shadow-2xl">
                <CheckCircle2 className="w-16 h-16 text-primary-foreground" />
              </div>
            </div>
          </div>

          {/* Main Message */}
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Thanks for signing up!
            </h1>
            <div className="flex items-center justify-center gap-2 text-primary">
              <Sparkles className="w-6 h-6 animate-pulse" />
              <p className="text-xl lg:text-2xl text-foreground/80">
                You&apos;re all set
              </p>
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-card border-2 border-primary/20 rounded-2xl p-8 lg:p-12 shadow-xl backdrop-blur-sm">
            <div className="space-y-6">
              <div className="flex items-start justify-center gap-4">
                <div className="bg-primary/10 rounded-full p-3 mt-1">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left flex-1">
                  <h2 className="text-2xl font-semibold text-foreground mb-2">
                    We&apos;re building something amazing
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    The app is currently in development. We&apos;ll email you as
                    soon as it&apos;s ready to launch.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-border">
                <div className="flex items-center justify-center gap-3 text-muted-foreground">
                  <Rocket className="w-5 h-5 animate-bounce" />
                  <p className="text-sm">
                    Stay tuned for updates and early access!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="flex justify-center gap-2 pt-8">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-primary rounded-full animate-pulse"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: "1.5s",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
