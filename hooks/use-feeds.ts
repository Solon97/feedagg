"use client"

import { useState, useEffect, useCallback } from "react"
import { apiService } from "@/lib/api"

interface FeedFilters {
  title?: string
  feed_id?: string
  feed_type?: "rss" | "youtube"
}

interface FeedItem {
  id: string
  title: string
  description: string
  url: string
  published_at: string
  feed_id: string
  feed_title: string
  feed_type: "rss" | "youtube"
}

interface Feed {
  id: string
  title: string
  url: string
  feed_type: "rss" | "youtube"
  is_active: boolean
}

export function useFeeds() {
  const [items, setItems] = useState<FeedItem[]>([])
  const [feeds, setFeeds] = useState<Feed[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filterLoading, setFilterLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [filteredTotal, setFilteredTotal] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [filters, setFilters] = useState<FeedFilters>({})

  const ITEMS_PER_PAGE = 20

  const fetchItems = useCallback(
    async (newFilters: FeedFilters = {}, offset = 0, isRefresh = false, isFilterChange = false) => {
      try {
        // Set appropriate loading state
        if (isRefresh) {
          setRefreshing(true)
        } else if (isFilterChange) {
          setFilterLoading(true)
        } else if (offset > 0) {
          setLoadingMore(true)
        } else {
          setLoading(true)
        }

        setError(null)

        const params = {
          limit: ITEMS_PER_PAGE,
          offset,
          sort: "published_at",
          order: "desc" as const,
          ...newFilters,
        }

        console.log("Fetching items with params:", params)

        const response = await apiService.getUserFeedItems(params)

        console.log("API Response:", response)

        if (!response) {
          throw new Error("No response received from API")
        }

        const responseItems = response.items || response.data || []
        const responseTotal = response.total || 0
        const responseFilteredTotal = response.filtered_total || response.total || responseItems.length

        if (offset === 0) {
          setItems(responseItems)
        } else {
          setItems((prev) => [...prev, ...responseItems])
        }

        // Update totals
        setTotal(Math.max(responseTotal, responseItems.length))
        setFilteredTotal(Math.max(responseFilteredTotal, responseItems.length))

        // Check if there are more items
        setHasMore(responseItems.length === ITEMS_PER_PAGE && offset + ITEMS_PER_PAGE < responseFilteredTotal)

        console.log("Updated state:", {
          itemsCount: responseItems.length,
          total: responseTotal,
          filteredTotal: responseFilteredTotal,
          hasMore: responseItems.length === ITEMS_PER_PAGE,
        })
      } catch (err) {
        console.error("Error fetching items:", err)
        const errorMessage = err instanceof Error ? err.message : "Failed to load feed items"
        setError(errorMessage)

        // Reset items on error if it's a fresh fetch
        if (offset === 0) {
          setItems([])
          setTotal(0)
          setFilteredTotal(0)
          setHasMore(false)
        }
      } finally {
        setLoading(false)
        setRefreshing(false)
        setFilterLoading(false)
        setLoadingMore(false)
      }
    },
    [],
  )

  const fetchFeeds = useCallback(async () => {
    try {
      console.log("Fetching feeds...")
      const response = await apiService.getUserFeeds()
      console.log("Feeds response:", response)

      const feedsData = response.feeds || response.data || response || []
      setFeeds(feedsData)
    } catch (err) {
      console.error("Error fetching feeds:", err)
      // Don't set error for feeds fetch failure, just log it
      setFeeds([])
    }
  }, [])

  const updateFilters = useCallback(
    (newFilters: FeedFilters) => {
      console.log("Updating filters:", newFilters)
      setFilters(newFilters)
      fetchItems(newFilters, 0, false, true)
    },
    [fetchItems],
  )

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && !filterLoading && !refreshing) {
      const nextOffset = items.length
      console.log("Loading more items, offset:", nextOffset)
      fetchItems(filters, nextOffset, false, false)
    }
  }, [items.length, hasMore, loadingMore, filterLoading, refreshing, filters, fetchItems])

  const refresh = useCallback(() => {
    console.log("Refreshing feeds...")
    fetchItems(filters, 0, true, false)
  }, [filters, fetchItems])

  const clearFilters = useCallback(() => {
    console.log("Clearing filters...")
    const emptyFilters = {}
    setFilters(emptyFilters)
    fetchItems(emptyFilters, 0, false, true)
  }, [fetchItems])

  // Initial load
  useEffect(() => {
    console.log("Initial load triggered")
    fetchItems()
    fetchFeeds()
  }, [fetchItems, fetchFeeds])

  return {
    items,
    feeds,
    loading,
    refreshing,
    filterLoading,
    loadingMore,
    error,
    total,
    filteredTotal,
    hasMore,
    filters,
    updateFilters,
    loadMore,
    refresh,
    clearFilters,
  }
}
