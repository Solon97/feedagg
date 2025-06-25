"use client"

import { useEffect, useState } from "react"
import { apiService } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

const FeedsPage = () => {
  const [feeds, setFeeds] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        const userFeeds = await apiService.getUserFeeds()
        setFeeds(userFeeds)
      } catch (error) {
        console.error("Error fetching feeds:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeeds()
  }, [])

  const toggleFeedStatus = async (feedId: string, currentIsActive: boolean) => {
    try {
      await apiService.updateFeedStatus(feedId, !currentIsActive)
      // Refresh feeds after status change
      const updatedFeeds = await apiService.getUserFeeds()
      setFeeds(updatedFeeds)
      toast.success(`Feed status updated successfully.`)
    } catch (error) {
      console.error("Error toggling feed status:", error)
      toast.error(`Failed to update feed status.`)
    }
  }

  const deleteFeed = async (feedId: string) => {
    try {
      await apiService.deleteFeed(feedId)
      // Refresh feeds after deletion
      const updatedFeeds = await apiService.getUserFeeds()
      setFeeds(updatedFeeds)
      toast.success(`Feed deleted successfully.`)
    } catch (error) {
      console.error("Error deleting feed:", error)
      toast.error(`Failed to delete feed.`)
    }
  }

  if (isLoading) {
    return <div>Loading feeds...</div>
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Your Feeds</h2>
      {feeds.length === 0 ? (
        <p>No feeds found. Add some!</p>
      ) : (
        <div className="space-y-4">
          {feeds.map((subscription) => (
            <div key={subscription.feed_id} className="border rounded-md p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{subscription.feed.name}</h3>
                  <p className="text-sm text-gray-500">{subscription.feed.url}</p>
                  <p className="text-xs text-gray-400">
                    Last fetched: {new Date(subscription.feed.last_fetched_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={subscription.is_active ? "default" : "secondary"}>
                    {subscription.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleFeedStatus(subscription.feed_id, subscription.is_active)}
                  >
                    {subscription.is_active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteFeed(subscription.feed_id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FeedsPage
