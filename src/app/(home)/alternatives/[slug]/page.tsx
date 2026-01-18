import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { client } from "@/lib/sanity/client";
import {
  COMPETITOR_BY_SLUG_QUERY,
  COMPETITOR_SLUGS_QUERY,
  RELATED_COMPETITORS_QUERY,
} from "@/lib/sanity/queries";
import type { CompetitorPage, RelatedCompetitor } from "@/lib/sanity/types";
import { genPageMetadata } from "@/lib/seo/genPageMetadata";
import { getImageUrl } from "@/lib/sanity/image";
import BlogPortableText from "@/components/blog/BlogPortableText";
import BlogFAQ from "@/components/blog/BlogFAQ";
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowRight, CheckCircle } from "lucide-react";
import config from "@/lib/config";
import { APP_ROUTER } from "@/lib/constants/appRouter";

interface CompetitorPageProps {
  params: Promise<{ slug: string }>;
}

const fetchOptions = { next: { revalidate: 60 } };

export async function generateStaticParams() {
  const competitors = await client.fetch<{ slug: string }[]>(
    COMPETITOR_SLUGS_QUERY,
    {},
    fetchOptions
  );
  return competitors.map((competitor) => ({ slug: competitor.slug }));
}

export async function generateMetadata({
  params,
}: CompetitorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const competitor = await client.fetch<CompetitorPage | null>(
    COMPETITOR_BY_SLUG_QUERY,
    { slug },
    fetchOptions
  );

  if (!competitor) {
    return {};
  }

  const title = competitor.seo.title;
  const description = competitor.seo?.description;
  const imageUrl = getImageUrl(
    competitor.seo?.ogImage || competitor.logo,
    1200,
    630
  );

  return genPageMetadata({
    title,
    description,
    url: `/alternatives/${slug}`,
    ...(imageUrl && { image: imageUrl }),
  });
}

export default async function CompetitorPageView({
  params,
}: CompetitorPageProps) {
  const { slug } = await params;

  const [competitor, relatedCompetitors] = await Promise.all([
    client.fetch<CompetitorPage | null>(
      COMPETITOR_BY_SLUG_QUERY,
      { slug },
      fetchOptions
    ),
    client.fetch<RelatedCompetitor[]>(
      RELATED_COMPETITORS_QUERY,
      { currentSlug: slug },
      fetchOptions
    ),
  ]);

  if (!competitor) {
    notFound();
  }

  const logoUrl = getImageUrl(competitor.logo, 1200, 630);

  // Comparison structured data
  const comparisonStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${competitor.title} Alternative - ${config.project.brandName}`,
    description:
      competitor.excerpt ||
      `Compare ${competitor.title} with ${config.project.brandName}`,
    mainEntity: {
      "@type": "SoftwareApplication",
      name: config.project.brandName,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: config.project.url,
      brand: {
        "@type": "Brand",
        name: config.project.brandName,
      },
      offers: {
        "@type": "Offer",
        priceCurrency: "USD",
        price: "9.50",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "9.50",
          priceCurrency: "USD",
          unitText: "One-time payment",
        },
      },
    },
    publisher: {
      "@type": "Organization",
      name: config.project.brandName,
      url: config.project.url,
      logo: {
        "@type": "ImageObject",
        url: `${config.project.url}${config.project.logo}`,
      },
    },
  };

  const ctaFeatures = [
    "One-time payment — no subscription",
    "AI-powered Reddit lead discovery",
    "Curated leads with relevance scoring",
    "Email notification when leads are ready",
  ];

  return (
    <>
      {/* Structured Data */}
      <Script
        id="comparison-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(comparisonStructuredData),
        }}
      />

      <article className="container mx-auto px-4 py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link
            href="/alternatives"
            className="hover:text-foreground transition-colors"
          >
            Alternatives
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">{competitor.title}</span>
        </nav>

        {/* Header */}
        <header className="max-w-3xl mx-auto text-center mb-12">
          {logoUrl && (
            <div className="max-w-4xl mx-auto mb-12">
              <Image
                src={logoUrl}
                alt={competitor.title}
                width={1200}
                height={630}
                className="rounded-2xl w-full"
                priority
              />
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
            {competitor.title}
          </h1>

          {/* Subtitle */}
          {competitor.excerpt && (
            <p className="text-lg text-muted-foreground leading-relaxed">
              {competitor.excerpt}
            </p>
          )}

          {/* Quick CTA */}
          <div className="mt-8">
            <Button
              asChild
              size="lg"
              className="bg-secondary hover:bg-secondary/90 text-white rounded-full px-8"
            >
              <Link href={APP_ROUTER.HOME}>
                Get Your Leads Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto">
          <BlogPortableText value={competitor.body} />

          {/* FAQ */}
          {competitor.faq && <BlogFAQ faq={competitor.faq} />}

          {/* Related Competitors */}
          {relatedCompetitors.length > 0 && (
            <section className="mt-16 p-6 bg-muted/50 rounded-xl border border-border">
              <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                🔍 Compare More Reddit Tools
              </h2>
              <p className="text-muted-foreground mb-4">
                If you&apos;re exploring Reddit lead generation tools, check out
                our reviews of:
              </p>
              <ul className="space-y-2">
                {relatedCompetitors.map((comp) => (
                  <li key={comp._id} className="flex items-start gap-2">
                    <span className="text-secondary">•</span>
                    <div>
                      <Link
                        href={`/alternatives/${comp.slug}`}
                        className="text-foreground font-medium hover:text-secondary transition-colors underline underline-offset-2"
                      >
                        {comp.title}
                      </Link>
                      {comp.excerpt && (
                        <span className="text-muted-foreground">
                          {" "}
                          – {comp.excerpt}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* CTA Section */}
          <div className="mt-16 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-2xl border border-secondary/20 p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Ready to Switch from {competitor.title}?
              </h2>
              <p className="text-muted-foreground text-lg">
                Join thousands of SaaS founders who use Prediqte to find
                high-intent leads on Reddit.
              </p>
            </div>

            {/* Features List */}
            <ul className="max-w-md mx-auto space-y-3 mb-8">
              {ctaFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-secondary hover:bg-secondary/90 text-white rounded-full px-8 w-full sm:w-auto"
              >
                <Link href={APP_ROUTER.HOME}>
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
      </article>
    </>
  );
}
