import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Reads env vars safely on both the server and the browser.
 */
const getPublicEnv = (key: string): string | undefined => {
  // On the server / Next.js preview
  if (typeof process !== "undefined" && process.env?.[key]) {
    return process.env[key];
  }
  // Vite-style or other bundlers
  if (typeof import.meta !== "undefined" && import.meta.env?.[key]) {
    // @ts-ignore – import.meta typing varies by bundler
    return import.meta.env[key];
  }
  // Nothing found
  return undefined;
};

let supabaseUrl = getPublicEnv("NEXT_PUBLIC_SUPABASE_URL");
let supabaseAnonKey = getPublicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

if (!supabaseUrl || !supabaseAnonKey) {
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

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
  );
}

// Global client instance for browser
let _browserClient: SupabaseClient | undefined;

// Create browser client (singleton)
export const supabase = (() => {
  if (typeof window === "undefined") {
    // Server-side: create a new instance each time with anon key
    return createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  // Browser-side: use singleton
  if (!_browserClient) {
    _browserClient = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce", // More secure flow
        debug: process.env.NODE_ENV === "development",
      },
    });
  }
  return _browserClient;
})();
