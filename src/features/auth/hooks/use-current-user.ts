"use client";

import { useState, useEffect } from "react";
import { UserEntity } from "@/core/entities/user.entity";
import { useAuth } from "@/components/auth-provider";

interface UseCurrentUserReturn {
  user: UserEntity | null;
  isLoading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export function useCurrentUser(): UseCurrentUserReturn {
  const {
    user: authUser,
    loading: authLoading,
    signOut: authSignOut,
    refreshAuth,
  } = useAuth();
  const [profileData, setProfileData] = useState<UserEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch full profile data when auth user changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (!authUser) {
        setProfileData(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Get user profile details from Next.js API
        const userResponse = await fetch(`/api/profile`, {
          credentials: "include",
        });

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const userData = await userResponse.json();
        setProfileData(userData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch user profile";
        setError(errorMessage);
        setProfileData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [authUser]);

  const signOut = async () => {
    try {
      setError(null);
      await authSignOut();
      setProfileData(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to sign out";
      setError(errorMessage);
    }
  };

  const refreshUser = async () => {
    try {
      setError(null);
      // Refresh auth state first
      await refreshAuth();
      // Profile will be automatically refetched due to authUser dependency
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to refresh user";
      setError(errorMessage);
    }
  };

  return {
    user: profileData,
    isLoading: authLoading || isLoading,
    error,
    signOut,
    refreshUser,
  };
}
