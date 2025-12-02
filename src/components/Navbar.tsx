"use client";

import { useState } from "react";
import Link from "next/link";
import config from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "@/lib/better-auth/auth-client";
import SignInModal from "@/components/SignInModal";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/hooks/useUser";
import { isSubscriptionActive } from "@/lib/utils/subscription";

export default function Navbar() {
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const { user } = useUser();

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <nav className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link
            href="/"
            className="text-xl font-semibold hover:opacity-80 transition-opacity"
          >
            {config.project.shortName || config.project.name}
          </Link>

          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="cursor-pointer">
                  <Avatar className="h-8 w-8 bg-primary">
                    <AvatarFallback className="bg-primary text-white font-medium">
                      {getInitials(session.user.name, session.user.email)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="bg-background">
                <DropdownMenuItem asChild>
                  <Link href="/news" className="cursor-pointer">
                    News
                  </Link>
                </DropdownMenuItem>
                {isSubscriptionActive(user?.subscriptionStatus) &&
                  user?.portalUrl && (
                    <DropdownMenuItem asChild>
                      <Link href={user.portalUrl} className="cursor-pointer">
                        Manage Subscription
                      </Link>
                    </DropdownMenuItem>
                  )}
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer"
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => setIsSignInModalOpen(true)}
              className="cursor-pointer"
            >
              Sign In
            </Button>
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
