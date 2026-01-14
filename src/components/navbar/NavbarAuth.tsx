"use client";

import { useUser } from "@/lib/hooks/useUser";
import NavbarUserMenu from "./NavbarUserMenu";
import NavbarSignInButton from "./NavbarSignInButton";

export default function NavbarAuth() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
    );
  }

  if (user) {
    return <NavbarUserMenu />;
  }

  return <NavbarSignInButton />;
}
