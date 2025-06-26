"use client"

import { useState, useEffect, useRef } from "react"
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
  const [localTitle, setLocalTitle] = useState(filters.title || "")
  const [localFeedId, setLocalFeedId] = useState(filters.feed_id || "")
  const [localFeedType, setLocalFeedType] = useState(filters.feed_type || "")
  const [isOpen, setIsOpen] = useState(false)

  // Use ref to track if we're updating from external filters
  const isUpdatingFromPropsRef = useRef(false)

  // Debounce title search
  const debouncedTitle = useDebounce(localTitle, 500)

  // Update local state when external filters change (without triggering effects)
  useEffect(() => {
    isUpdatingFromPropsRef.current = true
    setLocalTitle(filters.title || "")
    setLocalFeedId(filters.feed_id || "")
    setLocalFeedType(filters.feed_type || "")
    isUpdatingFromPropsRef.current = false
  }, [filters.title, filters.feed_id, filters.feed_type])

  // Handle debounced title changes
  useEffect(() => {
    if (!isUpdatingFromPropsRef.current && debouncedTitle !== filters.title) {
      onFiltersChange({
        ...filters,
        title: debouncedTitle || undefined,
      })
    }
  }, [debouncedTitle]) // Remove filters and onFiltersChange from dependencies

  const handleFeedChange = (feedId: string) => {
    setLocalFeedId(feedId)
    onFiltersChange({
      ...filters,
      feed_id: feedId || undefined,
    })
  }

  const handleFeedTypeChange = (feedType: string) => {
    setLocalFeedType(feedType)
    onFiltersChange({
      ...filters,
      feed_type: (feedType as "rss" | "youtube") || undefined,
    })
  }

  const handleClearFilters = () => {
    setLocalTitle("")
    setLocalFeedId("")
    setLocalFeedType("")
    onClearFilters()
  }

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
            onChange={(e) => setLocalTitle(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Feed Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Filter by feed</label>
        <Select value={localFeedId} onValueChange={handleFeedChange} disabled={feedsLoading}>
          <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder={feedsLoading ? "Loading feeds..." : "All feeds"} />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="" className="text-white hover:bg-slate-700">
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
            <SelectItem value="" className="text-white hover:bg-slate-700">
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
