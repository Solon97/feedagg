"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check session on mount and periodically
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Session check error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Check session periodically every 5 minutes
    const interval = setInterval(checkSession, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
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

      // Update user state with the returned user data
      setUser(data.user);

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
      // Call backend logout API
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      // Clear user state immediately
      setUser(null);

      // Redirect to login page
      router.push("/auth");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if there's an error, clear state and redirect
      setUser(null);
      router.push("/auth");
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
