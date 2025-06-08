import { useState, useEffect } from "react";
import { SavedContentUseCases } from "@/core/use-cases/saved-content.use-cases";
import { SavedContentEntity } from "@/core/entities/saved-content.entity";

interface UseSavedContentReturn {
  savedContent: SavedContentEntity[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  toggleRead: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<{
    success: boolean;
    data?: { isFavorite: boolean };
    error?: string;
  }>;
  deleteItem: (id: string) => Promise<void>;
  markAsRead: (
    id: string
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
  markAsUnread: (
    id: string
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
  deleteSavedContent: (id: string) => Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }>;
  refresh: () => Promise<void>;
}

export function useSavedContent(userId?: string): UseSavedContentReturn {
  const [savedContent, setSavedContent] = useState<SavedContentEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedContent = async () => {
    if (!userId) {
      setSavedContent([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Since SavedContentUseCases expects repositories, we'll need to handle this differently
      // For now, return empty array - this will be properly implemented when dependency injection is set up
      setSavedContent([]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch saved content"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRead = async (id: string) => {
    try {
      // Implementation will be added when use cases are properly set up
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to toggle read status"
      );
    }
  };

  const toggleFavorite = async (id: string) => {
    try {
      // Implementation will be added when use cases are properly set up
      setError(null);
      return { success: true, data: { isFavorite: true } };
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Failed to toggle favorite status";
      setError(error);
      return { success: false, error };
    }
  };

  const deleteItem = async (id: string) => {
    try {
      // Implementation will be added when use cases are properly set up
      setSavedContent((prev) => prev.filter((item) => item.id !== id));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item");
    }
  };

  const markAsRead = async (id: string) => {
    try {
      // Implementation will be added when use cases are properly set up
      setError(null);
      return { success: true };
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Failed to mark as read";
      setError(error);
      return { success: false, error };
    }
  };

  const markAsUnread = async (id: string) => {
    try {
      // Implementation will be added when use cases are properly set up
      setError(null);
      return { success: true };
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Failed to mark as unread";
      setError(error);
      return { success: false, error };
    }
  };

  const deleteSavedContent = async (id: string) => {
    try {
      await deleteItem(id);
      return { success: true };
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Failed to delete content";
      setError(error);
      return { success: false, error };
    }
  };

  const refresh = async () => {
    await fetchSavedContent();
  };

  useEffect(() => {
    fetchSavedContent();
  }, [userId]);

  return {
    savedContent,
    isLoading,
    error,
    refetch: fetchSavedContent,
    toggleRead,
    toggleFavorite,
    deleteItem,
    markAsRead,
    markAsUnread,
    deleteSavedContent,
    refresh,
  };
}
