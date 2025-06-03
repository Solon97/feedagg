"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  ExternalLink,
  MoreHorizontal,
  Clock,
  Calendar,
  Filter,
  X,
  ArrowLeft,
  Search,
  Grid3X3,
  List,
  ChevronDown,
  Play,
  CheckCircle,
  Circle,
  Trash2,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SavedContentManager } from "@/lib/saved-content-manager"

interface SavedContentItem {
  id: number
  title: string
  source: string
  type: "article" | "video"
  readTime: string
  savedDate: string
  thumbnail: string
  content?: string
  videoUrl?: string
  isConsumed: boolean // Add consumed status
}

export default function SavedContent() {
  const [selectedContent, setSelectedContent] = useState<any>(null)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedProviders, setSelectedProviders] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<string>("newest")
  const [filteredContent, setFilteredContent] = useState<SavedContentItem[]>([])

  const [previousFilterState, setPreviousFilterState] = useState<{
    types: string[]
    providers: string[]
    search: string
  }>({
    types: [],
    providers: [],
    search: "",
  })
  const [selectedConsumed, setSelectedConsumed] = useState<string>("all")

  const [savedContent, setSavedContent] = useState<SavedContentItem[]>([])
  // Load saved content from localStorage on component mount
  useEffect(() => {
    const loadSavedContent = () => {
      const savedItems = SavedContentManager.getSavedContent()
      setSavedContent(savedItems)
    }

    loadSavedContent()

    // Listen for storage changes to sync across tabs
    const handleStorageChange = () => {
      loadSavedContent()
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Get unique content types and sources (providers)
  const contentTypes = [...new Set(savedContent.map((item) => item.type))]
  const contentProviders = [...new Set(savedContent.map((item) => item.source))].sort()

  // Filter content based on selected filters and search
  useEffect(() => {
    let filtered = [...savedContent]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.source.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Content Type Filters
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((item) => selectedTypes.includes(item.type))
    }

    // Content Source/Provider Filters
    if (selectedProviders.length > 0) {
      filtered = filtered.filter((item) => selectedProviders.includes(item.source))
    }

    // Consumed status filter
    if (selectedConsumed !== "all") {
      filtered = filtered.filter((item) => (selectedConsumed === "consumed" ? item.isConsumed : !item.isConsumed))
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.savedDate).getTime() - new Date(a.savedDate).getTime()
        case "oldest":
          return new Date(a.savedDate).getTime() - new Date(b.savedDate).getTime()
        case "title":
          return a.title.localeCompare(b.title)
        case "source":
          return a.source.localeCompare(b.source)
        default:
          return 0
      }
    })

    setFilteredContent(filtered)
  }, [selectedTypes, selectedProviders, searchQuery, selectedConsumed, sortBy, savedContent])

  const toggleTypeFilter = (type: string) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  const toggleProviderFilter = (provider: string) => {
    setSelectedProviders((prev) => (prev.includes(provider) ? prev.filter((p) => p !== provider) : [...prev, provider]))
  }

  const clearAllFilters = () => {
    setSelectedTypes([])
    setSelectedProviders([])
    setSearchQuery("")
    setSelectedConsumed("all")
  }

  const hasActiveFilters =
    selectedTypes.length > 0 || selectedProviders.length > 0 || searchQuery !== "" || selectedConsumed !== "all"

  const openDetailView = (content: any) => {
    // Save current filter state before opening detail view
    setPreviousFilterState({
      types: [...selectedTypes],
      providers: [...selectedProviders],
      search: searchQuery,
    })
    setSelectedContent(content)
  }

  const closeDetailView = () => {
    setSelectedContent(null)
    // Restore previous filter state
    setSelectedTypes(previousFilterState.types)
    setSelectedProviders(previousFilterState.providers)
    setSearchQuery(previousFilterState.search)
  }
  const toggleConsumed = (itemId: number) => {
    setSavedContent((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, isConsumed: !item.isConsumed } : item)),
    )
  }
  const convertYouTubeUrl = (url: string) => {
    if (!url) return ""

    // Handle YouTube URLs with timestamps and parameters
    if (url.includes("youtube.com/watch")) {
      const urlObj = new URL(url)
      const videoId = urlObj.searchParams.get("v")
      const timestamp = urlObj.searchParams.get("t")

      let embedUrl = `https://www.youtube.com/embed/${videoId}`
      if (timestamp) {
        // Convert timestamp (e.g., "4850s" to "start=4850")
        const startTime = timestamp.replace("s", "")
        embedUrl += `?start=${startTime}`
      }
      return embedUrl
    }

    // Fallback for other URL formats
    return url.replace("watch?v=", "embed/")
  }

  const handleRemoveFromSaved = (itemId: number) => {
    const itemToRemove = savedContent.find(item => item.id === itemId)
    if (itemToRemove) {
      // Remove from saved content manager
      SavedContentManager.removeSavedContent(itemToRemove.id)
      // Update local state
      setSavedContent(prev => prev.filter(item => item.id !== itemId))
    }
  }

  if (selectedContent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        {/* Detail View */}
        <main className="px-4 md:px-6 py-4 md:py-8 max-w-7xl mx-auto">
          {/* Back Button */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={closeDetailView}
              className="flex items-center gap-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 border-teal-200"
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
              <Card>
                <CardHeader className="pb-4 md:pb-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight">
                        {selectedContent.title}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-3 md:gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{selectedContent.source}</span>
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
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm" className="text-xs md:text-sm">
                        <ExternalLink className="w-4 h-4 mr-1 md:mr-2" />
                        <span className="hidden sm:inline">Open Original</span>
                        <span className="sm:hidden">Open</span>
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-sm md:prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedContent.content }}
                  />
                </CardContent>
              </Card>
            ) : (
              // Video View
              <Card>
                <CardHeader className="pb-4 md:pb-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight">
                        {selectedContent.title}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-3 md:gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{selectedContent.source}</span>
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
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm" className="text-xs md:text-sm">
                        <ExternalLink className="w-4 h-4 mr-1 md:mr-2" />
                        <span className="hidden sm:inline">Open on YouTube</span>
                        <span className="sm:hidden">YouTube</span>
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>                <CardContent>
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
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Main Content */}
      <main className="px-4 md:px-6 py-4 md:py-8 max-w-7xl mx-auto">
        {/* Search and Controls */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search articles and videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {/* Test Integration Button - Temporary */}
              <Button
                onClick={() => {
                  SavedContentManager.addTestData()
                  // Trigger reload of saved content
                  const savedItems = SavedContentManager.getSavedContent()
                  setSavedContent(savedItems)
                }}
                variant="outline"
                size="sm"
                className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
              >
                Add Test Data
              </Button>
              <Button
                onClick={() => {
                  localStorage.removeItem('digestly-saved-content')
                  setSavedContent([])
                }}
                variant="outline"
                size="sm"
                className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
              >
                Clear All
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 bg-teal-100 text-teal-700">
                    {selectedTypes.length + selectedProviders.length + (searchQuery ? 1 : 0)}
                  </Badge>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </Button>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 hidden sm:inline">{filteredContent.length} items</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                  <SelectItem value="source">Source A-Z</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={`rounded-none ${viewMode === "grid" ? "bg-teal-600 text-white" : ""}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={`rounded-none ${viewMode === "list" ? "bg-teal-600 text-white" : ""}`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Content Type Filters */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Content Type</h4>
                  <div className="flex flex-wrap gap-2">
                    {contentTypes.map((type) => {
                      const count = savedContent.filter((item) => item.type === type).length
                      const isSelected = selectedTypes.includes(type)
                      return (
                        <Button
                          key={type}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleTypeFilter(type)}
                          className={`capitalize ${isSelected
                            ? "bg-teal-600 hover:bg-teal-700 text-white"
                            : "text-gray-600 hover:text-teal-600 hover:border-teal-600"
                            }`}
                        >
                          {type}
                          <Badge
                            variant="secondary"
                            className={`ml-2 ${isSelected ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-600"}`}
                          >
                            {count}
                          </Badge>
                        </Button>
                      )
                    })}
                  </div>
                </div>

                {/* Consumed Status Filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "all", label: "All Items", count: savedContent.length },
                      {
                        value: "consumed",
                        label: "Consumed",
                        count: savedContent.filter((item) => item.isConsumed).length,
                      },
                      {
                        value: "unconsumed",
                        label: "Not Consumed",
                        count: savedContent.filter((item) => !item.isConsumed).length,
                      },
                    ].map((status) => {
                      const isSelected = selectedConsumed === status.value
                      return (
                        <Button
                          key={status.value}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedConsumed(status.value)}
                          className={`${isSelected
                            ? "bg-teal-600 hover:bg-teal-700 text-white"
                            : "text-gray-600 hover:text-teal-600 hover:border-teal-600"
                            }`}
                        >
                          {status.label}
                          <Badge
                            variant="secondary"
                            className={`ml-2 ${isSelected ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-600"}`}
                          >
                            {status.count}
                          </Badge>
                        </Button>
                      )
                    })}
                  </div>
                </div>

                {/* Content Source/Provider Filters */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Source</h4>
                  <div className="flex flex-wrap gap-2">
                    {contentProviders.map((provider) => {
                      const count = savedContent.filter((item) => item.source === provider).length
                      const isSelected = selectedProviders.includes(provider)
                      return (
                        <Button
                          key={provider}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleProviderFilter(provider)}
                          className={`text-xs md:text-sm ${isSelected
                            ? "bg-teal-600 hover:bg-teal-700 text-white"
                            : "text-gray-600 hover:text-teal-600 hover:border-teal-600"
                            }`}
                        >
                          <span className="truncate max-w-[120px]">{provider}</span>
                          <Badge
                            variant="secondary"
                            className={`ml-2 ${isSelected ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-600"}`}
                          >
                            {count}
                          </Badge>
                        </Button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-purple-900">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {selectedTypes.map((type) => (
                <Badge key={`type-${type}`} variant="secondary" className="bg-teal-100 text-teal-700">
                  {type}
                  <button onClick={() => toggleTypeFilter(type)} className="ml-1 hover:text-teal-900">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {selectedProviders.map((provider) => (
                <Badge key={`provider-${provider}`} variant="secondary" className="bg-blue-100 text-blue-700">
                  <span className="truncate max-w-[100px]">{provider}</span>
                  <button onClick={() => toggleProviderFilter(provider)} className="ml-1 hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {selectedConsumed !== "all" && (
                <Badge key={`consumed-${selectedConsumed}`} variant="secondary" className="bg-gray-100 text-gray-700">
                  {selectedConsumed === "consumed" ? "Consumed" : "Not Consumed"}
                  <button onClick={() => setSelectedConsumed("all")} className="ml-1 hover:text-gray-900">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Content Display */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl md:text-2xl font-semibold text-gray-900">
              Your Saved Articles ({filteredContent.length})
              {hasActiveFilters && (
                <span className="text-base font-normal text-gray-500 ml-2">of {savedContent.length} total</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredContent.length === 0 ? (
              <div className="text-center py-12">
                {hasActiveFilters ? (
                  <>
                    <p className="text-gray-500 text-lg mb-4">No content matches your filters</p>
                    <p className="text-gray-400 mb-4">Try adjusting your filter criteria</p>
                    <Button variant="outline" onClick={clearAllFilters}>
                      Clear All Filters
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-gray-500 text-lg mb-4">No saved content yet</p>
                    <p className="text-gray-400">Articles and videos you save will appear here</p>
                  </>
                )}
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredContent.map((content) => (
                  <div
                    key={content.id}
                    onClick={() => openDetailView(content)}
                    className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-95"
                  >
                    {/* Thumbnail */}
                    <div className="relative">
                      <img
                        src={content.thumbnail || "/placeholder.svg"}
                        alt={content.title}
                        className={`w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-200 ${content.isConsumed ? "opacity-60" : ""
                          }`}
                        loading="lazy"
                      />
                      {content.isConsumed && (
                        <div className="absolute top-3 right-3">
                          <div className="bg-green-100 text-green-700 px-2 py-1 text-xs font-medium rounded-full">
                            ✓ Consumed
                          </div>
                        </div>
                      )}
                      {/* Content Type Badge */}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${content.type === "video" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                            }`}
                        >
                          {content.type === "video" && <Play className="w-3 h-3" />}
                          {content.type === "video" ? "Video" : "Article"}
                        </span>
                      </div>
                      {/* Actions */}
                      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleConsumed(content.id)
                            }}
                            title={content.isConsumed ? "Mark as not consumed" : "Mark as consumed"}
                          >
                            {content.isConsumed ? (
                              <CheckCircle className="w-3 h-3 text-green-600" />
                            ) : (
                              <Circle className="w-3 h-3" />
                            )}
                          </Button>                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                            onClick={(e) => {
                              e.stopPropagation()
                              // Handle external link
                            }}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 w-8 p-0 bg-white/90 hover:bg-red-50 text-red-600 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveFromSaved(content.id)
                            }}
                            title="Remove from saved"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                            onClick={(e) => {
                              e.stopPropagation()
                              // Handle more options
                            }}
                          >
                            <MoreHorizontal className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors text-sm md:text-base leading-tight">
                        {content.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                        <span className="truncate flex-1 mr-2">{content.source}</span>
                        <span className="flex-shrink-0">{content.readTime}</span>
                      </div>
                      <div className="text-xs text-gray-400">Saved {content.savedDate}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List View
              <div className="space-y-3">
                {filteredContent.map((content) => (
                  <div
                    key={content.id}
                    onClick={() => openDetailView(content)}
                    className="group flex gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.99]"
                  >
                    {/* Thumbnail */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={content.thumbnail || "/placeholder.svg"}
                        alt={content.title}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                        loading="lazy"
                      />
                      {content.type === "video" && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                            <Play className="w-3 h-3 text-white ml-0.5" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-teal-600 transition-colors text-sm md:text-base leading-tight">
                        {content.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-gray-500 mb-2">
                        <span className="font-medium">{content.source}</span>
                        <span>•</span>
                        <span>{content.readTime}</span>
                        <span>•</span>
                        <span>Saved {content.savedDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={`text-xs ${content.type === "video" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                            }`}
                        >
                          {content.type === "video" ? "Video" : "Article"}
                        </Badge>
                      </div>
                    </div>                    {/* Actions */}
                    <div className="flex-shrink-0 flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveFromSaved(content.id)
                        }}
                        title="Remove from saved"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Handle more options
                        }}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
