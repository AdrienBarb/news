import { genPageMetadata } from "@/lib/seo/genPageMetadata";

export const metadata = genPageMetadata({
  title: "Use Cases",
  description:
    "Discover how SaaS founders, indie hackers, and marketers use Prediqte to find high-intent leads on Reddit.",
  url: "/use-cases",
});

export default function UseCasesPage() {
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
          Use Cases
        </h1>
        <p className="text-lg text-foreground/70 mb-12">
          Discover how founders and marketers use Prediqte to find leads on
          Reddit.
        </p>

        {/* Placeholder - Add use cases content here */}
        <div className="text-center py-16 text-foreground/50">
          Coming soon...
        </div>
      </div>
    </div>
  );
}
