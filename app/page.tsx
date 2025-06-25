"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { FeedItemCard } from "@/components/feed-item-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useFeedItems } from "@/hooks/use-feeds"
import { RefreshCw, Plus, Rss } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { items, loading, error, hasMore, total, refresh, loadMore } = useFeedItems()
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    await refresh()
    setRefreshing(false)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20 md:pb-0">
        <Navbar />

        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
          {/* Header - otimizado para mobile */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Your Feed</h1>
              <p className="text-gray-400 text-sm sm:text-base">
                {items.length > 0 ? `${items.length} items from your subscribed feeds` : "No items yet"}
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Error State */}
          {error && (
            <Card className="mb-4 sm:mb-6 bg-red-900/20 border-red-700/50">
              <CardContent className="p-3 sm:p-4">
                <p className="text-red-300 text-sm sm:text-base">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Empty State - otimizado para mobile */}
          {!loading && items.length === 0 && !error && (
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-8 sm:p-12 text-center">
                <Rss className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No feed items yet</h3>
                <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base px-4">
                  Start by adding some RSS feeds or YouTube channels to see content here.
                </p>
                <Link href="/feeds">
                  <Button className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Feed
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Feed Items - espaçamento otimizado para mobile */}
          {items.length > 0 && (
            <div className="space-y-3 sm:space-y-6">
              {items.map((item, index) => (
                <div key={item.id}>
                  <FeedItemCard item={item} />
                </div>
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center pt-6 sm:pt-8">
                  <Button
                    onClick={loadMore}
                    disabled={loading}
                    variant="outline"
                    className="border-slate-600 text-gray-300 hover:bg-slate-700 w-full sm:w-auto"
                  >
                    {loading ? "Loading..." : "Load More"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Loading State - otimizado para mobile */}
          {loading && items.length === 0 && (
            <div className="space-y-3 sm:space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-slate-800/50 border-slate-700/50">
                  <CardContent className="p-4 sm:p-6">
                    <div className="animate-pulse">
                      <div className="flex gap-3 sm:gap-4">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-700 rounded-lg flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <div className="h-5 sm:h-6 bg-slate-700 rounded mb-2"></div>
                          <div className="h-3 sm:h-4 bg-slate-700 rounded mb-2 w-3/4"></div>
                          <div className="h-3 sm:h-4 bg-slate-700 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
