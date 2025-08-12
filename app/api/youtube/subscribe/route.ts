import { NextResponse } from "next/server";

/**
 * POST /api/youtube/subscribe
 * Body: { channelId: string }
 * Headers: x-provider-token or Authorization: Bearer <provider_token>
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

    const { channelId } = (await request.json()) as { channelId?: string };
    if (!channelId || typeof channelId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'channelId'" },
        { status: 400 }
      );
    }

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

    const url = `https://www.googleapis.com/youtube/v3/subscriptions?part=snippet`;
    const body = {
      snippet: {
        resourceId: {
          kind: "youtube#channel",
          channelId,
        },
      },
    };

    const ytResp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${providerToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (ytResp.ok) {
      const json = await ytResp.json().catch(() => ({}));
      return NextResponse.json({ success: true, data: json });
    }

    let errorPayload: any = undefined;
    try {
      errorPayload = await ytResp.json();
    } catch {}

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
