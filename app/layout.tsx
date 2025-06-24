import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { DevOnly } from "@/components/dev-only"
import { DevLogger } from "@/components/dev-logger"

export const metadata: Metadata = {
  title: "FeedAgg - Your Intelligent Content Companion",
  description: "A secure authentication system built with Supabase for content aggregation",
  icons: {
    icon: "/favicon.ico",
  },
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
        <DevOnly>
          <DevLogger />
        </DevOnly>
      </body>
    </html>
  )
}
