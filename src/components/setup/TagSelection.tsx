"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface Tag {
  id: string;
  name: string;
}

interface TagSelectionProps {
  tags: Tag[];
}

const STORAGE_KEY = "onboarding_selected_tags";

export default function TagSelection({ tags }: TagSelectionProps) {
  const router = useRouter();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Load selected tags from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSelectedTags(parsed);
        }
      } catch (error) {
        console.error("Failed to parse stored tags:", error);
      }
    }
  }, []);

  // Save to localStorage whenever selectedTags changes
  useEffect(() => {
    if (selectedTags.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedTags));
    }
  }, [selectedTags]);

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleContinue = () => {
    if (selectedTags.length < 3) {
      toast.error("Please select at least 3 tags");
      return;
    }

    // Save to localStorage and navigate to sign-up
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedTags));
    router.push("/setup/signup");
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Select Your Interests</h1>
          <p className="text-muted-foreground">
            Choose at least 3 tags that interest you. This helps us personalize
            your experience.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {tags.map((tag) => {
              const isSelected = selectedTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer",
                    "border-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground"
                  )}
                  type="button"
                >
                  {tag.name}
                </button>
              );
            })}
          </div>

          <div className="text-center text-sm text-muted-foreground">
            {selectedTags.length < 3 ? (
              <p>
                Select {3 - selectedTags.length} more tag
                {3 - selectedTags.length !== 1 ? "s" : ""} to continue
              </p>
            ) : (
              <p className="text-green-600">
                ✓ Great! You&apos;ve selected {selectedTags.length} tags
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button
            onClick={handleContinue}
            disabled={selectedTags.length < 3}
            size="lg"
            className="min-w-[200px] bg-secondary"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
