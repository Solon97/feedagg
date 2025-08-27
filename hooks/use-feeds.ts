"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { apiService } from "@/lib/api";
import type { FeedItem, UserFeedSubscription } from "@/types/api";

export function useFeeds() {
  const [feeds, setFeeds] = useState<UserFeedSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeeds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getUserFeeds();
      setFeeds(response || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch feeds");
    } finally {
      setLoading(false);
    }
  }, []);

  const subscribeFeed = useCallback(
    async (url: string, topicId: string) => {
      try {
        await apiService.subscribeFeed(url, topicId);
        await fetchFeeds();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error:
            err instanceof Error ? err.message : "Failed to subscribe to feed",
        };
      }
    },
    [fetchFeeds]
  );

  const updateFeedStatus = useCallback(
    async (feedId: string, isActive: boolean) => {
      try {
        await apiService.updateFeedStatus(feedId, isActive);
        setFeeds((prevFeeds) =>
          prevFeeds.map((subscription) =>
            subscription.feed.id === feedId
              ? { ...subscription, is_active: isActive }
              : subscription
          )
        );
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error:
            err instanceof Error ? err.message : "Failed to update feed status",
        };
      }
    },
    []
  );

  const deleteFeed = useCallback(async (feedId: string) => {
    try {
      await apiService.deleteFeed(feedId);
      setFeeds((prevFeeds) =>
        prevFeeds.filter((subscription) => subscription.feed.id !== feedId)
      );
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to delete feed",
      };
    }
  }, []);

  useEffect(() => {
    fetchFeeds();
  }, [fetchFeeds]);

  return {
    feeds,
    loading,
    error,
    refetch: fetchFeeds,
    subscribeFeed,
    updateFeedStatus,
    deleteFeed,
  };
}

export interface FeedFilters {
  title?: string;
  feed_id?: string;
  feed_type?: "blog" | "youtube";
  topic_id?: string;
}

export function useFeedItems() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<FeedFilters>({});

  // Use refs to track current values without causing re-renders
  const currentFiltersRef = useRef<FeedFilters>({});
  const isInitializedRef = useRef(false);
  const isFetchingRef = useRef(false);

  // Stable fetch function that doesn't change on every render
  const fetchItems = useCallback(
    async (
      targetFilters: FeedFilters,
      options: {
        limit?: number;
        offset?: number;
        sort?: string;
        order?: "asc" | "desc";
        reset?: boolean;
        isFilterChange?: boolean;
        isRefresh?: boolean;
      } = {}
    ) => {
      // Prevent concurrent fetches
      if (isFetchingRef.current) return;

      try {
        isFetchingRef.current = true;

        // Set appropriate loading state
        if (options.isRefresh) {
          setRefreshing(true);
        } else if (options.isFilterChange) {
          setFilterLoading(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const response = await apiService.getUserFeedItems({
          limit: options.limit || 20,
          offset: options.offset || 0,
          sort: options.sort || "published_at",
          order: options.order || "desc",
          ...targetFilters,
        });

        const responseItems = response?.data || response || [];

        // Handle response structure and calculate total
        let responseTotal = 0;
        if (
          response &&
          typeof response === "object" &&
          "total" in response &&
          typeof response.total === "number"
        ) {
          responseTotal = response.total;
        } else if (Array.isArray(responseItems)) {
          // If no total provided, we need to estimate
          // For first page, if we got less than limit, that's the total
          // For subsequent pages, we can't know the exact total
          if (options.offset === 0 || options.reset) {
            responseTotal =
              responseItems.length < (options.limit || 20)
                ? responseItems.length
                : responseItems.length;
          } else {
            // For pagination, keep existing total and add new items
            responseTotal = total + responseItems.length;
          }
        }

        if (options.reset || options.offset === 0) {
          setItems(responseItems);
          setTotal(responseTotal);
        } else {
          setItems((prevItems) => [...prevItems, ...responseItems]);
          // For pagination, update total to reflect all loaded items
          setTotal((prevTotal) =>
            Math.max(prevTotal, (options.offset || 0) + responseItems.length)
          );
        }

        // Set hasMore based on whether we got a full page
        setHasMore(responseItems.length === (options.limit || 20));

        // Update current filters ref
        currentFiltersRef.current = targetFilters;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch feed items"
        );
      } finally {
        setLoading(false);
        setFilterLoading(false);
        setRefreshing(false);
        isFetchingRef.current = false;
      }
    },
    [total]
  );

  // Stable functions that don't change on every render
  const refresh = useCallback(() => {
    fetchItems(currentFiltersRef.current, { reset: true, isRefresh: true });
  }, [fetchItems]);

  const loadMore = useCallback(() => {
    if (
      !loading &&
      !filterLoading &&
      !refreshing &&
      hasMore &&
      !isFetchingRef.current
    ) {
      fetchItems(currentFiltersRef.current, { offset: items.length });
    }
  }, [fetchItems, loading, filterLoading, refreshing, hasMore, items.length]);

  const applyFilters = useCallback(
    (newFilters: FeedFilters) => {
      setFilters(newFilters);
      fetchItems(newFilters, { reset: true, isFilterChange: true });
    },
    [fetchItems]
  );

  const clearFilters = useCallback(() => {
    const emptyFilters = {};
    setFilters(emptyFilters);
    fetchItems(emptyFilters, { reset: true, isFilterChange: true });
  }, [fetchItems]);

  const fetchAllItems = useCallback(() => {
    const emptyFilters = {};
    setFilters(emptyFilters);
    fetchItems(emptyFilters, { reset: true });
  }, [fetchItems]);

  const hasActiveFilters = useCallback(() => {
    return Object.values(filters).some(Boolean);
  }, [filters]);

  // Initialize only once - but don't fetch without filters
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      // Don't fetch items initially - wait for user to select a topic or apply filters
      setLoading(false);
    }
  }, []);

  return {
    items,
    loading,
    filterLoading,
    refreshing,
    error,
    hasMore,
    total,
    filters,
    refresh,
    loadMore,
    applyFilters,
    clearFilters,
    fetchAllItems,
    hasActiveFilters,
  };
}
