"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useSelectedItem } from "@/contexts/selected-item-context"
import { apiService } from "@/lib/api"
import { ArrowLeft, ExternalLink, Calendar, Play, Clock, User, ChevronDown, ChevronUp } from "lucide-react"
import type { FeedItem } from "@/types/api"

interface ItemPageProps {
  params: {
    id: string
  }
}

export default function ItemPage({ params }: ItemPageProps) {
  const router = useRouter()
  const { selectedItem, setSelectedItem } = useSelectedItem()
  const [item, setItem] = useState<FeedItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFullDescription, setShowFullDescription] = useState(false)

  useEffect(() => {
    const fetchItemData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Strategy 1: Check if we have the item in local context and it matches the requested ID
        if (selectedItem && selectedItem.id === params.id) {
          console.log("Using local data from context")
          setItem(selectedItem)
          setLoading(false)
          return
        }

        // Strategy 2: Fetch from API if not available locally
        console.log("Fetching from API - local data not available or doesn't match")
        const response = await apiService.getFeedItem(params.id)

        // The API now returns the item directly (not wrapped in data)
        setItem(response)
        setSelectedItem(response)
      } catch (err) {
        console.error("Error fetching item:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch item")
      } finally {
        setLoading(false)
      }
    }

    fetchItemData()
  }, [params.id, selectedItem, setSelectedItem])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getYouTubeVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    return match ? match[1] : null
  }

  const truncateDescription = (content: string, maxLength = 300) => {
    if (content.length <= maxLength) return content
    return content.slice(0, maxLength) + "..."
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <Navbar />
          <div className="w-full md:max-w-6xl md:mx-auto px-0 md:px-4 py-6 lg:py-8">
            <div className="animate-pulse space-y-6 px-4 md:px-0">
              <div className="flex justify-between">
                <div className="h-8 bg-slate-700 rounded w-24"></div>
                <div className="h-8 bg-slate-700 rounded w-32"></div>
              </div>
              <div className="h-12 bg-slate-700 rounded w-3/4"></div>
              <div className="h-6 bg-slate-700 rounded w-1/2"></div>
              <div className="h-64 bg-slate-700 rounded"></div>
              <div className="space-y-3">
                <div className="h-4 bg-slate-700 rounded"></div>
                <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                <div className="h-4 bg-slate-700 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !item) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <Navbar />
          <div className="w-full md:max-w-6xl md:mx-auto px-4 py-8">
            <Card className="bg-red-900/20 border-red-700/50">
              <CardContent className="p-8 text-center">
                <h2 className="text-xl font-semibold text-red-300 mb-2">Error Loading Content</h2>
                <p className="text-red-400 mb-4">{error || "Content not found"}</p>
                <Button onClick={() => router.back()} variant="outline" className="border-slate-600">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const isYouTube = item.url.includes("youtube.com") || item.url.includes("youtu.be")
  const youtubeVideoId = isYouTube ? getYouTubeVideoId(item.url) : null

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />

        <div className="w-full md:max-w-6xl md:mx-auto px-0 md:px-4 py-6 lg:py-8">
          {/* Top Navigation Bar - Now Horizontal */}
          <div className="flex items-center justify-between gap-3 mb-6 px-4 md:px-0">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="border-slate-600 text-gray-300 hover:bg-slate-700 flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Feed
            </Button>

            <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
              <Button className="bg-teal-600 hover:bg-teal-700">
                <ExternalLink className="w-4 h-4 mr-2" />
                {isYouTube ? "Watch on YouTube" : "Read Original"}
              </Button>
            </a>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-4 px-4 md:px-0">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">{item.title}</h1>

              {/* Metadata Bar */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  <span className="font-medium text-teal-400">{item.feed.name}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(item.published_at)}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatTime(item.published_at)}
                </div>
                {isYouTube && (
                  <Badge variant="outline" className="border-red-700/50 text-red-400">
                    <Play className="w-3 h-3 mr-1" />
                    YouTube Video
                  </Badge>
                )}
              </div>
            </div>

            <div className="px-4 md:px-0">
              <Separator className="bg-slate-700" />
            </div>

            {/* Media Content */}
            {youtubeVideoId && (
              <div className="space-y-4">
                <div className="aspect-video bg-slate-900 shadow-2xl overflow-hidden md:rounded-lg">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0&modestbranding=1`}
                    title={item.title}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              </div>
            )}

            {/* Non-YouTube Thumbnail */}
            {!isYouTube && item.thumbnail && (
              <div className="space-y-4">
                <div className="bg-slate-900 shadow-2xl overflow-hidden md:rounded-lg">
                  <img
                    src={item.thumbnail || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full h-auto max-h-96 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                </div>
              </div>
            )}

            {/* Content */}
            <Card className="bg-slate-800/30 border-slate-700/50 border-x-0 md:border-x rounded-none md:rounded-lg">
              <CardContent className="p-4 md:p-6 lg:p-8">
                {isYouTube ? (
                  /* YouTube Description with Show More/Less */
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Description</h3>
                    <div className="prose prose-invert prose-lg max-w-none">
                      <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {item.content && item.content.trim() ? (
                          showFullDescription ? (
                            item.content
                          ) : (
                            truncateDescription(item.content)
                          )
                        ) : (
                          <span className="text-gray-500 italic">No description available</span>
                        )}
                      </div>
                    </div>
                    {item.content && item.content.length > 300 && (
                      <Button
                        variant="ghost"
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="text-teal-400 hover:text-teal-300 hover:bg-slate-700/50 p-0 h-auto font-normal"
                      >
                        {showFullDescription ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-1" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-1" />
                            Show More
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                ) : (
                  /* Article Content with Full HTML */
                  <div className="prose prose-invert prose-lg max-w-none">
                    {item.content && item.content.trim() ? (
                      <div
                        className="text-gray-300 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: item.content }}
                      />
                    ) : (
                      <div className="text-gray-500 italic">No content available</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
