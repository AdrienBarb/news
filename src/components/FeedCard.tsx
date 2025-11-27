import type { Article, Tag } from "@prisma/client";
import { ThumbsUp, ThumbsDown } from "lucide-react";

type ArticleWithTags = Article & { tags: Tag[] };

interface FeedCardProps {
  article: ArticleWithTags;
}

export default function FeedCard({ article }: FeedCardProps) {
  return (
    <div className="aspect-[4/5] w-full rounded-lg bg-background overflow-hidden flex flex-col items-center gap-2">
      <div className="flex-1 flex flex-col items-center border rounded-lg">
        <div
          className="rounded-t-lg p-4 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/bg.jpg')",
          }}
        >
          <h2 className="text-2xl font-bold text-white font-playfair-display text-center">
            {article.title}
          </h2>
        </div>

        <div className="p-6 flex items-center justify-center h-full">
          <p className="text-base font-bold font-archivo text-center">
            {article.summary}
          </p>
        </div>
      </div>

      <div className="w-full flex gap-2">
        <button className="flex-1 bg-white border rounded-lg p-3 flex items-center justify-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
          <ThumbsDown
            className="text-primary font-bold"
            color="hsl(var(--color-primary))"
            strokeWidth={3}
            size={20}
          />
        </button>
        <button className="flex-1 bg-white border rounded-lg p-3 flex items-center justify-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
          <ThumbsUp
            className="text-primary font-bold"
            color="hsl(var(--color-secondary))"
            strokeWidth={3}
            size={20}
          />
        </button>
      </div>
    </div>
  );
}
