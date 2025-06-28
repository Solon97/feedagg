"use client"

import { useState, useEffect, useCallback } from "react"
import { apiService } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

interface FeedItem {
  id: string
  title: string
  description: string
  url: string
  published_at: string
  feed_id: string
  feed_title: string
  feed_type: "rss" | "youtube"
  thumbnail_url?: string
}

interface FeedFilters {
  title?: string
  feed_id?: string
  feed_type?: "rss" | "youtube"
}

interface UseFeedsReturn {
  items: FeedItem[]
  feeds: any[]
  loading: boolean
  refreshing: boolean
  filterLoading: boolean
  error: string | null
  total: number
  filteredTotal: number
  hasMore: boolean
  filters: FeedFilters
  fetchItems: () => Promise<void>
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  updateFilters: (newFilters: FeedFilters) => void
  clearFilters: () => void
}

export function useFeeds(): UseFeedsReturn {
  const { user, session } = useAuth()
  const [items, setItems] = useState<FeedItem[]>([])
  const [feeds, setFeeds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filterLoading, setFilterLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [filteredTotal, setFilteredTotal] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [filters, setFilters] = useState<FeedFilters>({})
  const [offset, setOffset] = useState(0)

  const limit = 20

  const fetchItems = useCallback(
    async (isRefresh = false, isLoadMore = false, currentFilters = filters) => {
      // Don't fetch if user is not authenticated
      if (!user || !session) {
        console.log("User not authenticated, skipping fetch")
        setLoading(false)
        return
      }

      try {
        const currentOffset = isRefresh || !isLoadMore ? 0 : offset

        if (isRefresh) {
          setRefreshing(true)
          setError(null)
        } else if (!isLoadMore) {
          setFilterLoading(true)
          setError(null)
        }

        console.log("Fetching items with params:", {
          limit,
          offset: currentOffset,
          ...currentFilters,
        })

        const response = await apiService.getUserFeedItems({
          limit,
          offset: currentOffset,
          sort: "published_at",
          order: "desc",
          ...currentFilters,
        })

        console.log("API Response:", response)

        const responseItems = response?.items || []
        const responseTotal = response?.total || 0
        const responseFilteredTotal = response?.filtered_total || responseItems.length

        if (isRefresh || !isLoadMore) {
          setItems(responseItems)
          setOffset(responseItems.length)
        } else {
          setItems((prev) => [...prev, ...responseItems])
          setOffset((prev) => prev + responseItems.length)
        }

        setTotal(Math.max(responseTotal, responseItems.length))
        setFilteredTotal(Math.max(responseFilteredTotal, responseItems.length))
        setHasMore(responseItems.length === limit)
        setError(null)
      } catch (err) {
        console.error("Error fetching items:", err)
        const errorMessage = err instanceof Error ? err.message : "Failed to load feed items"
        setError(errorMessage)

        // Reset items only on first fetch error
        if (!isLoadMore && !isRefresh) {
          setItems([])
          setTotal(0)
          setFilteredTotal(0)
        }
      } finally {
        setLoading(false)
        setRefreshing(false)
        setFilterLoading(false)
      }
    },
    [user, session, offset, filters, limit],
  )

  const fetchFeeds = useCallback(async () => {
    if (!user || !session) {
      return
    }

    try {
      const response = await apiService.getUserFeeds()
      setFeeds(response?.feeds || [])
    } catch (err) {
      console.error("Error fetching feeds:", err)
    }
  }, [user, session])

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || filterLoading || refreshing) return
    await fetchItems(false, true)
  }, [hasMore, loading, filterLoading, refreshing, fetchItems])

  const refresh = useCallback(async () => {
    await fetchItems(true, false)
  }, [fetchItems])

  const updateFilters = useCallback(
    (newFilters: FeedFilters) => {
      console.log("Updating filters:", newFilters)
      setFilters(newFilters)
      setOffset(0)
      fetchItems(false, false, newFilters)
    },
    [fetchItems],
  )

  const clearFilters = useCallback(() => {
    console.log("Clearing filters")
    setFilters({})
    setOffset(0)
    fetchItems(false, false, {})
  }, [fetchItems])

  // Initial fetch when user changes
  useEffect(() => {
    if (user && session) {
      console.log("User authenticated, fetching initial data")
      fetchItems()
      fetchFeeds()
    } else {
      console.log("User not authenticated, clearing data")
      setItems([])
      setFeeds([])
      setTotal(0)
      setFilteredTotal(0)
      setError(null)
      setLoading(false)
    }
  }, [user, session])

  return {
    items,
    feeds,
    loading,
    refreshing,
    filterLoading,
    error,
    total,
    filteredTotal,
    hasMore,
    filters,
    fetchItems: () => fetchItems(),
    loadMore,
    refresh,
    updateFilters,
    clearFilters,
  }
}
