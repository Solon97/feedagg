"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ExternalLink,
  MoreHorizontal,
  Clock,
  Calendar,
  Filter,
  X,
  ArrowLeft,
  Search,
  ChevronDown,
  Play,
  CheckCircle,
  Circle,
  Trash2,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SavedContentManager } from "@/lib/saved-content-manager";

interface SavedContentItem {
  id: number;
  title: string;
  source: string;
  type: "article" | "video";
  readTime: string;
  savedDate: string;
  thumbnail: string;
  content?: string;
  videoUrl?: string;
  isConsumed: boolean; // Add consumed status
  excerpt?: string;
  url?: string;
  publishedDate?: string;
}
export default function SavedContent() {
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [filteredContent, setFilteredContent] = useState<SavedContentItem[]>(
    []
  );

  const [previousFilterState, setPreviousFilterState] = useState<{
    types: string[];
    providers: string[];
    search: string;
  }>({
    types: [],
    providers: [],
    search: "",
  });
  const [selectedConsumed, setSelectedConsumed] = useState<string>("all");

  const [savedContent, setSavedContent] = useState<SavedContentItem[]>([]);
  // Load saved content from localStorage on component mount
  useEffect(() => {
    const loadSavedContent = () => {
      const savedItems = SavedContentManager.getSavedContent();
      setSavedContent(savedItems);
    };

    loadSavedContent();

    // Listen for storage changes to sync across tabs
    const handleStorageChange = () => {
      loadSavedContent();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Get unique content types and sources (providers)
  const contentTypes = [...new Set(savedContent.map((item) => item.type))];
  const contentProviders = [
    ...new Set(savedContent.map((item) => item.source)),
  ].sort();

  // Filter content based on selected filters and search
  useEffect(() => {
    let filtered = [...savedContent];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.source.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Content Type Filters
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((item) => selectedTypes.includes(item.type));
    }

    // Content Source/Provider Filters
    if (selectedProviders.length > 0) {
      filtered = filtered.filter((item) =>
        selectedProviders.includes(item.source)
      );
    }

    // Consumed status filter
    if (selectedConsumed !== "all") {
      filtered = filtered.filter((item) =>
        selectedConsumed === "consumed" ? item.isConsumed : !item.isConsumed
      );
    } // Sort
    filtered.sort((a, b) => {
      // First, sort by consumption status (unconsumed first)
      if (a.isConsumed !== b.isConsumed) {
        return a.isConsumed ? 1 : -1;
      }

      // Then apply the selected sort order
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.savedDate).getTime() - new Date(a.savedDate).getTime()
          );
        case "oldest":
          return (
            new Date(a.savedDate).getTime() - new Date(b.savedDate).getTime()
          );
        case "title":
          return a.title.localeCompare(b.title);
        case "source":
          return a.source.localeCompare(b.source);
        default:
          return 0;
      }
    });

    setFilteredContent(filtered);
  }, [
    selectedTypes,
    selectedProviders,
    searchQuery,
    selectedConsumed,
    sortBy,
    savedContent,
  ]);

  const toggleTypeFilter = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleProviderFilter = (provider: string) => {
    setSelectedProviders((prev) =>
      prev.includes(provider)
        ? prev.filter((p) => p !== provider)
        : [...prev, provider]
    );
  };
  const clearAllFilters = () => {
    setSelectedTypes([]);
    setSelectedProviders([]);
    setSearchQuery("");
    setSelectedConsumed("all");
  };

  const hasActiveFilters =
    selectedTypes.length > 0 ||
    selectedProviders.length > 0 ||
    searchQuery !== "" ||
    selectedConsumed !== "all";

  const openDetailView = (content: any) => {
    // Save current filter state before opening detail view
    setPreviousFilterState({
      types: [...selectedTypes],
      providers: [...selectedProviders],
      search: searchQuery,
    });
    setSelectedContent(content);
  };
  const closeDetailView = () => {
    setSelectedContent(null);
    // Restore previous filter state
    setSelectedTypes(previousFilterState.types);
    setSelectedProviders(previousFilterState.providers);
    setSearchQuery(previousFilterState.search);
  };
  const toggleConsumed = (itemId: number) => {
    setSavedContent((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, isConsumed: !item.isConsumed } : item
      )
    );
    // Also update in SavedContentManager
    const content = savedContent.find((item) => item.id === itemId);
    if (content) {
      SavedContentManager.updateConsumptionStatus(itemId, !content.isConsumed);
    }

    // Update selectedContent if it's the same item being toggled
    if (selectedContent && selectedContent.id === itemId) {
      setSelectedContent((prev: any) => ({
        ...prev,
        isConsumed: !prev.isConsumed,
      }));
    }
  };

  const handleRemoveFromSaved = (itemId: number) => {
    const itemToRemove = savedContent.find((item) => item.id === itemId);
    if (itemToRemove) {
      // Remove from saved content manager
      SavedContentManager.removeSavedContent(itemToRemove.id);
      // Update local state
      setSavedContent((prev) => prev.filter((item) => item.id !== itemId));
    }
  };

  const convertYouTubeUrl = (url: string) => {
    if (!url) return "";

    // Handle YouTube URLs with timestamps and parameters
    if (url.includes("youtube.com/watch")) {
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get("v");
      const timestamp = urlObj.searchParams.get("t");

      let embedUrl = `https://www.youtube.com/embed/${videoId}`;
      if (timestamp) {
        // Convert timestamp (e.g., "4850s" to "start=4850")
        const startTime = timestamp.replace("s", "");
        embedUrl += `?start=${startTime}`;
      }
      return embedUrl;
    }

    // Fallback for other URL formats
    return url.replace("watch?v=", "embed/");
  };
  const SavedContentCard = ({ item }: { item: SavedContentItem }) => (
    <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer border-0 shadow-sm bg-white dark:bg-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
      <div className="relative">
        <img
          src={item.thumbnail || "/placeholder.svg"}
          alt={item.title}
          className={`w-full h-48 object-cover rounded-t-lg ${
            item.isConsumed ? "opacity-60" : ""
          }`}
        />
        {item.type === "video" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-t-lg">
            <Play className="h-12 w-12 text-white drop-shadow-lg" />
          </div>
        )}
        <Badge
          variant={item.type === "video" ? "destructive" : "secondary"}
          className="absolute top-3 left-3 text-xs font-medium"
        >
          {item.type === "video" ? "Video" : "Article"}
        </Badge>
        {item.isConsumed && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
              ✓ Consumed
            </Badge>
          </div>
        )}
        {/* Action buttons - adapted for saved content */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-1">
            <Button
              variant="secondary"
              size="sm"
              className="h-8 w-8 p-0 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700"
              onClick={(e) => {
                e.stopPropagation();
                toggleConsumed(item.id);
              }}
              title={
                item.isConsumed ? "Mark as not consumed" : "Mark as consumed"
              }
            >
              {item.isConsumed ? (
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <Circle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              )}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="h-8 w-8 p-0 bg-white/90 dark:bg-gray-800/90 hover:bg-red-50 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFromSaved(item.id);
              }}
              title="Remove from saved"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <CardContent className="p-4" onClick={() => openDetailView(item)}>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium text-teal-600 dark:text-teal-400">
              {item.source}
            </span>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>{item.readTime}</span>
            </div>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
            {item.title}
          </h3>
          {item.excerpt && (
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {item.excerpt}
            </p>
          )}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="h-3 w-3" />
              <span>Saved {item.savedDate}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs hover:bg-teal-50 dark:hover:bg-teal-900/50 hover:text-teal-600 dark:hover:text-teal-400"
              onClick={(e) => {
                e.stopPropagation();
                window.open(item.url || item.videoUrl, "_blank");
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
  if (selectedContent) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />

        {/* Detail View */}
        <main className="px-4 md:px-6 py-4 md:py-8 max-w-7xl mx-auto">
          {/* Back Button */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={closeDetailView}
              className="flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/50 border-teal-200 dark:border-teal-700"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Saved Content</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>

          <div className="max-w-4xl mx-auto">
            {selectedContent.type === "article" ? (
              // Article View
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader className="pb-4 md:pb-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4 leading-tight">
                        {selectedContent.title}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-3 md:gap-6 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-teal-600 dark:text-teal-400">
                            {selectedContent.source}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{selectedContent.readTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Saved {selectedContent.savedDate}</span>
                        </div>
                      </div>
                    </div>{" "}
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs md:text-sm border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() =>
                          window.open(selectedContent.url, "_blank")
                        }
                      >
                        <ExternalLink className="w-4 h-4 mr-1 md:mr-2" />
                        <span className="hidden sm:inline">Open Original</span>
                        <span className="sm:hidden">Open</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleConsumed(selectedContent.id)}
                        className={
                          selectedContent.isConsumed
                            ? "bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700"
                            : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }
                      >
                        {selectedContent.isConsumed ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleRemoveFromSaved(selectedContent.id);
                          closeDetailView();
                        }}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/50 border-red-200 dark:border-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-sm md:prose-lg max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{
                      __html: selectedContent.content,
                    }}
                  />
                </CardContent>
              </Card>
            ) : (
              // Video View
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader className="pb-4 md:pb-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4 leading-tight">
                        {selectedContent.title}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-3 md:gap-6 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-teal-600 dark:text-teal-400">
                            {selectedContent.source}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{selectedContent.readTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Saved {selectedContent.savedDate}</span>
                        </div>
                      </div>
                    </div>{" "}
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs md:text-sm border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() =>
                          window.open(
                            selectedContent.videoUrl || selectedContent.url,
                            "_blank"
                          )
                        }
                      >
                        <ExternalLink className="w-4 h-4 mr-1 md:mr-2" />
                        <span className="hidden sm:inline">
                          Open on YouTube
                        </span>
                        <span className="sm:hidden">YouTube</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleConsumed(selectedContent.id)}
                        className={
                          selectedContent.isConsumed
                            ? "bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700"
                            : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }
                      >
                        {selectedContent.isConsumed ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleRemoveFromSaved(selectedContent.id);
                          closeDetailView();
                        }}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/50 border-red-200 dark:border-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>{" "}
                <CardContent>
                  <div className="aspect-video w-full">
                    <iframe
                      src={convertYouTubeUrl(selectedContent.videoUrl)}
                      title={selectedContent.title}
                      className="w-full h-full rounded-lg"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Main Content */}
      <main className="px-4 md:px-6 py-4 md:py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Saved Content
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Access your saved articles and videos for later reading
          </p>
        </div>
        {/* Search and Controls */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            <Input
              placeholder="Search articles and videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>{" "}
          {/* Controls Row */}{" "}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>{" "}
                {hasActiveFilters && (
                  <Badge
                    variant="secondary"
                    className="ml-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400"
                  >
                    {selectedTypes.length +
                      selectedProviders.length +
                      (searchQuery ? 1 : 0)}
                  </Badge>
                )}
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </Button>{" "}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>{" "}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
                {filteredContent.length} items
              </span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                  <SelectItem value="source">Source A-Z</SelectItem>{" "}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        {/* Filters Section */}
        {showFilters && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {" "}
                {/* Content Type Filters */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Content Type
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {contentTypes.map((type) => {
                      const count = savedContent.filter(
                        (item) => item.type === type
                      ).length;
                      const isSelected = selectedTypes.includes(type);
                      return (
                        <Button
                          key={type}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleTypeFilter(type)}
                          className={`capitalize ${
                            isSelected
                              ? "bg-teal-600 hover:bg-teal-700 text-white"
                              : "text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:border-teal-600 dark:hover:border-teal-400"
                          }`}
                        >
                          {type}{" "}
                          <Badge
                            variant="secondary"
                            className={`ml-2 ${
                              isSelected
                                ? "bg-teal-500 text-white"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                            }`}
                          >
                            {count}
                          </Badge>
                        </Button>
                      );
                    })}
                  </div>
                </div>
                {/* Consumed Status Filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Status
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      {
                        value: "all",
                        label: "All Items",
                        count: savedContent.length,
                      },
                      {
                        value: "consumed",
                        label: "Consumed",
                        count: savedContent.filter((item) => item.isConsumed)
                          .length,
                      },
                      {
                        value: "unconsumed",
                        label: "Not Consumed",
                        count: savedContent.filter((item) => !item.isConsumed)
                          .length,
                      },
                    ].map((status) => {
                      const isSelected = selectedConsumed === status.value;
                      return (
                        <Button
                          key={status.value}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedConsumed(status.value)}
                          className={`${
                            isSelected
                              ? "bg-teal-600 hover:bg-teal-700 text-white"
                              : "text-gray-600 hover:text-teal-600 hover:border-teal-600"
                          }`}
                        >
                          {status.label}
                          <Badge
                            variant="secondary"
                            className={`ml-2 ${
                              isSelected
                                ? "bg-teal-500 text-white"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {status.count}
                          </Badge>
                        </Button>
                      );
                    })}
                  </div>
                </div>{" "}
                {/* Content Source/Provider Filters */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Source
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {contentProviders.map((provider) => {
                      const count = savedContent.filter(
                        (item) => item.source === provider
                      ).length;
                      const isSelected = selectedProviders.includes(provider);
                      return (
                        <Button
                          key={provider}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleProviderFilter(provider)}
                          className={`text-xs md:text-sm ${
                            isSelected
                              ? "bg-teal-600 hover:bg-teal-700 text-white"
                              : "text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:border-teal-600 dark:hover:border-teal-400"
                          }`}
                        >
                          <span className="truncate max-w-[120px]">
                            {provider}
                          </span>
                          <Badge
                            variant="secondary"
                            className={`ml-2 ${
                              isSelected
                                ? "bg-teal-500 text-white"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                            }`}
                          >
                            {count}
                          </Badge>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {/* Active Filters Display */}{" "}
        {hasActiveFilters && (
          <div className="mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Active filters:
              </span>
              {searchQuery && (
                <Badge
                  variant="secondary"
                  className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                >
                  Search: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery("")}
                    className="ml-1 hover:text-purple-900 dark:hover:text-purple-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {selectedTypes.map((type) => (
                <Badge
                  key={`type-${type}`}
                  variant="secondary"
                  className="bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
                >
                  {type}
                  <button
                    onClick={() => toggleTypeFilter(type)}
                    className="ml-1 hover:text-teal-900 dark:hover:text-teal-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {selectedProviders.map((provider) => (
                <Badge
                  key={`provider-${provider}`}
                  variant="secondary"
                  className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                >
                  <span className="truncate max-w-[100px]">{provider}</span>
                  <button
                    onClick={() => toggleProviderFilter(provider)}
                    className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {selectedConsumed !== "all" && (
                <Badge
                  key={`consumed-${selectedConsumed}`}
                  variant="secondary"
                  className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  {selectedConsumed === "consumed"
                    ? "Consumed"
                    : "Not Consumed"}
                  <button
                    onClick={() => setSelectedConsumed("all")}
                    className="ml-1 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}{" "}
        {/* Content Grid/List */}{" "}
        {filteredContent.length === 0 ? (
          <Card className="p-12 text-center bg-white dark:bg-gray-800">
            <div className="text-gray-500 dark:text-gray-400">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
                {hasActiveFilters
                  ? "No content matches your filters"
                  : "No saved content yet"}
              </h3>
              <p className="text-sm">
                {hasActiveFilters
                  ? "Try adjusting your filters or search query"
                  : "Articles and videos you save will appear here"}
              </p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  className="mt-4 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={clearAllFilters}
                >
                  Clear all filters
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredContent.map((item) => (
              <SavedContentCard key={item.id} item={item} />
            ))}
          </div>
        )}
        {/* Results Summary */}{" "}
        {filteredContent.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredContent.length} of {savedContent.length} saved
            items
            {hasActiveFilters && " (filtered)"}
          </div>
        )}
      </main>
    </div>
  );
}
