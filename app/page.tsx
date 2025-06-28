"use client"

import { useFeeds } from "@/hooks/use-feeds"
import { FeedItemCard } from "@/components/feed-item-card"
import { FeedFiltersComponent } from "@/components/feed-filters"
import { Button } from "@/components/ui/button"
import { RefreshCw, Loader2 } from "lucide-react"
import { useSelectedItem } from "@/contexts/selected-item-context"

export default function Dashboard() {
  const {
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
  } = useFeeds()

  const { selectedItemId } = useSelectedItem()

  // Check if any filters are active
  const hasActiveFilters = Boolean(filters.title || filters.feed_id || filters.feed_type)

  // Calculate display total
  const displayTotal = hasActiveFilters ? Math.max(filteredTotal, items.length) : Math.max(total, items.length)

  // Check if any loading state is active
  const isAnyLoading = loading || refreshing || filterLoading

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading feed items...</span>
        </div>
      </div>
    )
  }

  if (error && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Feed</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feed Dashboard</h1>
          <p className="text-gray-600">Stay updated with your latest content</p>
        </div>

        <Button onClick={refresh} variant="outline" disabled={isAnyLoading} className="w-fit bg-transparent">
          {refreshing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          Refresh
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar - Desktop */}
        <div className="hidden lg:block lg:w-80 flex-shrink-0">
          <FeedFiltersComponent
            feeds={feeds}
            filters={filters}
            onFiltersChange={updateFilters}
            onClearFilters={clearFilters}
            isLoading={isAnyLoading}
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {/* Mobile Filters */}
          <div className="lg:hidden mb-4">
            <FeedFiltersComponent
              feeds={feeds}
              filters={filters}
              onFiltersChange={updateFilters}
              onClearFilters={clearFilters}
              isLoading={isAnyLoading}
            />
          </div>

          {/* Results Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              {filterLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Filtering results...</span>
                </div>
              ) : refreshing ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Refreshing feed...</span>
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  Showing {items.length} of {displayTotal}
                  {hasMore ? "+" : ""} items
                </div>
              )}
            </div>

            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outline" size="sm" disabled={isAnyLoading}>
                Clear filters
              </Button>
            )}
          </div>

          {/* Feed Items */}
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                {hasActiveFilters ? "No items match your current filters." : "No feed items found."}
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters} variant="outline">
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <FeedItemCard key={item.id} item={item} isSelected={selectedItemId === item.id} />
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center pt-6">
                  <Button onClick={loadMore} variant="outline" disabled={loadingMore || isAnyLoading}>
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading more items...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
