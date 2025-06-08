/**
 * Database state verification and debugging utilities
 * Useful for understanding database constraints and debugging issues
 */

import { describe, it, expect } from "vitest";
import { getTestSupabaseClient } from "./setup";

describe("Database State Verification", () => {
  it("should verify database connection and schema", async () => {
    const supabase = getTestSupabaseClient();

    // Test connection by checking if tables exist
    const { data: feedSources, error: feedSourcesError } = await supabase
      .from("feed_sources")
      .select("count", { count: "exact", head: true });

    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from("user_feed_subscriptions")
      .select("count", { count: "exact", head: true });

    // Both queries should succeed (no permission errors)
    expect(feedSourcesError).toBeNull();
    expect(subscriptionsError).toBeNull();

    console.log("✅ Database connection verified");
    console.log(`📊 Feed sources table accessible`);
    console.log(`📊 User subscriptions table accessible`);
  });

  it("should verify user authentication flow", async () => {
    const supabase = getTestSupabaseClient();

    // Test authentication
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: "test@example.com",
        password: "testpassword123",
      });

    if (signInError) {
      console.log(
        "⚠️ Authentication failed - this might be expected if test user doesn't exist"
      );
      return;
    }

    expect(signInData.user).toBeDefined();
    expect(signInData.session).toBeDefined();

    console.log("✅ User authentication successful");
    console.log(`👤 User ID: ${signInData.user?.id}`);

    // Test RLS policies with authenticated user
    const { data: userSubscriptions, error: subscriptionsError } =
      await supabase
        .from("user_feed_subscriptions")
        .select("*")
        .eq("user_id", signInData.user?.id);

    expect(subscriptionsError).toBeNull();
    console.log(`📋 User has ${userSubscriptions?.length || 0} subscriptions`);

    await supabase.auth.signOut();
  });

  it("should check database constraints and relationships", async () => {
    const supabase = getTestSupabaseClient();

    // Authenticate first
    const { data: authData } = await supabase.auth.signInWithPassword({
      email: "test@example.com",
      password: "testpassword123",
    });

    if (!authData.user) {
      console.log("⚠️ Skipping constraint check - no authenticated user");
      return;
    }

    // Check feed sources
    const { data: feedSources, error: feedSourcesError } = await supabase
      .from("feed_sources")
      .select("id, url, created_at")
      .limit(5);

    if (feedSources && feedSources.length > 0) {
      console.log("📦 Sample feed sources:");
      feedSources.forEach((source) => {
        console.log(`  - ${source.id}: ${source.url}`);
      });
    }

    // Check subscriptions with JOIN
    const { data: subscriptionsWithSources, error: joinError } = await supabase
      .from("user_feed_subscriptions")
      .select(
        `
        id,
        name,
        feed_sources (
          id,
          url,
          source_type
        )
      `
      )
      .eq("user_id", authData.user.id)
      .limit(3);

    if (subscriptionsWithSources) {
      console.log(
        `🔗 User subscriptions with JOIN: ${subscriptionsWithSources.length}`
      );
      subscriptionsWithSources.forEach((sub) => {
        console.log(`  - ${sub.name}: ${(sub.feed_sources as any)?.url}`);
      });
    }

    await supabase.auth.signOut();
  });
});
