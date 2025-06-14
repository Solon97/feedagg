import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

interface Context {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: Context) {
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

    const { id } = await params;

    const { data: savedContent, error } = await supabase
      .from("saved_content")
      .select(
        `
        *,
        content_item:content_items(*)
      `
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Saved content not found" },
          { status: 404 }
        );
      }
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

export async function PUT(request: NextRequest, { params }: Context) {
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

    const { id: paramId } = await params;
    const updates = await request.json();

    // Remove protected fields
    const { id, user_id, content_item_id, saved_at, ...allowedUpdates } =
      updates;

    const { data: savedContent, error } = await supabase
      .from("saved_content")
      .update(allowedUpdates)
      .eq("id", paramId)
      .eq("user_id", user.id)
      .select(
        `
        *,
        content_item:content_items(*)
      `
      )
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Saved content not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ savedContent });
  } catch (error) {
    console.error("Saved content update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Context) {
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

    const { id } = await params;

    const { error } = await supabase
      .from("saved_content")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Saved content deleted successfully" });
  } catch (error) {
    console.error("Saved content deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
