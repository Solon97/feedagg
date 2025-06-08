"use client";

import { useState, useMemo, useCallback } from "react";
import { useContentSources } from "../../content-sources/hooks/use-content-sources";
import { useCurrentUser } from "../../auth/hooks/use-current-user";
import type { ContentSourceEntity } from "../../../core/entities/content-source.entity";

interface FeedFilters {
  search: string;
  status: "all" | "active" | "inactive" | "error";
}

interface UseFeedsResult {
  feeds: ContentSourceEntity[];
  isLoading: boolean;
  error: string | null;
  filters: FeedFilters;
  updateFilters: (filters: Partial<FeedFilters>) => void;
  createFeed: (params: {
    name: string;
    url: string;
    description?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  updateFeed: (
    id: string,
    params: {
      name?: string;
      url?: string;
      description?: string;
      category?: string;
      isActive?: boolean;
    }
  ) => Promise<{ success: boolean; error?: string }>;
  deleteFeed: (id: string) => Promise<{ success: boolean; error?: string }>;
  toggleFeed: (id: string) => Promise<{ success: boolean; error?: string }>;
  refreshFeeds: () => Promise<void>;
}

const DEFAULT_FILTERS: FeedFilters = {
  search: "",
  status: "all",
};

export function useFeeds(): UseFeedsResult {
  const { user } = useCurrentUser();
  const userId = user?.id || "";

  const hookResult = useContentSources(userId);

  // Extract properties safely
  const contentSources = hookResult.contentSources || [];
  const isLoading = (hookResult as any).isLoading ?? false;
  const error = (hookResult as any).error ?? null;

  const {
    createContentSource,
    updateContentSource,
    deleteContentSource,
    toggleContentSource,
    refresh,
  } = hookResult;

  const [filters, setFilters] = useState<FeedFilters>(DEFAULT_FILTERS);

  // Filter feeds based on current filters
  const filteredFeeds = useMemo(() => {
    let filtered = contentSources || [];

    // Filter by search
    if (filters.search) {
      filtered = filtered.filter(
        (feed: ContentSourceEntity) =>
          feed.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          feed.url.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filter by status
    if (filters.status !== "all") {
      filtered = filtered.filter(
        (feed: ContentSourceEntity) =>
          feed.isActive === (filters.status === "active")
      );
    }

    return filtered;
  }, [contentSources, filters]);

  const updateFilters = useCallback((newFilters: Partial<FeedFilters>) => {
    setFilters((prev: FeedFilters) => ({ ...prev, ...newFilters }));
  }, []);

  const createFeed = useCallback(
    async (params: { name: string; url: string; description?: string }) => {
      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }

      try {
        const result = await createContentSource({
          ...params,
          userId,
        });

        return {
          success: result.success,
          error: result.error,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    [createContentSource, userId]
  );

  const updateFeed = useCallback(
    async (
      id: string,
      params: {
        name?: string;
        url?: string;
        description?: string;
        category?: string;
        isActive?: boolean;
      }
    ) => {
      try {
        const result = await updateContentSource(id, params);
        return {
          success: result.success,
          error: result.error,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    [updateContentSource]
  );

  const deleteFeed = useCallback(
    async (id: string) => {
      try {
        const result = await deleteContentSource(id);
        return {
          success: result.success,
          error: result.error,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    [deleteContentSource]
  );

  const toggleFeed = useCallback(
    async (id: string) => {
      try {
        const result = await toggleContentSource(id);
        return {
          success: result.success,
          error: result.error,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    [toggleContentSource]
  );

  const refreshFeeds = useCallback(async () => {
    await refresh();
  }, [refresh]);

  return {
    feeds: filteredFeeds,
    isLoading,
    error,
    filters,
    updateFilters,
    createFeed,
    updateFeed,
    deleteFeed,
    toggleFeed,
    refreshFeeds,
  };
}
