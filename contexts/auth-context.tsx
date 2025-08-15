"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import type { AuthContextType, AuthUser } from "@/types/auth";
import type { Session } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import { cleanCurrentUrl, urlContainsTokens } from "@/lib/url-security";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Clean any tokens from URL on mount (fallback security measure)
    if (
      typeof window !== "undefined" &&
      urlContainsTokens(window.location.href)
    ) {
      cleanCurrentUrl();
      logger.info("Cleaned tokens from URL for security");
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (mounted) {
          setSession(session);
          setUser((session?.user as AuthUser) || null);
          setLoading(false);
        }
      } catch (error) {
        logger.error("Failed to get initial session", { error });
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Clean URL after auth state changes to remove any tokens
      if (
        typeof window !== "undefined" &&
        urlContainsTokens(window.location.href)
      ) {
        cleanCurrentUrl();
        logger.info("Cleaned tokens from URL after auth state change");
      }

      if (mounted) {
        setSession(session);
        setUser((session?.user as AuthUser) || null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithMicrosoft = async () => {
    try {
      logger.info("Microsoft OAuth attempt");
      const redirectUrl = getRedirectUrl();
      logger.debug("OAuth redirect URL", { redirectUrl });

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "azure",
        options: {
          scopes: "openid email profile User.Read",
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        logger.warn("Microsoft OAuth failed", { error: error.message });
      } else {
        logger.info("Microsoft OAuth initiated");
      }

      return { error };
    } catch (error: any) {
      logger.error("Microsoft OAuth error", { error: error.message });
      return { error };
    }
  };

  const getRedirectUrl = () => {
    // Check for production URL from environment variables
    const productionUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_VERCEL_URL ||
      process.env.VERCEL_URL;

    // If we have a production URL and we're not in development, use it
    if (productionUrl && process.env.NODE_ENV === "production") {
      // Ensure the URL has the correct protocol
      const url = productionUrl.startsWith("http")
        ? productionUrl
        : `https://${productionUrl}`;
      return `${url}/auth/callback`;
    }

    // For development or when no production URL is set, use current origin
    return `${window.location.origin}/auth/callback`;
  };

  const signInWithGoogle = async () => {
    try {
      logger.info("Google OAuth attempt");
      const redirectUrl = getRedirectUrl();
      logger.debug("OAuth redirect URL", { redirectUrl });

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        logger.warn("Google OAuth failed", { error: error.message });
      } else {
        logger.info("Google OAuth initiated");
      }

      return { error };
    } catch (error: any) {
      logger.error("Google OAuth error", { error: error.message });
      return { error };
    }
  };

  const signInWithPassword = async (email: string, password: string) => {
    try {
      logger.info("Password sign-in attempt", { email });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logger.warn("Password sign-in failed", { email, error: error.message });
      } else {
        logger.info("Password sign-in successful", {
          email,
          userId: data.user?.id,
        });
        // Immediately reflect authenticated state in context
        setSession(data.session as Session);
        setUser((data.user as AuthUser) || null);
      }

      return { error };
    } catch (error: any) {
      logger.error("Password sign-in error", { email, error: error.message });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      logger.info("User logout attempt", { userId: user?.id });
      const { error } = await supabase.auth.signOut();

      if (error) {
        logger.warn("User logout failed", {
          userId: user?.id,
          error: error.message,
        });
      } else {
        logger.info("User logout successful", { userId: user?.id });
      }

      return { error };
    } catch (error: any) {
      logger.error("User logout error", {
        userId: user?.id,
        error: error.message,
      });
      return { error };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signInWithGoogle,
    signInWithMicrosoft,
    signInWithPassword,
    signOut,
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
