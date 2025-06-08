"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, ExternalLink, Play } from "lucide-react";
import { toast } from "sonner";

import { ContentItemCard } from "./content-item-card";
import { ContentFilters } from "./content-filters";
import { useFeedContent } from "../hooks/use-feed-content";
import { useSaveContent } from "../hooks/use-save-content";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import type { ContentItemEntity } from "@/core/entities/content-item.entity";

export function NewsPageContent() {
  const [selectedContent, setSelectedContent] =
    useState<ContentItemEntity | null>(null);
  const [savedContentIds, setSavedContentIds] = useState<Set<string>>(
    new Set()
  );

  const { user } = useCurrentUser();
  const {
    contentItems,
    isLoading,
    error,
    filters,
    updateFilters,
    refreshContent,
    hasMore,
    loadMore,
  } = useFeedContent();

  const { saveContent, unsaveContent, toggleSave, isSaving } = useSaveContent();

  // Get unique types and sources for filters
  const availableTypes = Array.from(
    new Set(contentItems.map((item) => item.contentType))
  );
  const availableSources = Array.from(
    new Set(contentItems.map((item) => item.author).filter(Boolean))
  ) as string[];

  const handleBookmarkToggle = async (contentId: string) => {
    if (!user) {
      toast.error("Please sign in to save content");
      return;
    }

    const isCurrentlySaved = savedContentIds.has(contentId);

    try {
      await toggleSave(contentId, user.id, isCurrentlySaved);

      setSavedContentIds((prev) => {
        const newSet = new Set(prev);
        if (isCurrentlySaved) {
          newSet.delete(contentId);
          toast.success("Content removed from saved items");
        } else {
          newSet.add(contentId);
          toast.success("Content saved successfully");
        }
        return newSet;
      });
    } catch (error) {
      toast.error("Failed to save content. Please try again.");
    }
  };

  const handleOpenContent = (item: ContentItemEntity) => {
    setSelectedContent(item);
  };

  const convertYouTubeUrl = (url: string) => {
    if (!url) return "";

    if (url.includes("youtube.com/watch")) {
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get("v");
      const timestamp = urlObj.searchParams.get("t");

      let embedUrl = `https://www.youtube.com/embed/${videoId}`;
      if (timestamp) {
        const startTime = timestamp.replace("s", "");
        embedUrl += `?start=${startTime}`;
      }
      return embedUrl;
    }

    return url.replace("watch?v=", "embed/");
  };

  // Load more content when scrolling near bottom
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        if (hasMore && !isLoading) {
          loadMore();
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, isLoading, loadMore]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 text-center">
          <CardTitle className="text-red-600 mb-2">
            Error Loading Content
          </CardTitle>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={refreshContent}>Try Again</Button>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Filters */}
        <ContentFilters
          filters={filters}
          onFiltersChange={updateFilters}
          availableTypes={availableTypes}
          availableSources={availableSources}
          onRefresh={refreshContent}
          isLoading={isLoading}
        />

        {/* Content Grid */}
        {contentItems.length === 0 && !isLoading ? (
          <Card className="p-8 text-center">
            <CardTitle className="mb-2">No Content Found</CardTitle>
            <p className="text-muted-foreground">
              Try adjusting your filters or refresh the page to see more
              content.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {contentItems.map((item) => (
              <ContentItemCard
                key={item.id}
                item={item}
                isBookmarked={savedContentIds.has(item.id)}
                onBookmarkToggle={handleBookmarkToggle}
                onOpenContent={handleOpenContent}
                isBookmarking={isSaving}
              />
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="text-center py-4">
            <Button onClick={loadMore} disabled={isLoading} variant="outline">
              {isLoading ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && contentItems.length === 0 && (
          <div className="grid gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <div className="w-24 h-16 bg-muted rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-4/5"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Content Detail Dialog */}
      <Dialog
        open={!!selectedContent}
        onOpenChange={() => setSelectedContent(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedContent && (
            <>
              <DialogHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedContent(null)}
                    className="mt-1"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex-1">
                    <DialogTitle className="text-xl mb-2">
                      {selectedContent.title}
                    </DialogTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{selectedContent.author || "Unknown"}</span>
                      <span>•</span>
                      <span>
                        {new Date(
                          selectedContent.publishedAt
                        ).toLocaleDateString()}
                      </span>
                      {selectedContent.readingTime && (
                        <>
                          <span>•</span>
                          <span>{selectedContent.readingTime} min read</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => window.open(selectedContent.url, "_blank")}
                    className="gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Original
                  </Button>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                {/* Video Content */}
                {selectedContent.contentType === "video" &&
                  selectedContent.url.includes("youtube") && (
                    <div className="aspect-video">
                      <iframe
                        src={convertYouTubeUrl(selectedContent.url)}
                        className="w-full h-full rounded-lg"
                        allowFullScreen
                        title={selectedContent.title}
                      />
                    </div>
                  )}

                {/* Article Content */}
                {selectedContent.contentType === "article" && (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    {selectedContent.imageUrl && (
                      <img
                        src={selectedContent.imageUrl}
                        alt={selectedContent.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedContent.description}
                    </p>
                  </div>
                )}

                {/* Tags */}
                {selectedContent.tags && selectedContent.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    {selectedContent.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
