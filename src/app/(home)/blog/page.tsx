import { genPageMetadata } from "@/lib/seo/genPageMetadata";

export const metadata = genPageMetadata({
  title: "Blog",
  description:
    "Tips, strategies, and insights on Reddit marketing and lead generation for SaaS founders.",
  url: "/blog",
});

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
          Blog
        </h1>
        <p className="text-lg text-foreground/70 mb-12">
          Tips, strategies, and insights on Reddit marketing and lead
          generation.
        </p>

        {/* Placeholder - Add blog posts here */}
        <div className="text-center py-16 text-foreground/50">
          Coming soon...
        </div>
      </div>
    </div>
  );
}
