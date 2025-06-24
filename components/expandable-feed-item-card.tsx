"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, ExternalLink, Play, ChevronDown, ChevronUp } from "lucide-react"
import type { FeedItem } from "@/types/api"

interface ExpandableFeedItemCardProps {
  item: FeedItem
}

export function ExpandableFeedItemCard({ item }: ExpandableFeedItemCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const truncateContent = (content: string, maxLength = 200) => {
    if (content.length <= maxLength) return content
    return content.slice(0, maxLength) + "..."
  }

  const isYouTubeUrl = (url: string) => {
    return url.includes("youtube.com") || url.includes("youtu.be")
  }

  const getYouTubeVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    return match ? match[1] : null
  }

  const youtubeVideoId = isYouTubeUrl(item.url) ? getYouTubeVideoId(item.url) : null

  return (
    <Card className="bg-slate-800/50 border-slate-700/50 hover:border-slate-600 transition-colors">
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Thumbnail */}
          {item.thumbnail && (
            <div className="flex-shrink-0">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-slate-700">
                <img
                  src={item.thumbnail || "/placeholder.svg"}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
                {isYouTubeUrl(item.url) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-white text-lg leading-tight">{item.title}</h3>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                <Button variant="outline" size="sm" className="border-slate-600">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {isYouTubeUrl(item.url) ? "Watch" : "Read"}
                </Button>
              </a>
            </div>

            {/* Content Preview */}
            {item.content && (
              <div className="text-gray-300 text-sm mb-3">
                {isExpanded ? (
                  <div className="whitespace-pre-wrap">{item.content}</div>
                ) : (
                  <div>{truncateContent(item.content)}</div>
                )}
              </div>
            )}

            {/* YouTube Video Embed (when expanded) */}
            {isExpanded && youtubeVideoId && (
              <div className="mb-4">
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

            {/* Metadata and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-teal-900/30 text-teal-400 border-teal-700/50">
                  {item.feed.name}
                </Badge>
                {isYouTubeUrl(item.url) && (
                  <Badge variant="outline" className="border-red-700/50 text-red-400">
                    YouTube
                  </Badge>
                )}
                <div className="flex items-center text-gray-400 text-sm">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(item.published_at)}
                </div>
              </div>

              {/* Expand/Collapse Button */}
              {item.content && item.content.length > 200 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-gray-400 hover:text-white"
                >
                  {isExpanded ? (
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
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
