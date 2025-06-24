"use client"

import { useState, useEffect, useCallback } from "react"
import { apiService } from "@/lib/api"
import type { Feed, FeedItem } from "@/types/api"

export function useFeeds() {
  const [feeds, setFeeds] = useState<Feed[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFeeds = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getUserFeeds()
      setFeeds(response.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch feeds")
    } finally {
      setLoading(false)
    }
  }, [])

  const subscribeFeed = useCallback(
    async (url: string) => {
      try {
        await apiService.subscribeFeed(url)
        await fetchFeeds() // Refresh the list
        return { success: true }
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to subscribe to feed",
        }
      }
    },
    [fetchFeeds],
  )

  const updateFeedStatus = useCallback(
    async (feedId: string, status: "active" | "inactive") => {
      try {
        await apiService.updateFeedStatus(feedId, status)
        await fetchFeeds() // Refresh the list
        return { success: true }
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to update feed status",
        }
      }
    },
    [fetchFeeds],
  )

  const deleteFeed = useCallback(
    async (feedId: string) => {
      try {
        await apiService.deleteFeed(feedId)
        await fetchFeeds() // Refresh the list
        return { success: true }
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to delete feed",
        }
      }
    },
    [fetchFeeds],
  )

  useEffect(() => {
    fetchFeeds()
  }, [fetchFeeds])

  return {
    feeds,
    loading,
    error,
    refetch: fetchFeeds,
    subscribeFeed,
    updateFeedStatus,
    deleteFeed,
  }
}

export function useFeedItems() {
  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)

  const fetchItems = useCallback(
    async (
      params: {
        limit?: number
        offset?: number
        sort?: string
        order?: "asc" | "desc"
        reset?: boolean
      } = {},
    ) => {
      try {
        setLoading(true)
        setError(null)

        const response = await apiService.getUserFeedItems({
          limit: params.limit || 20,
          offset: params.offset || 0,
          sort: params.sort || "published_at",
          order: params.order || "desc",
        })
        console.log(response.data)
        if (params.reset || params.offset === 0) {
          setItems(response.data || [])
        } else {
          setItems((prev) => [...prev, ...(response.data || [])])
        }

        setTotal(response.total || 0)
        setHasMore((response.data || []).length === (params.limit || 20))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch feed items")
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const refresh = useCallback(() => {
    fetchItems({ reset: true })
  }, [fetchItems])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchItems({ offset: items.length })
    }
  }, [fetchItems, loading, hasMore, items.length])

  useEffect(() => {
    fetchItems({ reset: true })
  }, [fetchItems])

  return {
    items,
    loading,
    error,
    hasMore,
    total,
    refresh,
    loadMore,
  }
}
