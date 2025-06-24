"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Home, Rss, LogOut } from "lucide-react"

export function Navbar() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (!error) {
      router.push("/auth/login")
    }
  }

  const getInitials = (name: string) => {
    return (name?.charAt(0) || "U").toUpperCase()
  }

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/feeds", label: "Feeds", icon: Rss },
  ]

  return (
    <nav className="bg-slate-800/95 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - mantém à esquerda */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl p-2">
              <img src="/funnel-icon.webp" alt="FeedAgg" className="w-6 h-6 filter brightness-0 invert" />
            </div>
            <span className="text-xl font-bold text-white">
              Feed<span className="text-teal-400">Agg</span>
            </span>
          </Link>

          {/* Navegação + User Menu - tudo à direita */}
          <div className="flex items-center space-x-6">
            {/* Navigation Links - agora à direita */}
            <div className="hidden md:flex items-center space-x-4">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === href ? "bg-teal-600 text-white" : "text-gray-300 hover:text-white hover:bg-slate-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={user?.user_metadata?.avatar_url || "/placeholder.svg"}
                      alt={user?.user_metadata?.full_name || "User"}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-teal-400 to-teal-600 text-white font-bold text-lg border-2 border-teal-300/50">
                      {user?.user_metadata?.full_name ? getInitials(user.user_metadata.full_name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-slate-800 border-slate-700" align="end">
                <div className="flex items-center justify-start gap-3 p-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={user?.user_metadata?.avatar_url || "/placeholder.svg"}
                      alt={user?.user_metadata?.full_name || "User"}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-teal-400 to-teal-600 text-white font-bold text-xl">
                      {user?.user_metadata?.full_name ? getInitials(user.user_metadata.full_name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-white text-sm">{user?.user_metadata?.full_name || "User"}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[180px]">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-gray-300 hover:text-white hover:bg-slate-700 cursor-pointer m-1"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation - melhorada */}
        <div className="md:hidden">
          <div className="flex items-center justify-between pt-4 pb-4 border-t border-slate-700">
            <div className="flex space-x-1">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === href ? "bg-teal-600 text-white" : "text-gray-300 hover:text-white hover:bg-slate-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
