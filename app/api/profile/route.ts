import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    // Use getUser() for secure authentication
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    console.log(
      "Profile API - User data:",
      user ? { id: user.id, email: user.email } : "No user"
    );
    console.log("Profile API - User error:", userError);

    if (userError || !user) {
      console.log("Profile API - Returning 401: No user or user error");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    console.log("Profile API - Profile data:", profile);
    console.log("Profile API - Profile error:", error);

    // If profile doesn't exist, create it automatically
    if (error && error.code === "PGRST116") {
      console.log("Profile API - Creating new profile for user");

      const newProfile = {
        id: user.id,
        email: user.email || "",
        full_name: user.user_metadata?.full_name || "",
        avatar_url: user.user_metadata?.avatar_url || "",
      };

      const { data: createdProfile, error: createError } = await supabase
        .from("profiles")
        .insert(newProfile)
        .select()
        .single();

      if (createError) {
        console.log(
          "Profile API - Error creating profile:",
          createError.message
        );
        return NextResponse.json(
          { error: createError.message },
          { status: 400 }
        );
      }

      console.log("Profile API - Profile created successfully");
      return NextResponse.json(createdProfile);
    }

    if (error) {
      console.log("Profile API - Returning 400:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log("Profile API - Success, returning profile");
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const updates = await request.json();

    // Remove id and other protected fields
    const { id, created_at, ...allowedUpdates } = updates;

    const { data: profile, error } = await supabase
      .from("profiles")
      .update(allowedUpdates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
