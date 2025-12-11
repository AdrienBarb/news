"use client";

import type { Tag } from "@prisma/client";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagSelectorProps {
  tags: Tag[];
  selectedTag: string | null;
  onTagToggle: (tagName: string) => void;
  onReset: () => void;
}

export default function TagSelector({
  tags,
  selectedTag,
  onTagToggle,
  onReset,
}: TagSelectorProps) {
  return (
    <div className="w-full overflow-x-auto pb-2 max-w-full">
      <div className="flex gap-2 items-center">
        {selectedTag && (
          <button
            onClick={onReset}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer whitespace-nowrap shrink-0",
              "border-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "bg-foreground text-white border-foreground hover:opacity-80",
              "flex items-center gap-1.5"
            )}
            type="button"
            aria-label="Clear filter"
          >
            <span>Reset Filter</span>
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        {tags.map((tag) => {
          const isSelected = selectedTag === tag.name;
          return (
            <button
              key={tag.id}
              onClick={() => onTagToggle(tag.name)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer whitespace-nowrap shrink-0",
                "border-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                isSelected
                  ? "bg-foreground text-white border-foreground"
                  : "bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground"
              )}
              type="button"
            >
              {tag.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
