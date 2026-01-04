"use client";

import Link from "next/link";
import BrandLogo from "./BrandLogo";

export default function OnboardingNavBar() {
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <nav className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/">
            <BrandLogo />
          </Link>
        </nav>
      </header>
    </>
  );
}
