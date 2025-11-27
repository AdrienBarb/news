"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "What exactly do I get every day?",
    answer:
      "You receive 10 curated tech stories—the most important news, launches, breakthroughs, and insights from across the industry. No noise, no filler, just the signal.",
  },
  {
    question: "How do you choose the 10 stories?",
    answer:
      "We scan hundreds of trusted sources, filter out the noise, and surface only the stories that actually matter. Everything is human-curated, not algorithmically bloated.",
  },
  {
    question: "How long does it take to read?",
    answer:
      "About 3 minutes. That's the entire point — a quick, sharp briefing you can finish before your coffee is ready.",
  },
  {
    question: "Can I personalize the topics I care about?",
    answer:
      "Yes. Choose your interests — AI, startups, engineering, product, design, VC, and more — and your daily feed adapts automatically.",
  },
  {
    question: "Is this a news app or a newsletter?",
    answer:
      "Neither. This is a curated daily briefing. It's built to save you time, not give you another inbox to manage or another feed to scroll.",
  },
  {
    question: "Do I need to check the app at a specific time?",
    answer:
      "No. Your briefing updates automatically every morning. Open it whenever works for you — the content is ready.",
  },
  {
    question: "Is it free?",
    answer:
      "During the early access phase, yes. Later, we'll introduce a simple premium plan for deeper insights and pro features.",
  },
  {
    question: "Why only 10 stories?",
    answer:
      "Because more isn't better. You don't need 100 articles a day — you need the right 10. That's how you stay informed without overwhelm.",
  },
  {
    question: "Who is this for?",
    answer:
      "Founders, builders, developers, operators, investors, and anyone who needs to stay sharp in tech without spending hours reading.",
  },
  {
    question: "What makes this better than reading news yourself?",
    answer:
      "You could scan 20+ websites daily… or let us do it and get the distilled essentials in minutes. Think of it as your tech intelligence partner.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="container mx-auto px-4 py-20 md:py-32">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="border rounded-lg bg-background overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-accent/50 transition-colors"
                  type="button"
                >
                  <span className="font-semibold text-lg pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-muted-foreground transition-transform",
                      isOpen && "transform rotate-180"
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

