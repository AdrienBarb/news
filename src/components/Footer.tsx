import Link from "next/link";
import BrandLogo from "./BrandLogo";
import { client } from "@/lib/sanity/client";

// Fetch categories for Resources section
const FOOTER_CATEGORIES_QUERY = `*[
  _type == "category" 
  && defined(slug.current)
] | order(order asc) [0...4] {
  title,
  "slug": slug.current
}`;

// Fetch latest posts for Our Last Articles section
const FOOTER_POSTS_QUERY = `*[
  _type == "post" 
  && defined(slug.current)
] | order(publishedAt desc) [0...4] {
  title,
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
  // Fetch categories and posts from Sanity
  const [categories, posts] = await Promise.all([
    client.fetch<{ title: string; slug: string }[]>(
      FOOTER_CATEGORIES_QUERY,
      {},
      { next: { revalidate: 3600 } }
    ),
    client.fetch<{ title: string; slug: string }[]>(
      FOOTER_POSTS_QUERY,
      {},
      { next: { revalidate: 3600 } }
    ),
  ]);

  // Build dynamic resources links (Blog + Categories)
  const resourcesLinks = [
    { href: "/blog", label: "Blog" },
    ...categories.map((category) => ({
      href: `/blog/category/${category.slug}`,
      label: category.title,
    })),
  ];

  // Build dynamic articles links
  const articlesLinks = posts.map((post) => ({
    href: `/blog/${post.slug}`,
    label: post.title,
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
            Find high-intent leads on Reddit.
          </p>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
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
