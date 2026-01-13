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
      "Most searches complete in 2-5 minutes. We'll email you when your leads are ready, so you can close the tab and come back later.",
  },
  {
    question: "What kind of leads will I find?",
    answer:
      "People actively expressing buying intent on Reddit: asking for recommendations, looking for alternatives to competitors, complaining about current tools, or comparing options. These are warm leads already in the market for a solution.",
  },
  {
    question: "How is this different from manually searching Reddit?",
    answer:
      "We use AI to search across hundreds of posts, score each one for relevance to your product, and filter out the noise. What would take you hours takes us minutes — and we find posts you'd never discover manually.",
  },
  {
    question: "Is this a subscription?",
    answer:
      "No. You pay once per search. No recurring charges, no monthly fees. When you want more leads, you run a new search.",
  },
  {
    question: "Do you post or comment on Reddit for me?",
    answer:
      "No. We only find leads. You decide which posts to engage with and how. This keeps your outreach authentic and avoids any spam concerns.",
  },
  {
    question: "What if I don't find good leads?",
    answer:
      "The number and quality of leads depends on how active your market is on Reddit. Most founders find 10-50 relevant leads per search. If your niche isn't discussed much on Reddit, you may find fewer leads.",
  },
  {
    question: "Can I search for competitor mentions?",
    answer:
      "Yes! Add your competitors in the form and we'll find posts where people are asking for alternatives, complaining about them, or comparing options.",
  },
  {
    question: "Which time window should I choose?",
    answer:
      "7 days is great for fresh, active conversations. 30 days gives you the best balance of volume and relevance (our most popular option). 12 months is ideal for deep research or if you're in a slower-moving niche.",
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
