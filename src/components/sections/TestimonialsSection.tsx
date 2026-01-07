"use client";

import { Badge } from "@/components/ui/badge";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Marcus Chen",
      role: "Founder, B2B SaaS",
      text: "I used to spend hours scrolling Reddit looking for potential leads. Now I get a curated list every morning. Closed 3 deals last month from Reddit alone.",
      avatar: "https://i.pravatar.cc/150?img=12",
    },
    {
      name: "Sarah Mitchell",
      role: "Solo founder",
      text: "Finally, Reddit marketing that doesn't feel spammy. I reply to people who are actually looking for what I built. It's like having a radar for buying intent.",
      avatar: "https://i.pravatar.cc/150?img=47",
    },
    {
      name: "David Park",
      role: "Co-founder, DevTools",
      text: "We were missing so many conversations. Now we catch posts within hours of being published. The timing difference is everything.",
      avatar: "https://i.pravatar.cc/150?img=33",
    },
    {
      name: "Emma Rodriguez",
      role: "Founder, Marketing SaaS",
      text: "The competitor tracking is gold. I see every time someone asks for alternatives to our competitors. Easy wins.",
      avatar: "https://i.pravatar.cc/150?img=44",
    },
  ];

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-background to-muted/50">
      <div className="max-w-7xl mx-auto">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <Badge className="bg-foreground text-background hover:bg-foreground/90 px-4 py-1.5">
            Testimonials
          </Badge>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl text-foreground mb-4">
            Founders finding leads on Reddit
          </h2>
        </div>

        {/* Testimonials Slider */}
        <Swiper
          modules={[Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          loop={true}
          speed={5000}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
          className="testimonials-swiper"
        >
          {testimonials.map((testimonial, index) => (
            <SwiperSlide key={index} className="h-auto">
              <div className="bg-card rounded-2xl p-8 shadow-sm border border-foreground/10 h-full flex flex-col">
                {/* Testimonial Text */}
                <p className="text-foreground/80 leading-relaxed mb-6 flex-1">
                  &ldquo;{testimonial.text}&rdquo;
                </p>

                {/* Author Info */}
                <div className="border-t border-foreground/10 pt-4 flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-foreground font-medium">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-foreground/60">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style>{`
        .testimonials-swiper .swiper-wrapper {
          transition-timing-function: linear !important;
        }
        
        .testimonials-swiper .swiper-slide {
          height: auto;
        }
      `}</style>
    </section>
  );
}
