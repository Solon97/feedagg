"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { apiService } from "@/lib/api"
import type { FeedItem, UserFeedSubscription } from "@/types/api"

/* -------------------------------------------------------------------------- */
/*  USER FEEDS – list of subscriptions                                       */
/* -------------------------------------------------------------------------- */

export function useFeeds() {
  const [feeds, setFeeds] = useState<UserFeedSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /** Stable fetch that never changes after mount */
  const fetchFeeds = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiService.getUserFeeds()
      setFeeds(response ?? [])
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
        /* only refetch when a new subscription is added */
        await fetchFeeds()
        return { success: true }
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to subscribe",
        }
      }
    },
    [fetchFeeds],
  )

  const updateFeedStatus = useCallback(async (feedId: string, isActive: boolean) => {
    try {
      await apiService.updateFeedStatus(feedId, isActive)

      /* optimistic local update – no refetch, so no extra renders */
      setFeeds((prev) => prev.map((sub) => (sub.feed.id === feedId ? { ...sub, is_active: isActive } : sub)))

      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to update status",
      }
    }
  }, [])

  const deleteFeed = useCallback(async (feedId: string) => {
    try {
      await apiService.deleteFeed(feedId)

      /* optimistic removal */
      setFeeds((prev) => prev.filter((sub) => sub.feed.id !== feedId))

      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to delete feed",
      }
    }
  }, [])

  /* Initial load — runs exactly once because fetchFeeds is stable */
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

/* -------------------------------------------------------------------------- */
/*  FEED ITEMS – supports title/feed_id/feed_type filters                     */
/* -------------------------------------------------------------------------- */

export interface FeedFilters {
  title?: string
  feed_id?: string
  feed_type?: "rss" | "youtube"
}

type Cache = {
  items: FeedItem[]
  total: number
  hasMore: boolean
  lastFetch: number
  filters: FeedFilters
}

/* module-level cache (five-minute TTL) */
let feedItemsCache: Cache | null = null

export function useFeedItems() {
  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState<FeedFilters>({})
  const initialized = useRef(false)

  /* ---- STABLE fetchItems -------------------------------------------------- */
  const fetchItems = useCallback(
    async ({
      limit = 20,
      offset = 0,
      reset = false,
      currentFilters = filters,
    }: {
      limit?: number
      offset?: number
      reset?: boolean
      currentFilters?: FeedFilters
    } = {}) => {
      try {
        setLoading(true)
        setError(null)

        const response = await apiService.getUserFeedItems({
          limit,
          offset,
          sort: "published_at",
          order: "desc",
          ...currentFilters,
        })

        setItems((prev) => {
          const incoming = response ?? []
          const merged = reset || offset === 0 ? incoming : [...prev, ...incoming]

          /* write cache */
          feedItemsCache = {
            items: merged,
            total: response.total ?? merged.length,
            hasMore: incoming.length === limit,
            lastFetch: Date.now(),
            filters: currentFilters,
          }

          return merged
        })

        setTotal(response.total ?? 0)
        setHasMore((response ?? []).length === limit)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch items")
      } finally {
        setLoading(false)
      }
    },
    [filters],
  )

  /* ---- helpers ----------------------------------------------------------- */
  const refresh = useCallback(() => {
    feedItemsCache = null
    fetchItems({ reset: true })
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

  /* ---- initial load with cache ------------------------------------------- */
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    if (feedItemsCache && Date.now() - feedItemsCache.lastFetch < 5 * 60 * 1000 /* 5 min */) {
      setItems(feedItemsCache.items)
      setTotal(feedItemsCache.total)
      setHasMore(feedItemsCache.hasMore)
      setFilters(feedItemsCache.filters)
      setLoading(false)
    } else {
      fetchItems({ reset: true })
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
