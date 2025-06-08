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
      .in("feed_source_id", sourceIds)
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (sourceId) {
      query = query.eq("feed_source_id", sourceId);
    }

    const { data: contentItems, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ contentItems });
  } catch (error) {
    console.error("Content items fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
