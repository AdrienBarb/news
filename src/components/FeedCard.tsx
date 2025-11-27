import type { Article, Tag } from "@prisma/client";

type ArticleWithTags = Article & { tags: Tag[] };

interface FeedCardProps {
  article: ArticleWithTags;
}

export default function FeedCard({ article }: FeedCardProps) {
  return (
    <div className="p-6 rounded-lg border bg-card">
      <p className="text-center text-foreground">{article.summary}</p>
    </div>
  );
}

