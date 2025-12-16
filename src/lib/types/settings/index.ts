import { type LucideIcon } from "lucide-react";

export type SettingsSection = "general" | "preference" | "newsletter";

export interface SettingsMenuItem {
  id: SettingsSection;
  label: string;
  icon: LucideIcon;
}

export interface Tag {
  id: string;
  name: string;
}
