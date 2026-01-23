import Link from "next/link";
import BrandLogo from "./BrandLogo";
import NavbarAuth from "./navbar/NavbarAuth";
import ToolsDropdown from "./navbar/ToolsDropdown";
import MobileMenu from "./navbar/MobileMenu";

const navLinks = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left: Mobile menu + Logo + Desktop nav links */}
        <div className="flex items-center gap-2">
          {/* Mobile hamburger menu */}
          <MobileMenu />

          {/* Logo */}
          <Link href="/" className="hidden md:block">
            <BrandLogo />
          </Link>

          {/* Desktop Navigation Links */}
          <ul className="hidden md:flex items-center gap-6 ml-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-foreground/70 hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <ToolsDropdown />
            </li>
          </ul>
        </div>

        {/* Right: Auth */}
        <NavbarAuth />
      </nav>
    </header>
  );
}
