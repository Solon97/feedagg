"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { apiService } from "@/lib/api"
import type { FeedItem, UserFeedSubscription } from "@/types/api"

/* -------------------------------------------------------------------------- */
/*  USER-FEED SUBSCRIPTIONS                                                   */
/* -------------------------------------------------------------------------- */

export function useFeeds() {
  /* state ------------------------------------------------------------------ */
  const [feeds, setFeeds] = useState<UserFeedSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /* stable helpers --------------------------------------------------------- */
  const fetchFeeds = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await apiService.getUserFeeds()
      setFeeds(data ?? [])
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
        await fetchFeeds() // refresh once
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

      /* optimistic update – no refetch */
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
      setFeeds((prev) => prev.filter((sub) => sub.feed.id !== feedId))
      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to delete feed",
      }
    }
  }, [])

  /* first load ------------------------------------------------------------- */
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
/*  FEED ITEMS (WITH FILTER SUPPORT)                                          */
/* -------------------------------------------------------------------------- */
export interface FeedFilters {
  title?: string
  feed_id?: string
  feed_type?: "rss" | "youtube"
}

interface Cache {
  items: FeedItem[]
  total: number
  hasMore: boolean
  lastFetch: number
  filters: FeedFilters
}

/* module-level, five-minute TTL cache -------------------------------------- */
let cache: Cache | null = null
const TTL = 5 * 60 * 1000 // 5 min

export function useFeedItems() {
  /* state ------------------------------------------------------------------ */
  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState<FeedFilters>({})

  const didInit = useRef(false)

  /* stable fetchItems ------------------------------------------------------ */
  const fetchItems = useCallback(
    async ({
      limit = 20,
      offset = 0,
      reset = false,
      curFilters = filters,
    }: {
      limit?: number
      offset?: number
      reset?: boolean
      curFilters?: FeedFilters
    } = {}) => {
      try {
        setLoading(true)
        setError(null)

        const data = await apiService.getUserFeedItems({
          limit,
          offset,
          sort: "published_at",
          order: "desc",
          ...curFilters,
        })

        setItems((prev) => {
          const incoming = data ?? []
          const merged = reset || offset === 0 ? incoming : [...prev, ...incoming]

          /* update cache */
          cache = {
            items: merged,
            total: data.total ?? merged.length,
            hasMore: incoming.length === limit,
            lastFetch: Date.now(),
            filters: curFilters,
          }

          return merged
        })

        setTotal(data.total ?? 0)
        setHasMore((data ?? []).length === limit)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch items")
      } finally {
        setLoading(false)
      }
    },
    [filters],
  )

  /* helpers ---------------------------------------------------------------- */
  const refresh = useCallback(() => {
    cache = null
    fetchItems({ reset: true })
  }, [fetchItems])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) fetchItems({ offset: items.length })
  }, [loading, hasMore, items.length, fetchItems])

  const applyFilters = useCallback(
    (f: FeedFilters) => {
      setFilters(f)
      cache = null
      fetchItems({ reset: true, curFilters: f })
    },
    [fetchItems],
  )

  const clearFilters = useCallback(() => {
    setFilters({})
    cache = null
    fetchItems({ reset: true, curFilters: {} })
  }, [fetchItems])

  /* initial load ----------------------------------------------------------- */
  useEffect(() => {
    if (didInit.current) return
    didInit.current = true

    const isValidCache =
      cache && Date.now() - cache.lastFetch < TTL && JSON.stringify(cache.filters) === JSON.stringify(filters)

    if (isValidCache) {
      setItems(cache.items)
      setTotal(cache.total)
      setHasMore(cache.hasMore)
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
