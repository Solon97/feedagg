import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
} from "lucide-react";
import type { ContentItemEntity } from "@/src/core/entities/content-item.entity";
import { convertYouTubeUrl } from "../constants/news.constants";

interface NewsContentDetailProps {
  content: ContentItemEntity;
  isBookmarked: boolean;
  onBookmarkToggle: (id: string) => void;
  onBack: () => void;
}

export function NewsContentDetail({
  content,
  isBookmarked,
  onBookmarkToggle,
  onBack,
}: NewsContentDetailProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Feeds
          </Button>
        </div>

        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Badge
                variant={
                  content.contentType === "video" ? "destructive" : "secondary"
                }
              >
                {content.contentType === "video" ? "Video" : "Article"}
              </Badge>
              <span className="text-sm font-medium text-teal-600 dark:text-teal-400">
                {content.author || "Unknown"}
              </span>
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span>
                  {content.readingTime ? `${content.readingTime} min` : "5 min"}
                </span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {content.title}
            </h1>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>
                  Published {new Date(content.publishedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={
                    isBookmarked
                      ? "bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-900/20 dark:border-teal-700 dark:text-teal-300"
                      : "dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  }
                  onClick={() => onBookmarkToggle(content.id)}
                >
                  {isBookmarked ? (
                    <>
                      <BookmarkCheck className="h-4 w-4 mr-2" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-4 w-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={() => window.open(content.url, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Original
                </Button>
              </div>
            </div>
          </div>

          {content.contentType === "video" &&
          content.url.includes("youtube") ? (
            <div className="mb-8">
              <div className="aspect-video w-full">
                <iframe
                  src={convertYouTubeUrl(content.url)}
                  title={content.title}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            </div>
          ) : (
            <div className="mb-8">
              {content.imageUrl && (
                <img
                  src={content.imageUrl}
                  alt={content.title}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {content.description || content.excerpt}
                </p>
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
