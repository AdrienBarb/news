"use client";

import type { Article, Tag } from "@prisma/client";
import FeedCard from "./FeedCard";
import { useState } from "react";
import useApi from "@/lib/hooks/useApi";
import toast from "react-hot-toast";

type ArticleWithTags = Article & { tags: Tag[] };

interface BookmarkedArticlesListProps {
  articles: ArticleWithTags[];
}

export default function BookmarkedArticlesList({
  articles: initialArticles,
}: BookmarkedArticlesListProps) {
  const [articles, setArticles] = useState(initialArticles);
  const [likes, setLikes] = useState<Set<string>>(new Set());

  const { usePost } = useApi();
  const sendInteractionMutation = usePost("/interactions", {
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Failed to save interaction";
      toast.error(errorMessage);
    },
  });

  const handleLikeToggle = (articleId: string) => {
    const isLiked = likes.has(articleId);
    const newLikeState = !isLiked;

    setLikes((prev) => {
      const newSet = new Set(prev);
      if (newLikeState) {
        newSet.add(articleId);
      } else {
        newSet.delete(articleId);
      }
      return newSet;
    });

    sendInteractionMutation.mutate({
      articleId,
      isLiked: newLikeState,
      isBookmarked: true,
    });
  };

  const handleBookmarkToggle = (articleId: string) => {
    // Remove from list immediately
    setArticles((prev) => prev.filter((a) => a.id !== articleId));
    toast.success("Article removed from bookmarks");

    // Send interaction
    sendInteractionMutation.mutate({
      articleId,
      isLiked: likes.has(articleId),
      isBookmarked: false,
    });
  };

  if (articles.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 font-playfair-display">
          Bookmarked Articles
        </h1>
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
        <FeedCard
          key={article.id}
          article={article}
          isLiked={likes.has(article.id)}
          isBookmarked={true}
          onLike={() => handleLikeToggle(article.id)}
          onBookmark={() => handleBookmarkToggle(article.id)}
        />
      ))}
    </div>
  );
}
