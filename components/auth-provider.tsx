"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { authEvents } from "@/lib/auth-events";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ error?: string }>;
  resetPassword: (password: string) => Promise<{ error?: string }>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state using the event system
  useEffect(() => {
    console.log("[AuthProvider] Initializing auth state");

    // Subscribe to auth changes
    const unsubscribe = authEvents.onAuthChange((newUser, eventType) => {
      console.log(
        "[AuthProvider] Auth state changed:",
        newUser?.email || "signed out",
        eventType ? `(${eventType})` : ""
      );

      setUser((prevUser) => {
        const wasLoggedIn = prevUser !== null;
        const isNowLoggedOut = newUser === null;

        // If user was logged in and is now logged out via LOGOUT event from another tab
        // redirect to login page
        if (wasLoggedIn && isNowLoggedOut && eventType === "LOGOUT") {
          console.log(
            "[AuthProvider] User logged out from another tab, redirecting to auth page"
          );
          router.push("/auth");
        }

        return newUser;
      });
      setLoading(false);
    });

    // Initial auth check
    const checkInitialAuth = async () => {
      try {
        const currentUser = await authEvents.checkAuthStatus();
        setUser(currentUser);
      } catch (error) {
        console.error("[AuthProvider] Initial auth check failed:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkInitialAuth();

    return unsubscribe;
  }, [router]); // Remove user from dependencies to avoid re-creating the listener
  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || "Login failed" };
      }

      // Force auth check to update state
      await authEvents.checkAuthStatus(true);

      return {};
    } catch (error) {
      console.error("Login error:", error);
      return { error: "Network error" };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || "Registration failed" };
      }

      // Update user state if user is immediately available (no email confirmation needed)
      if (data.user) {
        setUser(data.user);
      }

      return {};
    } catch (error) {
      console.error("Registration error:", error);
      return { error: "Network error" };
    }
  };

  const signOut = async () => {
    try {
      await authEvents.signOut();
      router.push("/auth");
    } catch (error) {
      console.error("Sign out error:", error);
      // Even if the server call fails, clear local state
      setUser(null);
      router.push("/auth");
    }
  };

  const refreshAuth = async () => {
    try {
      await authEvents.checkAuthStatus(true);
    } catch (error) {
      console.error("Refresh auth error:", error);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || "Failed to send reset email" };
      }

      return {};
    } catch (error) {
      console.error("Forgot password error:", error);
      return { error: "Network error" };
    }
  };

  const resetPassword = async (password: string) => {
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || "Failed to reset password" };
      }

      return {};
    } catch (error) {
      console.error("Reset password error:", error);
      return { error: "Network error" };
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    forgotPassword,
    resetPassword,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
