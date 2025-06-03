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
    Bookmark,
    BookmarkCheck,
    RefreshCw,
    Heart,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SavedContentManager } from "@/lib/saved-content-manager"

interface FeedContentItem {
    id: number
    title: string
    source: string
    type: "article" | "video"
    readTime: string
    publishedDate: string
    thumbnail: string
    content?: string
    videoUrl?: string
    isSaved: boolean
    excerpt: string
    url: string
}

export default function FeedsPage() {
    const [selectedContent, setSelectedContent] = useState<any>(null)
    const [selectedTypes, setSelectedTypes] = useState<string[]>([])
    const [selectedProviders, setSelectedProviders] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [showFilters, setShowFilters] = useState(false)
    const [sortBy, setSortBy] = useState<string>("newest")
    const [filteredContent, setFilteredContent] = useState<FeedContentItem[]>([])
    const [isRefreshing, setIsRefreshing] = useState(false)

    const [previousFilterState, setPreviousFilterState] = useState<{
        types: string[]
        providers: string[]
        search: string
    }>({
        types: [],
        providers: [],
        search: "",
    })

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

    const [feedContent, setFeedContent] = useState<FeedContentItem[]>([
        {
            id: 1,
            title: "Next.js 14: The Complete Guide to App Router",
            source: "Vercel Blog",
            type: "article",
            readTime: "12 min",
            publishedDate: "2 hours ago",
            thumbnail: "/placeholder.svg?height=200&width=300",
            isSaved: false,
            excerpt: "Explore the new App Router in Next.js 14 with comprehensive examples and best practices for modern web development.",
            url: "https://vercel.com/blog/nextjs-14-app-router-guide",
            content: `
        <h2>Next.js 14: Revolutionizing React Development</h2>
        <p>Next.js 14 introduces the revolutionary App Router, bringing significant improvements to how we build React applications. This new routing system provides enhanced performance, better developer experience, and more intuitive file-based routing.</p>
        
        <h3>Key Features of App Router</h3>
        <p>The App Router introduces several groundbreaking features including improved data fetching, better SEO optimization, and enhanced streaming capabilities.</p>
        
        <h3>Migration Guide</h3>
        <p>Learn how to migrate from the Pages Router to the new App Router with step-by-step instructions and best practices.</p>
      `,
        },
        {
            id: 2,
            title: "Understanding React Server Components",
            source: "React Blog",
            type: "article",
            readTime: "8 min",
            publishedDate: "4 hours ago",
            thumbnail: "/placeholder.svg?height=200&width=300",
            isSaved: true,
            excerpt: "Dive deep into React Server Components and learn how they can improve your app's performance and user experience.",
            url: "https://react.dev/blog/react-server-components",
            content: `
        <h2>React Server Components Explained</h2>
        <p>React Server Components represent a new paradigm in React development, allowing components to render on the server and stream to the client.</p>
        
        <h3>Benefits of Server Components</h3>
        <ul>
          <li>Reduced bundle size</li>
          <li>Improved initial page load</li>
          <li>Better SEO performance</li>
          <li>Direct database access</li>
        </ul>
        
        <h3>Implementation Examples</h3>
        <p>See practical examples of how to implement Server Components in your React applications.</p>
      `,
        },
        {
            id: 3,
            title: "CSS Grid Mastery: Advanced Techniques",
            source: "CSS-Tricks",
            type: "article",
            readTime: "15 min",
            publishedDate: "6 hours ago",
            thumbnail: "/placeholder.svg?height=200&width=300",
            isSaved: false,
            excerpt: "Master advanced CSS Grid techniques including subgrid, container queries, and complex layout patterns.",
            url: "https://css-tricks.com/css-grid-advanced-techniques",
            content: `
        <h2>Advanced CSS Grid Techniques</h2>
        <p>Take your CSS Grid skills to the next level with these advanced techniques and patterns.</p>
        
        <h3>Subgrid Implementation</h3>
        <p>Learn how to use the new subgrid feature to create more flexible and maintainable layouts.</p>
        
        <h3>Container Queries with Grid</h3>
        <p>Combine container queries with CSS Grid for truly responsive component-based layouts.</p>
      `,
        },
        {
            id: 4,
            title: "Building Modern APIs with TypeScript",
            source: "Dev.to",
            type: "video",
            readTime: "22 min",
            publishedDate: "8 hours ago",
            thumbnail: "/placeholder.svg?height=200&width=300",
            videoUrl: "https://www.youtube.com/watch?v=2RWsLmu8yVc&t=4850s",
            isSaved: false,
            excerpt: "Learn to build robust, type-safe APIs using TypeScript, Express, and modern development practices.",
            url: "https://dev.to/building-apis-typescript",
        },
        {
            id: 5,
            title: "Tailwind CSS v3.4: New Features Overview",
            source: "Tailwind CSS Blog",
            type: "article",
            readTime: "6 min",
            publishedDate: "12 hours ago",
            thumbnail: "/placeholder.svg?height=200&width=300",
            isSaved: true,
            excerpt: "Discover the latest features in Tailwind CSS v3.4 including new utility classes and improved performance.",
            url: "https://tailwindcss.com/blog/tailwindcss-v3-4",
            content: `
        <h2>Tailwind CSS v3.4: What's New</h2>
        <p>Tailwind CSS v3.4 brings exciting new features and improvements to the popular utility-first CSS framework.</p>
        
        <h3>New Utility Classes</h3>
        <p>Explore the new utility classes that make styling even more efficient and powerful.</p>
        
        <h3>Performance Improvements</h3>
        <p>Learn about the performance optimizations that make Tailwind CSS faster than ever.</p>
      `,
        },
        {
            id: 6,
            title: "JavaScript Performance Optimization Tips",
            source: "JavaScript Weekly",
            type: "video",
            readTime: "18 min",
            publishedDate: "1 day ago",
            thumbnail: "/placeholder.svg?height=200&width=300",
            videoUrl: "https://www.youtube.com/watch?v=2RWsLmu8yVc&t=4850s",
            isSaved: false,
            excerpt: "Optimize your JavaScript applications with these proven performance techniques and best practices.",
            url: "https://javascriptweekly.com/performance-tips",
        },
        {
            id: 7,
            title: "The Future of Web Development: Trends 2024",
            source: "Frontend Masters",
            type: "article",
            readTime: "10 min",
            publishedDate: "1 day ago",
            thumbnail: "/placeholder.svg?height=200&width=300",
            isSaved: false,
            excerpt: "Explore the emerging trends that will shape web development in 2024 and beyond.",
            url: "https://frontendmasters.com/web-dev-trends-2024",
            content: `
        <h2>Web Development Trends for 2024</h2>
        <p>Stay ahead of the curve with these emerging trends that are shaping the future of web development.</p>
        
        <h3>AI-Powered Development Tools</h3>
        <p>Discover how AI is transforming the way we write code and build applications.</p>
        
        <h3>Edge Computing and Performance</h3>
        <p>Learn about edge computing and its impact on web application performance.</p>
      `,
        },
        {
            id: 8,
            title: "Database Design Patterns for Modern Apps",
            source: "Database Weekly",
            type: "article",
            readTime: "14 min",
            publishedDate: "2 days ago",
            thumbnail: "/placeholder.svg?height=200&width=300",
            isSaved: true,
            excerpt: "Learn essential database design patterns for building scalable and maintainable modern applications.",
            url: "https://databaseweekly.com/design-patterns",
            content: `
        <h2>Modern Database Design Patterns</h2>
        <p>Explore essential database design patterns that help you build scalable and maintainable applications.</p>
        
        <h3>Microservices Database Patterns</h3>
        <p>Learn how to design databases for microservices architectures.</p>
        
        <h3>Event Sourcing and CQRS</h3>
        <p>Understand advanced patterns like Event Sourcing and Command Query Responsibility Segregation.</p>
      `,
        },
    ])

    // Get unique content providers for filtering
    const contentProviders = Array.from(new Set(feedContent.map((item) => item.source)))

    // Initialize saved state from localStorage
    useEffect(() => {
        setFeedContent(prev =>
            prev.map(item => ({
                ...item,
                isSaved: SavedContentManager.isSaved(item.id)
            }))
        )
    }, [])

    // Filter and sort content
    useEffect(() => {
        let filtered = [...feedContent]

        // Apply type filter
        if (selectedTypes.length > 0) {
            filtered = filtered.filter((item) => selectedTypes.includes(item.type))
        }

        // Apply provider filter
        if (selectedProviders.length > 0) {
            filtered = filtered.filter((item) => selectedProviders.includes(item.source))
        }

        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(
                (item) =>
                    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
                case "oldest":
                    return new Date(a.publishedDate).getTime() - new Date(b.publishedDate).getTime()
                case "readTime":
                    return parseInt(a.readTime) - parseInt(b.readTime)
                case "saved":
                    return b.isSaved ? 1 : -1
                default:
                    return 0
            }
        })

        setFilteredContent(filtered)
    }, [feedContent, selectedTypes, selectedProviders, searchQuery, sortBy])

    const handleSaveContent = (contentId: number) => {
        const content = feedContent.find(item => item.id === contentId)
        if (!content) return

        if (content.isSaved) {
            // Remove from saved content
            SavedContentManager.removeSavedContent(contentId)
        } else {
            // Add to saved content
            SavedContentManager.addSavedContent({
                id: content.id,
                title: content.title,
                source: content.source,
                type: content.type,
                readTime: content.readTime,
                thumbnail: content.thumbnail,
                content: content.content,
                videoUrl: content.videoUrl,
                excerpt: content.excerpt,
                url: content.url,
            })
        }

        // Update local state
        setFeedContent((prev) =>
            prev.map((item) =>
                item.id === contentId
                    ? { ...item, isSaved: !item.isSaved }
                    : item
            )
        )
    }

    const handleRefreshFeeds = async () => {
        setIsRefreshing(true)
        // Simulate API call to refresh feeds
        setTimeout(() => {
            setIsRefreshing(false)
        }, 2000)
    }

    const clearFilters = () => {
        setSelectedTypes([])
        setSelectedProviders([])
        setSearchQuery("")
        setSortBy("newest")
        setShowFilters(false)
    }

    const hasActiveFilters = selectedTypes.length > 0 || selectedProviders.length > 0 || searchQuery

    const handleTypeToggle = (type: string) => {
        setSelectedTypes((prev) =>
            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
        )
    }

    const handleProviderToggle = (provider: string) => {
        setSelectedProviders((prev) =>
            prev.includes(provider) ? prev.filter((p) => p !== provider) : [...prev, provider]
        )
    }

    const ContentCard = ({ item }: { item: FeedContentItem }) => (
        <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer border-0 shadow-sm bg-white hover:bg-gray-50/50">
            <div className="relative">
                <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-48 object-cover rounded-t-lg"
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
                <Button
                    variant="secondary"
                    size="sm"
                    className={`absolute top-3 right-3 h-8 w-8 p-0 ${item.isSaved
                        ? "bg-teal-500 hover:bg-teal-600 text-white"
                        : "bg-white/90 hover:bg-white text-gray-700"
                        }`}
                    onClick={(e) => {
                        e.stopPropagation()
                        handleSaveContent(item.id)
                    }}
                >
                    {item.isSaved ? (
                        <BookmarkCheck className="h-4 w-4" />
                    ) : (
                        <Bookmark className="h-4 w-4" />
                    )}
                </Button>
            </div>
            <CardContent className="p-4">
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="font-medium text-teal-600">{item.source}</span>
                        <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span>{item.readTime}</span>
                        </div>
                    </div>
                    <h3
                        className="font-semibold text-gray-900 line-clamp-2 group-hover:text-teal-600 transition-colors"
                        onClick={() => setSelectedContent(item)}
                    >
                        {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{item.excerpt}</p>
                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>{item.publishedDate}</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-xs hover:bg-teal-50 hover:text-teal-600"
                            onClick={(e) => {
                                e.stopPropagation()
                                window.open(item.url, '_blank')
                            }}
                        >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    const ContentListItem = ({ item }: { item: FeedContentItem }) => (
        <Card className="hover:shadow-md transition-all duration-300 group cursor-pointer border-0 shadow-sm bg-white hover:bg-gray-50/50">
            <CardContent className="p-4">
                <div className="flex gap-4">
                    <div className="relative flex-shrink-0">
                        <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-24 h-18 object-cover rounded-lg"
                        />
                        {item.type === "video" && (
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
                                        variant={item.type === "video" ? "destructive" : "secondary"}
                                        className="text-xs"
                                    >
                                        {item.type === "video" ? "Video" : "Article"}
                                    </Badge>
                                    <span className="text-sm font-medium text-teal-600">{item.source}</span>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Clock className="h-3 w-3" />
                                        <span>{item.readTime}</span>
                                    </div>
                                </div>
                                <h3
                                    className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-1"
                                    onClick={() => setSelectedContent(item)}
                                >
                                    {item.title}
                                </h3>
                                <p className="text-sm text-gray-600 line-clamp-2">{item.excerpt}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Calendar className="h-3 w-3" />
                                    <span>{item.publishedDate}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className={`h-8 w-8 p-0 ${item.isSaved
                                        ? "bg-teal-500 hover:bg-teal-600 text-white"
                                        : "bg-white hover:bg-gray-100 text-gray-700"
                                        }`}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleSaveContent(item.id)
                                    }}
                                >
                                    {item.isSaved ? (
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
                                        e.stopPropagation()
                                        window.open(item.url, '_blank')
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
    )

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
                                <Badge variant={selectedContent.type === "video" ? "destructive" : "secondary"}>
                                    {selectedContent.type === "video" ? "Video" : "Article"}
                                </Badge>
                                <span className="text-sm font-medium text-teal-600">{selectedContent.source}</span>
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                    <Clock className="h-4 w-4" />
                                    <span>{selectedContent.readTime}</span>
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">{selectedContent.title}</h1>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Calendar className="h-4 w-4" />
                                    <span>Published {selectedContent.publishedDate}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={selectedContent.isSaved ? "bg-teal-50 border-teal-200 text-teal-700" : ""}
                                        onClick={() => handleSaveContent(selectedContent.id)}
                                    >
                                        {selectedContent.isSaved ? (
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
                                        onClick={() => window.open(selectedContent.url, '_blank')}
                                    >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        View Original
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {selectedContent.type === "video" && selectedContent.videoUrl ? (
                            <div className="mb-8">
                                <div className="aspect-video w-full">
                                    <iframe
                                        src={convertYouTubeUrl(selectedContent.videoUrl)}
                                        title={selectedContent.title}
                                        className="w-full h-full rounded-lg"
                                        allowFullScreen
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    />
                                </div>
                            </div>
                        ) : (
                            selectedContent.content && (
                                <div
                                    className="prose prose-lg max-w-none"
                                    dangerouslySetInnerHTML={{ __html: selectedContent.content }}
                                />
                            )
                        )}
                    </article>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Latest from Your Feeds</h1>
                            <p className="text-gray-600 mt-2">
                                Stay updated with the latest content from your subscribed sources
                            </p>
                        </div>
                        <Button
                            onClick={handleRefreshFeeds}
                            disabled={isRefreshing}
                            className="bg-teal-600 hover:bg-teal-700"
                        >
                            {isRefreshing ? (
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
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
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
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-36">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest</SelectItem>
                                    <SelectItem value="oldest">Oldest</SelectItem>
                                    <SelectItem value="readTime">Read Time</SelectItem>
                                    <SelectItem value="saved">Saved</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Filter Toggle */}
                            <Button
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                                className={`${hasActiveFilters ? "bg-teal-50 border-teal-200 text-teal-700" : ""}`}
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                Filters
                                {hasActiveFilters && (
                                    <Badge variant="secondary" className="ml-2 bg-teal-100 text-teal-700">
                                        {selectedTypes.length + selectedProviders.length + (searchQuery ? 1 : 0)}
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
                                    <h3 className="font-medium text-gray-900">Filters</h3>
                                    {hasActiveFilters && (
                                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                                            <X className="h-4 w-4 mr-1" />
                                            Clear all
                                        </Button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Content Type Filter */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">Content Type</label>
                                        <div className="flex flex-wrap gap-2">
                                            {["article", "video"].map((type) => (
                                                <Button
                                                    key={type}
                                                    variant={selectedTypes.includes(type) ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => handleTypeToggle(type)}
                                                    className={
                                                        selectedTypes.includes(type)
                                                            ? "bg-teal-600 hover:bg-teal-700 border-teal-600"
                                                            : ""
                                                    }
                                                >
                                                    {type === "article" ? "Articles" : "Videos"}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Content Provider Filter */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">Source</label>
                                        <div className="flex flex-wrap gap-2">
                                            {contentProviders.slice(0, 6).map((provider) => (
                                                <Button
                                                    key={provider}
                                                    variant={selectedProviders.includes(provider) ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => handleProviderToggle(provider)}
                                                    className={
                                                        selectedProviders.includes(provider)
                                                            ? "bg-teal-600 hover:bg-teal-700 border-teal-600"
                                                            : ""
                                                    }
                                                >
                                                    {provider}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Content Grid/List */}
                {filteredContent.length === 0 ? (
                    <Card className="p-12 text-center bg-white">
                        <div className="text-gray-500">
                            <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium mb-2">No content found</h3>
                            <p className="text-sm">
                                {hasActiveFilters
                                    ? "Try adjusting your filters or search query"
                                    : "Check back later for new content from your feeds"}
                            </p>
                            {hasActiveFilters && (
                                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                                    Clear filters
                                </Button>
                            )}
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
                        {filteredContent.map((item) =>
                            viewMode === "grid" ? (
                                <ContentCard key={item.id} item={item} />
                            ) : (
                                <ContentListItem key={item.id} item={item} />
                            )
                        )}
                    </div>
                )}

                {/* Results Summary */}
                {filteredContent.length > 0 && (
                    <div className="mt-8 text-center text-sm text-gray-500">
                        Showing {filteredContent.length} of {feedContent.length} articles
                        {hasActiveFilters && " (filtered)"}
                    </div>
                )}
            </div>
        </div>
    )
}
