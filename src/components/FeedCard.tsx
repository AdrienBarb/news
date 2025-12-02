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
    <div className="w-full rounded-lg bg-white overflow-hidden flex flex-col">
      <div className="flex flex-col">
        <div className="relative w-full h-32 overflow-hidden rounded-lg">
          {article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt={article.headline || article.title}
              className="w-full h-full object-cover opacity-70"
            />
          ) : (
            <div className="w-full h-full bg-primary" />
          )}
        </div>

        <div className="p-6 flex flex-col gap-4">
          {article.tags && article.tags.length > 0 && (
            <span className="px-3 py-1 w-fit rounded-full bg-foreground text-white text-xs font-semibold">
              {article.tags[0].name}
            </span>
          )}

          <h2 className="text-2xl font-bold text-gray-900 font-playfair-display">
            {article.headline || article.title}
          </h2>

          <p className="text-base text-gray-700 leading-relaxed">
            {article.summary}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full flex gap-3 p-4 justify-end">
        <button
          onClick={onLike}
          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer ${
            isLiked ? "border-gray-300 bg-gray-200" : "border-gray-300 bg-white"
          }`}
        >
          <Heart
            className={isLiked ? "fill-black text-black" : "text-gray-600"}
            strokeWidth={2}
            size={20}
          />
        </button>
        <button
          onClick={onBookmark}
          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer ${
            isBookmarked
              ? "border-gray-300 bg-gray-200"
              : "border-gray-300 bg-white"
          }`}
        >
          <Bookmark
            className={isBookmarked ? "fill-black text-black" : "text-gray-600"}
            strokeWidth={2}
            size={20}
          />
        </button>
      </div>
    </div>
  );
}
