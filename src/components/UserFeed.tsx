"use client";

import type { Article, Tag } from "@prisma/client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, Pagination } from "swiper/modules";
import { useState } from "react";
import FeedCard from "./FeedCard";
import WelcomeCard from "./WelcomeCard";
import EndCard from "./EndCard";
import SubscriptionCard from "./SubscriptionCard";
import useApi from "@/lib/hooks/useApi";
import toast from "react-hot-toast";
import { useUser } from "@/lib/hooks/useUser";
import { isSubscriptionActive } from "@/lib/utils/subscription";
import "swiper/css";
import "swiper/css/pagination";

type ArticleWithTags = Article & { tags: Tag[] };

interface UserFeedProps {
  articles: ArticleWithTags[];
  initialLikes?: string[];
  initialBookmarks?: string[];
}

export default function UserFeed({
  articles,
  initialLikes = [],
  initialBookmarks = [],
}: UserFeedProps) {
  const { usePost } = useApi();
  const { user } = useUser();
  const [likes, setLikes] = useState<Set<string>>(new Set(initialLikes));
  const [bookmarks, setBookmarks] = useState<Set<string>>(
    new Set(initialBookmarks)
  );

  const sendInteractionMutation = usePost("/interactions", {
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Failed to save interaction";
      toast.error(errorMessage);
    },
  });

  const handleSlideChange = () => {};

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
      isBookmarked: bookmarks.has(articleId),
    });
  };

  const handleBookmarkToggle = (articleId: string) => {
    const isBookmarked = bookmarks.has(articleId);
    const newBookmarkState = !isBookmarked;

    setBookmarks((prev) => {
      const newSet = new Set(prev);
      if (newBookmarkState) {
        newSet.add(articleId);
      } else {
        newSet.delete(articleId);
      }
      return newSet;
    });

    sendInteractionMutation.mutate({
      articleId,
      isLiked: likes.has(articleId),
      isBookmarked: newBookmarkState,
    });
  };

  if (!isSubscriptionActive(user?.subscriptionStatus)) {
    return <SubscriptionCard />;
  }

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
        <SwiperSlide key="welcome" className="h-full">
          <div className="h-full flex items-center justify-center p-4">
            <div className="w-full max-w-md">
              <WelcomeCard />
            </div>
          </div>
        </SwiperSlide>

        {articles.map((article) => (
          <SwiperSlide key={article.id} className="h-full">
            <div className="h-full flex items-center justify-center p-4">
              <div className="w-full max-w-md">
                <FeedCard
                  article={article}
                  isLiked={likes.has(article.id)}
                  isBookmarked={bookmarks.has(article.id)}
                  onLike={() => handleLikeToggle(article.id)}
                  onBookmark={() => handleBookmarkToggle(article.id)}
                />
              </div>
            </div>
          </SwiperSlide>
        ))}

        <SwiperSlide key="end" className="h-full">
          <div className="h-full flex items-center justify-center p-4">
            <div className="w-full max-w-md">
              <EndCard />
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}
