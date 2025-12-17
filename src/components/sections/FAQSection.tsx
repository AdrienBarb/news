import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Is this just another tech news aggregator?",
    answer:
      "No. This dashboard isn't built to collect or display as much information as possible. It's built to apply judgment, decide what actually matters, explain why it matters, and intentionally leave out everything else.",
  },
  {
    question: "How is this different from Google News, Twitter, or Reddit?",
    answer:
      "Those platforms are designed to keep you engaged by constantly showing what's new or popular. This dashboard is designed to give you a clear, finite view of what truly mattered, without feeds, trends, or urgency.",
  },
  {
    question: "How does the AI decide what's important?",
    answer:
      "The AI reviews tech publications, social conversations, newsletters, videos, and podcasts, then filters them based on impact, relevance, and signal rather than popularity or novelty. The goal is not coverage, but clarity.",
  },
  {
    question: "How often is the dashboard updated?",
    answer:
      "It's updated continuously, but without any pressure to keep checking. You can log in whenever you want and trust that anything important will be there.",
  },
  {
    question: "Can I customize what I see?",
    answer:
      "Yes. You can tailor the dashboard to your interests and create your own personalized brief or newsletter, with customization used to reduce noise rather than increase engagement.",
  },
  {
    question: "Do I need to read everything every day?",
    answer:
      "No. The dashboard is intentionally designed so you can scan it in a few minutes, feel informed enough, and move on with your day.",
  },
  {
    question: "Can I listen instead of reading?",
    answer:
      "Yes. Every story can be listened to using AI voice, so you can stay informed while commuting, walking, or doing something else.",
  },
  {
    question: "Is this meant to replace all my other tech sources?",
    answer:
      "Not necessarily. Many people keep their favorite sources and use this dashboard as their primary filter to understand what actually mattered.",
  },
  {
    question: "Who is this built for?",
    answer:
      "It's built for people who care about tech but don't want to live inside it, including founders, builders, developers, and curious professionals who value clarity over completeness.",
  },
  {
    question: "Will this increase my screen time?",
    answer:
      "No. If it does, the product has failed. The dashboard is built to reduce usage while increasing confidence.",
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
