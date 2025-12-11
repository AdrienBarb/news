"use client";

import type { Article, Tag } from "@prisma/client";
import { useEffect } from "react";
import { useQueryState } from "nuqs";
import FeedCard from "./FeedCard";
import useApi from "@/lib/hooks/useApi";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type ArticleWithTags = Article & { tags: Tag[] };

interface AllNewsPageClientProps {
  initialArticles: ArticleWithTags[];
  initialPage: number;
  initialTotalPages: number;
  initialTotal: number;
}

export default function AllNewsPageClient({
  initialArticles,
  initialPage,
  initialTotalPages,
  initialTotal,
}: AllNewsPageClientProps) {
  const { useGet } = useApi();
  const [page, setPage] = useQueryState("page", {
    defaultValue: String(initialPage),
    parse: (value) => {
      const parsed = parseInt(value || String(initialPage), 10);
      return isNaN(parsed) || parsed < 1 ? String(initialPage) : String(parsed);
    },
    serialize: (value) => value || String(initialPage),
  });

  const currentPage = parseInt(page || String(initialPage), 10) || 1;

  const { data, isLoading, error, refetch } = useGet(
    "/articles",
    { page: currentPage, pageSize: 10 },
    {
      initialData:
        currentPage === initialPage
          ? {
              articles: initialArticles,
              page: initialPage,
              totalPages: initialTotalPages,
              total: initialTotal,
            }
          : undefined,
      staleTime: 0,
      refetchOnMount: true,
    }
  );

  useEffect(() => {
    if (currentPage !== initialPage) {
      refetch();
    }
  }, [currentPage, initialPage, refetch]);

  const articles: ArticleWithTags[] = data?.articles || initialArticles;
  const totalPages = data?.totalPages || initialTotalPages;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setPage(String(newPage));
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderPaginationItems = () => {
    const items: React.ReactNode[] = [];
    const maxVisiblePages = 7;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious
          onClick={() => handlePageChange(currentPage - 1)}
          className={
            currentPage === 1
              ? "pointer-events-none opacity-50"
              : "cursor-pointer"
          }
        />
      </PaginationItem>
    );

    // First page
    if (startPage > 1) {
      items.push(
        <PaginationItem key="1">
          <PaginationLink
            onClick={() => handlePageChange(1)}
            isActive={currentPage === 1}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => handlePageChange(totalPages)}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Next button
    items.push(
      <PaginationItem key="next">
        <PaginationNext
          onClick={() => handlePageChange(currentPage + 1)}
          className={
            currentPage === totalPages
              ? "pointer-events-none opacity-50"
              : "cursor-pointer"
          }
        />
      </PaginationItem>
    );

    return items;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <p className="text-muted-foreground text-lg">
          Failed to load articles. Please try again.
        </p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <p className="text-muted-foreground text-lg">No articles available</p>
      </div>
    );
  }

  return (
    <div className="mx-auto p-4 flex flex-col gap-6">
      {isLoading && currentPage !== initialPage ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading articles...</p>
        </div>
      ) : (
        <>
          {articles.map((article: ArticleWithTags) => (
            <FeedCard key={article.id} article={article} />
          ))}

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination>
                <PaginationContent>{renderPaginationItems()}</PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}
