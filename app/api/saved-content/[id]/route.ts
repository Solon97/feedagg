import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface Context {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: Context) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

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
      .eq("id", params.id)
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
    const supabase = createRouteHandlerClient({ cookies });

    // Use getUser() for secure authentication
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updates = await request.json();

    // Remove protected fields
    const { id, user_id, content_item_id, saved_at, ...allowedUpdates } =
      updates;

    const { data: savedContent, error } = await supabase
      .from("saved_content")
      .update(allowedUpdates)
      .eq("id", params.id)
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
    const supabase = createRouteHandlerClient({ cookies });

    // Use getUser() for secure authentication
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("saved_content")
      .delete()
      .eq("id", params.id)
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
