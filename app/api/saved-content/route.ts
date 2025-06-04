import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: savedContent, error } = await supabase
      .from("saved_content")
      .select(
        `
        *,
        content_item:content_items(*)
      `
      )
      .eq("user_id", session.user.id)
      .order("saved_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ savedContent });
  } catch (error) {
    console.error("Saved content fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content_item_id, notes, tags } = await request.json();

    if (!content_item_id) {
      return NextResponse.json(
        { error: "Content item ID is required" },
        { status: 400 }
      );
    }

    // Check if content item exists and user has access to it
    const { data: contentItem, error: contentError } = await supabase
      .from("content_items")
      .select(
        `
        *,
        content_sources!inner(user_id)
      `
      )
      .eq("id", content_item_id)
      .eq("content_sources.user_id", session.user.id)
      .single();

    if (contentError || !contentItem) {
      return NextResponse.json(
        { error: "Content item not found or access denied" },
        { status: 404 }
      );
    }

    const newSavedContent = {
      user_id: session.user.id,
      content_item_id,
      notes: notes || null,
      tags: tags || null,
    };

    const { data: savedContent, error } = await supabase
      .from("saved_content")
      .insert([newSavedContent])
      .select(
        `
        *,
        content_item:content_items(*)
      `
      )
      .single();

    if (error) {
      // Handle unique constraint violation
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Content already saved" },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ savedContent }, { status: 201 });
  } catch (error) {
    console.error("Save content error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
