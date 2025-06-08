"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "@/src/features/auth/hooks/use-current-user";
import { ChevronDown, LogOut, Settings } from "lucide-react";

interface UserProfileDisplayProps {
  variant?: "full" | "compact" | "avatar-only";
  showDropdown?: boolean;
  className?: string;
}

export function UserProfileDisplay({
  variant = "full",
  showDropdown = true,
  className = "",
}: UserProfileDisplayProps) {
  const { user, signOut } = useCurrentUser();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) {
    return null;
  }

  // Generate initials from fullName or email
  const getInitials = (name: string | null, email: string) => {
    if (name && name.trim()) {
      return name
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email.charAt(0).toUpperCase();
  };

  // Get display name
  const getDisplayName = () => {
    if (user.fullName && user.fullName.trim()) {
      return user.fullName;
    }
    return user.email;
  };

  // Get shortened display name for compact view
  const getShortDisplayName = () => {
    const displayName = getDisplayName();
    if (user.fullName && user.fullName.trim()) {
      const firstName = user.fullName.split(" ")[0];
      return firstName;
    }
    // For email, show everything before @
    return displayName.split("@")[0];
  };

  const initials = getInitials(user.fullName, user.email);
  const displayName =
    variant === "compact" ? getShortDisplayName() : getDisplayName();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!showDropdown || variant === "avatar-only") {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <Avatar className="h-8 w-8 ring-2 ring-teal-100 dark:ring-teal-900">
          <AvatarImage src={user.avatarUrl || undefined} alt={displayName} />
          <AvatarFallback className="bg-teal-500 text-white text-sm font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        {(variant === "full" || variant === "compact") && (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-32">
              {displayName}
            </span>
            {variant === "full" && user.fullName && (
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-32">
                {user.email}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`flex items-center gap-3 px-3 py-2 h-auto hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${className}`}
        >
          <Avatar className="h-8 w-8 ring-2 ring-teal-100 dark:ring-teal-900">
            <AvatarImage src={user.avatarUrl || undefined} alt={displayName} />
            <AvatarFallback className="bg-teal-500 text-white text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          {(variant === "full" || variant === "compact") && (
            <div className="flex flex-col text-left">
              <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-32">
                {displayName}
              </span>
              {variant === "full" && user.fullName && (
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-32">
                  {user.email}
                </span>
              )}
            </div>
          )}
          <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg"
      >
        <DropdownMenuLabel className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-white">
            {user.fullName || "User"}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">
            {user.email}
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />

        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
          onClick={() => (window.location.href = "/settings")}
        >
          <Settings className="h-4 w-4" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />

        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
