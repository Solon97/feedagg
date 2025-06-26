"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { apiService } from "@/lib/api"
import type { FeedItem, UserFeedSubscription } from "@/types/api"

export function useFeeds() {
  const [feeds, setFeeds] = useState<UserFeedSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFeeds = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getUserFeeds()
      setFeeds(response || [])
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
        await fetchFeeds()
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

  const updateFeedStatus = useCallback(async (feedId: string, isActive: boolean) => {
    try {
      await apiService.updateFeedStatus(feedId, isActive)
      setFeeds((prevFeeds) =>
        prevFeeds.map((subscription) =>
          subscription.feed.id === feedId ? { ...subscription, is_active: isActive } : subscription,
        ),
      )
      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to update feed status",
      }
    }
  }, [])

  const deleteFeed = useCallback(async (feedId: string) => {
    try {
      await apiService.deleteFeed(feedId)
      setFeeds((prevFeeds) => prevFeeds.filter((subscription) => subscription.feed.id !== feedId))
      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to delete feed",
      }
    }
  }, [])

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

export interface FeedFilters {
  title?: string
  feed_id?: string
  feed_type?: "rss" | "youtube"
}

export function useFeedItems() {
  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState<FeedFilters>({})

  // Use refs to track current values without causing re-renders
  const currentFiltersRef = useRef<FeedFilters>({})
  const isInitializedRef = useRef(false)
  const isFetchingRef = useRef(false)

  // Stable fetch function that doesn't change on every render
  const fetchItems = useCallback(
    async (
      targetFilters: FeedFilters,
      options: {
        limit?: number
        offset?: number
        sort?: string
        order?: "asc" | "desc"
        reset?: boolean
      } = {},
    ) => {
      // Prevent concurrent fetches
      if (isFetchingRef.current) return

      try {
        isFetchingRef.current = true
        setLoading(true)
        setError(null)

        const response = await apiService.getUserFeedItems({
          limit: options.limit || 20,
          offset: options.offset || 0,
          sort: options.sort || "published_at",
          order: options.order || "desc",
          ...targetFilters,
        })

        const responseItems = response || []

        if (options.reset || options.offset === 0) {
          setItems(responseItems)
        } else {
          setItems((prevItems) => [...prevItems, ...responseItems])
        }

        setTotal(response?.total || 0)
        setHasMore(responseItems.length === (options.limit || 20))

        // Update current filters ref
        currentFiltersRef.current = targetFilters
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch feed items")
      } finally {
        setLoading(false)
        isFetchingRef.current = false
      }
    },
    [],
  )

  // Stable functions that don't change on every render
  const refresh = useCallback(() => {
    fetchItems(currentFiltersRef.current, { reset: true })
  }, [fetchItems])

  const loadMore = useCallback(() => {
    if (!loading && hasMore && !isFetchingRef.current) {
      fetchItems(currentFiltersRef.current, { offset: items.length })
    }
  }, [fetchItems, loading, hasMore, items.length])

  const applyFilters = useCallback(
    (newFilters: FeedFilters) => {
      setFilters(newFilters)
      fetchItems(newFilters, { reset: true })
    },
    [fetchItems],
  )

  const clearFilters = useCallback(() => {
    const emptyFilters = {}
    setFilters(emptyFilters)
    fetchItems(emptyFilters, { reset: true })
  }, [fetchItems])

  // Initialize only once
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true
      fetchItems({}, { reset: true })
    }
  }, [fetchItems])

  return {
    items,
    loading,
    error,
    hasMore,
    total,
    filters,
    refresh,
    loadMore,
    applyFilters,
    clearFilters,
  }
}
