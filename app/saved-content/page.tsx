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
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

  const [savedContent, setSavedContent] = useState<SavedContentItem[]>([
    {
      id: 1,
      title: "Engenharia de Prompts: A Nova Habilidade Essencial da Era da IA",
      source: "TechBlog Brasil",
      type: "article",
      readTime: "8 min",
      savedDate: "2 days ago",
      thumbnail: "/placeholder.svg?height=200&width=300",
      isConsumed: false,
      content: `
    <div id="readability-page-1">
      <p>A IA generativa já faz parte do nosso dia a dia. Aprender a "conversar" com ela, ou seja, dominar a <strong>engenharia de prompts</strong>, é essencial para guiar seu potencial.</p>

      <figure>
        <img src="/placeholder.svg?height=400&width=600" alt="Pessoa ensinando IA" />
        <figcaption>"Saber falar com a IA é o novo inglês."</figcaption>
      </figure>

      <h3>O que é engenharia de prompts?</h3>
      <p>É a arte de criar instruções claras para modelos de linguagem (LLMs) gerarem resultados precisos, como um chef que segue uma receita detalhada.</p>

      <h3>Por que é importante?</h3>
      <ul>
        <li><strong>Desenvolvimento de software:</strong> gerar código, testes e documentações.</li>
        <li><strong>Marketing:</strong> criar textos persuasivos e ideias para campanhas.</li>
        <li><strong>Educação:</strong> material didático adaptativo e tutores virtuais.</li>
      </ul>

      <table>
        <thead>
          <tr>
            <th>Setor</th>
            <th>Benefício</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Data Science</td>
            <td>Scripts de análise e visualizações rápidas</td>
          </tr>
          <tr>
            <td>Design</td>
            <td>Geração de ideias visuais</td>
          </tr>
        </tbody>
      </table>

      <blockquote>
        <p>"O futuro é conversacional – você está pronto para liderar a conversa?"</p>
      </blockquote>

      <p>Saiba mais em:
        <a href="https://www.rocketseat.com.br/formacao/ia-para-devs">Formação IA para devs</a> |
        <a href="https://www.rocketseat.com.br/formacao/ia">Desenvolvimento de IA</a>
      </p>
    </div>
  `,
    },
    {
      id: 2,
      title: "The Future of AI: Trends and Predictions",
      source: "AI Research Weekly",
      type: "article",
      readTime: "8 min",
      savedDate: "1 week ago",
      thumbnail: "/placeholder.svg?height=200&width=300",
      isConsumed: true,
      content: `
        <h2>Artificial Intelligence: Looking Ahead</h2>
        <p>Artificial Intelligence continues to evolve at an unprecedented pace, transforming industries and reshaping how we interact with technology. As we look toward the future, several key trends are emerging that will define the next decade of AI development.</p>
        
        <h3>Machine Learning Democratization</h3>
        <p>One of the most significant trends is the democratization of machine learning tools. No-code and low-code platforms are making AI accessible to non-technical users, enabling businesses of all sizes to leverage AI capabilities without requiring extensive technical expertise.</p>
        
        <h3>Ethical AI and Responsible Development</h3>
        <p>As AI systems become more powerful and widespread, the focus on ethical AI development has intensified. Organizations are implementing frameworks to ensure AI systems are fair, transparent, and accountable.</p>
        
        <p>This includes addressing bias in AI models, ensuring privacy protection, and developing AI systems that can explain their decision-making processes.</p>
        
        <h3>AI in Healthcare and Education</h3>
        <p>Healthcare and education are two sectors where AI is expected to have transformative impacts. From personalized medicine to adaptive learning systems, AI is enabling more personalized and effective solutions.</p>
        
        <p>The integration of AI in these critical sectors promises to improve outcomes and accessibility while reducing costs.</p>
      `,
    },
    {
      id: 3,
      title: "React Hooks Explained in 10 Minutes",
      source: "CodeWithMosh",
      type: "video",
      readTime: "10 min",
      savedDate: "3 days ago",
      thumbnail: "/placeholder.svg?height=200&width=300",
      videoUrl: "https://www.youtube.com/watch?v=ohI7iu0Ub_U",
      isConsumed: false,
    },
    {
      id: 4,
      title: "CSS Grid vs Flexbox: When to Use Which",
      source: "CSS-Tricks",
      type: "article",
      readTime: "6 min",
      savedDate: "3 weeks ago",
      thumbnail: "/placeholder.svg?height=200&width=300",
      isConsumed: false,
      content: `
        <h2>CSS Layout: Grid vs Flexbox</h2>
        <p>CSS Grid and Flexbox are two powerful layout systems that have revolutionized how we create layouts on the web. While they can sometimes be used interchangeably, each has its strengths and ideal use cases.</p>
        
        <h3>Understanding Flexbox</h3>
        <p>Flexbox is designed for one-dimensional layouts. It excels at distributing space and aligning items within a container, whether in a row or column. Flexbox is perfect for components like navigation bars, card layouts, and centering content.</p>
        
        <p>The flexible nature of Flexbox makes it ideal for responsive design, as items can grow, shrink, and wrap as needed.</p>
        
        <h3>Understanding CSS Grid</h3>
        <p>CSS Grid is designed for two-dimensional layouts. It allows you to create complex layouts with rows and columns simultaneously. Grid is perfect for page layouts, image galleries, and any design that requires precise control over both dimensions.</p>
        
        <h3>When to Use Each</h3>
        <p>Use Flexbox when you need to arrange items in a single direction and want them to be flexible. Use Grid when you need to create complex two-dimensional layouts or when you need precise control over both rows and columns.</p>
        
        <p>In many cases, you'll use both together - Grid for the overall page layout and Flexbox for component-level layouts.</p>
      `,
    },
    {
      id: 5,
      title: "Building Modern Web Apps with Next.js",
      source: "Vercel",
      type: "video",
      readTime: "25 min",
      savedDate: "1 week ago",
      thumbnail: "/placeholder.svg?height=200&width=300",
      videoUrl: "https://www.youtube.com/watch?v=ohI7iu0Ub_U",
      isConsumed: true,
    },
    {
      id: 6,
      title: "Understanding TypeScript Generics",
      source: "Dev.to",
      type: "article",
      readTime: "12 min",
      savedDate: "2 weeks ago",
      thumbnail: "/placeholder.svg?height=200&width=300",
      isConsumed: false,
      content: `
        <h2>Mastering TypeScript Generics</h2>
        <p>TypeScript generics are one of the most powerful features of the language, allowing you to create reusable components and functions that work with multiple types while maintaining type safety.</p>
        
        <h3>What Are Generics?</h3>
        <p>Generics provide a way to make components work with any data type and not restrict to one data type. They allow you to capture the type of the argument in such a way that you can also use it to denote what is being returned.</p>
        
        <h3>Basic Generic Functions</h3>
        <p>The simplest way to understand generics is through functions. Instead of using 'any' type, which loses type information, generics preserve the type relationship between input and output.</p>
        
        <h3>Generic Interfaces and Classes</h3>
        <p>Generics aren't limited to functions. You can also create generic interfaces and classes that provide flexibility while maintaining type safety throughout your application.</p>
        
        <p>This is particularly useful when building data structures, API clients, or any component that needs to work with various data types.</p>
        
        <h3>Advanced Generic Patterns</h3>
        <p>Advanced generic patterns include conditional types, mapped types, and utility types. These patterns enable you to create sophisticated type transformations and constraints.</p>
      `,
    },
    // Add more content items for better mobile testing
    ...Array.from({ length: 6 }, (_, i) => ({
      id: 7 + i,
      title: `Sample Article ${i + 1}`,
      source: `Source ${i + 1}`,
      type: i % 2 === 0 ? "article" : "video",
      readTime: `${5 + i} min`,
      savedDate: `${i + 1} days ago`,
      thumbnail: "/placeholder.svg?height=200&width=300",
      content: `<h2>Sample content ${i + 1}</h2><p>This is sample content for testing.</p>`,
      ...(i % 2 === 1 && { videoUrl: "https://www.youtube.com/watch?v=ohI7iu0Ub_U" }),
      isConsumed: i % 3 === 0,
    })),
  ])

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
                </CardHeader>
                <CardContent>
                  <div className="aspect-video w-full">
                    <iframe
                      src={selectedContent.videoUrl.replace("watch?v=", "embed/")}
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
                          className={`capitalize ${
                            isSelected
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
                    {contentProviders.map((provider) => {
                      const count = savedContent.filter((item) => item.source === provider).length
                      const isSelected = selectedProviders.includes(provider)
                      return (
                        <Button
                          key={provider}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleProviderFilter(provider)}
                          className={`text-xs md:text-sm ${
                            isSelected
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
                        className={`w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-200 ${
                          content.isConsumed ? "opacity-60" : ""
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
                          className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${
                            content.type === "video" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
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
                          </Button>
                          <Button
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
                          className={`text-xs ${
                            content.type === "video" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {content.type === "video" ? "Video" : "Article"}
                        </Badge>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex items-center">
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
