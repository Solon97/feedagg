"use client"

import { useState, useEffect } from "react"
import { notFound, useRouter } from "next/navigation"
import DetailView from "@/components/DetailView"
import { Loader2 } from "lucide-react"

interface ContentItem {
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
  domain?: string
  source?: string
  content_type?: string
  created_at?: string
}

interface Props {
  params: {
    id: string
  }
}

const ContentDetailPage = ({ params: { id } }: Props) => {
  const [content, setContent] = useState<ContentItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true)

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800))

        // Mock content data - in a real app, this would fetch from your API
        const mockContent: ContentItem = {
          id: id,
          title: "The Future of Web Development: Trends to Watch in 2024",
          description:
            "Explore the latest trends and technologies shaping the future of web development, from AI integration to new frameworks and development practices.",
          content: `
            <article>
              <h1>The Future of Web Development: Trends to Watch in 2024</h1>
              
              <p>The web development landscape continues to evolve at a rapid pace, with new technologies, frameworks, and methodologies emerging regularly. As we progress through 2024, several key trends are shaping the future of how we build and interact with web applications.</p>
              
              <h2>1. AI-Powered Development Tools</h2>
              <p>Artificial Intelligence is revolutionizing the development process. From code completion tools like GitHub Copilot to AI-powered design systems, developers are leveraging machine learning to write better code faster. These tools are not replacing developers but augmenting their capabilities, allowing them to focus on higher-level problem-solving and creative tasks.</p>
              
              <h2>2. Edge Computing and Serverless Architecture</h2>
              <p>The shift towards edge computing continues to gain momentum. By processing data closer to users, applications can achieve lower latency and better performance. Serverless architectures are becoming more sophisticated, with platforms like Vercel, Netlify, and AWS Lambda leading the charge in making deployment and scaling effortless.</p>
              
              <h2>3. Web Assembly (WASM) Adoption</h2>
              <p>WebAssembly is enabling high-performance applications to run in browsers with near-native speed. This technology is particularly impactful for computationally intensive applications like image processing, gaming, and scientific computing that previously required native applications.</p>
              
              <h2>4. Progressive Web Apps (PWAs) Evolution</h2>
              <p>PWAs continue to bridge the gap between web and native applications. With improved offline capabilities, push notifications, and app-like experiences, PWAs are becoming a viable alternative to traditional mobile apps for many use cases.</p>
              
              <h2>5. Enhanced Developer Experience</h2>
              <p>The focus on developer experience (DX) has never been stronger. Tools like Vite, Next.js, and modern build systems are prioritizing fast development cycles, hot reloading, and intuitive APIs. This trend is making web development more accessible and enjoyable.</p>
              
              <h2>6. Sustainability and Green Computing</h2>
              <p>Environmental consciousness is influencing web development practices. Developers are increasingly considering the carbon footprint of their applications, optimizing for energy efficiency, and choosing hosting providers that use renewable energy.</p>
              
              <h2>Conclusion</h2>
              <p>The future of web development is bright and full of possibilities. As these trends continue to mature, they will enable developers to create more powerful, efficient, and user-friendly applications. Staying informed about these developments and experimenting with new technologies will be key to success in the evolving web development landscape.</p>
            </article>
          `,
          url: `https://example.com/article/${id}`,
          provider: "TechCrunch",
          providerType: "rss",
          publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          readTime: "8 min",
          thumbnail: `/placeholder.svg?height=400&width=600&text=TechCrunch`,
          author: "TechCrunch Editorial",
          isRead: false,
          isSaved: Math.random() > 0.5,
          domain: "techcrunch.com",
          source: "TechCrunch",
          content_type: "article",
          created_at: new Date().toISOString(),
        }

        setContent(mockContent)
      } catch (err) {
        console.error("Error fetching content:", err)
        setError("Failed to load content")
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Content</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!content) {
    notFound()
  }

  // Transform the content to match the expected format for DetailView
  const transformedContent = {
    id: content.id,
    title: content.title,
    url: content.url,
    source: content.source || content.provider,
    created_at: content.created_at || content.publishedAt,
    content_type: content.content_type || content.providerType,
    domain: content.domain || new URL(content.url).hostname,
  }

  return (
    <DetailView
      content={transformedContent}
      savedContentId={null} // This is not saved content, so no savedContentId
      isFromDigest={true} // Flag to indicate this came from digest
    />
  )
}

export default ContentDetailPage
