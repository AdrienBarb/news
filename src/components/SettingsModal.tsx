"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Globe } from "lucide-react";
import { GeneralContent } from "@/components/settings/GeneralContent";
import { SettingsSection } from "@/lib/types/settings";
import { SettingsMenuItem } from "@/lib/types/settings";
import { SettingsNavigation } from "./settings/SettingsNavigation";

const settingsMenuItems: SettingsMenuItem[] = [
  {
    id: "general",
    label: "General",
    icon: Globe,
  },
];

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSection?: SettingsSection;
}

export default function SettingsModal({
  open,
  onOpenChange,
  defaultSection = "general",
}: SettingsModalProps) {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>(defaultSection);

  const activeMenuItem = settingsMenuItems.find(
    (item) => item.id === activeSection
  );

  const renderContent = () => {
    switch (activeSection) {
      case "general":
        return <GeneralContent />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-xl font-semibold">
            {activeMenuItem?.label || "Settings"}
          </DialogTitle>
        </DialogHeader>

        <SettingsNavigation
          items={settingsMenuItems}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        <div className="flex-1 overflow-y-scroll">
          <div className="p-6">
            <div className="space-y-6">{renderContent()}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
