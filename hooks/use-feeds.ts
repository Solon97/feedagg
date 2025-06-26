"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { apiService } from "@/lib/api";
import type { FeedItem, UserFeedSubscription } from "@/types/api";

// Cache global para os feed items com controle de instância
let feedItemsCache: {
  items: FeedItem[];
  total: number;
  hasMore: boolean;
  lastFetch: number;
  filters?: FeedFilters;
} | null = null;

// Flag global para evitar múltiplas inicializações simultâneas
let isInitializing = false;

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
    async (url: string) => {
      try {
        await apiService.subscribeFeed(url);
        await fetchFeeds(); // Refresh the list only for new subscriptions
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

        // Update local state instead of refetching
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

      // Remove from local state instead of refetching
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
  }, []); // Remove fetchFeeds dependency to prevent infinite loop

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
  feed_type?: "rss" | "youtube";
}

export function useFeedItems() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<FeedFilters>({});
  const hasInitialized = useRef(false);

  // Fetch function without dependencies to prevent loops
  const fetchItemsInternal = async (
    currentFilters: FeedFilters,
    params: {
      limit?: number;
      offset?: number;
      sort?: string;
      order?: "asc" | "desc";
      reset?: boolean;
      forceRefresh?: boolean;
    } = {}
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getUserFeedItems({
        limit: params.limit || 20,
        offset: params.offset || 0,
        sort: params.sort || "published_at",
        order: params.order || "desc",
        ...currentFilters,
      });

      const responseItems = response || [];

      if (params.reset || params.offset === 0) {
        setItems(responseItems);
        feedItemsCache = {
          items: responseItems,
          total: response?.total || 0,
          hasMore: responseItems.length === (params.limit || 20),
          lastFetch: Date.now(),
          filters: currentFilters,
        };
      } else {
        setItems((prevItems) => {
          const newItems = [...prevItems, ...responseItems];
          feedItemsCache = {
            items: newItems,
            total: response?.total || 0,
            hasMore: responseItems.length === (params.limit || 20),
            lastFetch: Date.now(),
            filters: currentFilters,
          };
          return newItems;
        });
      }

      setTotal(response?.total || 0);
      setHasMore(responseItems.length === (params.limit || 20));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch feed items"
      );
    } finally {
      setLoading(false);
    }
  };

  const refresh = useCallback(() => {
    feedItemsCache = null;
    fetchItemsInternal(filters, { reset: true, forceRefresh: true });
  }, [filters]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchItemsInternal(filters, { offset: items.length });
    }
  }, [loading, hasMore, items.length, filters]);

  const applyFilters = useCallback((newFilters: FeedFilters) => {
    setFilters(newFilters);
    feedItemsCache = null;
    fetchItemsInternal(newFilters, { reset: true });
  }, []);

  const clearFilters = useCallback(() => {
    const emptyFilters = {};
    setFilters(emptyFilters);
    feedItemsCache = null;
    fetchItemsInternal(emptyFilters, { reset: true });
  }, []);

  // Initialize once
  useEffect(() => {
    if (!hasInitialized.current && !isInitializing) {
      hasInitialized.current = true;
      isInitializing = true;

      if (
        feedItemsCache &&
        Date.now() - feedItemsCache.lastFetch < 5 * 60 * 1000
      ) {
        setItems(feedItemsCache.items);
        setTotal(feedItemsCache.total);
        setHasMore(feedItemsCache.hasMore);
        setFilters(feedItemsCache.filters || {});
        setLoading(false);
        isInitializing = false;
      } else {
        fetchItemsInternal({}, { reset: true }).finally(() => {
          isInitializing = false;
        });
      }
    }
  }, []);

  return {
    items,
    loading,
    error,
    hasMore,
    total,
    filters,
    refresh,
    loadMore,
    applyFilters,
    clearFilters,
  };
}
