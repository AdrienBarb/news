import { type LucideIcon } from "lucide-react";

export type SettingsSection = "general" | "preference" | "email";

export interface SettingsMenuItem {
  id: SettingsSection;
  label: string;
  icon: LucideIcon;
}

export interface Tag {
  id: string;
  name: string;
}
