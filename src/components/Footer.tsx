import Link from "next/link";
import BrandLogo from "./BrandLogo";

const footerLinks = {
  useCases: {
    title: "Use cases",
    links: [
      { href: "/use-cases", label: "Use cases" },
      {
        href: "/use-cases/find-saas-customers-on-reddit",
        label: "Find SaaS customers on Reddit",
      },
      {
        href: "/use-cases/validate-saas-idea-on-reddit",
        label: "Validate a SaaS idea on Reddit",
      },
      {
        href: "/use-cases/launch-saas-on-reddit",
        label: "Launch a SaaS on Reddit",
      },
    ],
  },
  resources: {
    title: "Resources",
    links: [
      { href: "/blog", label: "Blog" },
      {
        href: "/blog/how-to-find-customers-on-reddit",
        label: "How to find customers on Reddit",
      },
      {
        href: "/blog/reddit-buying-intent-signals",
        label: "Reddit buying intent signals",
      },
      {
        href: "/blog/reddit-market-research-for-saas",
        label: "Reddit market research for SaaS",
      },
    ],
  },
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

export default function Footer() {
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
          {/* Use cases */}
          <div>
            <h3 className="text-background font-semibold mb-4">
              {footerLinks.useCases.title}
            </h3>
            <ul className="space-y-3">
              {footerLinks.useCases.links.map((link) => (
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

          {/* Resources */}
          <div>
            <h3 className="text-background font-semibold mb-4">
              {footerLinks.resources.title}
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.links.map((link) => (
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
