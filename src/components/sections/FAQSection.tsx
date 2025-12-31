import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What kind of SaaS is Prediqte for?",
    answer:
      "Prediqte is built for B2B SaaS products where users openly discuss tools, problems, and alternatives.",
  },
  {
    question: "Is Prediqte for idea validation?",
    answer:
      "No. Prediqte is designed for ongoing market understanding, not one-time research or idea validation.",
  },
  {
    question: "Do I see raw conversations or data?",
    answer:
      "No. Prediqte only shows structured insights, not raw posts or individual conversations.",
  },
  {
    question: "How is this different from analytics or surveys?",
    answer:
      "Analytics show what already happened. Surveys ask direct questions. Prediqte shows what users say naturally, before problems show up in metrics.",
  },
  {
    question: "How often are insights updated?",
    answer: "Insights are updated continuously as new conversations appear.",
  },
  {
    question: "Is this competitive intelligence?",
    answer:
      "Partially. Prediqte helps you understand why users compare tools and where competitors fall short, from the user's point of view.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes. The Founder plan can be cancelled at any time.",
  },
  {
    question: "Is my data safe?",
    answer:
      "Prediqte only analyzes publicly available conversations and focuses on aggregated patterns, not individuals.",
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
