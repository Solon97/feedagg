"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Filter, X, Loader2 } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

interface FeedFiltersProps {
  feeds: Array<{
    id: string
    title: string
    feed_type: "rss" | "youtube"
  }>
  filters: {
    title?: string
    feed_id?: string
    feed_type?: "rss" | "youtube"
  }
  onFiltersChange: (filters: any) => void
  onClearFilters: () => void
  isLoading?: boolean
}

const DEBOUNCE_DELAY = 1000

export function FeedFiltersComponent({
  feeds,
  filters,
  onFiltersChange,
  onClearFilters,
  isLoading = false,
}: FeedFiltersProps) {
  const isMobile = useIsMobile()
  const debounceTimeoutRef = useRef<NodeJS.Timeout>()

  const handleTitleChange = (value: string) => {
    // Clear any existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    // Set new timeout
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
    // Clear any pending debounce
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    onClearFilters()
  }

  const hasActiveFilters = !!(filters.title || filters.feed_id || filters.feed_type)

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <h3 className="font-semibold">Filters</h3>
          {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClear} disabled={isLoading}>
            <X className="w-3 h-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active Filters</Label>
          <div className="flex flex-wrap gap-2">
            {filters.title && (
              <Badge variant="secondary" className="text-xs">
                Title: {filters.title}
                <button
                  onClick={() =>
                    onFiltersChange({
                      ...filters,
                      title: undefined,
                    })
                  }
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  disabled={isLoading}
                >
                  <X className="w-2 h-2" />
                </button>
              </Badge>
            )}
            {filters.feed_id && (
              <Badge variant="secondary" className="text-xs">
                Feed: {feeds.find((f) => f.id === filters.feed_id)?.title || "Unknown"}
                <button
                  onClick={() =>
                    onFiltersChange({
                      ...filters,
                      feed_id: undefined,
                    })
                  }
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  disabled={isLoading}
                >
                  <X className="w-2 h-2" />
                </button>
              </Badge>
            )}
            {filters.feed_type && (
              <Badge variant="secondary" className="text-xs">
                Type: {filters.feed_type.toUpperCase()}
                <button
                  onClick={() =>
                    onFiltersChange({
                      ...filters,
                      feed_type: undefined,
                    })
                  }
                  className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  disabled={isLoading}
                >
                  <X className="w-2 h-2" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Search by Title */}
      <div className="space-y-2">
        <Label htmlFor="title-filter">Search by title</Label>
        <Input
          id="title-filter"
          key={filters.title || "empty"}
          placeholder="Enter article title..."
          defaultValue={filters.title || ""}
          onChange={(e) => handleTitleChange(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Filter by Feed */}
      <div className="space-y-2">
        <Label>Filter by feed</Label>
        <Select value={filters.feed_id || "all"} onValueChange={handleFeedChange} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue placeholder="All feeds" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All feeds</SelectItem>
            {feeds.map((feed) => (
              <SelectItem key={feed.id} value={feed.id}>
                {feed.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filter by Type */}
      <div className="space-y-2">
        <Label>Filter by type</Label>
        <Select value={filters.feed_type || "all"} onValueChange={handleTypeChange} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="rss">RSS</SelectItem>
            <SelectItem value="youtube">YouTube</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full bg-transparent" disabled={isLoading}>
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {hasActiveFilters && <Badge className="ml-2 px-1 py-0 text-xs">{Object.keys(filters).length}</Badge>}
            {isLoading && <Loader2 className="w-3 h-3 ml-2 animate-spin" />}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle>Filter Feed Items</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <FilterContent />
    </div>
  )
}
