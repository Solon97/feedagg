"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Search,
  Filter,
  RefreshCw,
  ArrowLeft,
  ExternalLink,
  Clock,
  Calendar,
  Bookmark,
  BookmarkCheck,
  Play,
  Video,
  FileText,
  X,
  ChevronDown,
  ChevronUp,
  Star,
  TrendingUp,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { useCurrentUser } from "@/src/features/auth/hooks/use-current-user";
import { useFeedContent } from "@/src/features/news/hooks/use-feed-content";
import { useSaveContent } from "@/src/features/news/hooks/use-save-content";
import { useContentSources } from "@/src/features/content-sources/hooks/use-content-sources";
import { ContentItemEntity } from "@/src/core/entities/content-item.entity";

// Custom hook for debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface QuickFilter {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  filter: Partial<SimpleFilters>;
  description: string;
}

interface ReadingTimeRange {
  id: string;
  label: string;
  minTime: number;
  maxTime: number | null;
  description: string;
}

interface BookmarkState {
  contentItemId: string;
  savedContentId: string | null;
  isSaved: boolean;
}

interface SimpleFilters {
  searchQuery: string;
  contentTypes: string[];
  sources: string[];
  categories: string[];
  minReadTime?: number;
  maxReadTime?: number;
  sortBy: "newest" | "oldest" | "popular";
}

