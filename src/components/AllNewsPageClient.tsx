"use client";

import type { Article, Tag } from "@prisma/client";
import { useEffect } from "react";
import { useQueryState } from "nuqs";
import FeedCard from "./FeedCard";
import TagSelector from "./TagSelector";
import useApi from "@/lib/hooks/useApi";
import { cn } from "@/lib/utils";
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
  initialTag: string | null;
  allTags: Tag[];
}

export default function AllNewsPageClient({
  initialArticles,
  initialPage,
  initialTotalPages,
  initialTotal,
  initialTag,
  allTags,
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

  const [tagParam, setTagParam] = useQueryState("tag");
  const selectedTag = tagParam || null;

  const currentPage = parseInt(page || String(initialPage), 10) || 1;

  const { data, isLoading, error, refetch } = useGet(
    "/articles",
    {
      page: currentPage,
      pageSize: 10,
      ...(selectedTag && { tag: selectedTag }),
    },
    {
      initialData:
        currentPage === initialPage && selectedTag === initialTag
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

  const handleTagToggle = (tagName: string) => {
    // If clicking the same tag, deselect it; otherwise select the new tag
    const newTag = selectedTag === tagName ? null : tagName;
    setTagParam(newTag);
    // Reset to page 1 when tag changes
    setPage("1");
  };

  const handleResetFilter = () => {
    setTagParam(null);
    setPage("1");
  };

  useEffect(() => {
    if (currentPage !== initialPage || selectedTag !== initialTag) {
      refetch();
    }
  }, [currentPage, initialPage, selectedTag, initialTag, refetch]);

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
    // Show fewer pages on mobile - use responsive approach
    const maxVisiblePages = 5; // Reduced from 7 for better mobile fit
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
          className={cn(
            currentPage === 1
              ? "pointer-events-none opacity-50"
              : "cursor-pointer"
          )}
        />
      </PaginationItem>
    );

    // First page - hide on mobile (sm:hidden)
    if (startPage > 1) {
      items.push(
        <PaginationItem key="1" className="hidden sm:block">
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
          <PaginationItem key="ellipsis-start" className="hidden sm:block">
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

    // Last page - hide on mobile (sm:hidden)
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis-end" className="hidden sm:block">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      items.push(
        <PaginationItem key={totalPages} className="hidden sm:block">
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
          className={cn(
            currentPage === totalPages
              ? "pointer-events-none opacity-50"
              : "cursor-pointer"
          )}
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

  const tagChanged = selectedTag !== initialTag;

  return (
    <div className="mx-auto p-4 flex flex-col gap-6 max-w-full">
      <TagSelector
        tags={allTags}
        selectedTag={selectedTag}
        onTagToggle={handleTagToggle}
        onReset={handleResetFilter}
      />

      {isLoading && (currentPage !== initialPage || tagChanged) ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading articles...</p>
        </div>
      ) : (
        <>
          {articles.map((article: ArticleWithTags) => (
            <FeedCard key={article.id} article={article} />
          ))}

          {totalPages > 1 && (
            <div className="mt-8 w-full overflow-x-auto">
              <div className="flex justify-center min-w-max mx-auto">
                <Pagination>
                  <PaginationContent>
                    {renderPaginationItems()}
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
