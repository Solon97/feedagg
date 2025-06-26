"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X, ChevronDown, ChevronUp } from "lucide-react"
import { useFeeds, type FeedFilters } from "@/hooks/use-feeds"
import { useDebounce } from "@/hooks/use-debounce"

interface FeedFiltersProps {
  filters: FeedFilters
  onFiltersChange: (filters: FeedFilters) => void
  onClearFilters: () => void
}

export function FeedFiltersComponent({ filters, onFiltersChange, onClearFilters }: FeedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localTitle, setLocalTitle] = useState(filters.title || "")
  const [localFeedId, setLocalFeedId] = useState(filters.feed_id || "")
  const [localFeedType, setLocalFeedType] = useState(filters.feed_type || "")

  const { feeds } = useFeeds()
  const debouncedTitle = useDebounce(localTitle, 500)

  // Update filters when debounced title changes
  useEffect(() => {
    if (debouncedTitle !== filters.title) {
      onFiltersChange({
        ...filters,
        title: debouncedTitle || undefined,
      })
    }
  }, [debouncedTitle, filters, onFiltersChange])

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
  const hasActiveFilters = activeFiltersCount > 0

  return (
    <Card className="bg-slate-800/50 border-slate-700/50 mb-6">
      <CardContent className="p-4">
        {/* Mobile Toggle Button */}
        <div className="flex items-center justify-between mb-4 md:mb-0">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-white font-medium">Filters</span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="bg-teal-900/30 text-teal-400 border-teal-700/50">
                {activeFiltersCount}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-white md:hidden"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Filters Content */}
        <div className={`space-y-4 ${isExpanded ? "block" : "hidden"} md:block`}>
          {/* Search by Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Search by title</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search articles..."
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filter by Feed */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Filter by feed</label>
              <select
                value={localFeedId}
                onChange={(e) => handleFeedChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All feeds</option>
                {Array.isArray(feeds) &&
                  feeds
                    .filter((subscription) => subscription.is_active)
                    .map((subscription) => (
                      <option key={subscription.feed.id} value={subscription.feed.id}>
                        {subscription.feed.name}
                      </option>
                    ))}
              </select>
            </div>

            {/* Filter by Feed Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Filter by type</label>
              <select
                value={localFeedType}
                onChange={(e) => handleFeedTypeChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All types</option>
                <option value="rss">RSS</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-700">
              {filters.title && (
                <Badge variant="outline" className="border-teal-700 text-teal-400">
                  Title: "{filters.title}"
                </Badge>
              )}
              {filters.feed_id && (
                <Badge variant="outline" className="border-blue-700 text-blue-400">
                  Feed: {feeds.find((f) => f.feed.id === filters.feed_id)?.feed.name || "Unknown"}
                </Badge>
              )}
              {filters.feed_type && (
                <Badge variant="outline" className="border-orange-700 text-orange-400">
                  Type: {filters.feed_type.toUpperCase()}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
