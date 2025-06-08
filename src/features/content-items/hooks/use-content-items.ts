import { useState, useEffect } from "react";
import { ContentItemEntity } from "@/core/entities/content-item.entity";
import { FindContentItemsQuery } from "@/core/repositories/content-item.repository";

interface UseContentItemsReturn {
  contentItems: ContentItemEntity[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useContentItems(
  userId?: string,
  query?: FindContentItemsQuery
): UseContentItemsReturn {
  const [contentItems, setContentItems] = useState<ContentItemEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContentItems = async () => {
    if (!userId) {
      setContentItems([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Since ContentItemUseCases expects repositories, we'll need to handle this differently
      // For now, return empty array - this will be properly implemented when dependency injection is set up
      setContentItems([]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch content items"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContentItems();
  }, [userId, query]);

  return {
    contentItems,
    isLoading,
    error,
    refetch: fetchContentItems,
  };
}

export function useRecentContentItems(
  userId?: string,
  limit: number = 20
): UseContentItemsReturn {
  const [contentItems, setContentItems] = useState<ContentItemEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentItems = async () => {
    if (!userId) {
      setContentItems([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Since ContentItemUseCases expects repositories, we'll need to handle this differently
      // For now, return empty array - this will be properly implemented when dependency injection is set up
      setContentItems([]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch recent content items"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentItems();
  }, [userId, limit]);

  return {
    contentItems,
    isLoading,
    error,
    refetch: fetchRecentItems,
  };
}
