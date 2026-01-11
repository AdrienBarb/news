"use client";

import { useState } from "react";
import { CreditCard, LogOutIcon, MoreVerticalIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { signOut } from "@/lib/better-auth/auth-client";
import SettingsModal from "@/components/SettingsModal";
import useApi from "@/lib/hooks/useApi";
import { useUser } from "@/lib/hooks/useUser";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
  };
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { usePost } = useApi();
  const { user: currentUser } = useUser();

  const { mutate: openBillingPortal, isPending: isOpeningPortal } = usePost(
    "/billing-portal",
    {
      onSuccess: (data: { url: string }) => {
        if (data.url) {
          window.location.href = data.url;
        }
      },
      onError: () => {
        toast.error("Failed to open billing portal");
      },
    }
  );

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  const header = (
    <>
      <Avatar className="h-8 w-8 rounded-lg">
        <AvatarFallback className="rounded-lg bg-primary text-white">
          {user.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">
          {user.name.charAt(0).toUpperCase()}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {user.email}
        </span>
      </div>
    </>
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {header}
              <MoreVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </SidebarMenu>
  );
}
