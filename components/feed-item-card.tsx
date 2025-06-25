"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, ExternalLink } from "lucide-react"
import { useSelectedItem } from "@/contexts/selected-item-context"
import type { FeedItem } from "@/types/api"

interface FeedItemCardProps {
  item: FeedItem
}

export function FeedItemCard({ item }: FeedItemCardProps) {
  const { setSelectedItem } = useSelectedItem()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const truncateContent = (content: string, maxLength = 120) => {
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

  const handleClick = () => {
    setSelectedItem(item)
  }

  return (
    <Link href={`/item/${item.id}`} onClick={handleClick}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-slate-800/50 border-slate-700/50 hover:border-slate-600">
        <CardContent className="p-4 sm:p-6">
          <div className="flex gap-3 sm:gap-4">
            {/* Thumbnail - otimizado para mobile */}
            {item.thumbnail && (
              <div className="flex-shrink-0">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-slate-700">
                  <img
                    src={item.thumbnail || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                </div>
              </div>
            )}

            {/* Content - otimizado para mobile */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-white text-base sm:text-lg leading-tight line-clamp-2 pr-2">
                  {item.title}
                </h3>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    window.open(item.url, "_blank", "noopener,noreferrer")
                  }}
                  className="flex-shrink-0 p-1 rounded hover:bg-slate-700/50 transition-colors"
                  title="Open original content"
                >
                  <ExternalLink className="w-4 h-4 text-gray-400 hover:text-white" />
                </button>
              </div>

              {/* Content Preview - ajustado para mobile */}
              {item.content && (
                <p className="text-gray-300 text-xs sm:text-sm mb-3 line-clamp-2 sm:line-clamp-3">
                  {truncateContent(stripHtml(item.content), window.innerWidth < 640 ? 100 : 150)}
                </p>
              )}

              {/* Metadata - layout responsivo */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-teal-900/30 text-teal-400 border-teal-700/50 text-xs">
                    {item.feed.name}
                  </Badge>
                </div>
                <div className="flex items-center text-gray-400 text-xs sm:text-sm">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="truncate">{formatDate(item.published_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
