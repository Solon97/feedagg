"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Bookmark, LogOut, Settings } from "lucide-react"

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const pathname = usePathname()
  const menuRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const isActive = (path: string) => pathname === path

  const navItems: NavItem[] = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/saved-content", label: "Saved Content", icon: Bookmark },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeMenu()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      // Prevent body scroll when menu is open
      document.body.style.overflow = "hidden"
      // Focus management
      setTimeout(() => {
        const firstFocusable = menuRef.current?.querySelector("a") as HTMLElement
        firstFocusable?.focus()
      }, 350) // Wait for animation to complete
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Handle route changes
  useEffect(() => {
    if (isOpen) {
      closeMenu()
    }
  }, [pathname])

  const openMenu = () => {
    if (isAnimating) return // Prevent multiple rapid clicks

    setIsAnimating(true)
    setIsOpen(true)

    // Complete animation after transition duration
    setTimeout(() => {
      setIsAnimating(false)
    }, 350)
  }

  const closeMenu = () => {
    if (isAnimating) return // Prevent multiple rapid clicks

    setIsAnimating(true)

    // Start close animation, then update state
    setTimeout(() => {
      setIsOpen(false)
      setIsAnimating(false)
      // Return focus to trigger button
      triggerRef.current?.focus()
    }, 300)
  }

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    const startX = touch.clientX
    let hasMoved = false

    const handleTouchMove = (moveEvent: TouchEvent) => {
      const currentTouch = moveEvent.touches[0]
      const deltaX = currentTouch.clientX - startX
      hasMoved = true

      // Only close on significant right-to-left swipe (swipe from right edge to left)
      if (deltaX < -120 && startX > window.innerWidth * 0.7) {
        closeMenu()
        document.removeEventListener("touchmove", handleTouchMove)
        document.removeEventListener("touchend", handleTouchEnd)
      }
    }

    const handleTouchEnd = () => {
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }

    document.addEventListener("touchmove", handleTouchMove, { passive: true })
    document.addEventListener("touchend", handleTouchEnd)
  }

  return (
    <>
      {/* Mobile Menu Button - Only shows hamburger, no close functionality */}
      <Button
        ref={triggerRef}
        variant="ghost"
        size="sm"
        className="md:hidden relative z-50 h-10 w-10 p-0 hover:bg-gray-100 active:bg-gray-200 transition-colors duration-150"
        onClick={openMenu}
        aria-label="Open menu"
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        disabled={isAnimating}
      >
        <div className="relative w-5 h-5">
          {/* Static hamburger icon */}
          <span className="absolute block h-0.5 w-5 bg-gray-600 top-1" />
          <span className="absolute block h-0.5 w-5 bg-gray-600 top-2" />
          <span className="absolute block h-0.5 w-5 bg-gray-600 top-3" />
        </div>
      </Button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            ref={backdropRef}
            className={`fixed inset-0 bg-black transition-opacity duration-300 ease-out ${
              isAnimating && !isOpen ? "opacity-0" : "opacity-50"
            }`}
            onClick={closeMenu}
            aria-hidden="true"
          />

          {/* Menu Panel */}
          <div
            ref={menuRef}
            id="mobile-menu"
            className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transition-transform duration-300 ease-out ${
              isAnimating && !isOpen ? "translate-x-full" : "translate-x-0"
            }`}
            onTouchStart={handleTouchStart}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-menu-title"
          >
            <div className="flex flex-col h-full">
              {/* Header - Single close button */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center shadow-sm">
                    <div className="w-5 h-3 bg-white rounded-sm transform rotate-12"></div>
                  </div>
                  <div>
                    <h2 id="mobile-menu-title" className="font-semibold text-gray-900 text-lg">
                      Digestly
                    </h2>
                    <p className="text-xs text-gray-500">Content Digest Platform</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeMenu}
                  className="h-8 w-8 p-0 hover:bg-gray-200 rounded-full transition-colors duration-150"
                  aria-label="Close menu"
                  disabled={isAnimating}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </Button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto py-2" role="navigation">
                <div className="space-y-1 px-2">
                  {navItems.map((item, index) => {
                    const Icon = item.icon
                    const active = isActive(item.href)
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ease-out transform hover:scale-[1.02] active:scale-[0.98] ${
                          active
                            ? "bg-teal-50 text-teal-700 shadow-sm border border-teal-100"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                        style={{
                          animationDelay: `${index * 50}ms`,
                          animation: isOpen && !isAnimating ? "slideInRight 0.3s ease-out forwards" : undefined,
                        }}
                        role="menuitem"
                        tabIndex={isOpen ? 0 : -1}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-2 rounded-lg transition-colors duration-200 ${
                              active ? "bg-teal-100" : "bg-gray-100 group-hover:bg-gray-200"
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="font-medium">{item.label}</span>
                        </div>
                      </a>
                    )
                  })}
                </div>
              </nav>

              {/* Footer */}
              <div className="border-t border-gray-100 p-4 bg-gray-50">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50 h-12 rounded-xl transition-all duration-200"
                  onClick={() => {
                    closeMenu()
                    // Handle logout
                  }}
                  tabIndex={isOpen ? 0 : -1}
                  disabled={isAnimating}
                >
                  <LogOut className="w-5 h-5 mr-4" />
                  <span className="font-medium">Log out</span>
                </Button>
              </div>
            </div>

            {/* Swipe indicator */}
            <div className="absolute top-4 left-4 opacity-30">
              <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Smooth scrolling for menu */
        #mobile-menu nav {
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }

        /* Custom scrollbar for webkit browsers */
        #mobile-menu nav::-webkit-scrollbar {
          width: 4px;
        }

        #mobile-menu nav::-webkit-scrollbar-track {
          background: transparent;
        }

        #mobile-menu nav::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 2px;
        }

        #mobile-menu nav::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </>
  )
}
