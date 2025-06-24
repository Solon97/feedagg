"use client"
import { useRouter } from "next/navigation"
import type { FeedItem } from "../types"

interface Props {
  item: FeedItem
}

export function FeedItemCard({ item }: Props) {
  const router = useRouter()

  // Adicione esta função no início do componente, após as importações
  const getFeedType = (feedUrl: string): "blog" | "youtube" => {
    return feedUrl.includes("youtube.com") ? "youtube" : "blog"
  }

  // Substitua a função handleClick por:
  const handleClick = () => {
    // Encode os dados do item para passar via URL
    const itemData = encodeURIComponent(JSON.stringify(item))
    router.push(`/item/${item.id}?data=${itemData}`)
  }

  return (
    <div key={item.id} className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800">{item.title}</h2>
        <p className="mt-2 text-gray-600">{item.description}</p>
        <div className="mt-3 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {item.feed && item.feed.name ? item.feed.name : "Unknown Source"} - {getFeedType(item.feed.url)}
          </span>
          <button
            onClick={handleClick}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
          >
            Read More
          </button>
        </div>
      </div>
    </div>
  )
}

// (optional) still allow default import
export default FeedItemCard
