import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/**
 * Reads env vars safely on both the server and the browser.
 */
const getPublicEnv = (key: string): string | undefined => {
  // On the server / Next.js preview
  if (typeof process !== "undefined" && process.env?.[key]) {
    return process.env[key]
  }
  // Vite-style or other bundlers
  if (typeof import.meta !== "undefined" && import.meta.env?.[key]) {
    // @ts-ignore – import.meta typing varies by bundler
    return import.meta.env[key]
  }
  // Nothing found
  return undefined
}

const supabaseUrl = getPublicEnv("NEXT_PUBLIC_SUPABASE_URL")
const supabaseAnonKey = getPublicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    [
      "Supabase client initialisation failed.",
      "Ensure the following public environment variables are present:",
      "- NEXT_PUBLIC_SUPABASE_URL",
      "- NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "",
      "You can add them in `.env.local` or via the Vercel project settings.",
    ].join("\n"),
  )
}

// Global client instance for browser
let _browserClient: SupabaseClient | undefined

// Create browser client (singleton)
export const supabase = (() => {
  if (typeof window === "undefined") {
    // Server-side: create a new instance each time with anon key
    return createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  // Browser-side: use singleton
  if (!_browserClient) {
    _browserClient = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  }
  return _browserClient
})()

// Server-side client with service role (for API routes only)
export const createServerSupabaseClient = () => {
  if (typeof window !== "undefined") {
    throw new Error("createServerSupabaseClient should only be used on the server")
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for server-side operations")
  }

  return createClient(supabaseUrl!, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
