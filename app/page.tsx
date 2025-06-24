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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Your Feed</h1>
              <p className="text-gray-400">
                {items.length > 0 ? `${items.length} items from your subscribed feeds` : "No items yet"}
              </p>
            </div>
            <Button onClick={handleRefresh} disabled={refreshing} className="bg-teal-600 hover:bg-teal-700">
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Error State */}
          {error && (
            <Card className="mb-6 bg-red-900/20 border-red-700/50">
              <CardContent className="p-4">
                <p className="text-red-300">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!loading && items.length === 0 && !error && (
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-12 text-center">
                <Rss className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No feed items yet</h3>
                <p className="text-gray-400 mb-6">
                  Start by adding some RSS feeds or YouTube channels to see content here.
                </p>
                <Link href="/feeds">
                  <Button className="bg-teal-600 hover:bg-teal-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Feed
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Feed Items */}
          {items.length > 0 && (
            <div className="space-y-8">
              {items.map((item, index) => (
                <div key={item.id} className={index > 0 ? "mt-8" : ""}>
                  <FeedItemCard item={item} />
                </div>
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center pt-8">
                  <Button
                    onClick={loadMore}
                    disabled={loading}
                    variant="outline"
                    className="border-slate-600 text-gray-300 hover:bg-slate-700"
                  >
                    {loading ? "Loading..." : "Load More"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && items.length === 0 && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-slate-800/50 border-slate-700/50">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 bg-slate-700 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-6 bg-slate-700 rounded mb-2"></div>
                          <div className="h-4 bg-slate-700 rounded mb-2 w-3/4"></div>
                          <div className="h-4 bg-slate-700 rounded w-1/2"></div>
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
