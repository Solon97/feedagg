import { NextResponse } from "next/server";

/**
 * POST /api/youtube/like
 * Body: { videoId: string }
 * Headers: x-provider-token: string (Google OAuth access token with youtube.force-ssl)
 *          OR Authorization: Bearer <provider_token>
 */
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 415 }
      );
    }

    const { videoId } = (await request.json()) as { videoId?: string };
    if (!videoId || typeof videoId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'videoId'" },
        { status: 400 }
      );
    }

    // Accept provider token from custom header or Authorization header
    const providerHeader = request.headers.get("x-provider-token");
    const authHeader = request.headers.get("authorization");
    const tokenFromAuth = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : undefined;
    const providerToken = providerHeader || tokenFromAuth;

    if (!providerToken) {
      return NextResponse.json(
        {
          error:
            "Missing provider token. Provide it via 'x-provider-token' header or 'Authorization: Bearer <token>'",
        },
        { status: 401 }
      );
    }

    const url = `https://www.googleapis.com/youtube/v3/videos/rate?id=${encodeURIComponent(
      videoId
    )}&rating=like`;

    const ytResp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${providerToken}`,
        Accept: "application/json",
        "Content-Length": "0",
      },
    });

    // YouTube returns 204 No Content on success
    if (ytResp.status === 204) {
      return NextResponse.json({ success: true });
    }

    // Try to parse error from YouTube if available
    let errorPayload: any = undefined;
    try {
      errorPayload = await ytResp.json();
    } catch {
      // ignore
    }

    const reason =
      errorPayload?.error?.errors?.[0]?.reason || errorPayload?.error?.status;
    const message =
      errorPayload?.error?.message ||
      `YouTube API error (${ytResp.status} ${ytResp.statusText})`;

    return NextResponse.json(
      { success: false, error: message, reason, details: errorPayload?.error },
      { status: ytResp.status }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
