import { useState, useCallback } from "react";

interface SavedContentResponse {
  saved: boolean;
  savedContentId: string | null;
  savedContent?: {
    id: string;
    user_id: string;
    content_item_id: string;
    created_at: string;
  };
}

interface SaveContentResponse {
  id: string;
  user_id: string;
  content_item_id: string;
  created_at: string;
}

interface UseSaveContentReturn {
  saveContent: (contentItemId: string) => Promise<SaveContentResponse>;
  unsaveContent: (savedContentId: string) => Promise<void>;
  toggleSave: (
    contentItemId: string,
    isSaved: boolean,
    savedContentId?: string
  ) => Promise<{ action: "saved" | "unsaved"; savedContentId?: string }>;
  getSavedContentByItemId: (
    contentItemId: string
  ) => Promise<SavedContentResponse>;
  isSaving: boolean;
  error: string | null;
}

export function useSaveContent(): UseSaveContentReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSavedContentByItemId = useCallback(
    async (contentItemId: string): Promise<SavedContentResponse> => {
      try {
        const response = await fetch(
          `/api/saved-content/by-content-item/${contentItemId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch saved content status");
        }

        return await response.json();
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to fetch saved content status";
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  const saveContent = useCallback(
    async (contentItemId: string): Promise<SaveContentResponse> => {
      try {
        setIsSaving(true);
        setError(null);

        const response = await fetch("/api/saved-content", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content_item_id: contentItemId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to save content");
        }

        const result = await response.json();
        console.log("Content saved successfully:", result);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to save content";
        console.error("Save content error:", err);
        setError(errorMessage);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const unsaveContent = useCallback(
    async (savedContentId: string): Promise<void> => {
      try {
        setIsSaving(true);
        setError(null);

        const response = await fetch(`/api/saved-content/${savedContentId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to unsave content");
        }

        console.log("Content unsaved successfully");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to unsave content";
        console.error("Unsave content error:", err);
        setError(errorMessage);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const toggleSave = useCallback(
    async (
      contentItemId: string,
      isSaved: boolean,
      savedContentId?: string
    ): Promise<{ action: "saved" | "unsaved"; savedContentId?: string }> => {
      try {
        if (isSaved && savedContentId) {
          await unsaveContent(savedContentId);
          return { action: "unsaved" };
        } else if (isSaved && !savedContentId) {
          // If isSaved is true but we don't have savedContentId, fetch it
          const savedContentResponse = await getSavedContentByItemId(
            contentItemId
          );
          if (
            savedContentResponse.saved &&
            savedContentResponse.savedContentId
          ) {
            await unsaveContent(savedContentResponse.savedContentId);
            return { action: "unsaved" };
          }
          // If not actually saved, save it
          const result = await saveContent(contentItemId);
          return { action: "saved", savedContentId: result.id };
        } else {
          const result = await saveContent(contentItemId);
          return { action: "saved", savedContentId: result.id };
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to toggle save state"
        );
        throw err;
      }
    },
    [saveContent, unsaveContent, getSavedContentByItemId]
  );

  return {
    saveContent,
    unsaveContent,
    toggleSave,
    getSavedContentByItemId,
    isSaving,
    error,
  };
}
