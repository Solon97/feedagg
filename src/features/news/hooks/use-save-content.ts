import { useState } from "react";

interface UseSaveContentReturn {
  saveContent: (contentItemId: string, userId: string) => Promise<void>;
  unsaveContent: (savedContentId: string) => Promise<void>;
  toggleSave: (
    contentItemId: string,
    userId: string,
    isSaved: boolean
  ) => Promise<void>;
  isSaving: boolean;
  error: string | null;
}

export function useSaveContent(): UseSaveContentReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveContent = async (contentItemId: string, userId: string) => {
    try {
      setIsSaving(true);
      setError(null);

      // Since SavedContentUseCases expects repositories, we'll need to handle this differently
      // For now, this is a placeholder - this will be properly implemented when dependency injection is set up
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save content");
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const unsaveContent = async (savedContentId: string) => {
    try {
      setIsSaving(true);
      setError(null);

      // Since SavedContentUseCases expects repositories, we'll need to handle this differently
      // For now, this is a placeholder - this will be properly implemented when dependency injection is set up
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unsave content");
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSave = async (
    contentItemId: string,
    userId: string,
    isSaved: boolean
  ) => {
    if (isSaved) {
      await unsaveContent(contentItemId); // Note: This should be savedContentId in real implementation
    } else {
      await saveContent(contentItemId, userId);
    }
  };

  return {
    saveContent,
    unsaveContent,
    toggleSave,
    isSaving,
    error,
  };
}
