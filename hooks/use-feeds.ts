"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { apiService } from "@/lib/api"
import type { FeedItem, UserFeedSubscription } from "@/types/api"

// Cache global para os feed items
let feedItemsCache: {
  items: FeedItem[]
  total: number
  hasMore: boolean
  lastFetch: number
  filters?: FeedFilters
} | null = null

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
        await fetchFeeds() // Refresh the list only for new subscriptions
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

      // Update local state instead of refetching
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

      // Remove from local state instead of refetching
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
  const hasInitialized = useRef(false)
  const filtersRef = useRef(filters)

  // Keep filters ref updated
  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  // Função estável que não depende de items
  const fetchItems = useCallback(
    async (
      params: {
        limit?: number
        offset?: number
        sort?: string
        order?: "asc" | "desc"
        reset?: boolean
        forceRefresh?: boolean
        filters?: FeedFilters
      } = {},
    ) => {
      try {
        setLoading(true)
        setError(null)

        const currentFilters = params.filters ?? filtersRef.current
        const response = await apiService.getUserFeedItems({
          limit: params.limit || 20,
          offset: params.offset || 0,
          sort: params.sort || "published_at",
          order: params.order || "desc",
          ...currentFilters,
        })

        const responseItems = response || []

        if (params.reset || params.offset === 0) {
          setItems(responseItems)
          // Atualizar cache
          feedItemsCache = {
            items: responseItems,
            total: response?.total || 0,
            hasMore: responseItems.length === (params.limit || 20),
            lastFetch: Date.now(),
            filters: currentFilters,
          }
        } else {
          setItems((prevItems) => {
            const newItems = [...prevItems, ...responseItems]
            // Atualizar cache
            feedItemsCache = {
              items: newItems,
              total: response?.total || 0,
              hasMore: responseItems.length === (params.limit || 20),
              lastFetch: Date.now(),
              filters: currentFilters,
            }
            return newItems
          })
        }

        setTotal(response?.total || 0)
        setHasMore(responseItems.length === (params.limit || 20))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch feed items")
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const refresh = useCallback(() => {
    feedItemsCache = null // Limpar cache
    fetchItems({ reset: true, forceRefresh: true })
  }, [fetchItems])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setItems((currentItems) => {
        fetchItems({ offset: currentItems.length })
        return currentItems
      })
    }
  }, [loading, hasMore, fetchItems])

  const applyFilters = useCallback(
    (newFilters: FeedFilters) => {
      setFilters(newFilters)
      feedItemsCache = null // Clear cache when filters change
      fetchItems({ reset: true, filters: newFilters })
    },
    [fetchItems],
  )

  const clearFilters = useCallback(() => {
    setFilters({})
    feedItemsCache = null
    fetchItems({ reset: true, filters: {} })
  }, [fetchItems])

  // Inicialização com cache - executa apenas uma vez
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true

      // Verificar se existe cache válido (menos de 5 minutos)
      if (feedItemsCache && Date.now() - feedItemsCache.lastFetch < 5 * 60 * 1000) {
        setItems(feedItemsCache.items)
        setTotal(feedItemsCache.total)
        setHasMore(feedItemsCache.hasMore)
        setFilters(feedItemsCache.filters || {})
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
    filters,
    refresh,
    loadMore,
    applyFilters,
    clearFilters,
  }
}
