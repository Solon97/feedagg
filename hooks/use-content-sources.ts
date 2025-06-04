import { useState, useEffect } from "react";

export interface ContentSource {
  id: string;
  user_id: string;
  name: string;
  url: string;
  source_type: "rss" | "website" | "youtube" | "twitter" | "newsletter";
  description?: string;
  category?: string;
  is_active: boolean;
  last_fetched_at?: string;
  fetch_frequency: number;
  created_at: string;
  updated_at: string;
}

export interface CreateContentSource {
  name: string;
  url: string;
  source_type?: ContentSource["source_type"];
  description?: string;
  category?: string;
}

export function useContentSources() {
  const [sources, setSources] = useState<ContentSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSources = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/content-sources");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch content sources");
      }

      setSources(data.sources || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch content sources";
      setError(errorMessage);
      console.error("Error fetching content sources:", err);
    } finally {
      setLoading(false);
    }
  };

  const addSource = async (sourceData: CreateContentSource) => {
    try {
      setError(null);

      const response = await fetch("/api/content-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sourceData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add content source");
      }

      // Add the new source to the current list
      setSources((prev) => [...prev, data.source]);
      return { success: true, source: data.source };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add content source";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateSource = async (id: string, updates: Partial<ContentSource>) => {
    try {
      setError(null);

      const response = await fetch(`/api/content-sources/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update content source");
      }

      // Update the source in the current list
      setSources((prev) =>
        prev.map((source) =>
          source.id === id ? { ...source, ...data.source } : source
        )
      );
      return { success: true, source: data.source };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update content source";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const deleteSource = async (id: string) => {
    try {
      setError(null);

      const response = await fetch(`/api/content-sources/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete content source");
      }

      // Remove the source from the current list
      setSources((prev) => prev.filter((source) => source.id !== id));
      return { success: true };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete content source";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const toggleSourceActive = async (id: string) => {
    const source = sources.find((s) => s.id === id);
    if (!source) return { success: false, error: "Source not found" };

    return updateSource(id, { is_active: !source.is_active });
  };

  useEffect(() => {
    fetchSources();
  }, []);

  return {
    sources,
    loading,
    error,
    addSource,
    updateSource,
    deleteSource,
    toggleSourceActive,
    refetch: fetchSources,
  };
}
