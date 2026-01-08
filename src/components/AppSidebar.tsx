"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  PlusCircleIcon,
  AlertCircleIcon,
  ChevronDownIcon,
  GlobeIcon,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/NavUser";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { MarketStatusBadge } from "@/components/markets/MarketStatusBadge";
import { useUser } from "@/lib/hooks/useUser";
import useApi from "@/lib/hooks/useApi";
import { cn } from "@/lib/utils";
import type { MarketStatus } from "@prisma/client";

const data = {
  navMain: [],
};

interface Market {
  id: string;
  name: string;
  status: string;
  leadCount: number;
  unreadLeadCount: number;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { useGet } = useApi();
  const [showLimitDialog, setShowLimitDialog] = useState(false);

  const { data: marketsData, isLoading: marketsLoading } = useGet("/markets");
  const markets: Market[] = marketsData?.markets || [];

  // Get current market ID from pathname (e.g., /markets/[marketId])
  const currentMarketId = pathname?.match(/\/markets\/([^/]+)/)?.[1];

  // Find current market
  const currentMarket = markets.find((m) => m.id === currentMarketId);

  // Check if user has an active market (not paused, not error)
  const hasActiveMarket = markets.some(
    (m) =>
      m.status === "active" ||
      m.status === "pending" ||
      m.status === "analyzing"
  );

  const handleNewMarketClick = () => {
    if (hasActiveMarket) {
      setShowLimitDialog(true);
    } else {
      router.push("/markets/new");
    }
  };

  const handleMarketSelect = (marketId: string) => {
    router.push(`/markets/${marketId}`);
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between"
              disabled={marketsLoading}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <GlobeIcon className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {currentMarket
                    ? currentMarket.name
                    : marketsLoading
                      ? "Loading..."
                      : markets.length > 0
                        ? "Select Market"
                        : "No Markets"}
                </span>
              </div>
              <ChevronDownIcon className="h-4 w-4 shrink-0 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[--radix-dropdown-menu-trigger-width]"
          >
            <DropdownMenuLabel>Markets</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {markets.length === 0 ? (
              <DropdownMenuItem disabled>
                <span className="text-sm text-muted-foreground">
                  No markets yet
                </span>
              </DropdownMenuItem>
            ) : (
              markets.map((market) => (
                <DropdownMenuItem
                  key={market.id}
                  onClick={() => handleMarketSelect(market.id)}
                  className={cn(
                    "flex items-center justify-between",
                    currentMarketId === market.id && "bg-accent"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="truncate">{market.name}</span>
                  </div>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleNewMarketClick}>
              <PlusCircleIcon className="mr-2 h-4 w-4" />
              Create New Market
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.name || "",
            email: user?.email || "",
          }}
        />
      </SidebarFooter>

      {/* Market Limit Dialog */}
      <Dialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircleIcon className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle>Market Limit Reached</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              You can only have one active market at a time. Please delete your
              existing market before creating a new one.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLimitDialog(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setShowLimitDialog(false);
                if (markets.length > 0) {
                  router.push(`/markets/${markets[0].id}`);
                } else {
                  router.push("/markets");
                }
              }}
            >
              View Markets
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
