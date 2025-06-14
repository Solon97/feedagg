import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
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

    const { data: savedContent, error } = await supabase
      .from("saved_content")
      .select(
        `
        *,
        content_item:content_items(*)
      `
      )
      .eq("user_id", user.id)
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
    const supabase = await createSupabaseServerClient();

    // Use getUser() for secure authentication
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content_item_id, notes, tags } = await request.json();

    if (!content_item_id) {
      return NextResponse.json(
        { error: "Content item ID is required" },
        { status: 400 }
      );
    }

    // Check if content item exists
    const { data: contentItem, error: contentError } = await supabase
      .from("content_items")
      .select("id")
      .eq("id", content_item_id)
      .single();

    if (contentError || !contentItem) {
      console.error("Content item not found:", contentError);
      return NextResponse.json(
        { error: "Content item not found" },
        { status: 404 }
      );
    }

    const newSavedContent = {
      user_id: user.id,
      content_item_id,
      notes: notes || null,
      tags: tags || null,
    };

    const { data: savedContent, error } = await supabase
      .from("saved_content")
      .insert([newSavedContent])
      .select("*")
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

    return NextResponse.json(savedContent, { status: 201 });
  } catch (error) {
    console.error("Save content error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
