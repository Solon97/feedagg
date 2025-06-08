"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  Edit,
  Trash2,
  RefreshCw,
  Rss,
  CheckCircle2,
  XCircle,
  Link,
  Settings,
  Calendar,
  Pause,
  Play,
  PlayCircle,
} from "lucide-react";
import type { ContentSourceEntity } from "../../../core/entities/content-source.entity";

interface FeedCardProps {
  feed: ContentSourceEntity;
  onEdit: (feed: ContentSourceEntity) => void;
  onDelete: (feedId: string) => void;
  onRefresh: (feedId: string) => void;
  onToggle?: (feedId: string) => void;
}

export function FeedCard({
  feed,
  onEdit,
  onDelete,
  onRefresh,
  onToggle,
}: FeedCardProps) {
  // Helper function to get feed type icon and color
  const getFeedTypeInfo = (url: string, sourceType?: string) => {
    // Simplify detection: YouTube vs RSS only
    if (
      sourceType === "youtube" ||
      url.includes("youtube.com") ||
      url.includes("youtu.be")
    ) {
      return {
        icon: PlayCircle,
        color: "text-red-600",
        bgColor: "bg-red-100",
        label: "YouTube",
      };
    }
    // Default to RSS for everything else
    return {
      icon: Rss,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      label: "RSS",
    };
  };

  // Helper function to format date
  const formatDate = (date: string | Date | null) => {
    if (!date) return "Never";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return dateObj.toLocaleDateString();
  };

  const getStatusColor = (isActive: boolean) => {
    if (isActive) {
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    }
    return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  };

  const getStatusIcon = (isActive: boolean) => {
    if (isActive) {
      return <CheckCircle2 className="w-3 h-3 text-green-600" />;
    }
    return <XCircle className="w-3 h-3 text-gray-400" />;
  };

  const feedTypeInfo = getFeedTypeInfo(feed.url, (feed as any).sourceType);
  const FeedIcon = feedTypeInfo.icon;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between space-x-4">
          <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
            <div className="flex-shrink-0 pt-1">
              <div
                className={`p-1.5 sm:p-2 ${feedTypeInfo.bgColor} rounded-lg`}
              >
                <FeedIcon
                  className={`h-4 w-4 sm:h-5 sm:w-5 ${feedTypeInfo.color}`}
                />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="mb-2">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate dark:text-white">
                  {feed.name}
                </h3>
              </div>

              {/* Category */}
              {feed.category && (
                <div className="mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {feed.category}
                  </Badge>
                </div>
              )}

              {/* Description */}
              {feed.description && (
                <p className="text-sm sm:text-base text-gray-600 mb-3 break-words dark:text-gray-400">
                  {feed.description}
                </p>
              )}

              {/* Feed URL */}
              <div className="flex flex-col space-y-2 sm:space-y-1">
                <div className="flex items-center space-x-1 min-w-0">
                  <Link className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-gray-400" />
                  <span className="text-xs sm:text-sm text-gray-500 truncate">
                    {feed.url}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(feed.isActive)}
                    <span>{feed.isActive ? "Active" : "Inactive"}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Settings className="h-3 w-3" />
                    <span>0 items</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>Updated: {formatDate(feed.lastFetchedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Moved to top right */}
          <div className="flex items-start space-x-1 sm:space-x-2 flex-shrink-0 pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(feed.url, "_blank")}
              className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-gray-600 hover:text-gray-700 hover:bg-gray-100"
              title="Open feed URL"
            >
              <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRefresh(feed.id)}
              className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              title="Refresh feed"
            >
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(feed)}
              className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-gray-600 hover:text-gray-700 hover:bg-gray-100"
              title="Edit feed"
            >
              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>

            {/* Conditional action button based on feed status */}
            {feed.isActive ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggle?.(feed.id)}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                title="Pause feed"
              >
                <Pause className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggle?.(feed.id)}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                  title="Activate feed"
                >
                  <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(feed.id)}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Delete feed"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
