"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { apiService } from "@/lib/api";
import { useAPIThrottle } from "@/hooks/use-api-throttle";
import { apiCache } from "@/lib/api-cache";
import { isSubscriptionActive } from "@/lib/subscription-utils";
import type {
  FeedItem,
  UserFeedSubscription,
  Topic,
  Subscription,
} from "@/types/api";

interface DashboardData {
  feeds: UserFeedSubscription[];
  topics: Topic[];
  subscription: Subscription | null;
  feedItems: FeedItem[];
}

interface DashboardFilters {
  title?: string;
  feed_id?: string;
  feed_type?: "blog" | "youtube";
  topic_id?: string;
}

interface DashboardState extends DashboardData {
  loading: boolean;
  error: string | null;
  feedItemsLoading: boolean;
  feedItemsError: string | null;
  hasMore: boolean;
  total: number;
  filters: DashboardFilters;
  refreshing: boolean;
  filterLoading: boolean;
}

export function useDashboardData(userId?: string) {
  const [state, setState] = useState<DashboardState>({
    feeds: [],
    topics: [],
    subscription: null,
    feedItems: [],
    loading: true,
    error: null,
    feedItemsLoading: false,
    feedItemsError: null,
    hasMore: true,
    total: 0,
    filters: {},
    refreshing: false,
    filterLoading: false,
  });

  const currentFiltersRef = useRef<DashboardFilters>({});
  const isInitializedRef = useRef(false);
  const isFetchingRef = useRef(false);

  // Fetch initial dashboard data (feeds, topics, subscription)
  const fetchDashboardDataInternal = useCallback(async () => {
    const cacheKey = `dashboard-${userId}`;

    // Check cache first
    const cachedData = apiCache.get<{
      feeds: UserFeedSubscription[];
      topics: Topic[];
      subscription: Subscription | null;
    }>(cacheKey);
    if (cachedData) {
      setState((prev) => ({
        ...prev,
        feeds: cachedData.feeds,
        topics: cachedData.topics,
        subscription: cachedData.subscription,
        loading: false,
        error: null,
      }));
      return;
    }

    // Prevent concurrent requests
    if (apiCache.isLoading(cacheKey)) {
      return;
    }

    try {
      apiCache.setLoading(cacheKey);
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // Fetch all data in parallel for better performance
      const [feedsResponse, topicsResponse, subscriptionResponse] =
        await Promise.allSettled([
          apiService.getUserFeeds(),
          apiService.getTopics(true), // Only topics with active feeds
          userId
            ? apiService.getUserSubscriptionStatus(userId)
            : Promise.resolve(null),
        ]);

      // Extract results, handling potential errors
      const feeds =
        feedsResponse.status === "fulfilled" ? feedsResponse.value || [] : [];
      const topics =
        topicsResponse.status === "fulfilled" ? topicsResponse.value || [] : [];
      const subscription =
        subscriptionResponse.status === "fulfilled"
          ? subscriptionResponse.value
          : null;

      // Cache the results
      apiCache.set(cacheKey, { feeds, topics, subscription });

      setState((prev) => ({
        ...prev,
        feeds,
        topics,
        subscription,
        loading: false,
        error:
          feedsResponse.status === "rejected"
            ? "Failed to fetch dashboard data"
            : null,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          err instanceof Error ? err.message : "Failed to fetch dashboard data",
      }));
    }
  }, [userId]);

  // Throttled version to avoid too frequent calls
  const fetchDashboardData = useAPIThrottle(fetchDashboardDataInternal, 3000);

  // Fetch feed items with filters
  const fetchFeedItems = useCallback(
    async (
      targetFilters: DashboardFilters,
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
          setState((prev) => ({ ...prev, refreshing: true }));
        } else if (options.isFilterChange) {
          setState((prev) => ({ ...prev, filterLoading: true }));
        } else {
          setState((prev) => ({ ...prev, feedItemsLoading: true }));
        }

        setState((prev) => ({ ...prev, feedItemsError: null }));

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
          if (options.offset === 0 || options.reset) {
            responseTotal =
              responseItems.length < (options.limit || 20)
                ? responseItems.length
                : responseItems.length;
          } else {
            responseTotal = state.total + responseItems.length;
          }
        }

        setState((prev) => {
          const newFeedItems =
            options.reset || options.offset === 0
              ? responseItems
              : [...prev.feedItems, ...responseItems];

          return {
            ...prev,
            feedItems: newFeedItems,
            total:
              options.reset || options.offset === 0
                ? responseTotal
                : Math.max(
                    prev.total,
                    (options.offset || 0) + responseItems.length
                  ),
            hasMore: responseItems.length === (options.limit || 20),
            filters: targetFilters,
          };
        });

        // Update current filters ref
        currentFiltersRef.current = targetFilters;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          feedItemsError:
            err instanceof Error ? err.message : "Failed to fetch feed items",
        }));
      } finally {
        setState((prev) => ({
          ...prev,
          feedItemsLoading: false,
          filterLoading: false,
          refreshing: false,
        }));
        isFetchingRef.current = false;
      }
    },
    [state.total]
  );

  // Public methods
  const refresh = useCallback(() => {
    const cacheKey = `dashboard-${userId}`;
    apiCache.clear(cacheKey); // Clear cache to force refresh
    Promise.all([
      fetchDashboardDataInternal(),
      fetchFeedItems(currentFiltersRef.current, {
        reset: true,
        isRefresh: true,
      }),
    ]);
  }, [fetchDashboardDataInternal, fetchFeedItems, userId]);

  const loadMore = useCallback(() => {
    if (
      !state.feedItemsLoading &&
      !state.filterLoading &&
      !state.refreshing &&
      state.hasMore &&
      !isFetchingRef.current
    ) {
      fetchFeedItems(currentFiltersRef.current, {
        offset: state.feedItems.length,
      });
    }
  }, [
    fetchFeedItems,
    state.feedItemsLoading,
    state.filterLoading,
    state.refreshing,
    state.hasMore,
    state.feedItems.length,
  ]);

  const applyFilters = useCallback(
    (newFilters: DashboardFilters) => {
      fetchFeedItems(newFilters, { reset: true, isFilterChange: true });
    },
    [fetchFeedItems]
  );

  const clearFilters = useCallback(() => {
    const emptyFilters = {};
    fetchFeedItems(emptyFilters, { reset: true, isFilterChange: true });
  }, [fetchFeedItems]);

  const fetchAllItems = useCallback(() => {
    const emptyFilters = {};
    fetchFeedItems(emptyFilters, { reset: true });
  }, [fetchFeedItems]);

  const hasActiveFilters = useCallback(() => {
    return Object.values(state.filters).some(Boolean);
  }, [state.filters]);

  // Initialize dashboard data once
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      fetchDashboardDataInternal();
    }
  }, [fetchDashboardDataInternal]);

  // Feed management methods
  const subscribeFeed = useCallback(
    async (url: string, topicId: string) => {
      try {
        await apiService.subscribeFeed(url, topicId);
        // Clear cache to refresh data
        apiCache.clear(`dashboard-${userId}`);
        await fetchDashboardDataInternal();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error:
            err instanceof Error ? err.message : "Failed to subscribe to feed",
        };
      }
    },
    [fetchDashboardDataInternal, userId]
  );

  const updateFeedStatus = useCallback(
    async (feedId: string, isActive: boolean) => {
      try {
        await apiService.updateFeedStatus(feedId, isActive);
        setState((prev) => ({
          ...prev,
          feeds: prev.feeds.map((subscription) =>
            subscription.feed.id === feedId
              ? { ...subscription, is_active: isActive }
              : subscription
          ),
        }));
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
      setState((prev) => ({
        ...prev,
        feeds: prev.feeds.filter(
          (subscription) => subscription.feed.id !== feedId
        ),
      }));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to delete feed",
      };
    }
  }, []);

  const createTopic = useCallback(
    async (topicData: {
      name: string;
      description?: string;
      color?: string;
    }) => {
      try {
        const newTopic = await apiService.createTopic(topicData);
        setState((prev) => ({
          ...prev,
          topics: [...prev.topics, newTopic],
        }));
        return { success: true, topic: newTopic };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to create topic",
        };
      }
    },
    []
  );

  const deleteTopic = useCallback(async (topicId: string) => {
    try {
      await apiService.deleteTopic(topicId);
      setState((prev) => ({
        ...prev,
        topics: prev.topics.filter((topic) => topic.id !== topicId),
      }));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to delete topic",
      };
    }
  }, []);

  return {
    // Data
    feeds: state.feeds,
    topics: state.topics,
    subscription: state.subscription,
    feedItems: state.feedItems,

    // Loading states
    loading: state.loading,
    feedItemsLoading: state.feedItemsLoading,
    filterLoading: state.filterLoading,
    refreshing: state.refreshing,

    // Error states
    error: state.error,
    feedItemsError: state.feedItemsError,

    // Pagination
    hasMore: state.hasMore,
    total: state.total,

    // Filters
    filters: state.filters,

    // Methods for feed items
    refresh,
    loadMore,
    applyFilters,
    clearFilters,
    fetchAllItems,
    hasActiveFilters,

    // Methods for feeds
    subscribeFeed,
    updateFeedStatus,
    deleteFeed,

    // Methods for topics
    createTopic,
    deleteTopic,

    // Computed values
    isActive: isSubscriptionActive(state.subscription?.status),
    currentPeriodEnd: state.subscription?.current_period_end
      ? new Date(state.subscription.current_period_end)
      : null,
    manageUrl: "/subscribe",

    // Check if any loading state is active
    isAnyLoading:
      state.loading ||
      state.feedItemsLoading ||
      state.filterLoading ||
      state.refreshing,
  };
}
