"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, type ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface ProtectedRouteProps {
  children: ReactNode
  fallback?: ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return fallback || null
  }

  return <>{children}</>
}
