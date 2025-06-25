"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { LogOut, Mail, Calendar, User, Shield } from "lucide-react"
import { useRouter } from "next/navigation"

export function UserProfile() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (!error) {
      router.push("/auth/login")
    }
  }

  if (!user) return null

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Card className="w-full max-w-md bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <Avatar className="h-24 w-24 ring-4 ring-teal-400/20">
            <AvatarImage
              src={user.user_metadata?.avatar_url || "/placeholder.svg"}
              alt={user.user_metadata?.full_name || "User"}
            />
            <AvatarFallback className="text-lg bg-gradient-to-br from-teal-400 to-teal-600 text-white">
              {user.user_metadata?.full_name ? getInitials(user.user_metadata.full_name) : <User className="h-8 w-8" />}
            </AvatarFallback>
          </Avatar>
        </div>
        <CardTitle className="text-xl text-white">Welcome, {user.user_metadata?.full_name || "User"}!</CardTitle>
        <p className="text-gray-400 text-sm">Ready to explore your content universe</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
            <Mail className="h-4 w-4 text-teal-400" />
            <span className="text-sm text-gray-300 flex-1">{user.email}</span>
            {user.email_confirmed_at && (
              <Badge variant="secondary" className="text-xs bg-green-900/30 text-green-400 border-green-700/50">
                <Shield className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
            <Calendar className="h-4 w-4 text-teal-400" />
            <span className="text-sm text-gray-300">Member since {formatDate(user.created_at)}</span>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
            <User className="h-4 w-4 text-teal-400" />
            <span className="text-sm text-gray-300">ID: {user.id.slice(0, 8)}...</span>
          </div>
        </div>

        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full mt-6 bg-transparent border-slate-600 text-gray-300 hover:bg-slate-700/50 hover:text-white transition-all duration-200"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </CardContent>
    </Card>
  )
}
