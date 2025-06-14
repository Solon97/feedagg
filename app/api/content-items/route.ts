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
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const sources =
      searchParams.get("sources")?.split(",").filter(Boolean) || [];
    const categories =
      searchParams.get("categories")?.split(",").filter(Boolean) || [];
    const contentTypes =
      searchParams.get("contentTypes")?.split(",").filter(Boolean) || [];
    const searchQuery = searchParams.get("search") || "";
    const orderBy = searchParams.get("orderBy") || "published_at";
    const orderDirection = searchParams.get("orderDirection") || "desc";

    // First, get user's feed subscriptions with optional category filter
    let subscriptionsQuery = supabase
      .from("user_feed_subscriptions")
      .select("feed_source_id, name, category")
      .eq("user_id", user.id);

    // Apply category filter on user subscriptions if provided
    if (categories.length > 0) {
      subscriptionsQuery = subscriptionsQuery.in("category", categories);
    }

    const { data: userSources, error: sourcesError } = await subscriptionsQuery;

    if (sourcesError) {
      return NextResponse.json(
        { error: sourcesError.message },
        { status: 400 }
      );
    }

    if (!userSources || userSources.length === 0) {
      return NextResponse.json({ contentItems: [] });
    }

    const sourceIds = userSources
      .map((s: any) => s.feed_source_id)
      .filter(Boolean);

    // Build query for content items
    let query = supabase
      .from("content_items")
      .select("*")
      .in("feed_source_id", sourceIds)
      .range(offset, offset + limit - 1);

    // Apply source filter by name if provided
    if (sources.length > 0) {
      const sourceIdsForFilter = userSources
        .filter((source: any) => sources.includes(source.name))
        .map((source: any) => source.feed_source_id);

      if (sourceIdsForFilter.length > 0) {
        query = query.in("feed_source_id", sourceIdsForFilter);
      }
    }

    // Apply search filter
    if (searchQuery) {
      query = query.or(
        `title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`
      );
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

    const { data: contentItems, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Get user subscription names to map to content items
    const { data: subscriptionsWithNames, error: subsError } = await supabase
      .from("user_feed_subscriptions")
      .select("feed_source_id, name")
      .eq("user_id", user.id)
      .in("feed_source_id", sourceIds);

    if (subsError) {
      console.error("Error fetching subscription names:", subsError);
    }

    // Create a map of feed_source_id to source name
    const sourceNameMap = new Map();
    if (subscriptionsWithNames) {
      subscriptionsWithNames.forEach((sub: any) => {
        sourceNameMap.set(sub.feed_source_id, sub.name);
      });
    }

    // Map the database fields to the expected frontend format
    const mappedContentItems =
      contentItems?.map((item: any) => {
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
          author:
            sourceNameMap.get(item.feed_source_id) ||
            item.author ||
            "Unknown Source",
          url: item.url,
          publishedAt: item.published_at,
          imageUrl: item.thumbnail_url,
          readingTime: item.read_time_minutes,
          contentType: getContentType(item.url),
          tags: [],
          sourceId: item.feed_source_id,
          contentHash: item.content_hash,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        };
      }) || [];

    // Apply content type filter after mapping (since it's derived from URL)
    let filteredItems = mappedContentItems;
    if (contentTypes.length > 0) {
      filteredItems = mappedContentItems.filter((item: any) =>
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
