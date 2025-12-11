"use client";

import type { Article, Tag } from "@prisma/client";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

type ArticleWithTags = Article & { tags: Tag[] };

interface FeedCardProps {
  article: ArticleWithTags;
}

export default function FeedCard({ article }: FeedCardProps) {
  return (
    <div className="w-full rounded-lg bg-gray-50 border border-transparent hover:border-gray-200 transition-colors overflow-hidden flex flex-col">
      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-center justify-between gap-4 mb-2">
          <h2 className="text-2xl font-bold text-gray-900 font-playfair-display mb-4">
            {article.headline}
          </h2>
          <div className="flex gap-2 shrink-0">
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

        <p className="text-base text-gray-700 leading-relaxed mb-4">
          {article.summary}
        </p>

        <div className="flex gap-2 flex-wrap">
          {article.tags &&
            article.tags.length > 0 &&
            article.tags.map((tag) => (
              <Link
                href={`/all-news?tag=${encodeURIComponent(tag.name)}&page=1`}
                key={tag.id}
                className="px-3 py-1 w-fit rounded-full bg-foreground text-white text-xs font-semibold hover:opacity-80 transition-opacity"
              >
                {tag.name}
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
