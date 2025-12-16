"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import useApi from "@/lib/hooks/useApi";
import { useSession } from "@/lib/better-auth/auth-client";
import toast from "react-hot-toast";
import { type Tag } from "./types";

export function PreferenceContent() {
  const { useGet, usePost } = useApi();
  const { data: session } = useSession();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Fetch all tags
  const { data: allTags, isLoading: isLoadingAllTags } = useGet(
    "/tags",
    {},
    {
      enabled: !!session?.user?.id,
    }
  );

  // Fetch user's tag preferences
  const { data: preferencesData, isLoading: isLoadingPreferences } = useGet(
    "/user/tag-preferences",
    {},
    {
      enabled: !!session?.user?.id,
    }
  );

  const updatePreferencesMutation = usePost("/user/tag-preferences", {
    onSuccess: () => {
      toast.success("Preferences updated successfully");
    },
    onError: () => {
      toast.error("Failed to update preferences");
    },
  });

  useEffect(() => {
    if (preferencesData?.preferences) {
      const tagIds = preferencesData.preferences.map((tag: Tag) => tag.id);
      setSelectedTags(tagIds);
    }
  }, [preferencesData]);

  const toggleTag = (tagId: string) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId];

    setSelectedTags(newSelectedTags);
    updatePreferencesMutation.mutate({ tagIds: newSelectedTags });
  };

  if (isLoadingAllTags || isLoadingPreferences) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  const tags: Tag[] = allTags || [];

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-4 block">
          Select your preferred topics
        </label>
        <p className="text-sm text-muted-foreground mb-4">
          Choose the topics you&apos;re interested in
        </p>
        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => {
            const isSelected = selectedTags.includes(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                disabled={updatePreferencesMutation.isPending}
                className={cn(
                  "p-2 rounded-full text-xs font-medium transition-all cursor-pointer",
                  "border-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-input hover:bg-accent hover:text-accent-foreground"
                )}
                type="button"
              >
                {tag.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
