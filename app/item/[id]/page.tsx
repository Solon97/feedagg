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
import { ArrowLeft, ExternalLink, Calendar, Play, Clock, User } from "lucide-react"
import type { FeedItem } from "@/types/api"

interface ItemPageProps {
  params: {
    id: string
  }
}

export default function ItemPage({ params }: ItemPageProps) {
  const router = useRouter()
  const { selectedItem, setSelectedItem } = useSelectedItem()
  const [item, setItem] = useState<FeedItem | null>(selectedItem)
  const [loading, setLoading] = useState(!selectedItem)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchItem = async () => {
      if (selectedItem && selectedItem.id === params.id) {
        setItem(selectedItem)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const response = await apiService.getFeedItem(params.id)
        setItem(response.data)
        setSelectedItem(response.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch item")
      } finally {
        setLoading(false)
      }
    }

    fetchItem()
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

  const stripHtml = (html: string) => {
    const tmp = document.createElement("div")
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ""
  }

  const formatContent = (content: string) => {
    // Split content into paragraphs and format
    return content.split("\n\n").filter((paragraph) => paragraph.trim().length > 0)
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <Navbar />
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-slate-700 rounded w-24"></div>
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
          <div className="max-w-4xl mx-auto px-4 py-8">
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
  const cleanContent = stripHtml(item.content)
  const contentParagraphs = formatContent(cleanContent)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />

        <div className="max-w-5xl mx-auto px-4 py-6 lg:py-8">
          {/* Back Button */}
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="mb-6 border-slate-600 text-gray-300 hover:bg-slate-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Feed
          </Button>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Content Column */}
            <div className="lg:col-span-3 space-y-6">
              {/* Header */}
              <div className="space-y-4">
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

              <Separator className="bg-slate-700" />

              {/* Media Content */}
              {youtubeVideoId ? (
                <div className="space-y-4">
                  <div className="aspect-video rounded-lg overflow-hidden bg-slate-900 shadow-2xl">
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0&modestbranding=1`}
                      title={item.title}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                </div>
              ) : item.thumbnail ? (
                <div className="space-y-4">
                  <div className="rounded-lg overflow-hidden bg-slate-900 shadow-2xl">
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
              ) : null}

              {/* Content */}
              <Card className="bg-slate-800/30 border-slate-700/50">
                <CardContent className="p-6 lg:p-8">
                  <div className="prose prose-invert prose-lg max-w-none">
                    <div className="space-y-4 text-gray-300 leading-relaxed">
                      {contentParagraphs.map((paragraph, index) => (
                        <p key={index} className="text-base lg:text-lg">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Actions Card */}
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-white mb-4">Actions</h3>
                  <div className="space-y-3">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="block">
                      <Button className="w-full bg-teal-600 hover:bg-teal-700">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {isYouTube ? "Watch on YouTube" : "Read Original"}
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Source Info */}
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-white mb-4">Source</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Feed</p>
                      <p className="text-white font-medium">{item.feed.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Published</p>
                      <p className="text-white">{formatDate(item.published_at)}</p>
                      <p className="text-gray-400 text-sm">{formatTime(item.published_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Type</p>
                      <p className="text-white">{isYouTube ? "YouTube Video" : "Blog Post"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
