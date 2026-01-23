"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Target } from "lucide-react";

export default function ToolsDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="text-sm text-foreground/70 hover:text-foreground flex items-center gap-1 transition-colors cursor-pointer">
        Free Tools <ChevronDown className="h-3 w-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuItem asChild>
          <Link href="/tools/icp-generator" className="cursor-pointer">
            <Target className="h-4 w-4 mr-2" />
            ICP Generator
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