export function NewsPageContent() {
  // Main states
  const [selectedContent, setSelectedContent] =
    useState<ContentItemEntity | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarkStates, setBookmarkStates] = useState<
    Map<string, BookmarkState>
  >(new Map());
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(false);

  // Simplified filters state
  const [filters, setFilters] = useState<SimpleFilters>({
    searchQuery: "",
    contentTypes: [],
    sources: [],
    categories: [],
    sortBy: "newest",
  });

  // Debounced search query
  const debouncedSearchQuery = useDebounce(filters.searchQuery, 500);

  const { user } = useCurrentUser();
  const {
    contentItems,
    isLoading,
    error,
    updateFilters: updateHookFilters,
    refreshContent,
    hasMore,
    loadMore,
  } = useFeedContent(user?.id);

  const { toggleSave, getSavedContentByItemId } = useSaveContent();

  // Get user's content sources for real categories and sources
  const { contentSources } = useContentSources(user?.id || "");

  // Ensure contentItems is always an array
  const safeContentItems = Array.isArray(contentItems) ? contentItems : [];

  // Get unique types, sources and categories for filters
  const { availableTypes, availableSources, availableCategories } =
    useMemo(() => {
      // Always show Articles and Videos options
      const types = ["article", "video"];

      // Use active feed sources instead of content item authors
      const activeSources = Array.from(
        new Set(
          contentSources
            .filter((source) => source.isActive)
            .map((source) => source.name)
        )
      );

      // Get real categories from user's feed subscriptions
      const categories = Array.from(
        new Set(contentSources.map((source) => source.category).filter(Boolean))
      ) as string[];

      return {
        availableTypes: types,
        availableSources: activeSources,
        availableCategories: categories,
      };
    }, [safeContentItems, contentSources]);

  // Reading time ranges with better UX
  const readingTimeRanges: ReadingTimeRange[] = useMemo(
    () => [
      {
        id: "short",
        label: "Short",
        minTime: 0,
        maxTime: 5,
        description: "0-5 minutes",
      },
      {
        id: "medium",
        label: "Medium",
        minTime: 5,
        maxTime: 15,
        description: "5-15 minutes",
      },
      {
        id: "long",
        label: "Long",
        minTime: 15,
        maxTime: null,
        description: "15+ minutes",
      },
    ],
    []
  );

  const applyReadingTimeRange = useCallback((range: ReadingTimeRange) => {
    setFilters((prev) => {
      // Check if this range is already active
      const expectedMaxTime =
        range.maxTime === null ? undefined : range.maxTime;
      const isCurrentlyActive =
        prev.minReadTime === range.minTime &&
        prev.maxReadTime === expectedMaxTime;

      if (isCurrentlyActive) {
        // Remove the filter if it's already active (toggle off)
        return {
          ...prev,
          minReadTime: undefined,
          maxReadTime: undefined,
        };
      } else {
        // Apply the filter if it's not active (toggle on)
        return {
          ...prev,
          minReadTime: range.minTime,
          maxReadTime: expectedMaxTime,
        };
      }
    });
  }, []);

  const isReadingTimeRangeActive = useCallback(
    (range: ReadingTimeRange): boolean => {
      const expectedMaxTime =
        range.maxTime === null ? undefined : range.maxTime;
      return (
        filters.minReadTime === range.minTime &&
        filters.maxReadTime === expectedMaxTime
      );
    },
    [filters.minReadTime, filters.maxReadTime]
  );

  // Load bookmark states
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
    updateHookFilters({
      contentTypes: filters.contentTypes,
      sources: filters.sources,
      searchQuery: debouncedSearchQuery,
      sortBy: filters.sortBy,
    });
  }, [
    filters.contentTypes,
    filters.sources,
    debouncedSearchQuery,
    filters.sortBy,
    updateHookFilters,
  ]);

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
    setFilters({
      searchQuery: "",
      contentTypes: [],
      sources: [],
      categories: [],
      sortBy: "newest",
    });
    setShowFilters(false);
    toast.success("All filters cleared");
  };

  const hasActiveFilters =
    filters.contentTypes.length > 0 ||
    filters.sources.length > 0 ||
    filters.categories.length > 0 ||
    filters.searchQuery.length > 0 ||
    (filters.minReadTime && filters.minReadTime > 0) ||
    (filters.maxReadTime && filters.maxReadTime < 60);

  const removeFilter = (
    type: "contentType" | "source" | "category" | "search",
    value?: string
  ) => {
    setFilters((prev) => {
      switch (type) {
        case "contentType":
          return {
            ...prev,
            contentTypes: prev.contentTypes.filter((t) => t !== value),
          };
        case "source":
          return { ...prev, sources: prev.sources.filter((s) => s !== value) };
        case "category":
          return {
            ...prev,
            categories: prev.categories.filter((c) => c !== value),
          };
        case "search":
          return { ...prev, searchQuery: "" };
        default:
          return prev;
      }
    });
  };

  // Content Card Component
  const ContentCard = ({ item }: { item: ContentItemEntity }) => {
    const bookmarkState = bookmarkStates.get(item.id);
    const isBookmarked = bookmarkState?.isSaved || false;

    return (
      <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer border-0 shadow-sm bg-white hover:bg-gray-50/50">
        <div className="relative">
          <div className="w-full h-48 bg-gray-100 rounded-t-lg overflow-hidden">
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
              className={`w-full h-full flex items-center justify-center bg-gray-100 ${
                item.imageUrl ? "hidden" : ""
              }`}
            >
              <div className="text-center text-gray-400">
                <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-lg flex items-center justify-center">
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
                    {selectedContent.description || selectedContent.excerpt}
                  </p>
                </div>
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
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Latest from Your Feeds
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Stay updated with the latest content from your subscribed sources
            </p>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search and Sort Row */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search content..."
                  value={filters.searchQuery}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      searchQuery: e.target.value,
                    }))
                  }
                  className="pl-10"
                />
                {debouncedSearchQuery !== filters.searchQuery && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <RefreshCw className="h-3 w-3 animate-spin text-gray-400" />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Select
                  value={filters.sortBy}
                  onValueChange={(value: "newest" | "oldest" | "popular") =>
                    setFilters((prev) => ({ ...prev, sortBy: value }))
                  }
                >
                  <SelectTrigger className="w-full sm:w-36">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="popular">Popular</SelectItem>
                  </SelectContent>
                </Select>

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
                  <span className="hidden sm:inline">Filters</span>
                  {showFilters ? (
                    <ChevronUp className="h-4 w-4 ml-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-2" />
                  )}
                  {hasActiveFilters && (
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-teal-100 text-teal-700"
                    >
                      {filters.contentTypes.length +
                        filters.sources.length +
                        filters.categories.length +
                        (filters.searchQuery ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg border">
                <span className="text-sm font-medium text-gray-700">
                  Active filters:
                </span>

                {filters.searchQuery && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    <Search className="h-3 w-3 mr-1" />"{filters.searchQuery}"
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-2 text-blue-600 hover:text-blue-800"
                      onClick={() => removeFilter("search")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {filters.contentTypes.map((type) => (
                  <Badge
                    key={type}
                    variant="secondary"
                    className="bg-teal-50 text-teal-700 border-teal-200"
                  >
                    {type === "video" ? (
                      <Video className="h-3 w-3 mr-1" />
                    ) : (
                      <FileText className="h-3 w-3 mr-1" />
                    )}
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-2 text-teal-600 hover:text-teal-800"
                      onClick={() => removeFilter("contentType", type)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}

                {filters.sources.map((source) => (
                  <Badge
                    key={source}
                    variant="secondary"
                    className="bg-purple-50 text-purple-700 border-purple-200"
                  >
                    {source}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-2 text-purple-600 hover:text-purple-800"
                      onClick={() => removeFilter("source", source)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}

                {filters.categories.map((category) => (
                  <Badge
                    key={category}
                    variant="secondary"
                    className="bg-orange-50 text-orange-700 border-orange-200"
                  >
                    {category}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-2 text-orange-600 hover:text-orange-800"
                      onClick={() => removeFilter("category", category)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear all
                </Button>
              </div>
            )}

            {/* Expandable Filter Panel */}
            {showFilters && (
              <Card className="bg-white border shadow-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-8">
                    {/* Filter Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-teal-100 to-teal-200 rounded-lg">
                          <Filter className="h-5 w-5 text-teal-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Advanced Filters
                          </h3>
                          <p className="text-sm text-gray-500">
                            Customize your content feed
                          </p>
                        </div>
                      </div>
                      {hasActiveFilters && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearFilters}
                          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Clear all
                        </Button>
                      )}
                    </div>

                    <div className="space-y-6">
                      {/* Content Types */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-900">
                          Content Types
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {availableTypes.map((type) => {
                            const isSelected =
                              filters.contentTypes.includes(type);
                            const Icon = type === "video" ? Video : FileText;
                            const count = safeContentItems.filter(
                              (item) => item.contentType === type
                            ).length;

                            return (
                              <button
                                key={type}
                                onClick={() => {
                                  if (isSelected) {
                                    setFilters((prev) => ({
                                      ...prev,
                                      contentTypes: prev.contentTypes.filter(
                                        (t) => t !== type
                                      ),
                                    }));
                                  } else {
                                    setFilters((prev) => ({
                                      ...prev,
                                      contentTypes: [
                                        ...prev.contentTypes,
                                        type,
                                      ],
                                    }));
                                  }
                                }}
                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 border ${
                                  isSelected
                                    ? "bg-teal-50 text-teal-700 border-teal-200"
                                    : "bg-white text-gray-700 border-gray-200 hover:border-teal-200 hover:bg-gray-50"
                                }`}
                              >
                                <Icon className="h-4 w-4" />
                                <span>
                                  {type.charAt(0).toUpperCase() + type.slice(1)}
                                  s
                                </span>
                                <Badge
                                  variant="secondary"
                                  className={`text-xs ${
                                    isSelected
                                      ? "bg-teal-100 text-teal-600"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {count}
                                </Badge>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Sources */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-900">
                          Sources ({availableSources.length})
                        </label>
                        {availableSources.length > 0 ? (
                          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                            {availableSources.map((source) => {
                              const isSelected =
                                filters.sources.includes(source);
                              const count = safeContentItems.filter(
                                (item) => item.author === source
                              ).length;

                              return (
                                <button
                                  key={source}
                                  onClick={() => {
                                    if (isSelected) {
                                      setFilters((prev) => ({
                                        ...prev,
                                        sources: prev.sources.filter(
                                          (s) => s !== source
                                        ),
                                      }));
                                    } else {
                                      setFilters((prev) => ({
                                        ...prev,
                                        sources: [...prev.sources, source],
                                      }));
                                    }
                                  }}
                                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors duration-200 border ${
                                    isSelected
                                      ? "bg-teal-50 text-teal-700 border-teal-200"
                                      : "bg-white text-gray-700 border-gray-200 hover:border-teal-200 hover:bg-gray-50"
                                  }`}
                                >
                                  <span className="truncate max-w-[120px]">
                                    {source}
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    className={`text-xs ${
                                      isSelected
                                        ? "bg-teal-100 text-teal-600"
                                        : "bg-gray-100 text-gray-600"
                                    }`}
                                  >
                                    {count}
                                  </Badge>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-gray-500">
                            <Search className="h-6 w-6 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">
                              No active sources available
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Add content sources in your settings
                            </p>
                          </div>
                        )}
                        {filters.sources.length > 0 && (
                          <div className="pt-2 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                {filters.sources.length} source
                                {filters.sources.length > 1 ? "s" : ""} selected
                              </span>
                              <button
                                onClick={() =>
                                  setFilters((prev) => ({
                                    ...prev,
                                    sources: [],
                                  }))
                                }
                                className="text-xs text-teal-600 hover:text-teal-800"
                              >
                                Clear sources
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Categories */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-900">
                          Categories
                        </label>
                        {availableCategories.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {availableCategories.map((category) => {
                              const isSelected =
                                filters.categories.includes(category);
                              const categoryContentCount =
                                safeContentItems.filter(
                                  (item) =>
                                    contentSources.find(
                                      (source) => source.name === item.author
                                    )?.category === category
                                ).length;

                              return (
                                <button
                                  key={category}
                                  onClick={() => {
                                    if (isSelected) {
                                      setFilters((prev) => ({
                                        ...prev,
                                        categories: prev.categories.filter(
                                          (c) => c !== category
                                        ),
                                      }));
                                    } else {
                                      setFilters((prev) => ({
                                        ...prev,
                                        categories: [
                                          ...prev.categories,
                                          category,
                                        ],
                                      }));
                                    }
                                  }}
                                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 border ${
                                    isSelected
                                      ? "bg-teal-50 text-teal-700 border-teal-200"
                                      : "bg-white text-gray-700 border-gray-200 hover:border-teal-200 hover:bg-gray-50"
                                  }`}
                                >
                                  <span className="truncate">{category}</span>
                                  <Badge
                                    variant="secondary"
                                    className={`text-xs ${
                                      isSelected
                                        ? "bg-teal-100 text-teal-600"
                                        : "bg-gray-100 text-gray-600"
                                    }`}
                                  >
                                    {categoryContentCount}
                                  </Badge>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-gray-500">
                            <div className="w-10 h-10 mx-auto mb-2 bg-gray-100 rounded-lg flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                />
                              </svg>
                            </div>
                            <p className="text-sm">No categories available</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Categories will appear when you add content
                              sources
                            </p>
                          </div>
                        )}
                        {filters.categories.length > 0 && (
                          <div className="pt-2 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                {filters.categories.length} categor
                                {filters.categories.length > 1
                                  ? "ies"
                                  : "y"}{" "}
                                selected
                              </span>
                              <button
                                onClick={() =>
                                  setFilters((prev) => ({
                                    ...prev,
                                    categories: [],
                                  }))
                                }
                                className="text-xs text-teal-600 hover:text-teal-800"
                              >
                                Clear categories
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Reading Time */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-900">
                          Reading Time
                        </label>

                        {/* Quick Time Ranges */}
                        <div className="flex flex-wrap gap-2">
                          {readingTimeRanges.map((range) => {
                            const isActive = isReadingTimeRangeActive(range);
                            return (
                              <button
                                key={range.id}
                                onClick={() => applyReadingTimeRange(range)}
                                className={`inline-flex flex-col items-center px-3 py-2 rounded-lg text-sm transition-colors duration-200 border ${
                                  isActive
                                    ? "bg-teal-50 text-teal-700 border-teal-200"
                                    : "bg-white text-gray-700 border-gray-200 hover:border-teal-200 hover:bg-gray-50"
                                }`}
                              >
                                <span className="font-medium">
                                  {range.label}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {range.description}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Active Range Indicator */}
                        {(filters.minReadTime !== undefined ||
                          filters.maxReadTime !== undefined) && (
                          <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                            <div className="flex items-center gap-2 text-teal-700">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                Reading time: {filters.minReadTime || 0} -{" "}
                                {filters.maxReadTime || "∞"} minutes
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Content Grid/List */}
        {error && (
          <Card className="p-6 text-center mb-6 border-red-200 bg-red-50">
            <div className="text-red-600">
              <X className="h-12 w-12 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Error Loading Content</h3>
              <p className="text-sm mb-4">{error}</p>
              <Button
                onClick={refreshContent}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </Card>
        )}

        {safeContentItems.length === 0 && !isLoading ? (
          <Card className="p-12 text-center bg-white border-gray-200">
            <div className="text-gray-500">
              <Search className="h-16 w-16 mx-auto mb-6 text-gray-300" />
              <h3 className="text-xl font-semibold mb-3 text-gray-700">
                No content found
              </h3>
              {hasActiveFilters ? (
                <div className="space-y-3">
                  <p className="text-gray-600">
                    No content matches your current filters. Try adjusting your
                    search criteria.
                  </p>
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="mt-4"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear All Filters
                  </Button>
                </div>
              ) : (
                <p className="text-gray-600">
                  Check back later for new content from your feeds.
                </p>
              )}
            </div>
          </Card>
        ) : (
          <>
            {/* Results Summary */}
            {safeContentItems.length > 0 && (
              <div className="mb-6 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full text-sm text-gray-600">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <span>
                    Showing {safeContentItems.length}{" "}
                    {safeContentItems.length === 1 ? "article" : "articles"}
                    {hasActiveFilters && " (filtered)"}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {safeContentItems.map((item) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}

        {/* Loading State */}
        {isLoading && safeContentItems.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse border-gray-200">
                <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-t-lg"></div>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && safeContentItems.length > 0 && (
          <div className="text-center py-8">
            <Button
              onClick={loadMore}
              disabled={isLoading}
              variant="outline"
              className="px-8 py-3 text-sm font-medium"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Loading more...
                </>
              ) : (
                <>Load More Content</>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
