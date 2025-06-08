"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Calendar,
  Clock,
  ExternalLink,
  Filter,
  Grid3X3,
  List,
  Play,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

// Import hooks and types
import { useCurrentUser } from "@/src/features/auth/hooks/use-current-user";
import { useFeedContent } from "@/src/features/news/hooks/use-feed-content";
import { useSaveContent } from "@/src/features/news/hooks/use-save-content";
import type { ContentItemEntity } from "@/src/core/entities/content-item.entity";

// Types
interface FeedContentFilters {
  contentTypes: string[];
  sources: string[];
  searchQuery: string;
  sortBy: "newest" | "oldest" | "popular" | "saved";
}

interface BookmarkState {
  contentItemId: string;
  savedContentId: string | null;
  isSaved: boolean;
}

type ViewMode = "grid" | "list";

export function NewsPageContent() {
  // Main states
  const [selectedContent, setSelectedContent] =
    useState<ContentItemEntity | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarkStates, setBookmarkStates] = useState<
    Map<string, BookmarkState>
  >(new Map());
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(false);

  // Local filters state
  const [localFilters, setLocalFilters] = useState<FeedContentFilters>({
    contentTypes: [],
    sources: [],
    searchQuery: "",
    sortBy: "newest",
  });

  const { user } = useCurrentUser();
  const {
    contentItems,
    isLoading,
    error,
    filters: hookFilters,
    updateFilters: updateHookFilters,
    refreshContent,
    hasMore,
    loadMore,
  } = useFeedContent(user?.id);

  const { toggleSave, getSavedContentByItemId, isSaving } = useSaveContent();

  // Ensure contentItems is always an array
  const safeContentItems = Array.isArray(contentItems) ? contentItems : [];

  // Get unique types and sources for filters
  const availableTypes = Array.from(
    new Set(safeContentItems.map((item) => item.contentType))
  );
  const availableSources = Array.from(
    new Set(safeContentItems.map((item) => item.author).filter(Boolean))
  ) as string[];

  // Load bookmark states for current content items
  const loadBookmarkStates = useCallback(async () => {
    if (!user || safeContentItems.length === 0) return;

    setIsLoadingBookmarks(true);
    const newStates = new Map<string, BookmarkState>();

    try {
      await Promise.all(
        safeContentItems.map(async (item) => {
          try {
            const savedContentResponse = await getSavedContentByItemId(item.id);
            newStates.set(item.id, {
              contentItemId: item.id,
              savedContentId: savedContentResponse.savedContentId,
              isSaved: savedContentResponse.saved,
            });
          } catch (error) {
            newStates.set(item.id, {
              contentItemId: item.id,
              savedContentId: null,
              isSaved: false,
            });
          }
        })
      );

      setBookmarkStates(newStates);
    } catch (error) {
      console.error("Failed to load bookmark states:", error);
    } finally {
      setIsLoadingBookmarks(false);
    }
  }, [user, safeContentItems, getSavedContentByItemId]);

  // Load bookmark states when content items change
  useEffect(() => {
    loadBookmarkStates();
  }, [loadBookmarkStates]);

  // Handle bookmark toggle
  const handleBookmarkToggle = async (contentId: string) => {
    if (!user) {
      toast.error("Please sign in to save content");
      return;
    }

    const currentState = bookmarkStates.get(contentId) || {
      contentItemId: contentId,
      savedContentId: null,
      isSaved: false,
    };

    try {
      const result = await toggleSave(
        contentId,
        currentState.isSaved,
        currentState.savedContentId || undefined
      );

      setBookmarkStates((prev) => {
        const newStates = new Map(prev);
        newStates.set(contentId, {
          contentItemId: contentId,
          savedContentId:
            result.action === "saved" ? result.savedContentId || null : null,
          isSaved: result.action === "saved",
        });
        return newStates;
      });

      if (result.action === "saved") {
        toast.success("Content saved successfully");
      } else {
        toast.success("Content removed from saved items");
      }
    } catch (error) {
      toast.error("Failed to save content. Please try again.");
    }
  };

  // Update hook filters when local filters change
  useEffect(() => {
    const hookSortBy =
      localFilters.sortBy === "saved"
        ? "newest"
        : localFilters.sortBy === "popular"
        ? "popular"
        : (localFilters.sortBy as "newest" | "oldest" | "popular");

    updateHookFilters({
      contentTypes: localFilters.contentTypes,
      sources: localFilters.sources,
      searchQuery: localFilters.searchQuery,
      sortBy: hookSortBy,
    });
  }, [localFilters, updateHookFilters]);

  // Filter and sort content locally for "saved" option
  const filteredAndSortedContent = (() => {
    let filtered = [...safeContentItems];

    // If sorting by saved, filter to show only saved items first
    if (localFilters.sortBy === "saved") {
      filtered.sort((a, b) => {
        const aBookmarked = bookmarkStates.get(a.id)?.isSaved || false;
        const bBookmarked = bookmarkStates.get(b.id)?.isSaved || false;
        if (aBookmarked && !bBookmarked) return -1;
        if (!aBookmarked && bBookmarked) return 1;
        return 0;
      });
    }

    return filtered;
  })();

  // Helper functions
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

  const clearFilters = () => {
    setLocalFilters({
      contentTypes: [],
      sources: [],
      searchQuery: "",
      sortBy: "newest",
    });
    setShowFilters(false);
  };

  const hasActiveFilters =
    localFilters.contentTypes.length > 0 ||
    localFilters.sources.length > 0 ||
    localFilters.searchQuery;

  const handleTypeToggle = (type: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      contentTypes: prev.contentTypes.includes(type)
        ? prev.contentTypes.filter((t) => t !== type)
        : [...prev.contentTypes, type],
    }));
  };

  const handleSourceToggle = (source: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      sources: prev.sources.includes(source)
        ? prev.sources.filter((s) => s !== source)
        : [...prev.sources, source],
    }));
  };

  // Content components
  const ContentCard = ({ item }: { item: ContentItemEntity }) => {
    const bookmarkState = bookmarkStates.get(item.id);
    const isBookmarked = bookmarkState?.isSaved || false;

    return (
      <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer border-0 shadow-sm bg-white hover:bg-gray-50/50">
        <div className="relative">
          {item.imageUrl && (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-48 object-cover rounded-t-lg"
            />
          )}
          {item.contentType === "video" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-t-lg">
              <Play className="h-12 w-12 text-white drop-shadow-lg" />
            </div>
          )}
          <Badge
            variant={item.contentType === "video" ? "destructive" : "secondary"}
            className="absolute top-3 left-3 text-xs font-medium"
          >
            {item.contentType === "video" ? "Video" : "Article"}
          </Badge>
          <Button
            variant="secondary"
            size="sm"
            className={`absolute top-3 right-3 h-8 w-8 p-0 ${
              isBookmarked
                ? "bg-teal-500 hover:bg-teal-600 text-white"
                : "bg-white/90 hover:bg-white text-gray-700"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              handleBookmarkToggle(item.id);
            }}
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        </div>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span className="font-medium text-teal-600">
                {item.author || "Unknown"}
              </span>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>
                  {item.readingTime ? `${item.readingTime} min` : "5 min"}
                </span>
              </div>
            </div>
            <h3
              className="font-semibold text-gray-900 line-clamp-2 group-hover:text-teal-600 transition-colors cursor-pointer"
              onClick={() => setSelectedContent(item)}
            >
              {item.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {item.description || item.excerpt}
            </p>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-xs hover:bg-teal-50 hover:text-teal-600"
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
  };

  const ContentListItem = ({ item }: { item: ContentItemEntity }) => {
    const bookmarkState = bookmarkStates.get(item.id);
    const isBookmarked = bookmarkState?.isSaved || false;

    return (
      <Card className="hover:shadow-md transition-all duration-300 group cursor-pointer border-0 shadow-sm bg-white hover:bg-gray-50/50">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-shrink-0">
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-24 h-18 object-cover rounded-lg"
                />
              )}
              {item.contentType === "video" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                  <Play className="h-6 w-6 text-white drop-shadow-lg" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        item.contentType === "video"
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {item.contentType === "video" ? "Video" : "Article"}
                    </Badge>
                    <span className="text-sm font-medium text-teal-600">
                      {item.author || "Unknown"}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>
                        {item.readingTime ? `${item.readingTime} min` : "5 min"}
                      </span>
                    </div>
                  </div>
                  <h3
                    className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-1 cursor-pointer"
                    onClick={() => setSelectedContent(item)}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {item.description || item.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(item.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    className={`h-8 w-8 p-0 ${
                      isBookmarked
                        ? "bg-teal-500 hover:bg-teal-600 text-white"
                        : "bg-white hover:bg-gray-100 text-gray-700"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookmarkToggle(item.id);
                    }}
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="h-4 w-4" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-xs hover:bg-teal-50 hover:text-teal-600"
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
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Detail view component
  if (selectedContent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setSelectedContent(null)}
              className="mb-4 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Feeds
            </Button>
          </div>

          <article className="bg-white rounded-lg shadow-sm p-8">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Badge
                  variant={
                    selectedContent.contentType === "video"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {selectedContent.contentType === "video"
                    ? "Video"
                    : "Article"}
                </Badge>
                <span className="text-sm font-medium text-teal-600">
                  {selectedContent.author || "Unknown"}
                </span>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>
                    {selectedContent.readingTime
                      ? `${selectedContent.readingTime} min`
                      : "5 min"}
                  </span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {selectedContent.title}
              </h1>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Published{" "}
                    {new Date(selectedContent.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={
                      bookmarkStates.get(selectedContent.id)?.isSaved
                        ? "bg-teal-50 border-teal-200 text-teal-700"
                        : ""
                    }
                    onClick={() => handleBookmarkToggle(selectedContent.id)}
                  >
                    {bookmarkStates.get(selectedContent.id)?.isSaved ? (
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
                    onClick={() => window.open(selectedContent.url, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Original
                  </Button>
                </div>
              </div>
            </div>

            {selectedContent.contentType === "video" &&
            selectedContent.url.includes("youtube") ? (
              <div className="mb-8">
                <div className="aspect-video w-full">
                  <iframe
                    src={convertYouTubeUrl(selectedContent.url)}
                    title={selectedContent.title}
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              </div>
            ) : (
              <div className="mb-8">
                {selectedContent.imageUrl && (
                  <img
                    src={selectedContent.imageUrl}
                    alt={selectedContent.title}
                    className="w-full h-64 object-cover rounded-lg mb-6"
                  />
                )}
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {selectedContent.description ||
                      selectedContent.excerpt ||
                      selectedContent.content}
                  </p>
                </div>
              </div>
            )}

            {/* Tags */}
            {selectedContent.tags && selectedContent.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                {selectedContent.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </article>
        </div>
      </div>
    );
  }

  // Main list view
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Latest from Your Feeds
              </h1>
              <p className="text-gray-600 mt-2">
                Stay updated with the latest content from your subscribed
                sources
              </p>
            </div>
            <Button
              onClick={refreshContent}
              disabled={isLoading}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh Feeds
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search content..."
                value={localFilters.searchQuery}
                onChange={(e) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    searchQuery: e.target.value,
                  }))
                }
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center border rounded-lg p-1 bg-white">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="p-2"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="p-2"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Sort Dropdown */}
              <Select
                value={localFilters.sortBy}
                onValueChange={(
                  value: "newest" | "oldest" | "popular" | "saved"
                ) => setLocalFilters((prev) => ({ ...prev, sortBy: value }))}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="saved">Saved</SelectItem>
                </SelectContent>
              </Select>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={`${
                  hasActiveFilters
                    ? "bg-teal-50 border-teal-200 text-teal-700"
                    : ""
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-teal-100 text-teal-700"
                  >
                    {localFilters.contentTypes.length +
                      localFilters.sources.length +
                      (localFilters.searchQuery ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card className="mt-4 p-4 bg-white">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Filters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Clear All
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Content Types */}
                  <div>
                    <h4 className="font-medium mb-2">Content Type</h4>
                    <div className="flex flex-wrap gap-2">
                      {availableTypes.map((type) => (
                        <Badge
                          key={type}
                          variant={
                            localFilters.contentTypes.includes(type)
                              ? "default"
                              : "outline"
                          }
                          className="cursor-pointer"
                          onClick={() => handleTypeToggle(type)}
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Sources */}
                  <div>
                    <h4 className="font-medium mb-2">Sources</h4>
                    <div className="flex flex-wrap gap-2">
                      {availableSources.slice(0, 10).map((source) => (
                        <Badge
                          key={source}
                          variant={
                            localFilters.sources.includes(source)
                              ? "default"
                              : "outline"
                          }
                          className="cursor-pointer"
                          onClick={() => handleSourceToggle(source)}
                        >
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Content Grid/List */}
        {error && (
          <Card className="p-6 text-center mb-6">
            <h3 className="text-red-600 font-semibold mb-2">
              Error Loading Content
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={refreshContent} variant="outline">
              Try Again
            </Button>
          </Card>
        )}

        {filteredAndSortedContent.length === 0 && !isLoading ? (
          <Card className="p-12 text-center bg-white">
            <div className="text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No content found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or check back later for new content.
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            </div>
          </Card>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }
          >
            {filteredAndSortedContent.map((item) =>
              viewMode === "grid" ? (
                <ContentCard key={item.id} item={item} />
              ) : (
                <ContentListItem key={item.id} item={item} />
              )
            )}
          </div>
        )}

        {/* Load More */}
        {hasMore && filteredAndSortedContent.length > 0 && (
          <div className="text-center py-6">
            <Button onClick={loadMore} disabled={isLoading} variant="outline">
              {isLoading ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && filteredAndSortedContent.length === 0 && (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Results Summary */}
        {filteredAndSortedContent.length > 0 && (
          <div className="text-center py-4 text-sm text-gray-500">
            Showing {filteredAndSortedContent.length}
            {filteredAndSortedContent.length === 1 ? " article" : " articles"}
            {hasActiveFilters && " (filtered)"}
          </div>
        )}
      </div>
    </div>
  );
}
