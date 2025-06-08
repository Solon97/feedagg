"use client";

import { useState, useEffect, useCallback } from "react";
import { ContentItemEntity } from "@/core/entities/content-item.entity";
import { AsyncState } from "@/shared/types/common.types";

interface ContentItemQuery {
  limit?: number;
  contentType?: string;
  sourceId?: string;
  tags?: string[];
}

interface ContentItemHookState extends AsyncState<ContentItemEntity[]> {
  contentItems: ContentItemEntity[];
}

interface ContentItemActions {
  searchContentItems: (
    searchTerm: string,
    options?: {
      contentType?: string;
      tags?: string[];
      sourceId?: string;
      limit?: number;
    }
  ) => Promise<{
    success: boolean;
    data?: ContentItemEntity[];
    error?: string;
  }>;
  getContentItemsBySource: (
    sourceId: string,
    limit?: number
  ) => Promise<{
    success: boolean;
    data?: ContentItemEntity[];
    error?: string;
  }>;
  getContentItemsByTags: (
    tags: string[],
    options?: {
      limit?: number;
      sourceId?: string;
    }
  ) => Promise<{
    success: boolean;
    data?: ContentItemEntity[];
    error?: string;
  }>;
  refresh: () => Promise<void>;
}

export function useContentItems(
  query?: ContentItemQuery
): ContentItemHookState & ContentItemActions {
  const [state, setState] = useState<ContentItemHookState>({
    contentItems: [],
    data: [],
    isLoading: true,
    error: null,
  });

  const fetchContentItems = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Use Next.js API instead of direct use cases
      const searchParams = new URLSearchParams();
      if (query?.limit) searchParams.append("limit", query.limit.toString());
      if (query?.contentType)
        searchParams.append("contentType", query.contentType);
      if (query?.sourceId) searchParams.append("sourceId", query.sourceId);
      if (query?.tags)
        query.tags.forEach((tag: string) => searchParams.append("tags", tag));

      const response = await fetch(`/api/content-items?${searchParams}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch content items");
      }

      const contentItems = await response.json();

      setState((prev) => ({
        ...prev,
        contentItems,
        data: contentItems,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch content items";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
    }
  }, [query]);

  const searchContentItems = async (
    searchTerm: string,
    options?: {
      contentType?: string;
      tags?: string[];
      sourceId?: string;
      limit?: number;
    }
  ) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const searchParams = new URLSearchParams();
      searchParams.append("search", searchTerm);
      if (options?.limit)
        searchParams.append("limit", options.limit.toString());
      if (options?.contentType)
        searchParams.append("contentType", options.contentType);
      if (options?.sourceId) searchParams.append("sourceId", options.sourceId);
      if (options?.tags)
        options.tags.forEach((tag: string) => searchParams.append("tags", tag));

      const response = await fetch(`/api/content-items?${searchParams}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to search content items");
      }

      const contentItems = await response.json();

      setState((prev) => ({
        ...prev,
        contentItems,
        data: contentItems,
        isLoading: false,
      }));

      return { success: true, data: contentItems };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to search content items";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      return { success: false, error: errorMessage };
    }
  };

  const getContentItemsBySource = async (sourceId: string, limit?: number) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const searchParams = new URLSearchParams();
      searchParams.append("sourceId", sourceId);
      if (limit) searchParams.append("limit", limit.toString());

      const response = await fetch(`/api/content-items?${searchParams}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch content items by source");
      }

      const contentItems = await response.json();

      setState((prev) => ({
        ...prev,
        contentItems,
        data: contentItems,
        isLoading: false,
      }));

      return { success: true, data: contentItems };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch content items by source";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      return { success: false, error: errorMessage };
    }
  };

  const getContentItemsByTags = async (
    tags: string[],
    options?: {
      limit?: number;
      sourceId?: string;
    }
  ) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const searchParams = new URLSearchParams();
      tags.forEach((tag: string) => searchParams.append("tags", tag));
      if (options?.limit)
        searchParams.append("limit", options.limit.toString());
      if (options?.sourceId) searchParams.append("sourceId", options.sourceId);

      const response = await fetch(`/api/content-items?${searchParams}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch content items by tags");
      }

      const contentItems = await response.json();

      setState((prev) => ({
        ...prev,
        contentItems,
        data: contentItems,
        isLoading: false,
      }));

      return { success: true, data: contentItems };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch content items by tags";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      return { success: false, error: errorMessage };
    }
  };

  const refresh = async () => {
    await fetchContentItems();
  };

  useEffect(() => {
    fetchContentItems();
  }, [fetchContentItems]);

  return {
    ...state,
    searchContentItems,
    getContentItemsBySource,
    getContentItemsByTags,
    refresh,
  };
}
