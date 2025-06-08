/**
 * Global test setup configuration for Vitest
 * Sets up environment variables and global test utilities
 */

import "@testing-library/jest-dom";
import { beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

// Default test configuration
const DEFAULT_SUPABASE_URL = "http://127.0.0.1:54321";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

// Singleton Supabase client for tests
let globalSupabaseClient: ReturnType<typeof createClient> | null = null;

beforeAll(() => {
  // Configure test environment variables
  process.env.NEXT_PUBLIC_SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  // Set test environment (using type assertion to bypass read-only restriction)
  (process.env as any).NODE_ENV = "test";

  // Initialize singleton Supabase client
  globalSupabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  console.log("🧪 Test environment configured");
  console.log(`📡 Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
});

afterAll(async () => {
  // Clean up Supabase client
  if (globalSupabaseClient) {
    await globalSupabaseClient.auth.signOut();
    globalSupabaseClient = null;
  }
  console.log("🧹 Test cleanup completed");
});

// Export helper function to get the singleton client
export function getTestSupabaseClient() {
  if (!globalSupabaseClient) {
    throw new Error(
      "Test Supabase client not initialized. Make sure setup.ts is imported."
    );
  }
  return globalSupabaseClient;
}
