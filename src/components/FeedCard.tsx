"use client";

import type { Article, Tag } from "@prisma/client";
import { ExternalLink } from "lucide-react";

type ArticleWithTags = Article & { tags: Tag[] };

interface FeedCardProps {
  article: ArticleWithTags;
}

export default function FeedCard({ article }: FeedCardProps) {
  const formatDate = (date?: Date | string) => {
    if (!date) return null;
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <article className="relative bg-card overflow-hidden flex flex-row rounded-xl shadow-sm border border-border">
      {/* Image Container - Left Side */}
      <div className="relative w-72 shrink-0 overflow-hidden rounded-l-xl">
        {article.imageUrl ? (
          <img
            src={article.imageUrl}
            alt={article.headline || "Article image"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-primary" />
        )}
      </div>

      {/* Content Container - Right Side */}
      <div className="flex flex-col flex-1 p-6 relative">
        {/* Date */}
        {article.publishedAt && (
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <div className="w-1 h-1 rounded-full bg-primary" />
            <time className="text-sm font-medium">
              {formatDate(article.publishedAt)}
            </time>
          </div>
        )}

        {/* Headline */}
        <h3 className="text-2xl font-bold text-foreground mb-3 line-clamp-2">
          {article.headline}
        </h3>

        {/* Summary */}
        <p className="text-base text-muted-foreground leading-relaxed line-clamp-2 flex-1 mb-4">
          {article.summary}
        </p>

        {/* Read More Link */}
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-semibold text-primary w-fit"
        >
          <span>Read article</span>
          <ExternalLink size={16} />
        </a>
      </div>
    </article>
  );
}
