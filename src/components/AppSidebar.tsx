"use client";

import * as React from "react";
import {
  LayoutDashboardIcon,
  PlusCircleIcon,
  TrendingUpIcon,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/NavUser";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useUser } from "@/lib/hooks/useUser";

const data = {
  navMain: [
    {
      title: "Markets",
      url: "/markets",
      icon: LayoutDashboardIcon,
    },
    {
      title: "New Market",
      url: "/markets/new",
      icon: PlusCircleIcon,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/markets">
                <TrendingUpIcon className="h-5 w-5" />
                <span className="text-base font-semibold">Market Signals</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
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
    </Sidebar>
  );
}
