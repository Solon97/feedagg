import { useState, useEffect, useCallback } from "react";
import { ContentItemEntity } from "@/core/entities/content-item.entity";

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

export function useFeedContent(userId?: string): UseFeedContentReturn {
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

  const updateFilters = useCallback((newFilters: Partial<FeedFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setOffset(0);
  }, []);

  const fetchContent = useCallback(
    async (reset: boolean = false) => {
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

        const searchParams = new URLSearchParams();
        searchParams.append("limit", "20");
        searchParams.append("offset", (reset ? 0 : offset).toString());

        if (filters.searchQuery) {
          searchParams.append("search", filters.searchQuery);
        }

        if (filters.contentTypes.length > 0) {
          filters.contentTypes.forEach((type) => {
            searchParams.append("contentType", type);
          });
        }

        if (filters.sources.length > 0) {
          filters.sources.forEach((source) => {
            searchParams.append("author", source);
          });
        }

        const orderDirection = filters.sortBy === "oldest" ? "asc" : "desc";
        searchParams.append("orderBy", "publishedAt");
        searchParams.append("orderDirection", orderDirection);

        const response = await fetch(`/api/content-items?${searchParams}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch content items");
        }

        const data = await response.json();
        const newItems: ContentItemEntity[] = Array.isArray(data?.contentItems)
          ? data.contentItems
          : Array.isArray(data)
          ? data
          : [];

        if (reset) {
          setContentItems(newItems);
        } else {
          setContentItems((prev) =>
            Array.isArray(prev) ? [...prev, ...newItems] : newItems
          );
        }

        setHasMore(newItems.length === 20);
        setOffset((prev) => (reset ? 20 : prev + 20));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch feed content"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [userId, filters, offset]
  );

  const refetch = useCallback(() => fetchContent(true), [fetchContent]);
  const loadMore = useCallback(() => fetchContent(false), [fetchContent]);
  const refreshContent = useCallback(() => fetchContent(true), [fetchContent]);

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
