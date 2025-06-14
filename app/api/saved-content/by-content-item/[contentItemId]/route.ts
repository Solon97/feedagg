import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { SavedContentRepositoryImpl } from "@/src/infrastructure/supabase/saved-content.repository.impl";

interface RouteContext {
  params: Promise<{
    contentItemId: string;
  }>;
}

/**
 * GET /api/saved-content/by-content-item/[contentItemId]
 * Find saved content by content item ID for the authenticated user
 */
export async function GET(
  request: Request,
  { params }: RouteContext
): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { contentItemId } = await params;

    if (!contentItemId) {
      return NextResponse.json(
        { error: "Content item ID is required" },
        { status: 400 }
      );
    }

    // Initialize repository
    const savedContentRepository = new SavedContentRepositoryImpl(supabase);

    // Find saved content by user ID and content item ID
    const savedContent =
      await savedContentRepository.findByUserIdAndContentItemId(
        user.id,
        contentItemId
      );

    if (!savedContent) {
      return NextResponse.json(
        { saved: false, savedContentId: null },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        saved: true,
        savedContentId: savedContent.id,
        savedContent,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error finding saved content by content item ID:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
