"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboardIcon,
  PlusCircleIcon,
  AlertCircleIcon,
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
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useUser } from "@/lib/hooks/useUser";
import useApi from "@/lib/hooks/useApi";

const data = {
  navMain: [
    {
      title: "Markets",
      url: "/markets",
      icon: LayoutDashboardIcon,
    },
  ],
};

interface Market {
  id: string;
  status: string;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();
  const router = useRouter();
  const { useGet } = useApi();
  const [showLimitDialog, setShowLimitDialog] = useState(false);

  const { data: marketsData } = useGet("/markets");
  const markets: Market[] = marketsData?.markets || [];

  // Check if user has an active market (not archived, not error)
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

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="p-4">
        <Button className="w-full" onClick={handleNewMarketClick}>
          <PlusCircleIcon className="mr-2 h-4 w-4" />
          New Market
        </Button>
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
              You can only have one active market at a time. Please archive or
              delete your existing market before creating a new one.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLimitDialog(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setShowLimitDialog(false);
                router.push("/markets");
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
