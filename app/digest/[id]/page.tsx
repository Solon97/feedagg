"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  Search,
  Calendar,
  Clock,
  ExternalLink,
  Bookmark,
  Share2,
  MoreHorizontal,
  RefreshCw,
  Rss,
  Youtube,
  Globe,
  ChevronDown,
  Eye,
  TrendingUp,
  Settings,
  BookmarkCheck,
  Loader2,
  Filter,
  Grid3X3,
  List,
  X,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { useRouter } from "next/navigation"

interface DigestItem {
  id: string
  title: string
  description: string
  content?: string
  url: string
  provider: string
  providerType: "rss" | "youtube"
  publishedAt: string
  readTime: string
  thumbnail?: string
  author?: string
  isRead: boolean
  isSaved: boolean
}

interface DigestInfo {
  id: string
  title: string
  description: string
  lastUpdated: string
  totalItems: number
  providers: Array<{
    name: string
    type: "rss" | "youtube"
    itemCount: number
  }>
}

const ITEMS_PER_PAGE = 10

export default function DigestPage({ params }: { params: { id: string } }) {
  const [digestInfo, setDigestInfo] = useState<DigestInfo | null>(null)
  const [items, setItems] = useState<DigestItem[]>([])
  const [filteredItems, setFilteredItems] = useState<DigestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProvider, setSelectedProvider] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [showFilters, setShowFilters] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedSaved, setSelectedSaved] = useState<string>("all")

  const router = useRouter()
  const observerRef = useRef<IntersectionObserver>()
  const lastItemRef = useCallback(
    (node: HTMLDivElement) => {
      if (loadingMore) return
      if (observerRef.current) observerRef.current.disconnect()
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreItems()
        }
      })
      if (node) observerRef.current.observe(node)
    },
    [loadingMore, hasMore],
  )

  // Mock data generation
  const generateMockItems = (startIndex: number, count: number): DigestItem[] => {
    const providers = [
      { name: "TechCrunch", type: "rss" as const },
      { name: "Vercel", type: "youtube" as const },
      { name: "CSS-Tricks", type: "rss" as const },
      { name: "CodeWithMosh", type: "youtube" as const },
      { name: "Dev.to", type: "rss" as const },
      { name: "Fireship", type: "youtube" as const },
    ]

    const sampleTitles = [
      "The Future of Web Development: Trends to Watch in 2024",
      "Building Scalable React Applications with Modern Architecture",
      "Understanding TypeScript Generics: A Complete Guide",
      "CSS Grid vs Flexbox: When to Use Which Layout Method",
      "Next.js 14: New Features and Performance Improvements",
      "JavaScript Performance Optimization Techniques",
      "Building Accessible Web Components",
      "The Rise of Edge Computing in Web Development",
      "Modern State Management in React Applications",
      "Web Security Best Practices for Developers",
      "Serverless Architecture: Benefits and Challenges",
      "Progressive Web Apps: The Future of Mobile Web",
      "GraphQL vs REST: Choosing the Right API Strategy",
      "Docker for Frontend Developers: A Practical Guide",
      "Web Performance Metrics That Actually Matter",
    ]

    const sampleDescriptions = [
      "Explore the latest trends and technologies shaping the future of web development, from AI integration to new frameworks.",
      "Learn how to build scalable React applications using modern architecture patterns and best practices.",
      "A comprehensive guide to understanding and implementing TypeScript generics in your projects.",
      "Compare CSS Grid and Flexbox to understand when to use each layout method for optimal results.",
      "Discover the new features and performance improvements in Next.js 14 and how they can benefit your projects.",
      "Practical techniques for optimizing JavaScript performance in modern web applications.",
      "Best practices for building accessible web components that work for all users.",
      "Understanding how edge computing is revolutionizing web development and user experiences.",
      "Modern approaches to state management in React applications, including hooks and context.",
      "Essential security practices every web developer should implement to protect their applications.",
    ]

    return Array.from({ length: count }, (_, i) => {
      const index = startIndex + i
      const provider = providers[index % providers.length]
      const titleIndex = index % sampleTitles.length
      const descIndex = index % sampleDescriptions.length

      return {
        id: `item-${index}`,
        title: sampleTitles[titleIndex],
        description: sampleDescriptions[descIndex],
        url: `https://example.com/article/${index}`,
        provider: provider.name,
        providerType: provider.type,
        publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        readTime: `${Math.floor(Math.random() * 10) + 3} min`,
        thumbnail: `/placeholder.svg?height=200&width=300&text=${encodeURIComponent(provider.name)}`,
        author: provider.type === "youtube" ? provider.name : undefined,
        isRead: Math.random() > 0.7,
        isSaved: Math.random() > 0.8,
      }
    })
  }

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock digest info
      const mockDigestInfo: DigestInfo = {
        id: params.id,
        title: "Daily Tech News",
        description: "Your daily dose of technology news, tutorials, and insights from top sources",
        lastUpdated: new Date().toISOString(),
        totalItems: 150,
        providers: [
          { name: "TechCrunch", type: "rss", itemCount: 25 },
          { name: "Vercel", type: "youtube", itemCount: 15 },
          { name: "CSS-Tricks", type: "rss", itemCount: 30 },
          { name: "CodeWithMosh", type: "youtube", itemCount: 20 },
          { name: "Dev.to", type: "rss", itemCount: 35 },
          { name: "Fireship", type: "youtube", itemCount: 25 },
        ],
      }

      const initialItems = generateMockItems(0, ITEMS_PER_PAGE)

      setDigestInfo(mockDigestInfo)
      setItems(initialItems)
      setLoading(false)
    }

    loadInitialData()
  }, [params.id])

  // Load more items for infinite scroll
  const loadMoreItems = async () => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    const newItems = generateMockItems(items.length, ITEMS_PER_PAGE)

    if (newItems.length < ITEMS_PER_PAGE) {
      setHasMore(false)
    }

    setItems((prev) => [...prev, ...newItems])
    setPage((prev) => prev + 1)
    setLoadingMore(false)
  }

  // Filter and sort items
  useEffect(() => {
    let filtered = [...items]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.provider.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Provider filter
    if (selectedProvider !== "all") {
      filtered = filtered.filter((item) => item.provider === selectedProvider)
    }

    // Type filter
    if (selectedType !== "all") {
      filtered = filtered.filter((item) => item.providerType === selectedType)
    }

    // Saved status filter
    if (selectedSaved !== "all") {
      filtered = filtered.filter((item) => (selectedSaved === "saved" ? item.isSaved : !item.isSaved))
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        case "oldest":
          return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
        case "title":
          return a.title.localeCompare(b.title)
        case "provider":
          return a.provider.localeCompare(b.provider)
        default:
          return 0
      }
    })

    setFilteredItems(filtered)
  }, [items, searchQuery, selectedProvider, selectedType, selectedSaved, sortBy])

  // Refresh digest
  const handleRefresh = async () => {
    setRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    // In a real app, this would fetch new items from the API
    setRefreshing(false)
  }

  // Toggle item actions
  const toggleSaved = (itemId: string) => {
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, isSaved: !item.isSaved } : item)))
  }

  const markAsRead = (itemId: string) => {
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, isRead: true } : item)))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return "Yesterday"
    return date.toLocaleDateString()
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="px-4 md:px-6 py-4 md:py-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading your digest...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!digestInfo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="px-4 md:px-6 py-4 md:py-8 max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Digest Not Found</h2>
            <p className="text-gray-600 mb-6">The digest you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <a href="/">Return to Dashboard</a>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const hasActiveFilters =
    selectedProvider !== "all" || selectedType !== "all" || selectedSaved !== "all" || searchQuery !== ""

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="px-4 md:px-6 py-4 md:py-8 max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" asChild size="sm">
            <a href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </a>
          </Button>
        </div>

        {/* Digest Header */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                    {digestInfo.title}
                  </CardTitle>
                  <p className="text-gray-600 mb-4">{digestInfo.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Updated {formatDate(digestInfo.lastUpdated)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      <span>{digestInfo.providers.length} sources</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>{digestInfo.totalItems} total items</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Options</span>
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Settings className="w-4 h-4 mr-2" />
                        Edit Digest
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Digest
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        Mark All as Read
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Providers Overview */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-3">
            {digestInfo.providers.map((provider) => (
              <Badge key={provider.name} variant="secondary" className="flex items-center gap-2 px-3 py-2 text-sm">
                {provider.type === "youtube" ? (
                  <Youtube className="w-4 h-4 text-red-600" />
                ) : (
                  <Rss className="w-4 h-4 text-orange-600" />
                )}
                <span>{provider.name}</span>
                <span className="text-xs text-gray-500">({provider.itemCount})</span>
              </Badge>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search articles, videos, and topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
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
                    {(selectedProvider !== "all" ? 1 : 0) +
                      (selectedType !== "all" ? 1 : 0) +
                      (selectedSaved !== "all" ? 1 : 0) +
                      (searchQuery ? 1 : 0)}
                  </Badge>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </Button>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedProvider("all")
                    setSelectedType("all")
                    setSelectedSaved("all")
                  }}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 hidden sm:inline">{filteredItems.length} items</span>
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

          {/* Filters Section */}
          {showFilters && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Content Type Filters */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Content Type</h4>
                    <div className="flex flex-wrap gap-2">
                      {["rss", "youtube"].map((type) => {
                        const count = items.filter((item) => item.providerType === type).length
                        const isSelected = selectedType === type
                        const label = type === "rss" ? "Articles" : "Videos"
                        return (
                          <Button
                            key={type}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedType(isSelected ? "all" : type)}
                            className={`${
                              isSelected
                                ? "bg-teal-600 hover:bg-teal-700 text-white"
                                : "text-gray-600 hover:text-teal-600 hover:border-teal-600"
                            }`}
                          >
                            {label}
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

                  {/* Saved Status Filter */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Save Status</h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: "all", label: "All Items", count: items.length },
                        { value: "saved", label: "Saved", count: items.filter((item) => item.isSaved).length },
                        { value: "unsaved", label: "Not Saved", count: items.filter((item) => !item.isSaved).length },
                      ].map((status) => {
                        const isSelected = selectedSaved === status.value
                        return (
                          <Button
                            key={status.value}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedSaved(status.value)}
                            className={`${
                              isSelected
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
                      {digestInfo.providers.map((provider) => {
                        const count = items.filter((item) => item.provider === provider.name).length
                        const isSelected = selectedProvider === provider.name
                        return (
                          <Button
                            key={provider.name}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedProvider(isSelected ? "all" : provider.name)}
                            className={`text-xs md:text-sm ${
                              isSelected
                                ? "bg-teal-600 hover:bg-teal-700 text-white"
                                : "text-gray-600 hover:text-teal-600 hover:border-teal-600"
                            }`}
                          >
                            <span className="truncate max-w-[120px]">{provider.name}</span>
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
        </div>

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
              {selectedType !== "all" && (
                <Badge variant="secondary" className="bg-teal-100 text-teal-700">
                  {selectedType === "rss" ? "Articles" : "Videos"}
                  <button onClick={() => setSelectedType("all")} className="ml-1 hover:text-teal-900">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {selectedSaved !== "all" && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {selectedSaved === "saved" ? "Saved" : "Not Saved"}
                  <button onClick={() => setSelectedSaved("all")} className="ml-1 hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {selectedProvider !== "all" && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                  <span className="truncate max-w-[100px]">{selectedProvider}</span>
                  <button onClick={() => setSelectedProvider("all")} className="ml-1 hover:text-orange-900">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Sorting */}
        <div className="mb-6 flex justify-end">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="title">Title A-Z</SelectItem>
              <SelectItem value="provider">Source A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content Items */}
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </CardContent>
            </Card>
          ) : (
            filteredItems.map((item, index) => (
              <Card
                key={item.id}
                ref={index === filteredItems.length - 1 ? lastItemRef : null}
                className={`hover:shadow-md transition-all duration-200 ${
                  !item.isRead ? "border-l-4 border-l-teal-500" : ""
                }`}
              >
                <CardContent className="p-4 md:p-6">
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <img
                          src={item.thumbnail || "/placeholder.svg"}
                          alt={item.title}
                          className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg"
                          loading="lazy"
                        />
                        {item.providerType === "youtube" && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                              <div className="w-0 h-0 border-l-[6px] border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-1"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3
                          className={`font-semibold text-lg leading-tight line-clamp-2 cursor-pointer hover:text-teal-600 transition-colors ${
                            item.isRead ? "text-gray-700" : "text-gray-900"
                          }`}
                          onClick={() => {
                            markAsRead(item.id)
                            router.push(`/content/${item.id}`)
                          }}
                        >
                          {item.title}
                        </h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => window.open(item.url, "_blank")}>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Open Original
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleSaved(item.id)}>
                              {item.isSaved ? (
                                <BookmarkCheck className="w-4 h-4 mr-2" />
                              ) : (
                                <Bookmark className="w-4 h-4 mr-2" />
                              )}
                              {item.isSaved ? "Remove from Saved" : "Save for Later"}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => markAsRead(item.id)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Mark as Read
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <p className="text-gray-600 text-sm md:text-base line-clamp-2 mb-3">{item.description}</p>

                      {/* Meta Information */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          {item.providerType === "youtube" ? (
                            <Youtube className="w-4 h-4 text-red-600" />
                          ) : (
                            <Rss className="w-4 h-4 text-orange-600" />
                          )}
                          <span className="font-medium">{item.provider}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{item.readTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(item.publishedAt)}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            markAsRead(item.id)
                            router.push(`/content/${item.id}`)
                          }}
                          className="flex items-center gap-2 h-11"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span className="hidden sm:inline">Read</span>
                        </Button>
                        <Button
                          variant={item.isSaved ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleSaved(item.id)}
                          className={`flex items-center gap-2 h-11 ${
                            item.isSaved ? "bg-teal-600 hover:bg-teal-700 text-white" : ""
                          }`}
                        >
                          {item.isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                          <span className="hidden sm:inline">{item.isSaved ? "Saved" : "Save"}</span>
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center gap-2 h-11">
                          <Share2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Share</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {/* Loading More Indicator */}
          {loadingMore && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading more items...</span>
              </div>
            </div>
          )}

          {/* End of Content */}
          {!hasMore && filteredItems.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">You've reached the end of your digest</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
