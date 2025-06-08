import { useState, useEffect } from "react";
import { ContentItemEntity } from "@/core/entities/content-item.entity";
import { FindContentItemsQuery } from "@/core/repositories/content-item.repository";

interface FeedFilters {
  contentTypes: string[];
  sources: string[];
  searchQuery: string;
  sortBy: "newest" | "oldest" | "popular";
}

interface UseFeedContentReturn {
  contentItems: ContentItemEntity[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  filters: FeedFilters;
  updateFilters: (newFilters: Partial<FeedFilters>) => void;
  refreshContent: () => Promise<void>;
}

export function useFeedContent(
  userId?: string,
  initialFilters?: Partial<FindContentItemsQuery>
): UseFeedContentReturn {
  const [contentItems, setContentItems] = useState<ContentItemEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState<FeedFilters>({
    contentTypes: [],
    sources: [],
    searchQuery: "",
    sortBy: "newest",
  });

  const updateFilters = (newFilters: Partial<FeedFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setOffset(0); // Reset pagination when filters change
  };

  const fetchContent = async (reset: boolean = false) => {
    if (!userId) {
      setContentItems([]);
      setIsLoading(false);
      return;
    }

    try {
      if (reset) {
        setIsLoading(true);
        setOffset(0);
      }
      setError(null);

      const query: FindContentItemsQuery = {
        ...initialFilters,
        // Map from FeedFilters to FindContentItemsQuery
        search: filters.searchQuery || undefined,
        contentType:
          filters.contentTypes.length > 0 ? filters.contentTypes[0] : undefined,
        author: filters.sources.length > 0 ? filters.sources[0] : undefined,
        limit: 20,
        offset: reset ? 0 : offset,
        orderBy: "publishedAt",
        orderDirection: filters.sortBy === "oldest" ? "asc" : "desc",
      };

      // Since ContentItemUseCases expects repositories, we'll need to handle this differently
      // For now, return empty array - this will be properly implemented when dependency injection is set up
      const newItems: ContentItemEntity[] = [];

      if (reset) {
        setContentItems(newItems);
      } else {
        setContentItems((prev) => [...prev, ...newItems]);
      }

      setHasMore(newItems.length === query.limit);
      setOffset((prev) => (reset ? 20 : prev + 20));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch feed content"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => fetchContent(true);
  const loadMore = () => fetchContent(false);
  const refreshContent = () => fetchContent(true);

  useEffect(() => {
    fetchContent(true);
  }, [userId, filters]);

  return {
    contentItems,
    isLoading,
    error,
    refetch,
    hasMore,
    loadMore,
    filters,
    updateFilters,
    refreshContent,
  };
}
