"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Plus,
  Edit,
  Trash2,
  Globe,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  EyeOff,
  Database,
  Rss,
  Youtube,
  XCircle,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { previewCache, type UrlPreview } from "@/lib/preview-cache"
import { UrlValidator } from "@/lib/url-validator"

interface Digest {
  id: number
  title: string
  frequency: string
  scheduleTime: string
  selectedDays: number[]
  contentSources: ContentSource[]
}

interface ContentSource {
  url: string
  preview?: UrlPreview
  isLoading?: boolean
  error?: string
  fromCache?: boolean
  isValidating?: boolean
  validationError?: string
  rssUrl?: string
  sourceType?: "youtube" | "rss" | "invalid"
}

interface DigestFormData {
  title: string
  frequency: string
  scheduleTime: string
  selectedDays: number[]
  contentSources: ContentSource[]
}

export default function Dashboard() {
  const [digests, setDigests] = useState<Digest[]>([
    {
      id: 1,
      title: "Daily Reads",
      frequency: "daily",
      scheduleTime: "09:00",
      selectedDays: [],
      contentSources: [{ url: "https://techcrunch.com" }, { url: "https://dev.to" }],
    },
    {
      id: 2,
      title: "Weekly Tech News",
      frequency: "weekly",
      scheduleTime: "10:00",
      selectedDays: [1, 3, 5],
      contentSources: [{ url: "https://youtube.com/@vercel" }, { url: "https://css-tricks.com" }],
    },
  ])

  const [editingDigest, setEditingDigest] = useState<Digest | null>(null)
  const [deletingDigest, setDeleteingDigest] = useState<Digest | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [showPreviews, setShowPreviews] = useState(true)
  const [cacheStats, setCacheStats] = useState(previewCache.getStats())
  const [formData, setFormData] = useState<DigestFormData>({
    title: "",
    frequency: "daily",
    scheduleTime: "09:00",
    selectedDays: [],
    contentSources: [{ url: "" }],
  })

  const daysOfWeek = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
  ]

  const daysOfMonth = Array.from({ length: 31 }, (_, i) => i + 1)

  // Update cache stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setCacheStats(previewCache.getStats())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Validate URL and fetch preview
  const validateAndFetchPreview = async (index: number, url: string) => {
    if (!url.trim()) {
      setFormData((prev) => ({
        ...prev,
        contentSources: prev.contentSources.map((source, i) =>
          i === index
            ? {
                ...source,
                preview: undefined,
                error: undefined,
                isLoading: false,
                fromCache: false,
                isValidating: false,
                validationError: undefined,
                rssUrl: undefined,
                sourceType: undefined,
              }
            : source,
        ),
      }))
      return
    }

    // Set validating state
    setFormData((prev) => ({
      ...prev,
      contentSources: prev.contentSources.map((source, i) =>
        i === index
          ? {
              ...source,
              isValidating: true,
              validationError: undefined,
              isLoading: false,
              error: undefined,
            }
          : source,
      ),
    }))

    try {
      // Validate URL first
      const validation = await UrlValidator.validateUrl(url)

      if (!validation.isValid) {
        setFormData((prev) => ({
          ...prev,
          contentSources: prev.contentSources.map((source, i) =>
            i === index
              ? {
                  ...source,
                  isValidating: false,
                  validationError: validation.error,
                  sourceType: "invalid",
                  preview: undefined,
                }
              : source,
          ),
        }))
        return
      }

      // URL is valid, now fetch preview
      setFormData((prev) => ({
        ...prev,
        contentSources: prev.contentSources.map((source, i) =>
          i === index
            ? {
                ...source,
                isValidating: false,
                isLoading: true,
                rssUrl: validation.rssUrl,
                sourceType: validation.type,
              }
            : source,
        ),
      }))

      const { preview, fromCache } = await fetchUrlPreview(url, validation.type)

      setFormData((prev) => ({
        ...prev,
        contentSources: prev.contentSources.map((source, i) =>
          i === index
            ? {
                ...source,
                preview,
                isLoading: false,
                error: undefined,
                fromCache,
              }
            : source,
        ),
      }))
    } catch (error) {
      setFormData((prev) => ({
        ...prev,
        contentSources: prev.contentSources.map((source, i) =>
          i === index
            ? {
                ...source,
                isValidating: false,
                isLoading: false,
                validationError: error instanceof Error ? error.message : "Validation failed",
                sourceType: "invalid",
              }
            : source,
        ),
      }))
    }
  }

  // Enhanced preview fetching with source type
  const fetchUrlPreview = async (
    url: string,
    sourceType: "youtube" | "rss",
  ): Promise<{ preview: UrlPreview; fromCache: boolean }> => {
    // Check cache first
    const cachedPreview = previewCache.get(url)
    if (cachedPreview) {
      console.log(`Cache HIT for ${url}`)
      return { preview: cachedPreview, fromCache: true }
    }

    console.log(`Cache MISS for ${url} - fetching from API`)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

    // Enhanced mock data with source types
    const mockPreviews: Record<string, UrlPreview> = {
      "https://techcrunch.com": {
        title: "TechCrunch - Startup and Technology News",
        description:
          "TechCrunch | Reporting on the business of technology, startups, venture capital funding, and Silicon Valley",
        image: "/placeholder.svg?height=200&width=400",
        siteName: "TechCrunch",
        favicon: "/placeholder.svg?height=16&width=16",
        isValid: true,
      },
      "https://dev.to": {
        title: "DEV Community - A constructive and inclusive social network for software developers",
        description:
          "Where programmers share ideas and help each other grow. It is an online community for sharing and discovering great ideas, having debates, and making friends.",
        image: "/placeholder.svg?height=200&width=400",
        siteName: "DEV Community",
        favicon: "/placeholder.svg?height=16&width=16",
        isValid: true,
      },
      "https://youtube.com/@vercel": {
        title: "Vercel - YouTube Channel",
        description:
          "The platform for frontend developers, providing the speed and reliability innovators need to create at the moment of inspiration.",
        image: "/placeholder.svg?height=200&width=400",
        siteName: "Vercel",
        favicon: "/placeholder.svg?height=16&width=16",
        isValid: true,
      },
      "https://css-tricks.com": {
        title: "CSS-Tricks - Tips, Tricks, and Techniques on using CSS",
        description:
          "Daily articles about CSS, HTML, JavaScript, and all things related to web design and development.",
        image: "/placeholder.svg?height=200&width=400",
        siteName: "CSS-Tricks",
        favicon: "/placeholder.svg?height=16&width=16",
        isValid: true,
      },
    }

    let preview: UrlPreview

    if (mockPreviews[url]) {
      preview = mockPreviews[url]
    } else {
      const domain = new URL(url).hostname
      const typeLabel = sourceType === "youtube" ? "YouTube Channel" : "Website"
      preview = {
        title: `${domain.charAt(0).toUpperCase() + domain.slice(1)} - ${typeLabel}`,
        description: `Content from ${domain}`,
        image: "/placeholder.svg?height=200&width=400",
        siteName: domain,
        favicon: "/placeholder.svg?height=16&width=16",
        isValid: true,
      }
    }

    // Cache the result
    previewCache.set(url, preview)
    setCacheStats(previewCache.getStats())

    return { preview, fromCache: false }
  }

  // Debounced URL validation and preview fetching
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = []

    formData.contentSources.forEach((source, index) => {
      if (source.url && source.url !== source.preview?.siteName) {
        const timeout = setTimeout(() => {
          validateAndFetchPreview(index, source.url)
        }, 1500) // 1.5 second debounce for validation
        timeouts.push(timeout)
      }
    })

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout))
    }
  }, [formData.contentSources.map((s) => s.url).join(",")])

  const handleCreateDigest = () => {
    setFormData({
      title: "",
      frequency: "daily",
      scheduleTime: "09:00",
      selectedDays: [],
      contentSources: [{ url: "" }],
    })
    setIsCreateDialogOpen(true)
  }

  const handleEditDigest = (digest: Digest) => {
    setEditingDigest(digest)
    setFormData({
      title: digest.title,
      frequency: digest.frequency,
      scheduleTime: digest.scheduleTime,
      selectedDays: [...digest.selectedDays],
      contentSources: [...digest.contentSources],
    })
    setIsEditDialogOpen(true)
  }

  const handleDeleteDigest = (digest: Digest) => {
    setDeleteingDigest(digest)
    setIsDeleteDialogOpen(true)
  }

  const handleDayToggle = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter((d) => d !== day)
        : [...prev.selectedDays, day],
    }))
  }

  const handleContentSourceChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      contentSources: prev.contentSources.map((source, i) => (i === index ? { ...source, url: value } : source)),
    }))
  }

  const addContentSource = () => {
    setFormData((prev) => ({
      ...prev,
      contentSources: [...prev.contentSources, { url: "" }],
    }))
  }

  const removeContentSource = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      contentSources: prev.contentSources.filter((_, i) => i !== index),
    }))
  }

  const isFormValid = () => {
    return (
      formData.title.trim() &&
      formData.contentSources.length > 0 &&
      formData.contentSources.every(
        (source) =>
          source.url.trim() && source.sourceType !== "invalid" && !source.validationError && !source.isValidating,
      )
    )
  }

  const confirmCreate = () => {
    if (!isFormValid()) return

    const newDigest: Digest = {
      id: Date.now(),
      ...formData,
      contentSources: formData.contentSources.filter((source) => source.url.trim() !== ""),
    }
    setDigests((prev) => [...prev, newDigest])
    setIsCreateDialogOpen(false)
    resetForm()
  }

  const confirmEdit = () => {
    if (!isFormValid() || !editingDigest) return

    setDigests((prev) =>
      prev.map((digest) =>
        digest.id === editingDigest.id
          ? {
              ...digest,
              ...formData,
              contentSources: formData.contentSources.filter((source) => source.url.trim() !== ""),
            }
          : digest,
      ),
    )
    setIsEditDialogOpen(false)
    setEditingDigest(null)
    resetForm()
  }

  const confirmDelete = () => {
    if (deletingDigest) {
      setDigests((prev) => prev.filter((digest) => digest.id !== deletingDigest.id))
      setIsDeleteDialogOpen(false)
      setDeleteingDigest(null)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      frequency: "daily",
      scheduleTime: "09:00",
      selectedDays: [],
      contentSources: [{ url: "" }],
    })
  }

  const cancelDialog = () => {
    setIsEditDialogOpen(false)
    setIsCreateDialogOpen(false)
    setIsDeleteDialogOpen(false)
    setEditingDigest(null)
    setDeleteingDigest(null)
    resetForm()
  }

  const getDigestSummary = (digest: Digest) => {
    const sourceCount = digest.contentSources.length
    return `${sourceCount} source${sourceCount !== 1 ? "s" : ""}`
  }

  const renderValidationStatus = (source: ContentSource) => {
    if (source.isValidating) {
      return (
        <div className="flex items-center gap-2 text-xs text-blue-600">
          <Loader2 className="w-3 h-3 animate-spin" />
          Validating...
        </div>
      )
    }

    if (source.validationError) {
      return (
        <div className="flex items-center gap-2 text-xs text-red-600">
          <XCircle className="w-3 h-3" />
          {source.validationError}
        </div>
      )
    }

    if (source.sourceType === "youtube") {
      return (
        <div className="flex items-center gap-2 text-xs text-green-600">
          <Youtube className="w-3 h-3" />
          YouTube Channel
        </div>
      )
    }

    if (source.sourceType === "rss") {
      return (
        <div className="flex items-center gap-2 text-xs text-green-600">
          <Rss className="w-3 h-3" />
          RSS Feed
        </div>
      )
    }

    return null
  }

  const renderUrlPreview = (source: ContentSource, index: number) => {
    if (!showPreviews) return null

    if (source.isLoading) {
      return (
        <div className="mt-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading preview...
          </div>
        </div>
      )
    }

    if (source.error) {
      return (
        <div className="mt-2 p-3 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" />
            {source.error}
          </div>
        </div>
      )
    }

    if (source.preview && source.url.trim() && source.sourceType !== "invalid") {
      return (
        <div className="mt-2 p-3 border border-gray-200 rounded-lg bg-white hover:shadow-sm transition-shadow">
          <div className="flex gap-3">
            {source.preview.image && (
              <img
                src={source.preview.image || "/placeholder.svg"}
                alt={source.preview.title}
                className="w-16 h-16 object-cover rounded flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {source.preview.favicon && (
                  <img src={source.preview.favicon || "/placeholder.svg"} alt="" className="w-4 h-4" />
                )}
                <span className="text-xs text-gray-500 truncate">{source.preview.siteName}</span>
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                {source.fromCache && (
                  <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    <Database className="w-3 h-3" />
                    Cached
                  </div>
                )}
              </div>
              <h4 className="font-medium text-sm text-gray-900 line-clamp-1 mb-1">{source.preview.title}</h4>
              <p className="text-xs text-gray-600 line-clamp-2">{source.preview.description}</p>
              <div className="flex items-center gap-4 mt-2">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700"
                >
                  <ExternalLink className="w-3 h-3" />
                  Visit site
                </a>
                {source.rssUrl && (
                  <a
                    href={source.rssUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700"
                  >
                    <Rss className="w-3 h-3" />
                    RSS Feed
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  const renderDaySelection = () => {
    if (formData.frequency === "weekly") {
      return (
        <div className="grid gap-2">
          <Label>Select Days of the Week</Label>
          <div className="flex flex-wrap gap-2">
            {daysOfWeek.map((day) => (
              <Button
                key={day.value}
                type="button"
                variant={formData.selectedDays.includes(day.value) ? "default" : "outline"}
                size="sm"
                onClick={() => handleDayToggle(day.value)}
                className={
                  formData.selectedDays.includes(day.value)
                    ? "bg-teal-600 hover:bg-teal-700 text-white"
                    : "text-gray-600 hover:text-teal-600 hover:border-teal-600"
                }
              >
                {day.label}
              </Button>
            ))}
          </div>
        </div>
      )
    }

    if (formData.frequency === "monthly") {
      return (
        <div className="grid gap-2">
          <Label>Select Days of the Month</Label>
          <div className="grid grid-cols-7 gap-2">
            {daysOfMonth.map((day) => (
              <Button
                key={day}
                type="button"
                variant={formData.selectedDays.includes(day) ? "default" : "outline"}
                size="sm"
                onClick={() => handleDayToggle(day)}
                className={`h-10 w-10 p-0 ${
                  formData.selectedDays.includes(day)
                    ? "bg-teal-600 hover:bg-teal-700 text-white"
                    : "text-gray-600 hover:text-teal-600 hover:border-teal-600"
                }`}
              >
                {day}
              </Button>
            ))}
          </div>
        </div>
      )
    }

    return null
  }

  const renderDigestForm = () => (
    <div className="grid gap-6 py-4">
      {/* Template Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Template Information</h3>

        <div className="grid gap-2">
          <Label htmlFor="title">Template Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="My Daily News Digest"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select
              value={formData.frequency}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, frequency: value, selectedDays: [] }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="scheduleTime">Schedule Time (HH:MM)</Label>
            <Input
              id="scheduleTime"
              type="time"
              value={formData.scheduleTime}
              onChange={(e) => setFormData((prev) => ({ ...prev, scheduleTime: e.target.value }))}
            />
          </div>
        </div>

        {renderDaySelection()}
      </div>

      {/* Content Sources */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Content Sources</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPreviews(!showPreviews)}
            className="text-gray-600 hover:text-teal-600"
          >
            {showPreviews ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showPreviews ? "Hide" : "Show"} Previews
          </Button>
        </div>

        {formData.contentSources.map((source, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <Label className="text-sm font-medium text-gray-700">Content Source #{index + 1}</Label>
                </div>
                <Input
                  value={source.url}
                  onChange={(e) => handleContentSourceChange(index, e.target.value)}
                  placeholder="https://... (YouTube channel or website with RSS feed)"
                  className={
                    source.validationError
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : source.sourceType && source.sourceType !== "invalid"
                        ? "border-green-300 focus:border-green-500 focus:ring-green-500"
                        : ""
                  }
                />
                {renderValidationStatus(source)}
              </div>
              {formData.contentSources.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeContentSource(index)}
                  className="text-gray-500 hover:text-red-600 hover:border-red-600 mt-6"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            {renderUrlPreview(source, index)}
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addContentSource}
          className="text-gray-600 hover:text-teal-600 hover:border-teal-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Content Source
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Main Content */}
      <main className="px-6 py-8 max-w-7xl mx-auto">
        {/* Digests Section */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-semibold text-gray-900">Your Digests</CardTitle>
            <Button onClick={handleCreateDigest} className="bg-teal-600 hover:bg-teal-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Digest
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-0 font-medium text-gray-600">Title</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Frequency</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Schedule</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Sources</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {digests.map((digest) => (
                    <tr
                      key={digest.id}
                      className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-0 text-gray-900 font-medium">{digest.title}</td>
                      <td className="py-4 px-4 text-gray-900 capitalize">{digest.frequency}</td>
                      <td className="py-4 px-4 text-gray-900">{digest.scheduleTime}</td>
                      <td className="py-4 px-4 text-gray-900">{getDigestSummary(digest)}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditDigest(digest)}
                            className="text-gray-600 hover:text-teal-600 hover:border-teal-600"
                          >
                            <Edit className="w-4 h-4" />
                            <span className="sr-only">Edit {digest.title}</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteDigest(digest)}
                            className="text-gray-600 hover:text-red-600 hover:border-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="sr-only">Delete {digest.title}</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Email Template</DialogTitle>
              <DialogDescription>
                Set up your email template with YouTube channels or websites that have RSS feeds
              </DialogDescription>
            </DialogHeader>
            {renderDigestForm()}
            <DialogFooter>
              <Button variant="outline" onClick={cancelDialog}>
                Cancel
              </Button>
              <Button
                onClick={confirmCreate}
                className="bg-teal-600 hover:bg-teal-700 text-white"
                disabled={!isFormValid()}
              >
                Save Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Email Template</DialogTitle>
              <DialogDescription>Make changes to your email template configuration</DialogDescription>
            </DialogHeader>
            {renderDigestForm()}
            <DialogFooter>
              <Button variant="outline" onClick={cancelDialog}>
                Cancel
              </Button>
              <Button
                onClick={confirmEdit}
                className="bg-teal-600 hover:bg-teal-700 text-white"
                disabled={!isFormValid()}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Digest</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletingDigest?.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelDialog}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  )
}
