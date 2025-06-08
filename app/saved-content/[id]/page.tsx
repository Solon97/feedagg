import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

import DetailView from "@/components/DetailView";

interface Props {
  params: {
    id: string;
  };
}

const SavedContentDetailPage = async ({ params: { id } }: Props) => {
  const supabase = createServerComponentClient({ cookies });
  const { data: savedContent, error } = await supabase
    .from("saved_content")
    .select(
      `
      id,
      created_at,
      content_items (
        id,
        title,
        url,
        feed_source_id,
        created_at,
        summary,
        author
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching saved content:", error);
    return <div>Error: Failed to load saved content.</div>;
  }

  if (!savedContent || !savedContent.content_items) {
    notFound();
  }

  // Transform the data to match DetailView expectations
  const contentItem = Array.isArray(savedContent.content_items)
    ? savedContent.content_items[0]
    : savedContent.content_items;

  if (!contentItem) {
    notFound();
  }

  const transformedContent = {
    id: contentItem.id,
    title: contentItem.title,
    url: contentItem.url,
    source: contentItem.feed_source_id,
    created_at: contentItem.created_at,
    content_type: "article", // Default type
    domain: new URL(contentItem.url).hostname,
  };

  return (
    <DetailView content={transformedContent} savedContentId={savedContent.id} />
  );
};

export default SavedContentDetailPage;
