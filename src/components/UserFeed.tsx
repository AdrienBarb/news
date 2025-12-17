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
    <div className="bg-card rounded-2xl shadow-lg  p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-foreground">Articles</h2>
      </div>

      <div className="flex flex-col gap-4">
        {articles.map((article) => (
          <FeedCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
