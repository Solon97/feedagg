import { createSupabaseServerClient } from "../../../lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // Use getUser() for secure authentication
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sourceId = searchParams.get("source_id");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    const search = searchParams.get("search");
    const orderBy = searchParams.get("orderBy") || "published_at";
    const orderDirection = searchParams.get("orderDirection") || "desc";

    // Get filter parameters
    const contentTypes = searchParams.getAll("contentType");
    const authors = searchParams.getAll("author");

    // First get user's feed source IDs from user_feed_subscriptions
    const { data: userSources, error: sourcesError } = await supabase
      .from("user_feed_subscriptions")
      .select("feed_source_id")
      .eq("user_id", user.id);

    if (sourcesError) {
      return NextResponse.json(
        { error: sourcesError.message },
        { status: 400 }
      );
    }

    const sourceIds = userSources.map((s) => s.feed_source_id).filter(Boolean);

    if (sourceIds.length === 0) {
      return NextResponse.json({ contentItems: [] });
    }

    // Now query content_items using the feed_source_ids
    let query = supabase
      .from("content_items")
      .select("*")
      .in("feed_source_id", sourceIds);

    // Apply filters
    if (sourceId) {
      query = query.eq("feed_source_id", sourceId);
    }

    if (search) {
      query = query.or(
        `title.ilike.%${search}%, content.ilike.%${search}%, summary.ilike.%${search}%`
      );
    }

    if (authors.length > 0) {
      query = query.in("author", authors);
    }

    // Apply ordering
    const ascending = orderDirection === "asc";
    if (orderBy === "published_at") {
      query = query
        .order("published_at", { ascending, nullsFirst: false })
        .order("created_at", { ascending: false });
    } else if (orderBy === "created_at") {
      query = query.order("created_at", { ascending });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: contentItems, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Map the database fields to the expected frontend format
    const mappedContentItems =
      contentItems?.map((item) => {
        // Determine content type based on URL patterns
        const getContentType = (url: string): string => {
          if (!url) return "article";

          const lowerUrl = url.toLowerCase();
          if (
            lowerUrl.includes("youtube.com") ||
            lowerUrl.includes("youtu.be") ||
            lowerUrl.includes("vimeo.com") ||
            lowerUrl.includes("video")
          ) {
            return "video";
          }

          if (
            lowerUrl.includes("podcast") ||
            lowerUrl.includes(".mp3") ||
            lowerUrl.includes("audio")
          ) {
            return "podcast";
          }

          return "article";
        };

        return {
          id: item.id,
          title: item.title,
          content: item.content,
          excerpt: item.summary,
          author: item.author,
          url: item.url,
          publishedAt: item.published_at,
          imageUrl: item.thumbnail_url, // Map thumbnail_url to imageUrl
          readingTime: item.read_time_minutes,
          contentType: getContentType(item.url),
          tags: [], // No tags support yet
          sourceId: item.feed_source_id,
          contentHash: item.content_hash,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        };
      }) || [];

    // Apply content type filter after mapping (since it's derived from URL)
    let filteredItems = mappedContentItems;
    if (contentTypes.length > 0) {
      filteredItems = mappedContentItems.filter((item) =>
        contentTypes.includes(item.contentType)
      );
    }

    return NextResponse.json({ contentItems: filteredItems });
  } catch (error) {
    console.error("Content items fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
