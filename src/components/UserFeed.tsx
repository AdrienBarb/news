import type { Article, Tag } from "@prisma/client";
import FeedCard from "./FeedCard";

type ArticleWithTags = Article & { tags: Tag[] };

interface UserFeedProps {
  articles: ArticleWithTags[];
}

export default function UserFeed({ articles }: UserFeedProps) {
  if (articles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground text-lg">No articles available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen py-8 px-4">
      <div className="w-full max-w-3xl space-y-6">
        {articles.map((article) => (
          <FeedCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
