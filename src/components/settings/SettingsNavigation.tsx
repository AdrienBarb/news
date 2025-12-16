"use client";

import { cn } from "@/lib/utils";
import {
  type SettingsSection,
  type SettingsMenuItem,
} from "@/lib/types/settings";

interface SettingsNavigationProps {
  items: SettingsMenuItem[];
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
}

export function SettingsNavigation({
  items,
  activeSection,
  onSectionChange,
}: SettingsNavigationProps) {
  return (
    <div className="px-6 pt-4 pb-3 border-b">
      <nav className="flex flex-row gap-1 overflow-x-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap cursor-pointer",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
