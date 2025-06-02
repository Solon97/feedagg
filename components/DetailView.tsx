"use client"
import { useRouter } from "next/router"
import { format } from "date-fns"

interface DetailViewProps {
  content: {
    id: string
    title: string
    url: string
    source: string
    created_at: string
    content_type: string
    domain: string
  }
  savedContentId: string | null
  isFromDigest?: boolean
}

export default function DetailView({ content, savedContentId, isFromDigest = false }: DetailViewProps) {
  const router = useRouter()

  const formattedDate = content.created_at
    ? format(new Date(content.created_at), "MMMM dd, yyyy")
    : "Date not available"

  return (
    <div className="container mx-auto mt-8 p-4">
      <div className="mb-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => {
            if (isFromDigest) {
              router.push("/") // Go back to dashboard or digest list
            } else {
              router.push("/saved-content")
            }
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 inline-block mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="hidden sm:inline">{isFromDigest ? "Back to Dashboard" : "Back to Saved Content"}</span>
        </button>
      </div>

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-4">{content.title}</h2>
        <p className="text-gray-700 text-base mb-4">
          <strong>Source:</strong> {content.source} ({content.domain})
        </p>
        <p className="text-gray-700 text-base mb-4">
          <strong>Published Date:</strong> {formattedDate}
        </p>
        <a
          href={content.url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Read Full Article
        </a>
      </div>
    </div>
  )
}
