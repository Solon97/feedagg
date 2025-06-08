import { createSupabaseServerClient } from "../../../lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";
import { ContentSourceRepositoryImpl } from "../../../src/infrastructure/supabase/content-source.repository.impl";

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

    // Use repository for proper field mapping
    const repository = new ContentSourceRepositoryImpl(supabase as any);
    const result = await repository.findByUserId(user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ sources: result.data });
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
    const supabase = await createSupabaseServerClient();

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

    // Use repository for proper handling of two-table structure
    const repository = new ContentSourceRepositoryImpl(supabase as any);

    // Prepare data for repository (remove userId as it's handled internally)
    const { userId, ...validSourceData } = sourceData;

    const result = await repository.create({
      ...validSourceData,
      userId: user.id,
    });

    if (!result.success) {
      // Handle unique constraint violation
      if (
        result.error.message?.includes("already added") ||
        result.error.message?.includes("unique")
      ) {
        return NextResponse.json(
          { error: "You have already added this URL" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ source: result.data }, { status: 201 });
  } catch (error) {
    console.error("Content source creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
