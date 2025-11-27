"use client";

import type { Article, Tag } from "@prisma/client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, Pagination } from "swiper/modules";
import { useState, useEffect } from "react";
import FeedCard from "./FeedCard";
import useApi from "@/lib/hooks/useApi";
import type { Reaction } from "@/lib/types/interactions";
import toast from "react-hot-toast";
import "swiper/css";
import "swiper/css/pagination";

type ArticleWithTags = Article & { tags: Tag[] };

interface InteractionState {
  startTime: number;
  reaction: Reaction;
  hasSent: boolean;
}

interface UserFeedProps {
  articles: ArticleWithTags[];
}

export default function UserFeed({ articles }: UserFeedProps) {
  const { usePost } = useApi();
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [interactions, setInteractions] = useState<
    Map<string, InteractionState>
  >(new Map());

  const sendInteractionMutation = usePost("/interactions", {
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Failed to save interaction";
      toast.error(errorMessage);
    },
  });

  const sendInteraction = (articleId: string) => {
    const interaction = interactions.get(articleId);
    if (!interaction || interaction.hasSent) return;

    const dwellTimeMs = Date.now() - interaction.startTime;
    if (dwellTimeMs > 0) {
      setInteractions((prev) => {
        const newMap = new Map(prev);
        const current = newMap.get(articleId);
        if (current) {
          newMap.set(articleId, { ...current, hasSent: true });
        }
        return newMap;
      });

      sendInteractionMutation.mutate({
        articleId,
        dwellTimeMs,
        reaction: interaction.reaction,
      });
    }
  };

  useEffect(() => {
    if (articles.length > 0) {
      const firstArticleId = articles[0].id;
      setInteractions((prev) => {
        const newMap = new Map(prev);
        if (!newMap.has(firstArticleId)) {
          newMap.set(firstArticleId, {
            startTime: Date.now(),
            reaction: null,
            hasSent: false,
          });
        }
        return newMap;
      });
    }
  }, [articles]);

  const handleSlideChange = (swiper: { activeIndex: number }) => {
    const newIndex = swiper.activeIndex;
    const previousIndex = activeSlideIndex;

    if (previousIndex >= 0 && previousIndex < articles.length) {
      const previousArticleId = articles[previousIndex].id;
      sendInteraction(previousArticleId);
    }

    const newArticleId = articles[newIndex]?.id;
    if (newArticleId) {
      setInteractions((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(newArticleId);

        if (existing) {
          newMap.set(newArticleId, {
            startTime: Date.now(),
            reaction: existing.reaction,
            hasSent: false,
          });
        } else {
          newMap.set(newArticleId, {
            startTime: Date.now(),
            reaction: null,
            hasSent: false,
          });
        }
        return newMap;
      });
    }

    setActiveSlideIndex(newIndex);
  };

  const handleReactionChange = (articleId: string, reaction: Reaction) => {
    setInteractions((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(articleId) || {
        startTime: Date.now(),
        reaction: null,
        hasSent: false,
      };
      newMap.set(articleId, { ...current, reaction });
      return newMap;
    });
  };

  if (articles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground text-lg">No articles available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <Swiper
        direction="vertical"
        slidesPerView={1}
        spaceBetween={0}
        mousewheel={{
          forceToAxis: true,
          sensitivity: 1,
          releaseOnEdges: true,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        modules={[Mousewheel, Pagination]}
        className="h-full w-full"
        speed={500}
        resistance={true}
        resistanceRatio={0.85}
        onSlideChange={handleSlideChange}
      >
        {articles.map((article) => {
          const interaction = interactions.get(article.id);
          const reaction = interaction?.reaction || null;

          return (
            <SwiperSlide key={article.id} className="h-full">
              <div className="h-full flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                  <FeedCard
                    article={article}
                    reaction={reaction}
                    onThumbsUp={() => {
                      const newReaction = reaction === "up" ? null : "up";
                      handleReactionChange(article.id, newReaction);
                    }}
                    onThumbsDown={() => {
                      const newReaction = reaction === "down" ? null : "down";
                      handleReactionChange(article.id, newReaction);
                    }}
                  />
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
