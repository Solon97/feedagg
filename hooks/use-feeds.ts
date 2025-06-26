"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { apiService } from "@/lib/api"
import type { FeedItem, UserFeedSubscription } from "@/types/api"

// -----------------------------------------------------------------------------
// SHARED – USER FEEDS (UNCHANGED)
// -----------------------------------------------------------------------------
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
        await fetchFeeds() // refresh list
        return { success: true }
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Failed to subscribe" }
      }
    },
    [fetchFeeds],
  )

  const updateFeedStatus = useCallback(async (feedId: string, isActive: boolean) => {
    try {
      await apiService.updateFeedStatus(feedId, isActive)

      // optimistic update
      setFeeds((prev) => prev.map((sub) => (sub.feed.id === feedId ? { ...sub, is_active: isActive } : sub)))
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to update" }
    }
  }, [])

  const deleteFeed = useCallback(async (feedId: string) => {
    try {
      await apiService.deleteFeed(feedId)
      setFeeds((prev) => prev.filter((sub) => sub.feed.id !== feedId))
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to delete" }
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

// -----------------------------------------------------------------------------
// FEED ITEMS WITH FILTERS
// -----------------------------------------------------------------------------
export interface FeedFilters {
  title?: string
  feed_id?: string
  feed_type?: "rss" | "youtube"
}

type FeedItemsCache = {
  items: FeedItem[]
  total: number
  hasMore: boolean
  lastFetch: number
  filters?: FeedFilters
}

let feedItemsCache: FeedItemsCache | null = null

export function useFeedItems() {
  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState<FeedFilters>({})
  const hasInitialized = useRef(false)

  // ---------------------------------------------------------------------------
  // Stable fetchItems (does NOT depend on `items`)
  // ---------------------------------------------------------------------------
  const fetchItems = useCallback(
    async ({
      limit = 20,
      offset = 0,
      sort = "published_at",
      order = "desc",
      reset = false,
      forceRefresh = false,
      currentFilters = filters,
    }: {
      limit?: number
      offset?: number
      sort?: string
      order?: "asc" | "desc"
      reset?: boolean
      forceRefresh?: boolean
      currentFilters?: FeedFilters
    } = {}) => {
      try {
        setLoading(true)
        setError(null)

        const response = await apiService.getUserFeedItems({
          limit,
          offset,
          sort,
          order,
          ...currentFilters,
        })

        setItems((prev) => {
          const incoming = response || []
          const newItems = reset || offset === 0 ? incoming : [...prev, ...incoming]

          // update cache
          feedItemsCache = {
            items: newItems,
            total: response.total || 0,
            hasMore: incoming.length === limit,
            lastFetch: Date.now(),
            filters: currentFilters,
          }

          return newItems
        })

        setTotal(response.total || 0)
        setHasMore((response || []).length === limit)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch feed items")
      } finally {
        setLoading(false)
      }
    },
    [filters],
  )

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  const refresh = useCallback(() => {
    feedItemsCache = null
    fetchItems({ reset: true, forceRefresh: true })
  }, [fetchItems])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchItems({ offset: items.length })
    }
  }, [loading, hasMore, items.length, fetchItems])

  const applyFilters = useCallback(
    (newFilters: FeedFilters) => {
      setFilters(newFilters)
      feedItemsCache = null
      fetchItems({ reset: true, currentFilters: newFilters })
    },
    [fetchItems],
  )

  const clearFilters = useCallback(() => {
    setFilters({})
    feedItemsCache = null
    fetchItems({ reset: true, currentFilters: {} })
  }, [fetchItems])

  // ---------------------------------------------------------------------------
  // Initial load (with cache)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    if (feedItemsCache && Date.now() - feedItemsCache.lastFetch < 5 * 60 * 1000) {
      setItems(feedItemsCache.items)
      setTotal(feedItemsCache.total)
      setHasMore(feedItemsCache.hasMore)
      setFilters(feedItemsCache.filters || {})
      setLoading(false)
    } else {
      fetchItems({ reset: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // run once

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
