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
}

export interface SavedContent {
  id: string;
  user_id: string;
  content_item_id: string;
  is_read: boolean;
  is_favorite: boolean;
  notes?: string;
  tags?: string[];
  saved_at: string;
  read_at?: string;
  content_item: ContentItem;
}

export interface SaveContentData {
  content_item_id: string;
  notes?: string;
  tags?: string[];
}

export function useSavedContent() {
  const [savedContent, setSavedContent] = useState<SavedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/saved-content");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch saved content");
      }

      setSavedContent(data.savedContent || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch saved content";
      setError(errorMessage);
      console.error("Error fetching saved content:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async (contentData: SaveContentData) => {
    try {
      setError(null);

      const response = await fetch("/api/saved-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save content");
      }

      // Add the new saved content to the current list
      setSavedContent((prev) => [data.savedContent, ...prev]);
      return { success: true, savedContent: data.savedContent };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save content";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateSavedContent = async (
    id: string,
    updates: Partial<SavedContent>
  ) => {
    try {
      setError(null);

      const response = await fetch(`/api/saved-content/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update saved content");
      }

      // Update the saved content in the current list
      setSavedContent((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...data.savedContent } : item
        )
      );
      return { success: true, savedContent: data.savedContent };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update saved content";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const deleteSavedContent = async (id: string) => {
    try {
      setError(null);

      const response = await fetch(`/api/saved-content/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete saved content");
      }

      // Remove the saved content from the current list
      setSavedContent((prev) => prev.filter((item) => item.id !== id));
      return { success: true };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete saved content";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const markAsRead = async (id: string) => {
    const item = savedContent.find((s) => s.id === id);
    if (!item) return { success: false, error: "Saved content not found" };

    return updateSavedContent(id, {
      is_read: true,
      read_at: new Date().toISOString(),
    });
  };

  const markAsUnread = async (id: string) => {
    const item = savedContent.find((s) => s.id === id);
    if (!item) return { success: false, error: "Saved content not found" };

    return updateSavedContent(id, {
      is_read: false,
      read_at: undefined,
    });
  };

  const toggleFavorite = async (id: string) => {
    const item = savedContent.find((s) => s.id === id);
    if (!item) return { success: false, error: "Saved content not found" };

    return updateSavedContent(id, { is_favorite: !item.is_favorite });
  };

  const addTags = async (id: string, newTags: string[]) => {
    const item = savedContent.find((s) => s.id === id);
    if (!item) return { success: false, error: "Saved content not found" };

    const currentTags = item.tags || [];
    const uniqueTags = Array.from(new Set([...currentTags, ...newTags]));

    return updateSavedContent(id, { tags: uniqueTags });
  };

  const removeTags = async (id: string, tagsToRemove: string[]) => {
    const item = savedContent.find((s) => s.id === id);
    if (!item) return { success: false, error: "Saved content not found" };

    const currentTags = item.tags || [];
    const updatedTags = currentTags.filter(
      (tag) => !tagsToRemove.includes(tag)
    );

    return updateSavedContent(id, { tags: updatedTags });
  };

  // Filter functions
  const getUnreadContent = () => savedContent.filter((item) => !item.is_read);
  const getFavoriteContent = () =>
    savedContent.filter((item) => item.is_favorite);
  const getContentByTag = (tag: string) =>
    savedContent.filter((item) => item.tags?.includes(tag));

  useEffect(() => {
    fetchSavedContent();
  }, []);

  return {
    savedContent,
    loading,
    error,
    saveContent,
    updateSavedContent,
    deleteSavedContent,
    markAsRead,
    markAsUnread,
    toggleFavorite,
    addTags,
    removeTags,
    getUnreadContent,
    getFavoriteContent,
    getContentByTag,
    refetch: fetchSavedContent,
  };
}
