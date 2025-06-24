"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, ExternalLink, Play } from "lucide-react"
import type { FeedItem } from "@/types/api"

interface FeedItemCardProps {
  item: FeedItem
}

export function FeedItemCard({ item }: FeedItemCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const truncateContent = (content: string, maxLength = 150) => {
    if (content.length <= maxLength) return content
    return content.slice(0, maxLength) + "..."
  }

  const stripHtml = (html: string) => {
    // Remove HTML tags and decode HTML entities
    const tmp = document.createElement("div")
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ""
  }

  // Detectar se é YouTube pela URL
  const isYouTube = item.url.includes("youtube.com") || item.url.includes("youtu.be")

  // Serializar dados do item para passar via URL
  const itemData = encodeURIComponent(JSON.stringify(item))

  return (
    <Link href={`/item/${item.id}?data=${itemData}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-slate-800/50 border-slate-700/50 hover:border-slate-600">
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
                  {isYouTube && (
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
                <h3 className="font-semibold text-white text-lg leading-tight line-clamp-2">{item.title}</h3>
                <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
              </div>

              {/* Content Preview */}
              {item.content && (
                <p className="text-gray-300 text-sm mb-3 line-clamp-3">{truncateContent(stripHtml(item.content))}</p>
              )}

              {/* Metadata */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-teal-900/30 text-teal-400 border-teal-700/50">
                    {item.feed.name}
                  </Badge>
                  {isYouTube && (
                    <Badge variant="outline" className="border-red-700/50 text-red-400">
                      YouTube
                    </Badge>
                  )}
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(item.published_at)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
