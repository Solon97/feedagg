"use client"

import { usePathname } from "next/navigation"
import { MobileNav } from "./mobile-nav"

export function Navbar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-teal-500 rounded flex items-center justify-center">
            <div className="w-5 h-3 bg-white rounded-sm transform rotate-12"></div>
          </div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Digestly</h1>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex items-center gap-2">
            <a
              href="/"
              className={`font-medium px-3 py-2 rounded-md transition-colors ${
                isActive("/") ? "text-teal-600 bg-teal-50" : "text-gray-600 hover:text-teal-600 hover:bg-gray-50"
              }`}
            >
              Dashboard
            </a>
            <a
              href="/saved-content"
              className={`font-medium px-3 py-2 rounded-md transition-colors ${
                isActive("/saved-content")
                  ? "text-teal-600 bg-teal-50"
                  : "text-gray-600 hover:text-teal-600 hover:bg-gray-50"
              }`}
            >
              Saved Content
            </a>
          </nav>

          <div className="h-6 w-px bg-gray-200"></div>

          <button className="text-gray-600 hover:text-gray-900 transition-colors px-4 py-2 rounded-md hover:bg-gray-50 font-medium">
            Log out
          </button>
        </div>

        {/* Mobile Navigation */}
        <MobileNav />
      </div>
    </header>
  )
}
