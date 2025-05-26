"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, Home, Bookmark, LogOut } from "lucide-react"

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/saved-content", label: "Saved Content", icon: Bookmark },
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

          {/* Menu Panel */}
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-teal-500 rounded flex items-center justify-center">
                    <div className="w-4 h-3 bg-white rounded-sm transform rotate-12"></div>
                  </div>
                  <span className="font-semibold text-gray-900">Digestly</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} aria-label="Close menu">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4">
                <div className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                          isActive(item.href)
                            ? "bg-teal-50 text-teal-600 font-medium"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </a>
                    )
                  })}
                </div>
              </nav>

              {/* Footer */}
              <div className="p-4 border-t">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-600 hover:text-gray-900"
                  onClick={() => {
                    setIsOpen(false)
                    // Handle logout
                  }}
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Log out
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
