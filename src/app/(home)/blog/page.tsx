import { Metadata } from "next";
import Link from "next/link";
import { client } from "@/lib/sanity/client";
import {
  CATEGORIES_QUERY,
  FEATURED_POSTS_QUERY,
  LATEST_POSTS_QUERY,
} from "@/lib/sanity/queries";
import type { CategoryPreview, PostPreview } from "@/lib/sanity/types";
import { genPageMetadata } from "@/lib/seo/genPageMetadata";
import BlogPostCard from "@/components/blog/BlogPostCard";
import BlogCategoryCard from "@/components/blog/BlogCategoryCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { APP_ROUTER } from "@/lib/constants/appRouter";

export const metadata: Metadata = genPageMetadata({
  title: "Prediqte Blog — Lead Generation, SaaS Growth & Lead Finders",
  description:
    "Expert guides for SaaS founders and indie hackers on finding high-intent leads, traffic strategies, and growth systems. Actionable tips and real examples.",
  url: "/blog",
});

const fetchOptions = { next: { revalidate: 60 } };

export default async function BlogPage() {
  const [categories, featuredPosts, latestPosts] = await Promise.all([
    client.fetch<CategoryPreview[]>(CATEGORIES_QUERY, {}, fetchOptions),
    client.fetch<PostPreview[]>(FEATURED_POSTS_QUERY, {}, fetchOptions),
    client.fetch<PostPreview[]>(LATEST_POSTS_QUERY, {}, fetchOptions),
  ]);

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <header className="max-w-3xl mb-16">
        <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
          Prediqte Blog — Lead Generation & SaaS Growth Insights
        </h1>
        <div className="text-lg text-muted-foreground leading-relaxed space-y-4">
          <p>
            The Prediqte Blog is your go-to resource for finding high-intent
            leads, scaling SaaS growth, and leveraging online communities for traffic and
            traction. If you&apos;re a SaaS founder, indie hacker, or solo
            developer tired of spending hours searching for opportunities
            — you&apos;re in the right place.
          </p>
          <p>
            Here, we break down the exact strategies, tools, and tactics used by
            successful founders to uncover buyer intent, prioritize
            opportunities, and turn organic signals into real leads. Whether
            you&apos;re learning how to find conversations with buying intent, build lead
            nurturing workflows, or uncover hidden signals buried in niche
            communities — we write for builders who want results.
          </p>
          <p>
            Explore practical guides, deep dives, and step-by-step playbooks to
            help you drive traffic, generate leads, and grow your software
            business.
          </p>
        </div>
      </header>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              Explore Topics
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <BlogCategoryCard key={category._id} category={category} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Posts Section */}
      {featuredPosts.length > 0 && (
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-foreground mb-8">
            Founder Favorites
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredPosts.map((post, index) => (
              <BlogPostCard key={post._id} post={post} featured={index === 0} />
            ))}
          </div>
        </section>
      )}

      {/* Latest Posts Section */}
      {latestPosts.length > 0 && (
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-foreground mb-8">
            Latest Posts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestPosts.map((post) => (
              <BlogPostCard key={post._id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-card rounded-3xl border border-border/50 p-8 md:p-12 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Ready to Find High-Intent Leads?
        </h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          Stop searching manually. Let Prediqte find people actively looking for
          solutions like yours across online communities and social platforms.
        </p>
        <Button
          asChild
          className="bg-secondary hover:bg-secondary/90 text-white rounded-full px-8"
        >
          <Link href={APP_ROUTER.HOME}>
            Get Your Leads Now
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </section>

      {/* FAQ Section */}
      <section className="mt-20">
        <h2 className="text-2xl font-bold text-foreground mb-8">
          Frequently Asked Questions
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-foreground mb-2">
              What topics does this blog cover?
            </h3>
            <p className="text-muted-foreground text-sm">
              Lead generation strategies, SaaS growth tactics, content workflows,
              founder distribution playbooks, and product traction strategies.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">
              Who is this blog for?
            </h3>
            <p className="text-muted-foreground text-sm">
              SaaS founders, micro-teams, indie builders, and solo devs looking
              to find actionable, real-world leads and traffic channels.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
