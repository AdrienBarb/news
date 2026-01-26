import Link from "next/link";
import BrandLogo from "./BrandLogo";
import { client } from "@/lib/sanity/client";

// Fetch all categories for Resources section
const FOOTER_CATEGORIES_QUERY = `*[
  _type == "category"
  && defined(slug.current)
] | order(order asc) {
  title,
  "slug": slug.current
}`;

// Fetch all posts for Our Last Articles section
const FOOTER_POSTS_QUERY = `*[
  _type == "post"
  && defined(slug.current)
] | order(publishedAt desc) {
  title,
  primaryKeyword,
  "slug": slug.current
}`;

// Fetch all competitors for Alternatives section
const FOOTER_COMPETITORS_QUERY = `*[
  _type == "competitorPage"
  && defined(slug.current)
] | order(order asc, title asc) {
  competitorName,
  title,
  primaryKeyword,
  "slug": slug.current
}`;

const footerLinks = {
  product: {
    title: "Product",
    links: [
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#pricing", label: "Pricing" },
      { href: "/#faq", label: "FAQ" },
    ],
  },
  support: {
    title: "Support",
    links: [{ href: "mailto:adrien-barbier@hotmail.fr", label: "Contact us" }],
  },
};

export default async function Footer() {
  // Fetch categories, posts, and competitors from Sanity
  const [categories, posts, competitors] = await Promise.all([
    client.fetch<{ title: string; slug: string }[]>(
      FOOTER_CATEGORIES_QUERY,
      {},
      { next: { revalidate: 60 } }
    ),
    client.fetch<{ title: string; slug: string; primaryKeyword?: string }[]>(
      FOOTER_POSTS_QUERY,
      {},
      { next: { revalidate: 60 } }
    ),
    client.fetch<{
      competitorName?: string;
      title: string;
      primaryKeyword?: string;
      slug: string;
    }[]>(FOOTER_COMPETITORS_QUERY, {}, { next: { revalidate: 60 } }),
  ]);

  // Build dynamic resources links (Blog + Categories)
  const resourcesLinks = [
    { href: "/blog", label: "Blog" },
    ...categories.map((category) => ({
      href: `/blog/category/${category.slug}`,
      label: category.title,
    })),
  ];

  // Build dynamic articles links (use primaryKeyword for anchor text)
  const articlesLinks = posts.map((post) => ({
    href: `/blog/${post.slug}`,
    label: post.primaryKeyword || post.title,
  }));

  // Build dynamic alternatives links (use primaryKeyword for anchor text)
  const alternativesLinks = competitors.map((competitor) => ({
    href: `/alternatives/${competitor.slug}`,
    label:
      competitor.primaryKeyword ||
      `${competitor.competitorName || competitor.title} Alternative`,
  }));
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        {/* Brand - Full Width */}
        <div className="mb-12">
          <div className="mb-4">
            <BrandLogo />
          </div>
          <p className="text-background/60 leading-relaxed max-w-md">
            Find high-intent leads for your SaaS.
          </p>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Resources (Categories from Sanity) */}
          <div>
            <h3 className="text-background font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              {resourcesLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-background/60 hover:text-secondary text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Our Last Articles (Posts from Sanity) */}
          <div>
            <h3 className="text-background font-semibold mb-4">
              Our Last Articles
            </h3>
            <ul className="space-y-3">
              {articlesLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-background/60 hover:text-secondary text-sm transition-colors line-clamp-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Alternatives (Competitors from Sanity) */}
          {alternativesLinks.length > 0 && (
            <div>
              <h3 className="text-background font-semibold mb-4">
                Alternatives
              </h3>
              <ul className="space-y-3">
                {alternativesLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-background/60 hover:text-secondary text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Product */}
          <div>
            <h3 className="text-background font-semibold mb-4">
              {footerLinks.product.title}
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-background/60 hover:text-secondary text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-background font-semibold mb-4">
              {footerLinks.support.title}
            </h3>
            <ul className="space-y-3">
              {footerLinks.support.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-background/60 hover:text-secondary text-sm transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-background/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-background/60 text-sm">
              © {new Date().getFullYear()} Prediqte. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-background/60 hover:text-secondary text-sm transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-background/60 hover:text-secondary text-sm transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
