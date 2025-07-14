"use client";

import { useState, useEffect, useCallback } from "react";
import { apiService } from "@/lib/api";
import type { Topic, CreateTopicRequest } from "@/types/api";

export function useTopics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getTopics();
      setTopics(response || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch topics");
    } finally {
      setLoading(false);
    }
  }, []);

  const createTopic = useCallback(async (topicData: CreateTopicRequest) => {
    try {
      const newTopic = await apiService.createTopic(topicData);
      setTopics((prev) => [...prev, newTopic]);
      return { success: true, topic: newTopic };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to create topic",
      };
    }
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  return {
    topics,
    loading,
    error,
    fetchTopics,
    createTopic,
  };
}
