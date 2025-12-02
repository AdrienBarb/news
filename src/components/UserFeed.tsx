"use client";

import type { Article, Tag } from "@prisma/client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, Pagination } from "swiper/modules";
import { useState } from "react";
import FeedCard from "./FeedCard";
import WelcomeCard from "./WelcomeCard";
import EndCard from "./EndCard";
import useApi from "@/lib/hooks/useApi";
import type { Reaction } from "@/lib/types/interactions";
import toast from "react-hot-toast";
import { useUser } from "@/lib/hooks/useUser";
import { isSubscriptionActive } from "@/lib/utils/subscription";
import { Button } from "@/components/ui/button";
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
  const { user } = useUser();
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [interactions, setInteractions] = useState<
    Map<string, InteractionState>
  >(new Map());
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);

  const sendInteractionMutation = usePost("/interactions", {
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Failed to save interaction";
      toast.error(errorMessage);
    },
  });

  const { mutate: createCheckoutSession } = usePost(
    "/checkout/create-session",
    {
      onSuccess: (data: { url: string }) => {
        if (data.url) {
          window.location.href = data.url;
        }
      },
      onError: (error: unknown) => {
        const errorMessage =
          error &&
          typeof error === "object" &&
          "response" in error &&
          error.response &&
          typeof error.response === "object" &&
          "data" in error.response &&
          error.response.data &&
          typeof error.response.data === "object" &&
          "error" in error.response.data
            ? String(error.response.data.error)
            : undefined;
        toast.error(errorMessage || "Failed to create checkout session");
        setIsCreatingCheckout(false);
      },
    }
  );

  const handleActivateTrial = async () => {
    setIsCreatingCheckout(true);
    createCheckoutSession({});
  };

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

  const handleSlideChange = (swiper: { activeIndex: number }) => {
    const newIndex = swiper.activeIndex;
    const previousIndex = activeSlideIndex;

    const totalSlides = articles.length + 2;
    const isWelcomeCard = (index: number) => index === 0;
    const isEndCard = (index: number) => index === totalSlides - 1;
    const getArticleIndex = (slideIndex: number) => slideIndex - 1;

    if (!isWelcomeCard(previousIndex) && !isEndCard(previousIndex)) {
      const previousArticleIndex = getArticleIndex(previousIndex);
      if (previousArticleIndex >= 0 && previousArticleIndex < articles.length) {
        const previousArticleId = articles[previousArticleIndex].id;
        sendInteraction(previousArticleId);
      }
    }

    if (!isWelcomeCard(newIndex) && !isEndCard(newIndex)) {
      const newArticleIndex = getArticleIndex(newIndex);
      const newArticleId = articles[newArticleIndex]?.id;
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

  if (!isSubscriptionActive(user?.subscriptionStatus)) {
    return (
      <div className="w-full h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="aspect-[4/5] w-full rounded-lg bg-background overflow-hidden flex flex-col items-center gap-2">
            <div className="flex-1 flex flex-col items-center justify-center border rounded-lg p-6">
              <div className="text-center space-y-6 w-full">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-primary font-playfair-display">
                    Subscribe to use the app
                  </h2>
                  <p className="text-base font-bold font-archivo text-muted-foreground">
                    Get access to personalized tech news and start your free
                    trial today.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold mb-1">
                      €4.99 per month
                    </div>
                    <p className="text-sm text-muted-foreground">
                      (billed annually)
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleActivateTrial}
                  size="lg"
                  disabled={isCreatingCheckout}
                  className="w-full font-extrabold text-xl text-white"
                >
                  {isCreatingCheckout
                    ? "Redirecting to checkout..."
                    : "Activate free trial"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
        {/* Welcome Card - First Slide */}
        <SwiperSlide key="welcome" className="h-full">
          <div className="h-full flex items-center justify-center p-4">
            <div className="w-full max-w-md">
              <WelcomeCard />
            </div>
          </div>
        </SwiperSlide>

        {/* Article Cards */}
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

        {/* End Card - Last Slide */}
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
