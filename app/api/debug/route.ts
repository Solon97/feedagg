import { type NextRequest, NextResponse } from "next/server"
import { apiDiagnostics } from "@/lib/api-diagnostics"

export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Debug endpoint only available in development" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const requestId = searchParams.get("requestId")
  const action = searchParams.get("action")

  if (action === "clear") {
    apiDiagnostics.clear()
    return NextResponse.json({ message: "Diagnostics cleared" })
  }

  const diagnostics = requestId ? apiDiagnostics.getDiagnostics(requestId) : apiDiagnostics.getDiagnostics()

  return NextResponse.json({
    totalDiagnostics: diagnostics.length,
    diagnostics: diagnostics.slice(-50), // Last 50 entries
    recentErrors: apiDiagnostics.getLastErrors(10),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
  })
}
