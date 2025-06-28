"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import type { AuthContextType, AuthUser } from "@/types/auth"
import type { Session } from "@supabase/supabase-js"
import { logger } from "@/lib/logger"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        console.log("Initial session:", session ? "Found" : "Not found")

        if (mounted) {
          setSession(session)
          setUser((session?.user as AuthUser) || null)
          setLoading(false)
        }
      } catch (error) {
        logger.error("Failed to get initial session", { error })
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session ? "Session exists" : "No session")
      logger.debug("Auth state changed", { event, userId: session?.user?.id })

      if (mounted) {
        setSession(session)
        setUser((session?.user as AuthUser) || null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      logger.info("User registration attempt", { email })
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        logger.warn("User registration failed", { email, error: error.message })
      } else {
        logger.info("User registration successful", { email })
      }

      return { error }
    } catch (error: any) {
      logger.error("User registration error", { email, error: error.message })
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      logger.info("User login attempt", { email })
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        logger.warn("User login failed", { email, error: error.message })
      } else {
        logger.info("User login successful", { email })
        console.log("Login successful, session:", data.session ? "Created" : "Not created")
      }

      return { error }
    } catch (error: any) {
      logger.error("User login error", { email, error: error.message })
      return { error }
    }
  }

  const signInWithGoogle = async () => {
    try {
      logger.info("Google OAuth attempt")
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      })

      if (error) {
        logger.warn("Google OAuth failed", { error: error.message })
      } else {
        logger.info("Google OAuth initiated")
      }

      return { error }
    } catch (error: any) {
      logger.error("Google OAuth error", { error: error.message })
      return { error }
    }
  }

  const signOut = async () => {
    try {
      logger.info("User logout attempt", { userId: user?.id })
      const { error } = await supabase.auth.signOut()

      if (error) {
        logger.warn("User logout failed", { userId: user?.id, error: error.message })
      } else {
        logger.info("User logout successful", { userId: user?.id })
        console.log("Logout successful")
      }

      return { error }
    } catch (error: any) {
      logger.error("User logout error", { userId: user?.id, error: error.message })
      return { error }
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
