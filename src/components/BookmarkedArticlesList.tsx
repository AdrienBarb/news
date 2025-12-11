"use client";

import type { Article, Tag } from "@prisma/client";
import FeedCard from "./FeedCard";

type ArticleWithTags = Article & { tags: Tag[] };

interface BookmarkedArticlesListProps {
  articles: ArticleWithTags[];
}

export default function BookmarkedArticlesList({
  articles,
}: BookmarkedArticlesListProps) {
  if (articles.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground text-lg">
            You haven&apos;t bookmarked any articles yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 flex flex-col gap-6">
      {articles.map((article) => (
        <FeedCard key={article.id} article={article} />
      ))}
    </div>
  );
}
