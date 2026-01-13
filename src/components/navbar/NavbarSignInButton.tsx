"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import SignInModal from "@/components/SignInModal";

export default function NavbarSignInButton() {
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        className="text-foreground"
        onClick={() => setIsSignInModalOpen(true)}
      >
        Sign In
      </Button>
      <SignInModal
        open={isSignInModalOpen}
        onOpenChange={setIsSignInModalOpen}
      />
    </>
  );
}
