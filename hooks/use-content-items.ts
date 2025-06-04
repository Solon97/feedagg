import { useState, useEffect } from "react";

export interface ContentItem {
  id: string;
  source_id: string;
  title: string;
  content?: string;
  summary?: string;
  author?: string;
  url: string;
  published_at?: string;
  thumbnail_url?: string;
  read_time_minutes?: number;
  created_at: string;
  updated_at: string;
  content_sources?: {
    user_id: string;
    name: string;
  };
}

interface UseContentItemsOptions {
  sourceId?: string;
  limit?: number;
  autoFetch?: boolean;
}

export function useContentItems(options: UseContentItemsOptions = {}) {
  const { sourceId, limit = 10, autoFetch = true } = options;

  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const fetchContentItems = async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const currentOffset = reset ? 0 : offset;
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: currentOffset.toString(),
      });

      if (sourceId) {
        params.append("source_id", sourceId);
      }

      const response = await fetch(`/api/content-items?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch content items");
      }

      const newItems = data.contentItems || [];

      if (reset) {
        setContentItems(newItems);
        setOffset(newItems.length);
      } else {
        setContentItems((prev) => [...prev, ...newItems]);
        setOffset((prev) => prev + newItems.length);
      }

      // Check if there are more items to load
      setHasMore(newItems.length === limit);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch content items";
      setError(errorMessage);
      console.error("Error fetching content items:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchContentItems(false);
    }
  };

  const refresh = () => {
    fetchContentItems(true);
  };

  useEffect(() => {
    if (autoFetch) {
      fetchContentItems(true);
    }
  }, [sourceId, autoFetch]);

  return {
    contentItems,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    fetch: fetchContentItems,
  };
}
