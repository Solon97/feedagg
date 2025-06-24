"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { apiService } from "@/lib/api"
import type { Feed, FeedItem } from "@/types/api"

// Cache global para os feed items
let feedItemsCache: {
  items: FeedItem[]
  total: number
  hasMore: boolean
  lastFetch: number
} | null = null

export function useFeeds() {
  const [feeds, setFeeds] = useState<Feed[]>([])
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
  const hasInitialized = useRef(false)

  const fetchItems = useCallback(
    async (
      params: {
        limit?: number
        offset?: number
        sort?: string
        order?: "asc" | "desc"
        reset?: boolean
        forceRefresh?: boolean
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

        if (params.reset || params.offset === 0) {
          setItems(response || [])
          // Atualizar cache
          feedItemsCache = {
            items: response || [],
            total: response.total || 0,
            hasMore: (response || []).length === (params.limit || 20),
            lastFetch: Date.now(),
          }
        } else {
          const newItems = [...items, ...(response || [])]
          setItems(newItems)
          // Atualizar cache
          feedItemsCache = {
            items: newItems,
            total: response.total || 0,
            hasMore: (response || []).length === (params.limit || 20),
            lastFetch: Date.now(),
          }
        }

        setTotal(response.total || 0)
        setHasMore((response || []).length === (params.limit || 20))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch feed items")
      } finally {
        setLoading(false)
      }
    },
    [items],
  )

  const refresh = useCallback(() => {
    feedItemsCache = null // Limpar cache
    fetchItems({ reset: true, forceRefresh: true })
  }, [fetchItems])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchItems({ offset: items.length })
    }
  }, [fetchItems, loading, hasMore, items.length])

  // Inicialização com cache
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true

      // Verificar se existe cache válido (menos de 5 minutos)
      if (feedItemsCache && Date.now() - feedItemsCache.lastFetch < 5 * 60 * 1000) {
        setItems(feedItemsCache.items)
        setTotal(feedItemsCache.total)
        setHasMore(feedItemsCache.hasMore)
        setLoading(false)
      } else {
        fetchItems({ reset: true })
      }
    }
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
