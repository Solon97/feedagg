"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useFeeds } from "@/hooks/use-feeds"
import { Plus, Trash2, Power, PowerOff, CheckCircle, Loader2, Rss, Youtube } from "lucide-react"
import type { UserFeedSubscription } from "@/types/api"

export default function FeedsPage() {
  const { feeds, loading, error, refetch, subscribeFeed, updateFeedStatus, deleteFeed } = useFeeds()
  const [newFeedUrl, setNewFeedUrl] = useState("")
  const [subscribing, setSubscribing] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Auto-hide messages after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const handleSubscribe = async () => {
    if (!newFeedUrl.trim()) return

    try {
      setSubscribing(true)
      const result = await subscribeFeed(newFeedUrl)
      if (result.success) {
        setMessage({ type: "success", text: "Feed subscribed successfully!" })
        setNewFeedUrl("")
      } else {
        setMessage({ type: "error", text: result.error || "Failed to subscribe to feed" })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to subscribe to feed"
      setMessage({ type: "error", text: errorMessage })
    } finally {
      setSubscribing(false)
    }
  }

  const handleToggleStatus = async (subscription: UserFeedSubscription) => {
    const feedId = subscription.feed.id
    const newStatus = !subscription.is_active

    try {
      setUpdatingStatus(feedId)
      const result = await updateFeedStatus(feedId, newStatus)
      if (result.success) {
        setMessage({
          type: "success",
          text: `Subscription ${newStatus ? "activated" : "deactivated"} successfully!`,
        })
      } else {
        setMessage({ type: "error", text: result.error || "Failed to update subscription status" })
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to update subscription status" })
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleDelete = async (subscription: UserFeedSubscription) => {
    if (!confirm(`Are you sure you want to unsubscribe from "${subscription.feed.name}"?`)) return

    const result = await deleteFeed(subscription.feed.id)
    if (result.success) {
      setMessage({ type: "success", text: "Unsubscribed successfully!" })
    } else {
      setMessage({ type: "error", text: result.error || "Failed to unsubscribe" })
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Manage Feeds</h1>
            <p className="text-gray-400">Add and manage your RSS feeds and YouTube channels</p>
          </div>

          {/* Message */}
          {message && (
            <Alert
              variant={message.type === "error" ? "destructive" : "default"}
              className={`mb-6 ${
                message.type === "success"
                  ? "bg-green-900/20 border-green-700/50 text-green-300"
                  : "bg-red-900/20 border-red-700/50"
              }`}
            >
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Add New Feed */}
          <Card className="mb-8 bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Add New Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    type="url"
                    placeholder="Enter RSS feed URL or YouTube channel URL..."
                    value={newFeedUrl}
                    onChange={(e) => setNewFeedUrl(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newFeedUrl.trim() && isValidUrl(newFeedUrl.trim()) && !subscribing) {
                        handleSubscribe()
                      }
                    }}
                  />
                </div>
                <Button
                  onClick={handleSubscribe}
                  disabled={!newFeedUrl.trim() || !isValidUrl(newFeedUrl.trim()) || subscribing}
                  className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50"
                >
                  {subscribing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {subscribing ? "Adding..." : "Add Feed"}
                </Button>
              </div>
              <p className="text-sm text-gray-400">
                Enter a valid RSS feed URL or YouTube channel URL. The feed will be validated when you add it.
              </p>
            </CardContent>
          </Card>

          {/* Error State */}
          {error && (
            <Card className="mb-6 bg-red-900/20 border-red-700/50">
              <CardContent className="p-4">
                <p className="text-red-300">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Feeds List */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-slate-800/50 border-slate-700/50">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-6 bg-slate-700 rounded mb-2 w-1/3"></div>
                      <div className="h-4 bg-slate-700 rounded mb-2 w-2/3"></div>
                      <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : feeds.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-12 text-center">
                <Rss className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No feeds yet</h3>
                <p className="text-gray-400">Add your first RSS feed or YouTube channel to get started.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {feeds.map((subscription: UserFeedSubscription) => {
                const feed = subscription.feed
                const isUpdating = updatingStatus === feed.id

                return (
                  <Card key={feed.id} className="bg-slate-800/50 border-slate-700/50">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">{feed.name}</h3>
                            <Badge
                              variant="secondary"
                              className={
                                subscription.is_active
                                  ? "bg-green-900/30 text-green-400 border-green-700/50"
                                  : "bg-gray-900/30 text-gray-400 border-gray-700/50"
                              }
                            >
                              {subscription.is_active ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <PowerOff className="w-4 h-4" />
                              )}
                              <span className="ml-1">{subscription.is_active ? "Active" : "Inactive"}</span>
                            </Badge>
                            {feed.url.includes("youtube") && (
                              <Badge variant="outline" className="border-red-700/50 text-red-400">
                                <Youtube className="w-3 h-3 mr-1" />
                                YouTube
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm mb-2 break-all">{feed.url}</p>
                          <p className="text-gray-500 text-xs">Last fetched: {formatDate(feed.last_fetched_at)}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            onClick={() => handleToggleStatus(subscription)}
                            variant="outline"
                            size="sm"
                            className="border-slate-600"
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : subscription.is_active ? (
                              <PowerOff className="w-4 h-4" />
                            ) : (
                              <Power className="w-4 h-4" />
                            )}
                          </Button>
                          {!subscription.is_active && (
                            <Button
                              onClick={() => handleDelete(subscription)}
                              variant="outline"
                              size="sm"
                              className="border-red-700/50 text-red-400 hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
