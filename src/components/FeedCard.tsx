"use client";

import type { Article, Tag } from "@prisma/client";
import { Heart, Bookmark, ExternalLink } from "lucide-react";

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
    <div className="w-full rounded-lg bg-gray-50 border border-transparent hover:border-gray-200 transition-colors overflow-hidden flex flex-col">
      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex flex-col gap-2 flex-1">
            {article.tags && article.tags.length > 0 && (
              <span className="px-3 py-1 w-fit rounded-full bg-foreground text-white text-xs font-semibold">
                {article.tags[0].name}
              </span>
            )}
          </div>

          <div className="flex gap-2 shrink-0">
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
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="w-8 h-8 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
            >
              <ExternalLink
                className="text-gray-600"
                strokeWidth={2}
                size={14}
              />
            </a>
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
