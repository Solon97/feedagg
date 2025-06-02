import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"

import DetailView from "@/components/DetailView"

interface Props {
  params: {
    id: string
  }
}

const SavedContentDetailPage = async ({ params: { id } }: Props) => {
  const supabase = createServerComponentClient({ cookies })

  const { data: savedContent, error } = await supabase
    .from("saved_content")
    .select(`
      id,
      created_at,
      content (
        id,
        title,
        url,
        source,
        created_at,
        content_type,
        domain
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching saved content:", error)
    return <div>Error: Failed to load saved content.</div>
  }

  if (!savedContent || !savedContent.content) {
    notFound()
  }

  return <DetailView content={savedContent.content} savedContentId={savedContent.id} />
}

export default SavedContentDetailPage
