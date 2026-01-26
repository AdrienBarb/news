import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { client } from "@/lib/sanity/client";
import { COMPETITOR_PAGES_QUERY } from "@/lib/sanity/queries";
import type { CompetitorPreview } from "@/lib/sanity/types";
import { genPageMetadata } from "@/lib/seo/genPageMetadata";
import { getImageUrl } from "@/lib/sanity/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = genPageMetadata({
  title: "Prediqte Alternatives & Competitors Comparison",
  description:
    "Looking for a B2B lead finder? Compare Prediqte with other tools and discover why SaaS founders choose Prediqte for finding high-intent leads.",
  url: "/alternatives",
});

export default async function AlternativesPage() {
  const competitors = await client.fetch<CompetitorPreview[]>(
    COMPETITOR_PAGES_QUERY,
    {},
    { next: { revalidate: 3600 } }
  );

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
          Prediqte Alternatives & Comparisons
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          Looking for a B2B lead finder? Compare Prediqte with other tools in
          the market. Learn what makes each solution unique and discover why
          thousands of SaaS founders choose Prediqte for finding high-intent
          leads across Reddit, HackerNews, Twitter & LinkedIn.
        </p>
        <Button
          asChild
          size="lg"
          className="bg-secondary hover:bg-secondary/90 text-white rounded-full px-8"
        >
          <Link href="/d">
            Get Your Leads Now
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>

      {/* Competitors Grid */}
      {competitors.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {competitors.map((competitor) => {
            const logoUrl = getImageUrl(competitor.logo, 100, 100);
            return (
              <Link
                key={competitor._id}
                href={`/alternatives/${competitor.slug.current}`}
                className="group bg-card border border-border rounded-xl p-6 hover:border-secondary/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  {logoUrl && (
                    <Image
                      src={logoUrl}
                      alt={`${competitor.title} logo`}
                      width={48}
                      height={48}
                      className="rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-foreground group-hover:text-secondary transition-colors">
                      {competitor.title} Alternative
                    </h2>
                    {competitor.excerpt && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {competitor.excerpt}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-secondary font-medium">
                  Compare with Prediqte
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No comparisons available yet. Check back soon!
          </p>
        </div>
      )}

      {/* CTA Section */}
      <div className="max-w-2xl mx-auto mt-20 text-center bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-2xl border border-secondary/20 p-8 md:p-12">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          Why Choose Prediqte?
        </h2>
        <p className="text-muted-foreground mb-6">
          One-time payment. No subscription. Prediqte delivers a curated list of
          high-intent leads from Reddit, HackerNews, Twitter & LinkedIn based on
          your product&apos;s ICP.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="bg-secondary hover:bg-secondary/90 text-white rounded-full px-8 w-full sm:w-auto"
          >
            <Link href="/d">
              Get Your Leads Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full px-8 w-full sm:w-auto"
          >
            <Link href="/#how-it-works">See How It Works</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
