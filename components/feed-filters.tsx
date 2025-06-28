"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Search, Filter, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import type { FeedFilters } from "@/hooks/use-feeds"
import type { UserFeedSubscription } from "@/types/api"

const DEBOUNCE_DELAY = 1000

interface FeedFiltersProps {
  filters: FeedFilters
  onFiltersChange: (filters: FeedFilters) => void
  onClearFilters: () => void
  feeds: UserFeedSubscription[]
  feedsLoading: boolean
  isFilterLoading?: boolean
}

export function FeedFiltersComponent({
  filters,
  onFiltersChange,
  onClearFilters,
  feeds,
  feedsLoading,
  isFilterLoading = false,
}: FeedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handler com debounce para o campo de título
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(() => {
      onFiltersChange({
        ...filters,
        title: value || undefined,
      })
    }, DEBOUNCE_DELAY)
  }

  const handleFeedChange = (value: string) => {
    onFiltersChange({
      ...filters,
      feed_id: value === "all" ? undefined : value,
    })
  }

  const handleTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      feed_type: value === "all" ? undefined : (value as "rss" | "youtube"),
    })
  }

  const handleClear = () => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
      debounceTimeoutRef.current = null
    }
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
          {isFilterLoading && filters.title && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-teal-500 h-4 w-4 animate-spin" />
          )}
          <Input
            key={filters.title || "empty"}
            placeholder="Search articles..."
            defaultValue={filters.title || ""}
            onChange={handleTitleChange}
            className={`pl-10 bg-slate-800 border-slate-700 text-white placeholder-gray-400 ${
              isFilterLoading && filters.title ? "pr-10" : ""
            }`}
            autoComplete="off"
            disabled={isFilterLoading}
          />
        </div>
        {isFilterLoading && filters.title && (
          <p className="text-xs text-teal-400 flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Searching for "{filters.title}"...
          </p>
        )}
      </div>

      {/* Feed Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Filter by feed</label>
        <Select
          value={filters.feed_id || "all"}
          onValueChange={handleFeedChange}
          disabled={feedsLoading || isFilterLoading}
        >
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
        <Select value={filters.feed_type || "all"} onValueChange={handleTypeChange} disabled={isFilterLoading}>
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
            onClick={handleClear}
            variant="outline"
            size="sm"
            className="w-full border-slate-600 text-gray-300 hover:bg-slate-700 bg-transparent"
            disabled={isFilterLoading}
          >
            {isFilterLoading ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Clearing...
              </>
            ) : (
              "Clear all filters"
            )}
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
          {isFilterLoading && <Loader2 className="h-3 w-3 text-teal-500 animate-spin ml-auto" />}
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
              disabled={isFilterLoading}
            >
              <Filter className="h-4 w-4 mr-2" />
              {isFilterLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Filtering...
                </>
              ) : (
                "Filters"
              )}
              {activeFiltersCount > 0 && !isFilterLoading && (
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
                {isFilterLoading && <Loader2 className="h-3 w-3 text-teal-500 animate-spin" />}
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
