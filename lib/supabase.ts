import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/**
 * Reads env vars safely on both the server and the browser.
 * next-lite injects public envs on `process.env`; older toolchains may inject on
 * `import.meta.env`.  We fall back to either location so the code never executes
 * before they exist.
 */
const getPublicEnv = (key: string): string | undefined => {
  // On the server / next-lite preview
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
  /**
   * Give a descriptive error instead of letting `createClient` throw a generic one.
   * This shows up in the console and the browser, guiding the developer to add
   * the required env vars.
   */
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

/**
 * Singleton pattern – one client per browser tab.
 */
let _client: SupabaseClient | undefined

export const supabase = (() => {
  if (!_client) {
    _client = createClient(supabaseUrl, supabaseAnonKey)
  }
  return _client
})()
