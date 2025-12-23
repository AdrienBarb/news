import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What exactly does this platform analyze?",
    answer:
      "We analyze public web signals at scale: discussions, reviews, comparisons, feedback, and market conversations across multiple platforms. The goal is not data collection — it's demand detection.",
  },
  {
    question: "How is this different from market research or surveys?",
    answer:
      "Surveys tell you what people say when asked. We analyze what people say unprompted, in real situations, at scale. That's where real demand shows up.",
  },
  {
    question: "Is this just AI summaries?",
    answer:
      "No. We use a proprietary AI model built specifically for market signal detection, not generic summarization. Every insight is based on recurring patterns, not isolated opinions.",
  },
  {
    question: "Can I trust the insights?",
    answer:
      "Yes. All insights are grounded in real, verifiable public signals and backed by concrete examples. No black box. No fabricated conclusions.",
  },
  {
    question: "Who is this built for?",
    answer:
      "Micro-SaaS and early B2B SaaS founders who want to validate demand before building, avoid crowded or weak markets, and understand where competitors fail. If you make early product decisions, this is for you.",
  },
  {
    question: "Is this a lead generation or growth tool?",
    answer:
      "No. We don't help you spam people. We help you choose the right problem, market, and angle — before growth even matters.",
  },
  {
    question: "When is this most useful?",
    answer:
      "Before you start building, pivot, invest months of development, or commit to a market. The earlier the decision, the higher the value.",
  },
  {
    question: "How is this different from tools like Similarweb?",
    answer:
      "Tools like Similarweb show what already happened. We focus on why demand exists — and where it's forming. Different layer. Earlier moment.",
  },
];

export default function FAQSection() {
  return (
    <section className="relative py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl lg:text-5xl xl:text-6xl text-foreground mb-4">
            FAQ
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card rounded-2xl border-2 border-border/50 px-6 overflow-hidden hover:border-primary/30 transition-colors"
              >
                <AccordionTrigger className="hover:no-underline py-6">
                  <span className="text-lg text-foreground text-left pr-4">
                    {faq.question}
                  </span>
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

        <div className="absolute top-20 left-10 w-32 h-32 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      </div>
    </section>
  );
}
