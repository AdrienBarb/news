"use client";

import { useState } from "react";
import Link from "next/link";
import config from "@/lib/config";
import { Button } from "@/components/ui/button";
import SignInModal from "@/components/SignInModal";
import { useUser } from "@/lib/hooks/useUser";
import BrandLogo from "./BrandLogo";

export default function Navbar() {
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const { user } = useUser();

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <nav className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/">
            <BrandLogo />
          </Link>

          {user ? (
            <Button asChild className="cursor-pointer">
              <Link href="/news">Launch app</Link>
            </Button>
          ) : (
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                className="text-foreground"
                onClick={() => setIsSignInModalOpen(true)}
              >
                Sign In
              </Button>
              <Button
                asChild
                className="bg-foreground text-background hover:bg-foreground/90"
              >
                <Link href="/onboarding">Get Started</Link>
              </Button>
            </div>
          )}
        </nav>
      </header>
      <SignInModal
        open={isSignInModalOpen}
        onOpenChange={setIsSignInModalOpen}
      />
    </>
  );
}
