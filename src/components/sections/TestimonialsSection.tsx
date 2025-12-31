"use client";

import { Badge } from "@/components/ui/badge";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Alex Martin",
      role: "Founder, B2B SaaS",
      text: "Prediqte helped me see the same user complaints repeating across competitors. It quickly became part of how I think about what to build next.",
      avatar: "https://i.pravatar.cc/150?img=12",
    },
    {
      name: "Sophie Laurent",
      role: "Solo founder",
      text: "Before Prediqte, I relied on gut feeling and a few support tickets. Now I have a clear view of what users expect across the whole market.",
      avatar: "https://i.pravatar.cc/150?img=47",
    },
    {
      name: "Thomas Nguyen",
      role: "Co-founder, SaaS startup",
      text: "It's like having a constant pulse on user frustration and unmet needs. It helped us avoid shipping features no one actually cared about.",
      avatar: "https://i.pravatar.cc/150?img=33",
    },
    {
      name: "Marco Rossi",
      role: "Product-focused founder",
      text: "Prediqte doesn't drown you in data. It highlights what users keep repeating — and that's what makes it useful.",
      avatar: "https://i.pravatar.cc/150?img=60",
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
            Trusted by founders building SaaS products
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

