"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useSelectedItem } from "@/contexts/selected-item-context";
import { useLocalizedTranslations } from "@/hooks/use-localized-translations";
import type { FeedItem } from "@/types/api";
import { Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";

interface FeedItemCardProps {
  item: FeedItem;
}

export function FeedItemCard({ item }: FeedItemCardProps) {
  const { localizedDate } = useLocalizedTranslations();
  const { setSelectedItem } = useSelectedItem();

  const truncateContent = (content: string, maxLength = 120) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + "...";
  };

  const stripHtml = (html: string) => {
    // Remove HTML tags and decode HTML entities
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const getFeedType = (url: string) => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      return "YouTube";
    }
    return "Blog";
  };

  // Detectar se é Shorts pela URL
  const isYoutubeShorts =
    item.url.includes("youtube") && item.url.includes("shorts");

  // Get dynamic colors for feed badge based on topic
  const getFeedBadgeStyle = () => {
    const topicColor = item.feed.topic?.color;
    if (topicColor) {
      // Convert hex to rgb for transparency
      const hex = topicColor.replace("#", "");
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);

      return {
        backgroundColor: `rgba(${r}, ${g}, ${b}, 0.2)`,
        color: topicColor,
        borderColor: `rgba(${r}, ${g}, ${b}, 0.3)`,
      };
    }
    // Fallback to default teal
    return {};
  };

  const handleClick = () => {
    setSelectedItem(item);
  };

  const formatDuration = (duration: string) => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return "";

    const [, hours, minutes, seconds] = match;
    return [
      hours ? `${hours.padStart(2, "0")}:` : "",
      minutes ? `${minutes.padStart(2, "0")}:` : "",
      seconds ? `${seconds.padStart(2, "0")}` : "",
    ]
      .filter(Boolean)
      .join("");
  };

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
                      e.currentTarget.style.display = "none";
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
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(item.url, "_blank", "noopener,noreferrer");
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
                  {truncateContent(
                    stripHtml(item.content),
                    window.innerWidth < 640 ? 100 : 150
                  )}
                </p>
              )}

              {/* Metadata - layout responsivo */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={`text-xs ${
                      item.feed.topic?.color
                        ? ""
                        : "bg-teal-900/30 text-teal-400 border-teal-700/50"
                    }`}
                    style={item.feed.topic?.color ? getFeedBadgeStyle() : {}}
                  >
                    {item.feed.name}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${
                      getFeedType(item.url) === "YouTube"
                        ? "bg-red-900/30 text-red-400 border-red-700/50"
                        : "bg-orange-900/30 text-orange-400 border-orange-700/50"
                    }`}
                  >
                    {getFeedType(item.url)}
                  </Badge>
                  {(item.duration || isYoutubeShorts) && (
                    <Badge
                      variant="secondary"
                      className="bg-red-900/30 text-red-400 border-red-700/50"
                    >
                      {item.duration ? formatDuration(item.duration) : "Shorts"}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center text-gray-400 text-xs sm:text-sm">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="truncate">
                    {localizedDate(item.published_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
