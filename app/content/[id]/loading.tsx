import { Loader2 } from "lucide-react"

export default function ContentDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading content...</p>
      </div>
    </div>
  )
}
