import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "Stay informed effortlessly",
    description:
      "Whether you're commuting, getting ready, or between meetings, you get a clean, concise, easy-to-digest briefing every morning. One scroll, and you're up to date.",
    image: "/one.png",
  },
  {
    title: "Personalized to your interests",
    description:
      "You choose the topics that matter to you — AI, startups, product, engineering, VC, and more. Your daily briefing adapts to your taste, your industry, and your goals.",
    image: "/two.png",
  },
  {
    title: "Build a habit of staying sharp",
    description:
      "Staying ahead shouldn't feel like work. With a 3-minute daily rhythm and a simple streak system, you stay consistent, focused, and mentally one step ahead.",
    image: "/three.png",
  },
];

export default function FeaturesSection() {
  return (
    <section className="container mx-auto px-4 py-20 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Understand the tech world in minutes
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Skip the chaos. Your feed is distilled into the 10 tech stories that
            actually matter — no noise, no endless scrolling, just pure signal.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-lg border bg-background hover:shadow-lg transition-shadow"
            >
              <div className="mb-4 flex justify-center">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  width={200}
                  height={200}
                  className="w-full max-w-[200px] h-auto"
                />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-center">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <Button size="lg" className="font-bold" asChild>
            <Link href="/setup">Get Started</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
