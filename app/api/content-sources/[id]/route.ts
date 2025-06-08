import { createSupabaseServerClient } from "../../../../lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";
import { ContentSourceRepositoryImpl } from "../../../../src/infrastructure/supabase/content-source.repository.impl";

interface Context {
  params: {
    id: string;
  };
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

    // Use repository for proper field mapping
    const repository = new ContentSourceRepositoryImpl(supabase as any);
    const result = await repository.findById(params.id);

    if (!result.success) {
      if (result.error.message.includes("not found")) {
        return NextResponse.json(
          { error: "Content source not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }

    // Verify ownership
    if (result.data?.userId !== user.id) {
      return NextResponse.json(
        { error: "Content source not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ source: result.data });
  } catch (error) {
    console.error("Content source fetch error:", error);
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

    const { id } = await params;
    const updates = await request.json();

    // Remove protected fields and client-side fields
    const {
      id: updateId,
      user_id,
      userId,
      created_at,
      ...allowedUpdates
    } = updates;

    // Use repository for proper field mapping
    const repository = new ContentSourceRepositoryImpl(supabase as any);
    const result = await repository.update(id, allowedUpdates);

    if (!result.success) {
      if (result.error.message.includes("not found")) {
        return NextResponse.json(
          { error: "Content source not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ source: result.data });
  } catch (error) {
    console.error("Content source update error:", error);
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

    // Use repository for proper handling of two-table structure
    const repository = new ContentSourceRepositoryImpl(supabase as any);
    const result = await repository.delete(params.id);

    if (!result.success) {
      if (result.error.message.includes("not found")) {
        return NextResponse.json(
          { error: "Content source not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Content source deleted successfully",
    });
  } catch (error) {
    console.error("Content source deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Context) {
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
    const { action } = await request.json();

    if (action === "toggle") {
      // Use repository for proper field mapping
      const repository = new ContentSourceRepositoryImpl(supabase as any);

      // Get current source to toggle its status
      const currentResult = await repository.findById(id);
      if (!currentResult.success || !currentResult.data) {
        return NextResponse.json(
          { error: "Content source not found" },
          { status: 404 }
        );
      }

      // Toggle the status
      const updateResult = await repository.update(id, {
        isActive: !currentResult.data.isActive,
      });

      if (!updateResult.success) {
        return NextResponse.json(
          { error: updateResult.error.message },
          { status: 400 }
        );
      }

      return NextResponse.json({ source: updateResult.data });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Content source toggle error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
