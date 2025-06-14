import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Calendar,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Loader2,
} from "lucide-react";
import type { NewsContentCardProps } from "../types/news.types";

export function NewsContentCard({
  item,
  isBookmarked,
  isSaving = false,
  onBookmarkToggle,
  onContentSelect,
}: NewsContentCardProps) {
  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer border-0 shadow-sm bg-white dark:bg-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
      <div className="relative">
        <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-t-lg overflow-hidden">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                target.nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : null}
          <div
            className={`w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 ${
              item.imageUrl ? "hidden" : ""
            }`}
          >
            <div className="text-center text-gray-400 dark:text-gray-500">
              <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="text-xs">No image</span>
            </div>
          </div>
        </div>
        <Badge
          variant={item.contentType === "video" ? "destructive" : "secondary"}
          className="absolute top-3 left-3 text-xs font-medium"
        >
          {item.contentType === "video" ? "Video" : "Article"}
        </Badge>
        <Button
          variant="secondary"
          size="sm"
          disabled={isSaving}
          className={`absolute top-3 right-3 h-8 w-8 p-0 ${
            isBookmarked
              ? "bg-teal-500 hover:bg-teal-600 text-white"
              : "bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
          } ${isSaving ? "opacity-70" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            if (!isSaving) {
              onBookmarkToggle(item.id);
            }
          }}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isBookmarked ? (
            <BookmarkCheck className="h-4 w-4" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
        </Button>
      </div>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium text-teal-600 dark:text-teal-400">
              {item.author || "Unknown"}
            </span>
            {item.readingTime && (
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>{item.readingTime} min</span>
              </div>
            )}
          </div>
          <h3
            className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors cursor-pointer"
            onClick={() => onContentSelect(item)}
          >
            {item.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {item.description || item.excerpt}
          </p>
          <div className="flex items-center justify-between pt-2">
            {item.publishedAt &&
            new Date(item.publishedAt).getFullYear() > 1970 ? (
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="h-3 w-3" />
                <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
              </div>
            ) : (
              <div></div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-600 dark:hover:text-teal-400"
              onClick={(e) => {
                e.stopPropagation();
                window.open(item.url, "_blank");
              }}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
