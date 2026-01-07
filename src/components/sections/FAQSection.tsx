import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does the app find leads on Reddit?",
    answer:
      "When you enter your website, our AI analyzes it to understand what you sell, who your customers are, and what keywords they use. We then search Reddit daily for posts where people are asking for recommendations, comparing tools, expressing frustration, or looking for solutions that match your product.",
  },
  {
    question: "Is this against Reddit's terms of service?",
    answer:
      "No. We don't automate posting, commenting, or any engagement on Reddit. We simply help you discover relevant conversations. You manually review leads and engage authentically. This is exactly how Reddit is meant to be used — finding relevant discussions and adding value.",
  },
  {
    question: "What kind of leads will I find?",
    answer:
      "You'll find people actively expressing buying intent: asking for recommendations, searching for alternatives to competitors, complaining about existing tools, or asking questions your product answers. These are warm leads — people who are already in the market.",
  },
  {
    question: "How is this different from manually searching Reddit?",
    answer:
      "Manual searching is time-consuming, inconsistent, and easy to miss. We scan Reddit daily using AI-generated keywords, track competitor mentions, and surface only high-intent posts. You save hours and never miss an opportunity.",
  },
  {
    question: "Does the app post or comment for me?",
    answer:
      "No. We are strictly human-in-the-loop. We surface opportunities and can suggest replies, but you always review, edit, and post manually. This keeps your engagement authentic and avoids any spam concerns.",
  },
  {
    question: "How quickly will I see leads?",
    answer:
      "Once you enter your website, we analyze it and start scanning Reddit. You'll typically see your first leads within 24 hours, depending on how active your market is on Reddit.",
  },
  {
    question: "Can I track specific competitors?",
    answer:
      "Yes. We automatically detect competitors from your website, but you can also add specific competitors to track. You'll see posts where people mention them, ask for alternatives, or express frustration.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. You can cancel your subscription at any time with no questions asked.",
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
                className="bg-card rounded-2xl border-2 border-border/50 px-6 overflow-hidden hover:border-[#FF4500]/30 transition-colors"
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

        <div className="absolute top-20 left-10 w-32 h-32 bg-[#FF4500] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      </div>
    </section>
  );
}
