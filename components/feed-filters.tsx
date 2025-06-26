"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useDebounce } from "@/hooks/use-debounce"
import type { FeedFilters } from "@/hooks/use-feeds"
import type { UserFeedSubscription } from "@/types/api"

interface FeedFiltersProps {
  filters: FeedFilters
  onFiltersChange: (filters: FeedFilters) => void
  onClearFilters: () => void
  feeds: UserFeedSubscription[]
  feedsLoading: boolean
}

export function FeedFiltersComponent({
  filters,
  onFiltersChange,
  onClearFilters,
  feeds,
  feedsLoading,
}: FeedFiltersProps) {
  // Local state for form inputs
  const [localTitle, setLocalTitle] = useState(filters.title || "")
  const [localFeedId, setLocalFeedId] = useState(filters.feed_id ?? "all")
  const [localFeedType, setLocalFeedType] = useState(filters.feed_type ?? "all")
  const [isOpen, setIsOpen] = useState(false)

  // Refs to track state and prevent race conditions
  const isUpdatingFromPropsRef = useRef(false)
  const lastAppliedTitleRef = useRef(filters.title || "")
  const userIsTypingRef = useRef(false)

  // Debounce title search with a reasonable delay
  const debouncedTitle = useDebounce(localTitle, 300)

  // Stable callback for updating filters
  const updateFilters = useCallback(
    (newFilters: Partial<FeedFilters>) => {
      onFiltersChange({
        ...filters,
        ...newFilters,
      })
    },
    [filters, onFiltersChange],
  )

  // Handle title input changes
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    userIsTypingRef.current = true
    setLocalTitle(value)

    // Clear the typing flag after a short delay
    setTimeout(() => {
      userIsTypingRef.current = false
    }, 100)
  }, [])

  // Update filters when debounced title changes (only if user initiated)
  useEffect(() => {
    // Only update if:
    // 1. Not currently updating from props
    // 2. The debounced title is different from what we last applied
    // 3. This change wasn't triggered by an external filter update
    if (!isUpdatingFromPropsRef.current && debouncedTitle !== lastAppliedTitleRef.current) {
      lastAppliedTitleRef.current = debouncedTitle
      updateFilters({ title: debouncedTitle || undefined })
    }
  }, [debouncedTitle, updateFilters])

  // Update local state when external filters change
  useEffect(() => {
    // Only update local state if user is not currently typing
    if (!userIsTypingRef.current) {
      isUpdatingFromPropsRef.current = true

      // Update title only if it's different and user isn't typing
      if (filters.title !== localTitle) {
        setLocalTitle(filters.title || "")
        lastAppliedTitleRef.current = filters.title || ""
      }

      setLocalFeedId(filters.feed_id ?? "all")
      setLocalFeedType(filters.feed_type ?? "all")

      // Reset the flag after a short delay
      setTimeout(() => {
        isUpdatingFromPropsRef.current = false
      }, 50)
    }
  }, [filters.title, filters.feed_id, filters.feed_type, localTitle])

  const handleFeedChange = useCallback(
    (feedId: string) => {
      setLocalFeedId(feedId)
      updateFilters({ feed_id: feedId === "all" ? undefined : feedId })
    },
    [updateFilters],
  )

  const handleFeedTypeChange = useCallback(
    (feedType: string) => {
      setLocalFeedType(feedType)
      updateFilters({ feed_type: feedType === "all" ? undefined : (feedType as "rss" | "youtube") })
    },
    [updateFilters],
  )

  const handleClearFilters = useCallback(() => {
    // Reset all local state first
    setLocalTitle("")
    setLocalFeedId("all")
    setLocalFeedType("all")
    lastAppliedTitleRef.current = ""
    userIsTypingRef.current = false

    // Then clear the filters
    onClearFilters()
  }, [onClearFilters])

  const activeFiltersCount = Object.values(filters).filter(Boolean).length
  const activeFeeds = Array.isArray(feeds) ? feeds.filter((sub) => sub.is_active) : []

  const FilterContent = () => (
    <div className="space-y-4">
      {/* Title Search */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Search by title</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search articles..."
            value={localTitle}
            onChange={handleTitleChange}
            className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-gray-400"
            autoComplete="off"
          />
        </div>
        {/* Debug info in development */}
        {process.env.NODE_ENV === "development" && (
          <div className="text-xs text-gray-500 space-y-1">
            <div>Local: "{localTitle}"</div>
            <div>Debounced: "{debouncedTitle}"</div>
            <div>Filter: "{filters.title || ""}"</div>
            <div>Typing: {userIsTypingRef.current ? "Yes" : "No"}</div>
          </div>
        )}
      </div>

      {/* Feed Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Filter by feed</label>
        <Select value={localFeedId} onValueChange={handleFeedChange} disabled={feedsLoading}>
          <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder={feedsLoading ? "Loading feeds..." : "All feeds"} />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all" className="text-white hover:bg-slate-700">
              All feeds
            </SelectItem>
            {activeFeeds.map((subscription) => (
              <SelectItem
                key={subscription.feed.id}
                value={subscription.feed.id}
                className="text-white hover:bg-slate-700"
              >
                {subscription.feed.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Feed Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Filter by type</label>
        <Select value={localFeedType} onValueChange={handleFeedTypeChange}>
          <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all" className="text-white hover:bg-slate-700">
              All types
            </SelectItem>
            <SelectItem value="rss" className="text-white hover:bg-slate-700">
              RSS
            </SelectItem>
            <SelectItem value="youtube" className="text-white hover:bg-slate-700">
              YouTube
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Active filters</label>
          <div className="flex flex-wrap gap-2">
            {filters.title && (
              <Badge variant="secondary" className="bg-teal-900/30 text-teal-400 border-teal-700/50">
                Title: {filters.title}
              </Badge>
            )}
            {filters.feed_id && (
              <Badge variant="secondary" className="bg-blue-900/30 text-blue-400 border-blue-700/50">
                Feed: {activeFeeds.find((f) => f.feed.id === filters.feed_id)?.feed.name || "Unknown"}
              </Badge>
            )}
            {filters.feed_type && (
              <Badge variant="secondary" className="bg-purple-900/30 text-purple-400 border-purple-700/50">
                Type: {filters.feed_type.toUpperCase()}
              </Badge>
            )}
          </div>
          <Button
            onClick={handleClearFilters}
            variant="outline"
            size="sm"
            className="w-full border-slate-600 text-gray-300 hover:bg-slate-700 bg-transparent"
          >
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block bg-slate-800/50 rounded-lg p-4 border border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-gray-400" />
          <h3 className="font-medium text-white">Filters</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="bg-teal-900/30 text-teal-400 border-teal-700/50 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        <FilterContent />
      </div>

      {/* Mobile Filters */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="w-full border-slate-600 text-gray-300 hover:bg-slate-700 bg-transparent"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2 bg-teal-900/30 text-teal-400 border-teal-700/50 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-slate-900 border-slate-700 w-80">
            <SheetHeader>
              <SheetTitle className="text-white flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
