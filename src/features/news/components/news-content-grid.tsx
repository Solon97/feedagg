import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { NewsContentCard } from "./news-content-card";
import {
  NewsLoadingState,
  NewsErrorState,
  NewsEmptyState,
} from "./news-states";
import type { ContentItemEntity } from "@/src/core/entities/content-item.entity";
import type { BookmarkState } from "../types/news.types";

interface NewsContentGridProps {
  contentItems: ContentItemEntity[];
  bookmarkStates: Map<string, BookmarkState>;
  onBookmarkToggle: (id: string) => void;
  onContentSelect: (item: ContentItemEntity) => void;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onRefresh: () => void;
}

export function NewsContentGrid({
  contentItems,
  bookmarkStates,
  onBookmarkToggle,
  onContentSelect,
  isLoading,
  error,
  hasMore,
  onLoadMore,
  hasActiveFilters,
  onClearFilters,
  onRefresh,
}: NewsContentGridProps) {
  // Error state
  if (error) {
    return <NewsErrorState error={error} onRetry={onRefresh} />;
  }

  // Empty state
  if (contentItems.length === 0 && !isLoading) {
    return (
      <NewsEmptyState
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
      />
    );
  }

  // Loading state for initial load
  if (isLoading && contentItems.length === 0) {
    return <NewsLoadingState />;
  }

  return (
    <>
      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {contentItems.map((item) => {
          const bookmarkState = bookmarkStates.get(item.id);
          const isBookmarked = bookmarkState?.isSaved || false;

          return (
            <NewsContentCard
              key={item.id}
              item={item}
              isBookmarked={isBookmarked}
              onBookmarkToggle={onBookmarkToggle}
              onContentSelect={onContentSelect}
            />
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMore && contentItems.length > 0 && (
        <div className="text-center py-8">
          <Button
            onClick={onLoadMore}
            disabled={isLoading}
            variant="outline"
            className="px-8 py-3 text-sm font-medium"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading more...
              </>
            ) : (
              <>Load More Content</>
            )}
          </Button>
        </div>
      )}
    </>
  );
}
