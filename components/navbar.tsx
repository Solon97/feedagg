"use client";

import { usePathname } from "next/navigation";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";
import { UserProfileDisplay } from "./user-profile-display";
import { useState, useEffect } from "react";
import { useAuth } from "./auth-provider";
import { Logo } from "./ui/logo";

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut } = useAuth();

  const isActive = (path: string) => {
    return pathname === path;
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10;
      setIsScrolled(scrolled);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 md:px-6 py-3 md:py-4 sticky top-0 z-30 transition-all duration-200 ${
        isScrolled
          ? "backdrop-blur-md bg-white/95 dark:bg-gray-900/95 shadow-sm"
          : "bg-white dark:bg-gray-900"
      }`}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {" "}
        {/* Logo */}
        <a
          href="/"
          className="hover:opacity-80 transition-opacity duration-200"
        >
          <Logo size="md" />
        </a>
        {/* Desktop Navigation */}{" "}
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex items-center gap-2" role="navigation">
            <a
              href="/news"
              className={`font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
                isActive("/news")
                  ? "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              News
            </a>
            <a
              href="/saved-content"
              className={`font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
                isActive("/saved-content")
                  ? "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              Saved Content
            </a>{" "}
            <a
              href="/feeds"
              className={`font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
                isActive("/feeds")
                  ? "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              Feeds
            </a>
          </nav>{" "}
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user && <UserProfileDisplay variant="compact" />}
          </div>
        </div>
        {/* Mobile Navigation */}
        <MobileNav />
      </div>
    </header>
  );
}
