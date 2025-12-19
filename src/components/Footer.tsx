import Link from "next/link";
import BrandLogo from "./BrandLogo";
import config from "@/lib/config";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="lg:col-span-1">
            <div className="mb-4">
              <BrandLogo />
            </div>
            <p className="text-background/60 leading-relaxed mb-6">
              Stay informed about tech — without spending your day on it.
            </p>
          </div>
          <div>
            <h3 className="text-background font-semibold mb-4">Support</h3>
            <a
              href={config.contact.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-background/60 hover:text-secondary text-sm transition-colors block"
            >
              {config.contact.telegram}
            </a>
          </div>
        </div>

        <div className="pt-8 border-t border-background/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-background/60 text-sm">
              © {new Date().getFullYear()} TheHackerBrief. All rights reserved.
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
