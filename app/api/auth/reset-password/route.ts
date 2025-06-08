import { createSupabaseServerClient } from "../../../../lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { password, code, access_token, refresh_token } =
      await request.json();

    console.log("Reset password request params:", {
      hasPassword: !!password,
      hasCode: !!code,
      hasAccessToken: !!access_token,
      hasRefreshToken: !!refresh_token,
    });

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Method 1: If we have access_token and refresh_token (older flow)
    if (access_token && refresh_token) {
      console.log("Using access_token/refresh_token flow...");

      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (sessionError) {
        console.log("Session error:", sessionError);
        return NextResponse.json(
          { error: "Invalid session tokens" },
          { status: 400 }
        );
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        console.log("Password update error:", updateError);
        return NextResponse.json(
          { error: updateError.message },
          { status: 400 }
        );
      }

      console.log("Password updated successfully via session");
      return NextResponse.json({
        message: "Password updated successfully",
      });
    }

    // Method 2: If we have a code (PKCE flow)
    if (code) {
      console.log("Using code-based flow...");

      // Try exchangeCodeForSession first (for PKCE flow)
      let authResult;
      try {
        console.log("Attempting exchangeCodeForSession...");
        authResult = await supabase.auth.exchangeCodeForSession(code);

        if (authResult.error) {
          console.log("Exchange code error:", authResult.error);

          // If exchangeCodeForSession fails, try verifyOtp with token_hash
          console.log("Attempting verifyOtp with token_hash...");
          authResult = await supabase.auth.verifyOtp({
            token_hash: code,
            type: "recovery",
          });
        }
      } catch (exchangeErr) {
        console.log("Exchange code exception, trying verifyOtp:", exchangeErr);
        // Fallback to verifyOtp
        authResult = await supabase.auth.verifyOtp({
          token_hash: code,
          type: "recovery",
        });
      }

      if (authResult.error) {
        console.log("All auth attempts failed:", authResult.error);
        return NextResponse.json(
          {
            error: "Invalid or expired reset code",
            details: authResult.error.message,
          },
          { status: 400 }
        );
      }

      // Now update the password
      console.log("Auth successful, attempting to update password...");
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        console.log("Password update error:", updateError);
        return NextResponse.json(
          {
            error: updateError.message,
          },
          { status: 400 }
        );
      }

      console.log("Password updated successfully via code");
      return NextResponse.json({
        message: "Password updated successfully",
      });
    }

    // If we don't have any valid authentication method
    return NextResponse.json(
      {
        error:
          "Missing authentication parameters. Please use a valid reset link.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
