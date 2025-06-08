"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ContentSourceEntity,
  CreateContentSourceParams,
  UpdateContentSourceParams,
} from "@/core/entities/content-source.entity";
import { AsyncState } from "@/shared/types/common.types";

interface FindContentSourcesQuery {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  status?: string;
}

interface ContentSourceHookState extends AsyncState<ContentSourceEntity[]> {
  contentSources: ContentSourceEntity[];
}

interface ContentSourceActions {
  createContentSource: (
    params: CreateContentSourceParams & { userId: string }
  ) => Promise<{
    success: boolean;
    data?: ContentSourceEntity;
    error?: string;
  }>;
  updateContentSource: (
    id: string,
    params: UpdateContentSourceParams
  ) => Promise<{
    success: boolean;
    data?: ContentSourceEntity;
    error?: string;
  }>;
  deleteContentSource: (
    id: string
  ) => Promise<{ success: boolean; error?: string }>;
  toggleContentSource: (
    id: string
  ) => Promise<{ success: boolean; error?: string }>;
  refresh: () => Promise<void>;
}

export function useContentSources(
  userId: string,
  query?: FindContentSourcesQuery
): ContentSourceHookState & ContentSourceActions {
  const [state, setState] = useState<ContentSourceHookState>({
    contentSources: [],
    data: [],
    isLoading: true,
    error: null,
  });

  const fetchContentSources = useCallback(async () => {
    if (!userId) return;

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Use Next.js API instead of use cases
      const searchParams = new URLSearchParams();
      searchParams.append("userId", userId);
      if (query?.limit) searchParams.append("limit", query.limit.toString());
      if (query?.offset) searchParams.append("offset", query.offset.toString());
      if (query?.search) searchParams.append("search", query.search);
      if (query?.status) searchParams.append("status", query.status);
      if (query?.sortBy) searchParams.append("sortBy", query.sortBy);
      if (query?.sortOrder) searchParams.append("sortOrder", query.sortOrder);

      const response = await fetch(`/api/content-sources?${searchParams}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch content sources");
      }

      const responseData = await response.json();
      const contentSources = responseData.sources || [];

      setState((prev) => ({
        ...prev,
        contentSources,
        data: contentSources,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch content sources";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
    }
  }, [userId, query]);

  useEffect(() => {
    fetchContentSources();
  }, [fetchContentSources]);

  const createContentSource = async (
    params: CreateContentSourceParams & { userId: string }
  ) => {
    try {
      const response = await fetch("/api/content-sources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error("Failed to create content source");
      }

      const responseData = await response.json();
      const contentSource = responseData.source;

      setState((prev) => ({
        ...prev,
        contentSources: [contentSource, ...prev.contentSources],
        data: [contentSource, ...(prev.data || [])],
      }));

      return { success: true, data: contentSource };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create content source";
      return { success: false, error: errorMessage };
    }
  };

  const updateContentSource = async (
    id: string,
    params: UpdateContentSourceParams
  ) => {
    try {
      const response = await fetch(`/api/content-sources/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error("Failed to update content source");
      }

      const responseData = await response.json();
      const updatedContentSource = responseData.source;

      setState((prev) => ({
        ...prev,
        contentSources: prev.contentSources.map((source) =>
          source.id === id ? updatedContentSource : source
        ),
        data: (prev.data || []).map((source) =>
          source.id === id ? updatedContentSource : source
        ),
      }));

      return { success: true, data: updatedContentSource };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update content source";
      return { success: false, error: errorMessage };
    }
  };

  const deleteContentSource = async (id: string) => {
    try {
      const response = await fetch(`/api/content-sources/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete content source");
      }

      setState((prev) => ({
        ...prev,
        contentSources: prev.contentSources.filter(
          (source) => source.id !== id
        ),
        data: (prev.data || []).filter((source) => source.id !== id),
      }));

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete content source";
      return { success: false, error: errorMessage };
    }
  };

  const toggleContentSource = async (id: string) => {
    try {
      const response = await fetch(`/api/content-sources/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ action: "toggle" }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle content source");
      }

      const responseData = await response.json();
      const updatedContentSource = responseData.source;

      setState((prev) => ({
        ...prev,
        contentSources: prev.contentSources.map((source) =>
          source.id === id ? updatedContentSource : source
        ),
        data: (prev.data || []).map((source) =>
          source.id === id ? updatedContentSource : source
        ),
      }));

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to toggle content source";
      return { success: false, error: errorMessage };
    }
  };

  const refresh = async () => {
    await fetchContentSources();
  };

  return {
    ...state,
    createContentSource,
    updateContentSource,
    deleteContentSource,
    toggleContentSource,
    refresh,
  };
}

// Specialized hooks for common use cases
export function useActiveContentSources(userId: string) {
  return useContentSources(userId, {
    status: "active",
    sortBy: "name",
    sortOrder: "asc",
  });
}

export function useContentSourcesByType(userId: string, type: string) {
  return useContentSources(userId, {
    // Note: assuming there's a type filter in the API
    sortBy: "created_at",
    sortOrder: "desc",
  });
}
