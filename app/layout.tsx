import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { SelectedItemProvider } from "@/contexts/selected-item-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { DevLogger } from "@/components/dev-logger"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FeedAgg - Your Intelligent Content Companion",
  description: "Aggregate and manage your RSS feeds and YouTube channels in one place",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <SelectedItemProvider>
              {children}
              <Toaster />
              <DevLogger />
            </SelectedItemProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
