"use client";

import type { Article, Tag } from "@prisma/client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, Pagination } from "swiper/modules";
import FeedCard from "./FeedCard";
import "swiper/css";
import "swiper/css/pagination";

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
      >
        {articles.map((article) => (
          <SwiperSlide key={article.id} className="h-full">
            <div className="h-full flex items-center justify-center p-4">
              <div className="w-full max-w-md">
                <FeedCard article={article} />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
