"use client"

import { useFeeds } from "@/hooks/use-feeds"
import { FeedFiltersComponent } from "@/components/feed-filters"
import { FeedItemCard } from "@/components/feed-item-card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const {
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
    loadMore,
    refresh,
    updateFilters,
    clearFilters,
  } = useFeeds()

  // Show loading while auth is being determined
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to FeedAgg</h1>
          <p className="text-gray-600 mb-4">Please log in to view your feeds</p>
          <Button onClick={() => (window.location.href = "/auth/login")}>Go to Login</Button>
        </div>
      </div>
    )
  }

  const hasActiveFilters = !!(filters.title || filters.feed_id || filters.feed_type)
  const displayTotal = hasActiveFilters ? Math.max(filteredTotal, items.length) : Math.max(total, items.length)
  const isAnyLoading = loading || refreshing || filterLoading

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <FeedFiltersComponent
              feeds={feeds}
              filters={filters}
              onFiltersChange={updateFilters}
              onClearFilters={clearFilters}
              isLoading={isAnyLoading}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Feed Items</h1>
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-sm text-gray-600">
                    Showing {items.length} of {displayTotal} items
                  </p>
                  {hasActiveFilters && (
                    <Button variant="outline" size="sm" onClick={clearFilters} disabled={isAnyLoading}>
                      Clear filters
                    </Button>
                  )}
                </div>
              </div>
              <Button
                onClick={refresh}
                disabled={isAnyLoading}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-transparent"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </div>

            {/* Loading Indicator */}
            {filterLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Filtering results...</span>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !filterLoading && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Error Loading Feed</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                  <Button onClick={refresh} variant="outline" size="sm" disabled={refreshing}>
                    Try Again
                  </Button>
                </div>
              </div>
            )}

            {/* Feed Items */}
            {!loading && !filterLoading && (
              <>
                {items.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">
                      {hasActiveFilters ? "No items match your current filters" : "No feed items found"}
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
                      <FeedItemCard key={item.id} item={item} />
                    ))}

                    {/* Load More Button */}
                    {hasMore && (
                      <div className="flex justify-center pt-6">
                        <Button onClick={loadMore} disabled={isAnyLoading} variant="outline">
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
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
              </>
            )}

            {/* Initial Loading */}
            {loading && !refreshing && !filterLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading feed items...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
