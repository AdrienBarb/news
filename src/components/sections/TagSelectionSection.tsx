"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Tag {
  id: string;
  name: string;
}

interface TagSelectionSectionProps {
  tags: Tag[];
}

const STORAGE_KEY = "onboarding_selected_tags";

export default function TagSelectionSection({
  tags,
}: TagSelectionSectionProps) {
  const router = useRouter();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleGetStarted = () => {
    // Save selected tags to localStorage if any are selected
    if (selectedTags.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedTags));
    }
    router.push("/setup/signup");
  };

  return (
    <section className="container mx-auto px-4 py-20 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="bg-foreground text-white rounded-3xl p-8 md:p-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Pick your topics and start staying ahead.
            </h2>
          </div>

          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {tags.map((tag) => {
              const isSelected = selectedTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer",
                    "border-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    "text-foreground",
                    isSelected
                      ? "bg-primary border-primary"
                      : "bg-foreground border-input hover:bg-accent hover:text-accent-foreground"
                  )}
                  type="button"
                >
                  {tag.name}
                </button>
              );
            })}
          </div>

          <div className="flex justify-center">
            <Button size="lg" className="font-bold" onClick={handleGetStarted}>
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
