import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type { BookmarkState } from "../types/news.types";
import type { ContentItemEntity } from "@/src/core/entities/content-item.entity";

interface UseBookmarkManagerProps {
  user: any;
  contentItems: ContentItemEntity[];
  getSavedContentByItemId: (
    itemId: string
  ) => Promise<{ saved: boolean; savedContentId: string | null }>;
  toggleSave: (
    contentId: string,
    isSaved: boolean,
    savedContentId?: string
  ) => Promise<{ action: "saved" | "unsaved"; savedContentId?: string }>;
}

export function useBookmarkManager({
  user,
  contentItems,
  getSavedContentByItemId,
  toggleSave,
}: UseBookmarkManagerProps) {
  const [bookmarkStates, setBookmarkStates] = useState<
    Map<string, BookmarkState>
  >(new Map());
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(false);

  // Load bookmark states for current content items
  const loadBookmarkStates = useCallback(async () => {
    if (!user || contentItems.length === 0) return;

    setIsLoadingBookmarks(true);
    const newStates = new Map<string, BookmarkState>();

    try {
      await Promise.all(
        contentItems.map(async (item) => {
          try {
            const savedContentResponse = await getSavedContentByItemId(item.id);
            newStates.set(item.id, {
              contentItemId: item.id,
              savedContentId: savedContentResponse.savedContentId,
              isSaved: savedContentResponse.saved,
            });
          } catch (error) {
            newStates.set(item.id, {
              contentItemId: item.id,
              savedContentId: null,
              isSaved: false,
            });
          }
        })
      );

      setBookmarkStates(newStates);
    } catch (error) {
      console.error("Failed to load bookmark states:", error);
    } finally {
      setIsLoadingBookmarks(false);
    }
  }, [user, contentItems, getSavedContentByItemId]);

  // Load bookmark states when content items change
  useEffect(() => {
    loadBookmarkStates();
  }, [loadBookmarkStates]);

  // Handle bookmark toggle
  const handleBookmarkToggle = useCallback(
    async (contentId: string) => {
      if (!user) {
        toast.error("Please sign in to save content");
        return;
      }

      const currentState = bookmarkStates.get(contentId) || {
        contentItemId: contentId,
        savedContentId: null,
        isSaved: false,
      };

      try {
        const result = await toggleSave(
          contentId,
          currentState.isSaved,
          currentState.savedContentId || undefined
        );

        setBookmarkStates((prev) => {
          const newStates = new Map(prev);
          newStates.set(contentId, {
            contentItemId: contentId,
            savedContentId:
              result.action === "saved" ? result.savedContentId || null : null,
            isSaved: result.action === "saved",
          });
          return newStates;
        });

        if (result.action === "saved") {
          toast.success("Content saved successfully");
        } else {
          toast.success("Content removed from saved items");
        }
      } catch (error) {
        toast.error("Failed to save content. Please try again.");
      }
    },
    [user, bookmarkStates, toggleSave]
  );

  return {
    bookmarkStates,
    isLoadingBookmarks,
    handleBookmarkToggle,
    loadBookmarkStates,
  };
}
