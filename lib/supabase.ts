import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Client-side Supabase client
// WARNING: This should NOT be used by frontend components directly!
// Frontend should only call Next.js API routes for Clean Architecture compliance
export const createSupabaseClient = () => {
  console.warn(
    "⚠️  WARNING: Direct Supabase client usage detected in frontend!\n" +
      "This violates Clean Architecture principles.\n" +
      "Frontend components should only call Next.js API routes.\n" +
      "Consider using API routes instead of direct Supabase calls."
  );

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};
