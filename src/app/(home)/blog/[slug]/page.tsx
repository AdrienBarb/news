import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { client } from "@/lib/sanity/client";
import {
  POST_BY_SLUG_QUERY,
  POST_SLUGS_QUERY,
  RELATED_POSTS_QUERY,
} from "@/lib/sanity/queries";
import type { Post, PostPreview } from "@/lib/sanity/types";
import { genPageMetadata } from "@/lib/seo/genPageMetadata";
import { getImageUrl } from "@/lib/sanity/image";
import BlogPortableText, {
  extractHeadings,
} from "@/components/blog/BlogPortableText";
import BlogTableOfContents from "@/components/blog/BlogTableOfContents";
import BlogPostCard from "@/components/blog/BlogPostCard";
import BlogFAQ from "@/components/blog/BlogFAQ";
import { Button } from "@/components/ui/button";
import { ChevronRight, Calendar, Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import config from "@/lib/config";
import { APP_ROUTER } from "@/lib/constants/appRouter";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

const fetchOptions = { next: { revalidate: 60 } };

export async function generateStaticParams() {
  const posts = await client.fetch<{ slug: string }[]>(
    POST_SLUGS_QUERY,
    {},
    fetchOptions
  );
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await client.fetch<Post | null>(
    POST_BY_SLUG_QUERY,
    { slug },
    fetchOptions
  );

  if (!post) {
    return {};
  }

  const title = post.seo?.title || post.title;
  const description = post.seo?.description || post.excerpt || "";
  const imageUrl = getImageUrl(post.seo?.ogImage || post.coverImage, 1200, 630);

  return genPageMetadata({
    title,
    description,
    url: `/blog/${slug}`,
    ...(imageUrl && { image: imageUrl }),
  });
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;

  const post = await client.fetch<Post | null>(
    POST_BY_SLUG_QUERY,
    { slug },
    fetchOptions
  );

  if (!post) {
    notFound();
  }

  // Fetch related posts
  const relatedPosts = await client.fetch<PostPreview[]>(
    RELATED_POSTS_QUERY,
    { categorySlug: post.category.slug.current, currentSlug: slug },
    fetchOptions
  );

  const coverImageUrl = getImageUrl(post.coverImage, 1200, 630);
  const headings = extractHeadings(post.body);

  // Article structured data
  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: coverImageUrl,
    author: {
      "@type": "Person",
      name: post.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: config.project.brandName,
      logo: {
        "@type": "ImageObject",
        url: `${config.project.url}${config.project.logo}`,
      },
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${config.project.url}/blog/${slug}`,
    },
  };

  return (
    <>
      {/* Article Structured Data */}
      <Script
        id="article-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />

      <article className="container mx-auto px-4 py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link
            href="/blog"
            className="hover:text-foreground transition-colors"
          >
            Blog
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link
            href={`/blog/category/${post.category.slug.current}`}
            className="hover:text-foreground transition-colors"
          >
            {post.category.title}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground truncate max-w-[200px]">
            {post.title}
          </span>
        </nav>

        {/* Header */}
        <header className="max-w-3xl mx-auto text-center mb-12">
          {coverImageUrl && (
            <div className="max-w-4xl mx-auto mb-12">
              <Image
                src={coverImageUrl}
                alt={post.title}
                width={1200}
                height={630}
                className="rounded-2xl w-full"
                priority
              />
            </div>
          )}

          {/* Category */}
          <Link
            href={`/blog/category/${post.category.slug.current}`}
            className="inline-block text-xs font-medium text-secondary hover:text-secondary/80 uppercase tracking-wide mb-4"
          >
            {post.category.title}
          </Link>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground flex-wrap">
            <span className="font-medium text-foreground">
              {post.authorName}
            </span>
            <span>·</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <time dateTime={post.publishedAt}>
                {format(new Date(post.publishedAt), "MMM d, yyyy")}
              </time>
            </div>
            {post.readingTime && (
              <>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{post.readingTime} min read</span>
                </div>
              </>
            )}
          </div>

          {post.updatedAt && (
            <p className="mt-2 text-xs text-muted-foreground">
              Updated: {format(new Date(post.updatedAt), "MMM d, yyyy")}
            </p>
          )}
        </header>

        {/* Content Layout */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-12">
          {/* Main Content */}
          <div className="max-w-3xl">
            <BlogPortableText value={post.body} />

            {/* FAQ */}
            {post.faq && <BlogFAQ faq={post.faq} />}

            {/* CTA */}
            <div className="mt-16 bg-card rounded-2xl border border-border/50 p-8 text-center">
              <h2 className="text-xl font-bold text-foreground mb-3">
                Want to find leads on Reddit automatically?
              </h2>
              <p className="text-muted-foreground mb-6">
                Stop scrolling through Reddit manually. Prediqte finds
                high-intent leads who are actively looking for solutions like
                yours.
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
            </div>
          </div>

          {/* Sidebar - TOC */}
          <aside className="hidden lg:block">
            {headings.length > 0 && <BlogTableOfContents headings={headings} />}
          </aside>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="max-w-6xl mx-auto mt-20">
            <h2 className="text-2xl font-bold text-foreground mb-8">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <BlogPostCard key={relatedPost._id} post={relatedPost} />
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
