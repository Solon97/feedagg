"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    ExternalLink,
    Plus,
    Trash2,
    Edit,
    RefreshCw,
    Rss,
    Youtube,
    Check,
    X,
    AlertTriangle,
    CheckCircle2,
    Link,
    Save,
    Settings,
} from "lucide-react"
import { Navbar } from "@/components/navbar"

interface FeedSource {
    id: string
    name: string
    url: string
    type: "rss" | "youtube"
    description?: string
    status: "active" | "inactive" | "error"
    lastUpdate: string
    itemCount: number
    favicon?: string
}

interface ValidationResult {
    isValid: boolean
    type?: "rss" | "youtube"
    error?: string
    rssUrl?: string
    preview?: {
        title: string
        description: string
        favicon?: string
    }
}

// Helper function to validate URL using the server-side API
async function validateUrlWithAPI(url: string): Promise<ValidationResult | null> {
    try {
        const response = await fetch('/api/validate-url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
        })

        if (!response.ok) {
            return null
        }

        const result = await response.json()
        return result
    } catch (error) {
        console.error('API validation error:', error)
        return null
    }
}

interface FeedSource {
    id: string
    name: string
    url: string
    type: "rss" | "youtube"
    description?: string
    status: "active" | "inactive" | "error"
    lastUpdate: string
    itemCount: number
    favicon?: string
}

interface ValidationResult {
    isValid: boolean
    type?: "rss" | "youtube"
    error?: string
    rssUrl?: string
    preview?: {
        title: string
        description: string
        favicon?: string
    }
}

