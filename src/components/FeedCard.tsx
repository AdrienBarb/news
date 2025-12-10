"use client";

import type { Article, Tag } from "@prisma/client";
import { Heart, Bookmark } from "lucide-react";

type ArticleWithTags = Article & { tags: Tag[] };

interface FeedCardProps {
  article: ArticleWithTags;
  isLiked: boolean;
  isBookmarked: boolean;
  onLike: () => void;
  onBookmark: () => void;
}

export default function FeedCard({
  article,
  isLiked,
  isBookmarked,
  onLike,
  onBookmark,
}: FeedCardProps) {
  return (
    <div className="w-full rounded-lg bg-gray-50 border border-transparent hover:border-gray-200 transition-colors overflow-hidden flex flex-col md:flex-row md:items-stretch">
      <div className="relative w-full h-48 md:w-32 md:h-auto md:self-stretch flex-shrink-0 overflow-hidden rounded-t-lg md:rounded-l-lg">
        {article.imageUrl ? (
          <img
            src={article.imageUrl}
            alt={article.headline || ""}
            className="w-full h-full object-cover opacity-70"
          />
        ) : (
          <div className="w-full h-full bg-primary" />
        )}
      </div>

      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex flex-col gap-2 flex-1">
            {article.tags && article.tags.length > 0 && (
              <span className="px-3 py-1 w-fit rounded-full bg-foreground text-white text-xs font-semibold">
                {article.tags[0].name}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onLike();
              }}
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer ${
                isLiked
                  ? "border-gray-300 bg-gray-200"
                  : "border-gray-300 bg-white"
              }`}
            >
              <Heart
                className={isLiked ? "fill-black text-black" : "text-gray-600"}
                strokeWidth={2}
                size={14}
              />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onBookmark();
              }}
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer ${
                isBookmarked
                  ? "border-gray-300 bg-gray-200"
                  : "border-gray-300 bg-white"
              }`}
            >
              <Bookmark
                className={
                  isBookmarked ? "fill-black text-black" : "text-gray-600"
                }
                strokeWidth={2}
                size={14}
              />
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 font-playfair-display mb-4">
          {article.headline}
        </h2>

        <p className="text-base text-gray-700 leading-relaxed">
          {article.summary}
        </p>
      </div>
    </div>
  );
}
