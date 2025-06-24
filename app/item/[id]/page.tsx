"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiService } from "@/lib/api"
import { ArrowLeft, ExternalLink, Calendar, Play } from "lucide-react"
import type { FeedItem } from "@/types/api"

interface ItemPageProps {
  params: {
    id: string
  }
}

export default function ItemPage({ params }: ItemPageProps) {
  const router = useRouter()
  const [item, setItem] = useState<FeedItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await apiService.getFeedItem(params.id)
        setItem(response.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch item")
      } finally {
        setLoading(false)
      }
    }

    fetchItem()
  }, [params.id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getYouTubeVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    return match ? match[1] : null
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <Navbar />
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-8">
                <div className="animate-pulse space-y-4">
                  <div className="h-8 bg-slate-700 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                  <div className="h-64 bg-slate-700 rounded"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-700 rounded"></div>
                    <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                    <div className="h-4 bg-slate-700 rounded w-4/6"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Card className="bg-red-900/20 border-red-700/50">
              <CardContent className="p-8 text-center">
                <h2 className="text-xl font-semibold text-red-300 mb-2">Error Loading Item</h2>
                <p className="text-red-400 mb-4">{error || "Item not found"}</p>
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

  const youtubeVideoId = item.feed_type === "youtube" ? getYouTubeVideoId(item.url) : null

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Back Button */}
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="mb-6 border-slate-600 text-gray-300 hover:bg-slate-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-8">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h1 className="text-3xl font-bold text-white leading-tight">{item.title}</h1>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                    <Button variant="outline" size="sm" className="border-slate-600">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {item.feed_type === "youtube" ? "Watch on YouTube" : "Read Original"}
                    </Button>
                  </a>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(item.published_at)}
                  </div>
                  <Badge variant="secondary" className="bg-teal-900/30 text-teal-400 border-teal-700/50">
                    {item.feed_name}
                  </Badge>
                  {item.feed_type === "youtube" && (
                    <Badge variant="outline" className="border-red-700/50 text-red-400">
                      <Play className="w-3 h-3 mr-1" />
                      YouTube
                    </Badge>
                  )}
                </div>
              </div>

              {/* YouTube Video Embed */}
              {youtubeVideoId && (
                <div className="mb-8">
                  <div className="aspect-video rounded-lg overflow-hidden bg-slate-900">
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                      title={item.title}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                </div>
              )}

              {/* Thumbnail for non-YouTube content */}
              {item.thumbnail && item.feed_type !== "youtube" && (
                <div className="mb-8">
                  <img
                    src={item.thumbnail || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full max-w-2xl mx-auto rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                </div>
              )}

              {/* Content */}
              <div className="prose prose-invert max-w-none">
                {item.feed_type === "blog" && item.content ? (
                  <div className="text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.content }} />
                ) : item.summary ? (
                  <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">{item.summary}</div>
                ) : (
                  <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">{item.content}</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
