import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import Script from "next/script";

const faqs = [
  {
    question: "How fast will I get my leads?",
    answer:
      "Most searches complete in 2-5 minutes. You'll get an email when your leads are ready.",
  },
  {
    question: "What platforms do you search?",
    answer:
      "Currently Reddit and HackerNews. We're adding more platforms soon including Twitter and LinkedIn.",
  },
  {
    question: "How does pricing work?",
    answer:
      "You buy run packs. 1 run for $9.50, 3 runs for $24.50, or 10 runs for $49.50. Each run launches an AI agent that finds all qualified leads for you. No subscriptions, no monthly fees.",
  },
  {
    question: "What kind of leads will I find?",
    answer:
      "People actively asking for recommendations, complaining about competitors, or looking for solutions like yours. Every lead includes an AI explanation of why they match your ICP.",
  },
  {
    question: "How is this different from a lead database?",
    answer:
      "Lead databases give you contact info for random people. We find people who are actively looking for what you sell right now — real buying intent, not cold data.",
  },
  {
    question: "Is this a subscription?",
    answer:
      "No. Buy a run pack, use your runs whenever you want. Come back when you need more.",
  },
  {
    question: "What if I don't find good leads?",
    answer:
      "Every search is different. Start with a single run for $9.50 to test. If your ICP is active on the platforms we search, you'll find them.",
  },
];

// Generate FAQ structured data for SEO
const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default function FAQSection() {
  return (
    <section id="faq" className="relative py-24 bg-background scroll-mt-20">
      {/* FAQ Structured Data for SEO */}
      <Script
        id="faq-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card rounded-2xl border-2 border-border/50 px-6 overflow-hidden hover:border-[#FF4500]/30 transition-colors"
              >
                <AccordionTrigger className="hover:no-underline py-6">
                  <h3 className="text-lg font-medium text-foreground text-left pr-4">
                    {faq.question}
                  </h3>
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="absolute top-20 left-10 w-32 h-32 bg-[#FF4500] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      </div>
    </section>
  );
}
