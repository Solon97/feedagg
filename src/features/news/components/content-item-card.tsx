import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Clock,
  Calendar,
  Play,
  Bookmark,
  BookmarkCheck,
  Heart,
} from "lucide-react";
import type { ContentItemEntity } from "@/core/entities/content-item.entity";

interface ContentItemCardProps {
  item: ContentItemEntity;
  isBookmarked?: boolean;
  onBookmarkToggle?: (itemId: string) => void;
  onOpenContent?: (item: ContentItemEntity) => void;
  isBookmarking?: boolean;
}

export function ContentItemCard({
  item,
  isBookmarked = false,
  onBookmarkToggle,
  onOpenContent,
  isBookmarking = false,
}: ContentItemCardProps) {
  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookmarkToggle?.(item.id);
  };

  const handleCardClick = () => {
    onOpenContent?.(item);
  };

  const getTypeIcon = () => {
    switch (item.contentType) {
      case "video":
        return <Play className="h-4 w-4" />;
      case "podcast":
        return <Play className="h-4 w-4" />;
      default:
        return <ExternalLink className="h-4 w-4" />;
    }
  };

  const getTypeColor = () => {
    switch (item.contentType) {
      case "video":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "podcast":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "article":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2 mb-2">
              {item.title}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">{item.author || "Unknown"}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(item.publishedAt.toISOString())}
              </div>
              {item.readingTime && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {item.readingTime} min
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Badge variant="secondary" className={getTypeColor()}>
              <div className="flex items-center gap-1">
                {getTypeIcon()}
                {item.contentType}
              </div>
            </Badge>
            {onBookmarkToggle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmarkClick}
                disabled={isBookmarking}
                className="h-8 w-8 p-0"
              >
                {isBookmarked ? (
                  <BookmarkCheck className="h-4 w-4 text-primary" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-4">
          {item.imageUrl && (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-24 h-16 object-cover rounded-md flex-shrink-0"
            />
          )}
          <div className="flex-1">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.description}
            </p>
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {item.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {item.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{item.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
