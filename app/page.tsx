"use client"

import { useState } from "react"
import { RefreshCw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FeedItemCard } from "@/components/feed-item-card"
import { FeedFiltersComponent } from "@/components/feed-filters"
import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { useFeedItems, useFeeds } from "@/hooks/use-feeds"

export default function Dashboard() {
  const [refreshing, setRefreshing] = useState(false)

  // Use the hooks with stable references
  const feedItemsHook = useFeedItems()
  const feedsHook = useFeeds()

  const {
    items,
    loading,
    filterLoading,
    error,
    hasMore,
    total,
    filteredTotal,
    filters,
    refresh,
    loadMore,
    applyFilters,
    clearFilters,
  } = feedItemsHook

  const { feeds, loading: feedsLoading } = feedsHook

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refresh()
    } finally {
      setRefreshing(false)
    }
  }

  const handleLoadMore = () => {
    if (!loading && !filterLoading && hasMore) {
      loadMore()
    }
  }

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(Boolean)

  // Calculate the correct total to display
  const displayTotal = hasActiveFilters ? Math.max(filteredTotal, items.length) : total
  const displayCount = items.length

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <Navbar />
          <div className="max-w-4xl mx-auto p-4">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-red-400 mb-4">Error Loading Feed</h1>
              <p className="text-gray-400 mb-6">{error}</p>
              <Button onClick={handleRefresh} className="bg-teal-600 hover:bg-teal-700">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />

        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Your Feed</h1>
              <p className="text-gray-400">
                {items.length > 0 ? `${items.length} items from your subscribed feeds` : "No items yet"}
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing || filterLoading}
              className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto"
            >
              {refreshing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <FeedFiltersComponent
                filters={filters}
                onFiltersChange={applyFilters}
                onClearFilters={clearFilters}
                feeds={feeds}
                feedsLoading={feedsLoading}
                isFilterLoading={filterLoading}
              />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Filter Loading Indicator */}
              {filterLoading && (
                <div className="mb-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700 flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
                    <span className="text-sm text-gray-300">Filtering results...</span>
                  </div>
                </div>
              )}

              {loading && items.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
                  <span className="ml-2 text-gray-400">Loading your feed...</span>
                </div>
              ) : items.length === 0 && !filterLoading ? (
                <div className="text-center py-12">
                  <h2 className="text-xl font-semibold text-gray-300 mb-2">
                    {hasActiveFilters ? "No items match your filters" : "No feed items yet"}
                  </h2>
                  <p className="text-gray-500 mb-6">
                    {hasActiveFilters
                      ? "Try adjusting your filters or check back later."
                      : "Subscribe to some feeds to see content here."}
                  </p>
                  {hasActiveFilters && (
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      className="border-slate-600 text-gray-300 hover:bg-slate-700 bg-transparent"
                      disabled={filterLoading}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {/* Results Summary */}
                  {(hasActiveFilters || displayCount > 0) && !filterLoading && (
                    <div className="mb-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400">
                          Showing <span className="text-white font-medium">{displayCount}</span> of{" "}
                          <span className="text-white font-medium">{displayTotal}</span> items
                        </p>
                        {hasActiveFilters && (
                          <Button
                            onClick={clearFilters}
                            variant="ghost"
                            size="sm"
                            className="text-xs text-gray-400 hover:text-white h-auto p-1"
                            disabled={filterLoading}
                          >
                            Clear filters
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Feed Items Grid */}
                  <div className="grid gap-4 sm:gap-6">
                    {items.map((item) => (
                      <FeedItemCard key={item.id} item={item} />
                    ))}
                  </div>

                  {/* Load More Button */}
                  {hasMore && !filterLoading && (
                    <div className="flex justify-center mt-8">
                      <Button
                        onClick={handleLoadMore}
                        disabled={loading}
                        variant="outline"
                        className="border-slate-600 text-gray-300 hover:bg-slate-700 bg-transparent"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          "Load More"
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
