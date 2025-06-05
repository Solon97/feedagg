import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
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

    const { data: sources, error } = await supabase
      .from("content_sources")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ sources });
  } catch (error) {
    console.error("Content sources fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const sourceData = await request.json();

    // Validate required fields
    if (!sourceData.name || !sourceData.url) {
      return NextResponse.json(
        { error: "Name and URL are required" },
        { status: 400 }
      );
    }

    // Add user_id to the source data
    const newSource = {
      ...sourceData,
      user_id: user.id,
    };

    const { data: source, error } = await supabase
      .from("content_sources")
      .insert([newSource])
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "You have already added this URL" },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ source }, { status: 201 });
  } catch (error) {
    console.error("Content source creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
