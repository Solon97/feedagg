"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
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
  // Local form state - completely independent from external filters
  const [formState, setFormState] = useState({
    title: "",
    feed_id: "all",
    feed_type: "all",
  })
  const [isOpen, setIsOpen] = useState(false)

  // Initialize form state only when filters are externally cleared
  useEffect(() => {
    const allFiltersEmpty = !filters.title && !filters.feed_id && !filters.feed_type

    if (allFiltersEmpty) {
      setFormState({
        title: "",
        feed_id: "all",
        feed_type: "all",
      })
    }
  }, [filters.title, filters.feed_id, filters.feed_type])

  // Form handlers - only update local state
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({
      ...prev,
      title: e.target.value,
    }))
  }

  const handleFeedChange = (value: string) => {
    setFormState((prev) => ({
      ...prev,
      feed_id: value,
    }))
  }

  const handleTypeChange = (value: string) => {
    setFormState((prev) => ({
      ...prev,
      feed_type: value,
    }))
  }

  // Search function - collects all form data and sends to API
  const handleSearch = () => {
    const searchFilters: FeedFilters = {
      title: formState.title.trim() || undefined,
      feed_id: formState.feed_id === "all" ? undefined : formState.feed_id,
      feed_type: formState.feed_type === "all" ? undefined : (formState.feed_type as "rss" | "youtube"),
    }

    onFiltersChange(searchFilters)

    // Close mobile sheet after search
    setIsOpen(false)
  }

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  // Clear all filters
  const handleClear = () => {
    setFormState({
      title: "",
      feed_id: "all",
      feed_type: "all",
    })
    onClearFilters()
  }

  // Clear individual filter
  const handleClearTitle = () => {
    setFormState((prev) => ({
      ...prev,
      title: "",
    }))
  }

  const activeFiltersCount = Object.values(filters).filter(Boolean).length
  const activeFeeds = Array.isArray(feeds) ? feeds.filter((sub) => sub.is_active) : []
  const hasFormChanges = formState.title.trim() || formState.feed_id !== "all" || formState.feed_type !== "all"

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="space-y-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
          <Search className="h-4 w-4" />
          Search Filters
        </h4>

        {/* Title Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Search by title</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Type to search articles..."
              value={formState.title}
              onChange={handleTitleChange}
              onKeyPress={handleKeyPress}
              className="pl-10 pr-10 bg-slate-800 border-slate-700 text-white placeholder-gray-400"
              autoComplete="off"
            />
            {formState.title && (
              <button
                onClick={handleClearTitle}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Feed Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Filter by feed</label>
          <Select value={formState.feed_id} onValueChange={handleFeedChange} disabled={feedsLoading}>
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
          <Select value={formState.feed_type} onValueChange={handleTypeChange}>
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

        {/* Search Actions */}
        <div className="flex gap-2 pt-2">
          <Button onClick={handleSearch} className="flex-1 bg-teal-600 hover:bg-teal-700" disabled={!hasFormChanges}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          {hasFormChanges && (
            <Button
              onClick={handleClear}
              variant="outline"
              className="border-slate-600 text-gray-300 hover:bg-slate-700 bg-transparent"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <p className="text-xs text-gray-500">Press Enter in the title field or click "Search" to apply all filters</p>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-300">Active filters</label>
          <div className="flex flex-wrap gap-2">
            {filters.title && (
              <Badge variant="secondary" className="bg-teal-900/30 text-teal-400 border-teal-700/50">
                Title: "{filters.title}"
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
          >
            Clear all active filters
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
                Search & Filters
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
