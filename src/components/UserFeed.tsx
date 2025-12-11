"use client";

import type { Article, Tag } from "@prisma/client";
import FeedCard from "./FeedCard";

type ArticleWithTags = Article & { tags: Tag[] };

interface UserFeedProps {
  articles: ArticleWithTags[];
}

export default function UserFeed({ articles }: UserFeedProps) {
  if (articles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <p className="text-muted-foreground text-lg">No articles available</p>
      </div>
    );
  }

  return (
    <div className="mx-auto p-4 flex flex-col gap-6">
      {articles.map((article) => (
        <FeedCard key={article.id} article={article} />
      ))}
    </div>
  );
}
