"use client"

import { useState } from "react"
import { RefreshCw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FeedItemCard } from "@/components/feed-item-card"
import { FeedFiltersComponent } from "@/components/feed-filters"
import { useFeedItems, useFeeds } from "@/hooks/use-feeds"

export default function Dashboard() {
  const [refreshing, setRefreshing] = useState(false)
  const { items, loading, error, hasMore, total, filters, refresh, loadMore, applyFilters, clearFilters } =
    useFeedItems()
  const { feeds, loading: feedsLoading } = useFeeds()

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refresh()
    } finally {
      setRefreshing(false)
    }
  }

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadMore()
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Error Loading Feed</h1>
            <p className="text-gray-400 mb-6">{error}</p>
            <Button onClick={handleRefresh} className="bg-teal-600 hover:bg-teal-700">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
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
            disabled={refreshing}
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
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {loading && items.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
                <span className="ml-2 text-gray-400">Loading your feed...</span>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-gray-300 mb-2">
                  {Object.values(filters).some(Boolean) ? "No items match your filters" : "No feed items yet"}
                </h2>
                <p className="text-gray-500 mb-6">
                  {Object.values(filters).some(Boolean)
                    ? "Try adjusting your filters or check back later."
                    : "Subscribe to some feeds to see content here."}
                </p>
                {Object.values(filters).some(Boolean) && (
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="border-slate-600 text-gray-300 hover:bg-slate-700"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Results Summary */}
                {Object.values(filters).some(Boolean) && (
                  <div className="mb-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <p className="text-sm text-gray-400">
                      Showing {items.length} of {total} items
                      {filters.title && ` matching "${filters.title}"`}
                    </p>
                  </div>
                )}

                {/* Feed Items Grid */}
                <div className="grid gap-4 sm:gap-6">
                  {items.map((item) => (
                    <FeedItemCard key={item.id} item={item} />
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="flex justify-center mt-8">
                    <Button
                      onClick={handleLoadMore}
                      disabled={loading}
                      variant="outline"
                      className="border-slate-600 text-gray-300 hover:bg-slate-700"
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
  )
}
