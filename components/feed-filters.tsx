"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Filter, X, Loader2 } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

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
  const isMobile = useMobile()
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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
    // Clear any pending debounced calls
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    onClearFilters()
  }

  const hasActiveFilters = Boolean(filters.title || filters.feed_id || filters.feed_type)

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-gray-500 pb-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Filtering results...</span>
        </div>
      )}

      {/* Search by title */}
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

      {/* Filter by feed */}
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

      {/* Filter by type */}
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

      {/* Active filters */}
      {hasActiveFilters && (
        <div className="space-y-2">
          <Label>Active filters</Label>
          <div className="flex flex-wrap gap-2">
            {filters.title && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Title: {filters.title}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => onFiltersChange({ ...filters, title: undefined })}
                />
              </Badge>
            )}
            {filters.feed_id && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Feed: {feeds.find((f) => f.id === filters.feed_id)?.title || "Unknown"}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => onFiltersChange({ ...filters, feed_id: undefined })}
                />
              </Badge>
            )}
            {filters.feed_type && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Type: {filters.feed_type.toUpperCase()}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => onFiltersChange({ ...filters, feed_type: undefined })}
                />
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Clear all button */}
      {hasActiveFilters && (
        <Button onClick={handleClear} variant="outline" className="w-full bg-transparent" disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Clear all filters
        </Button>
      )}
    </div>
  )

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full bg-transparent" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Filter className="w-4 h-4 mr-2" />}
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {Object.values(filters).filter(Boolean).length}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle>Filter Articles</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters
          {hasActiveFilters && <Badge variant="secondary">{Object.values(filters).filter(Boolean).length}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FilterContent />
      </CardContent>
    </Card>
  )
}