export default function FeedsManagementPage() {
    const [feeds, setFeeds] = useState<FeedSource[]>([
        {
            id: "1",
            name: "Vercel Blog",
            url: "https://vercel.com/blog/rss.xml",
            type: "rss",
            description: "Latest updates and insights from Vercel",
            status: "active",
            lastUpdate: "2 hours ago",
            itemCount: 25,
            favicon: "/favicon.ico",
        },
        {
            id: "2",
            name: "React Blog",
            url: "https://react.dev/blog/rss.xml",
            type: "rss",
            description: "Official React team blog",
            status: "active",
            lastUpdate: "6 hours ago",
            itemCount: 18,
            favicon: "/favicon.ico",
        },
        {
            id: "3",
            name: "Fireship",
            url: "https://www.youtube.com/c/Fireship",
            type: "youtube",
            description: "Web development tutorials and tech news",
            status: "active",
            lastUpdate: "1 day ago",
            itemCount: 42,
            favicon: "/favicon.ico",
        },
        {
            id: "4",
            name: "CSS-Tricks",
            url: "https://css-tricks.com/feed/",
            type: "rss",
            description: "Tips, tricks, and techniques on using CSS",
            status: "error",
            lastUpdate: "3 days ago",
            itemCount: 0,
            favicon: "/favicon.ico",
        },
    ])

    const [showAddForm, setShowAddForm] = useState(false)
    const [editingFeed, setEditingFeed] = useState<FeedSource | null>(null)
    const [newFeedUrl, setNewFeedUrl] = useState("")
    const [newFeedName, setNewFeedName] = useState("")
    const [newFeedDescription, setNewFeedDescription] = useState("")
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
    const [isValidating, setIsValidating] = useState(false)
    // Track if fields were auto-filled to provide better UX
    const [fieldsAutoFilled, setFieldsAutoFilled] = useState({ name: false, description: false })

    // Real URL validation using UrlValidator
    useEffect(() => {
        if (!newFeedUrl.trim()) {
            setValidationResult(null)
            setIsValidating(false)
            // Clear all fields when URL is empty
            if (!editingFeed) { // Only clear if not editing an existing feed
                setNewFeedName("")
                setNewFeedDescription("")
            }
            return
        }

        const timeoutId = setTimeout(async () => {
            setIsValidating(true)
            try {
                console.log("Validating URL:", newFeedUrl)
                // Use the server-side API for validation
                const result = await validateUrlWithAPI(newFeedUrl)
                console.log("Validation result:", result)

                if (result && result.isValid && result.type !== undefined) {
                    setValidationResult(result)

                    // Auto-fill all fields if preview is available
                    if (result.preview) {
                        let nameWasAutoFilled = false
                        let descriptionWasAutoFilled = false

                        // Auto-fill feed name if available and field is empty or was previously auto-filled
                        if (result.preview.title &&
                            (!newFeedName.trim() || fieldsAutoFilled.name ||
                                (editingFeed && newFeedName === editingFeed.name))) {
                            setNewFeedName(result.preview.title)
                            nameWasAutoFilled = true
                        }

                        // Auto-fill description if available and field is empty or was previously auto-filled
                        if (result.preview.description &&
                            result.preview.description !== 'No description available' &&
                            (!newFeedDescription.trim() || fieldsAutoFilled.description ||
                                (editingFeed && newFeedDescription === editingFeed.description))) {
                            setNewFeedDescription(result.preview.description)
                            descriptionWasAutoFilled = true
                        }

                        // Update tracking state
                        setFieldsAutoFilled({
                            name: nameWasAutoFilled,
                            description: descriptionWasAutoFilled
                        })
                    }
                } else {
                    setValidationResult({
                        isValid: false,
                        error: result?.error || "Invalid URL"
                    })
                }
            } catch (error) {
                console.error("Validation error:", error)
                setValidationResult({
                    isValid: false,
                    error: "Failed to validate URL"
                })
            } finally {
                setIsValidating(false)
            }
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [newFeedUrl, newFeedName, newFeedDescription, editingFeed])

    const handleAddFeed = () => {
        if (!validationResult?.isValid || !newFeedName.trim()) return

        const newFeed: FeedSource = {
            id: Date.now().toString(),
            name: newFeedName,
            url: validationResult.rssUrl || newFeedUrl,
            type: validationResult.type as "rss" | "youtube",
            description: newFeedDescription,
            status: "active",
            lastUpdate: "Just now",
            itemCount: 0,
            favicon: validationResult.preview?.favicon
        }

        setFeeds(prev => [...prev, newFeed])
        resetForm()
    }

    const handleEditFeed = (feed: FeedSource) => {
        setEditingFeed(feed)
        setNewFeedUrl(feed.url)
        setNewFeedName(feed.name)
        setNewFeedDescription(feed.description || "")
        setShowAddForm(true)
    }

    const handleUpdateFeed = () => {
        if (!editingFeed || !validationResult?.isValid || !newFeedName.trim()) return

        const updatedFeed: FeedSource = {
            ...editingFeed,
            name: newFeedName,
            url: newFeedUrl,
            type: validationResult.type as "rss" | "youtube",
            description: newFeedDescription,
            favicon: validationResult.preview?.favicon
        }

        setFeeds(prev => prev.map(feed =>
            feed.id === editingFeed.id ? updatedFeed : feed
        ))
        resetForm()
    }

    const handleDeleteFeed = (feedId: string) => {
        setFeeds(prev => prev.filter(feed => feed.id !== feedId))
    }

    const handleRefreshFeed = async (feedId: string) => {
        // Mock refresh functionality
        setFeeds(prev => prev.map(feed =>
            feed.id === feedId
                ? { ...feed, lastUpdate: "Just now", status: "active" as const }
                : feed
        ))
    }

    // Handlers for manual field editing to stop auto-fill
    const handleNameChange = (value: string) => {
        setNewFeedName(value)
        setFieldsAutoFilled(prev => ({ ...prev, name: false }))
    }

    const handleDescriptionChange = (value: string) => {
        setNewFeedDescription(value)
        setFieldsAutoFilled(prev => ({ ...prev, description: false }))
    }

    const resetForm = () => {
        setShowAddForm(false)
        setEditingFeed(null)
        setNewFeedUrl("")
        setNewFeedName("")
        setNewFeedDescription("")
        setValidationResult(null)
        setFieldsAutoFilled({ name: false, description: false }) // Reset auto-fill tracking
    }

    const stats = {
        totalFeeds: feeds.length,
        activeFeeds: feeds.filter(f => f.status === "active").length,
        totalItems: feeds.reduce((sum, f) => sum + f.itemCount, 0)
    }

    const getStatusColor = (status: FeedSource["status"]) => {
        switch (status) {
            case "active": return "bg-green-100 text-green-800"
            case "inactive": return "bg-gray-100 text-gray-800"
            case "error": return "bg-red-100 text-red-800"
            default: return "bg-gray-100 text-gray-800"
        }
    }

    const getStatusIcon = (status: FeedSource["status"]) => {
        switch (status) {
            case "active": return <CheckCircle2 className="h-4 w-4" />
            case "inactive": return <X className="h-4 w-4" />
            case "error": return <AlertTriangle className="h-4 w-4" />
            default: return <X className="h-4 w-4" />
        }
    }

    const getValidationIcon = () => {
        if (isValidating) return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
        if (!validationResult) return null
        if (validationResult.isValid) return <Check className="h-4 w-4 text-green-500" />
        return <X className="h-4 w-4 text-red-500" />
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Feed Management</h1>
                            <p className="text-gray-600 mt-2">Manage your RSS feeds and YouTube channels</p>
                        </div>
                        <Button onClick={() => setShowAddForm(true)} className="bg-teal-600 hover:bg-teal-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Feed
                        </Button>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <Rss className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Total Feeds</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.totalFeeds}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Active Feeds</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.activeFeeds}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <div className="p-3 bg-purple-100 rounded-lg">
                                        <Settings className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Total Items</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Add/Edit Feed Form */}
                {showAddForm && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>
                                {editingFeed ? "Edit Feed" : "Add New Feed"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <Label htmlFor="feedUrl">Feed URL</Label>
                                <div className="relative mt-1">
                                    <Input
                                        id="feedUrl"
                                        value={newFeedUrl}
                                        onChange={(e) => setNewFeedUrl(e.target.value)}
                                        placeholder="https://example.com/feed.xml or https://youtube.com/channel/..."
                                        className="pr-10"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        {getValidationIcon()}
                                    </div>
                                </div>

                                {/* Validation feedback */}
                                {validationResult && (
                                    <div className={`mt-2 p-3 rounded-lg ${validationResult.isValid
                                        ? "bg-green-50 border border-green-200"
                                        : "bg-red-50 border border-red-200"
                                        }`}>
                                        {validationResult.isValid ? (
                                            <div className="flex items-start space-x-3">
                                                <div className="flex-shrink-0 pt-1">
                                                    {validationResult.type === "youtube" ? (
                                                        <Youtube className="h-5 w-5 text-red-600" />
                                                    ) : (
                                                        <Rss className="h-5 w-5 text-green-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-green-800">
                                                        Valid {validationResult.type === "youtube" ? "YouTube Channel" : "RSS Feed"}
                                                    </p>
                                                    {validationResult.preview && (
                                                        <div className="mt-1">
                                                            <p className="text-sm text-green-700 font-medium">
                                                                {validationResult.preview.title}
                                                            </p>
                                                            <p className="text-sm text-green-600">
                                                                {validationResult.preview.description}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                                <p className="text-sm text-red-800">{validationResult.error}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="feedName">Feed Name</Label>
                                <Input
                                    id="feedName"
                                    value={newFeedName}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    placeholder="Enter a name for this feed"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="feedDescription">Description (Optional)</Label>
                                <Textarea
                                    id="feedDescription"
                                    value={newFeedDescription}
                                    onChange={(e) => handleDescriptionChange(e.target.value)}
                                    placeholder="Brief description of this feed"
                                    className="mt-1"
                                    rows={3}
                                />
                            </div>

                            <div className="flex space-x-3">
                                <Button
                                    onClick={editingFeed ? handleUpdateFeed : handleAddFeed}
                                    disabled={!validationResult?.isValid || !newFeedName.trim()}
                                    className="bg-teal-600 hover:bg-teal-700"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {editingFeed ? "Update Feed" : "Add Feed"}
                                </Button>
                                <Button variant="outline" onClick={resetForm}>
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Feeds List */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Feeds</h2>

                    {feeds.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-12">
                                <Rss className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No feeds yet</h3>
                                <p className="text-gray-600 mb-6">Get started by adding your first RSS feed or YouTube channel</p>
                                <Button onClick={() => setShowAddForm(true)} className="bg-teal-600 hover:bg-teal-700">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Your First Feed
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {feeds.map((feed) => (
                                <Card key={feed.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-4 flex-1">
                                                <div className="flex-shrink-0 pt-1">
                                                    {feed.type === "youtube" ? (
                                                        <div className="p-2 bg-red-100 rounded-lg">
                                                            <Youtube className="h-5 w-5 text-red-600" />
                                                        </div>
                                                    ) : (
                                                        <div className="p-2 bg-green-100 rounded-lg">
                                                            <Rss className="h-5 w-5 text-green-600" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <h3 className="text-lg font-medium text-gray-900 truncate">
                                                            {feed.name}
                                                        </h3>
                                                        <Badge className={`${getStatusColor(feed.status)} flex items-center space-x-1`}>
                                                            {getStatusIcon(feed.status)}
                                                            <span className="capitalize">{feed.status}</span>
                                                        </Badge>
                                                    </div>

                                                    {feed.description && (
                                                        <p className="text-gray-600 mb-2">{feed.description}</p>
                                                    )}

                                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                        <div className="flex items-center space-x-1">
                                                            <Link className="h-4 w-4" />
                                                            <span className="truncate max-w-xs">{feed.url}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <Settings className="h-4 w-4" />
                                                            <span>{feed.itemCount} items</span>
                                                        </div>
                                                        <div>Last updated: {feed.lastUpdate}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2 ml-4">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => window.open(feed.url, '_blank')}
                                                    className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                                                    title="Open feed URL"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRefreshFeed(feed.id)}
                                                    className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    title="Refresh feed"
                                                >
                                                    <RefreshCw className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditFeed(feed)}
                                                    className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                                                    title="Edit feed"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteFeed(feed.id)}
                                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    title="Delete feed"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
