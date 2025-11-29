"use client";

import type { Article, Tag } from "@prisma/client";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import type { Reaction } from "@/lib/types/interactions";

type ArticleWithTags = Article & { tags: Tag[] };

interface FeedCardProps {
  article: ArticleWithTags;
  reaction: Reaction;
  onThumbsUp: () => void;
  onThumbsDown: () => void;
}

export default function FeedCard({
  article,
  reaction,
  onThumbsUp,
  onThumbsDown,
}: FeedCardProps) {
  return (
    <div className="aspect-[4/5] w-full rounded-lg bg-background overflow-hidden flex flex-col items-center gap-2">
      <div className="flex-1 flex flex-col items-center border rounded-lg">
        <div
          className={`rounded-t-lg p-4 bg-cover bg-center bg-no-repeat ${
            !article.imageUrl ? "bg-primary" : ""
          }`}
          style={{
            backgroundImage: article.imageUrl
              ? `url(${article.imageUrl})`
              : undefined,
          }}
        >
          <h2 className="text-2xl font-bold text-white font-playfair-display text-center">
            {article.headline || article.title}
          </h2>
        </div>

        <div className="p-6 flex items-center justify-center h-full">
          <p className="text-base font-bold font-archivo text-center">
            {article.summary}
          </p>
        </div>
      </div>

      <div className="w-full flex gap-2">
        <button
          onClick={onThumbsDown}
          className={`flex-1 bg-white border rounded-lg p-3 flex items-center justify-center gap-2 hover:opacity-80 transition-opacity cursor-pointer ${
            reaction === "down" ? "bg-red-50 border-red-300" : ""
          }`}
        >
          <ThumbsDown
            className="text-primary font-bold"
            color={
              reaction === "down"
                ? "hsl(var(--color-destructive))"
                : "hsl(var(--color-primary))"
            }
            strokeWidth={3}
            size={20}
          />
        </button>
        <button
          onClick={onThumbsUp}
          className={`flex-1 bg-white border rounded-lg p-3 flex items-center justify-center gap-2 hover:opacity-80 transition-opacity cursor-pointer ${
            reaction === "up" ? "bg-green-50 border-green-300" : ""
          }`}
        >
          <ThumbsUp
            className="text-primary font-bold"
            color={
              reaction === "up"
                ? "hsl(var(--color-primary))"
                : "hsl(var(--color-secondary))"
            }
            strokeWidth={3}
            size={20}
          />
        </button>
      </div>
    </div>
  );
}
