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

  const formatDate = (dateInput: string | Date | null | undefined) => {
    try {
      // Validação inicial mais robusta
      if (!dateInput) {
        console.warn("formatDate: No date input provided");
        return "Unknown date";
      }

      let date: Date;

      // Conversão segura para Date
      if (typeof dateInput === "string") {
        date = new Date(dateInput);
      } else if (dateInput instanceof Date) {
        date = dateInput;
      } else {
        console.warn(
          "formatDate: Invalid date type:",
          typeof dateInput,
          dateInput
        );
        return "Unknown date";
      }

      // Verificação adicional se date é válido antes de chamar getTime()
      if (!date || !(date instanceof Date)) {
        console.warn("formatDate: Date object creation failed");
        return "Unknown date";
      }

      // Verificação específica para getTime() antes de usar
      let timestamp: number;
      try {
        timestamp = date.getTime();
        if (isNaN(timestamp)) {
          console.warn("formatDate: Invalid timestamp from date:", date);
          return "Unknown date";
        }
      } catch (error) {
        console.error(
          "formatDate: Error calling getTime():",
          error,
          "Date:",
          date
        );
        return "Unknown date";
      }

      const now = new Date();
      const nowTimestamp = now.getTime();
      const diffTime = Math.abs(nowTimestamp - timestamp);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
      return `${Math.ceil(diffDays / 365)} years ago`;
    } catch (error) {
      console.error(
        "formatDate: Unexpected error:",
        error,
        "Input:",
        dateInput
      );
      return "Unknown date";
    }
  };

  // Função auxiliar para formatação segura de data curta
  const formatDateShort = (dateInput: string | Date | null | undefined) => {
    try {
      if (!dateInput) return "Unknown date";

      let date: Date;
      if (typeof dateInput === "string") {
        date = new Date(dateInput);
      } else if (dateInput instanceof Date) {
        date = dateInput;
      } else {
        return "Unknown date";
      }

      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return "Unknown date";
      }

      return date.toLocaleDateString();
    } catch (error) {
      console.error("formatDateShort: Error:", error, "Input:", dateInput);
      return "Unknown date";
    }
  };

  return (
    <Card
      className="hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 border-l-transparent hover:border-l-primary/50"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg leading-tight line-clamp-2 mb-2">
              {item.title}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
              <span className="font-medium truncate max-w-[150px]">
                {item.author || "Unknown"}
              </span>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span className="hidden sm:inline">
                  {formatDate(item.publishedAt)}
                </span>
                <span className="sm:hidden">
                  {formatDateShort(item.publishedAt)}
                </span>
              </div>
              {item.readingTime && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {item.readingTime} min
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex items-start gap-2 flex-shrink-0">
            <Badge
              variant="secondary"
              className={`${getTypeColor()} hidden sm:flex`}
            >
              <div className="flex items-center gap-1">
                {getTypeIcon()}
                <span className="capitalize">{item.contentType}</span>
              </div>
            </Badge>
            <Badge
              variant="secondary"
              className={`${getTypeColor()} sm:hidden p-1`}
            >
              {getTypeIcon()}
            </Badge>
            {onBookmarkToggle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmarkClick}
                disabled={isBookmarking}
                className="h-8 w-8 p-0 hover:bg-muted"
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
            <div className="w-20 h-14 sm:w-24 sm:h-16 flex-shrink-0">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover rounded-md"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {item.description}
            </p>
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.tags.slice(0, 2).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {item.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{item.tags.length - 2}
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
