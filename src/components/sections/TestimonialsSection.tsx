"use client";

import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Marcus Chen",
      role: "Founder, B2B SaaS",
      text: "Found 34 qualified leads in my first search. Already closed one deal from a post I would have never found manually.",
      avatar: "https://i.pravatar.cc/150?img=12",
    },
    {
      name: "Sarah Mitchell",
      role: "Solo founder",
      text: "The relevance scoring is spot on. Instead of scrolling through hundreds of posts, I get a curated list of people actually looking for my product.",
      avatar: "https://i.pravatar.cc/150?img=47",
    },
    {
      name: "David Park",
      role: "Co-founder, DevTools",
      text: "Ran a 30-day search and found conversations I never knew existed. The competitor mention tracking is pure gold.",
      avatar: "https://i.pravatar.cc/150?img=33",
    },
  ];

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-background to-muted/50">
      <div className="max-w-6xl mx-auto">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <Badge className="bg-foreground text-background hover:bg-foreground/90 px-4 py-1.5">
            Trusted by founders
          </Badge>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            SaaS Founders Are Finding Leads on Reddit
          </h2>
          <p className="text-lg text-foreground/60">
            Join hundreds of SaaS founders using Reddit for growth
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-8 shadow-sm border border-foreground/10 hover:shadow-lg transition-shadow"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-foreground/80 leading-relaxed mb-6">
                &ldquo;{testimonial.text}&rdquo;
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="text-foreground font-medium">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-foreground/60">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
