/**
 * Comprehensive test suite for ContentSourceRepository with optimized two-table architecture
 * Tests cover CRUD operations, URL change handling, and idempotent behavior
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ContentSourceRepositoryImpl } from "../src/infrastructure/supabase/content-source.repository.impl";
import { getTestSupabaseClient } from "./setup";
import { v4 as uuidv4 } from "uuid";

// Test configuration using singleton client
describe("ContentSourceRepository Integration Tests", () => {
  let supabase: ReturnType<typeof getTestSupabaseClient>;
  let repository: ContentSourceRepositoryImpl;
  let testUserId: string;
  let testFeedId: string;
  let authSession: any;
  let createdResourceIds: string[] = []; // Track created resources for cleanup

  beforeEach(async () => {
    supabase = getTestSupabaseClient();
    createdResourceIds = []; // Reset tracking array

    // Authenticate existing test user (no creation attempt)
    const testEmail = "test@example.com";
    const testPassword = "testpassword123";

    // Direct sign in - user should already exist
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

    if (signInError) {
      throw new Error(
        `Test user authentication failed: ${signInError.message}. ` +
          `Make sure test user exists (email: ${testEmail}). ` +
          `You can create it manually or run the setup once with signup.`
      );
    }

    authSession = signInData.session;
    testUserId = signInData.user?.id || "test-user-123";

    repository = new ContentSourceRepositoryImpl(supabase);
    testFeedId = uuidv4(); // Generate valid UUID for each test
    createdResourceIds.push(testFeedId); // Track this test's main resource

    // Light cleanup - only remove test feeds with specific patterns to avoid affecting other tests
    await supabase
      .from("user_feed_subscriptions")
      .delete()
      .eq("user_id", testUserId)
      .like("name", "%Test%"); // Only delete feeds with "Test" in name
  });

  afterEach(async () => {
    // Cleanup test data
    try {
      await supabase
        .from("user_feed_subscriptions")
        .delete()
        .eq("id", testFeedId);
    } catch (error) {
      // Ignore cleanup errors
    }

    // Sign out
    await supabase.auth.signOut();
  });

  describe("Feed Creation", () => {
    it("should create a new feed subscription successfully", async () => {
      const timestamp = Date.now();
      const feedUrl = `https://techcrunch.com/feed?test=${timestamp}`;

      const createResult = await repository.create({
        id: testFeedId,
        userId: testUserId,
        name: "Test Tech Feed",
        url: feedUrl,
        description: "Technology news feed for testing",
        category: "Technology",
        sourceType: "rss",
        fetchFrequency: 3600,
      });

      expect(createResult.success).toBe(true);

      if (createResult.success) {
        expect(createResult.data.id).toBe(testFeedId);
        expect(createResult.data.url).toBe(feedUrl);
        expect(createResult.data.name).toBe("Test Tech Feed");
        expect(createResult.data.category).toBe("Technology");
        expect(createResult.data.fetchFrequency).toBe(3600);
        expect(createResult.data.feedSourceId).toBeDefined();
      }
    });

    it("should handle duplicate subscription creation with idempotent behavior", async () => {
      const timestamp = Date.now();
      const feedUrl = `https://techcrunch.com/feed?test=${timestamp}&duplicate=1`;

      // Create first subscription
      const createResult1 = await repository.create({
        id: testFeedId,
        userId: testUserId,
        name: "First Feed",
        url: feedUrl,
        description: "First subscription",
        category: "Technology",
        sourceType: "rss",
        fetchFrequency: 3600,
      });

      expect(createResult1.success).toBe(true);
      if (!createResult1.success) return;

      const firstSubscriptionId = createResult1.data.id;

      // Attempt to create duplicate subscription
      const createResult2 = await repository.create({
        id: uuidv4(), // Different ID
        userId: testUserId,
        name: "Second Feed", // Different metadata
        url: feedUrl, // Same URL
        description: "Duplicate subscription attempt",
        category: "Technology",
        sourceType: "rss",
        fetchFrequency: 3600,
      });

      expect(createResult2.success).toBe(true);
      if (!createResult2.success) return;

      // Should return the existing subscription
      expect(createResult2.data.id).toBe(firstSubscriptionId);
      expect(createResult2.data.url).toBe(feedUrl);
    });
  });

  describe("Feed Updates", () => {
    it("should update feed URL and create new feed source", async () => {
      const timestamp = Date.now();
      const initialUrl = `https://techcrunch.com/feed?test=${timestamp}`;

      // Create initial feed
      const createResult = await repository.create({
        id: testFeedId,
        userId: testUserId,
        name: "Test Feed",
        url: initialUrl,
        description: "Test feed for URL update",
        category: "Technology",
        sourceType: "rss",
        fetchFrequency: 3600,
      });

      expect(createResult.success).toBe(true);
      if (!createResult.success) return;

      const initialFeedSourceId = createResult.data.feedSourceId;

      // Update with new URL
      const newUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=UCsnGwSIHyoYN0kiINAGUKxg&test=${timestamp}`;
      const updateResult = await repository.update(testFeedId, {
        name: "Updated Feed Name",
        url: newUrl,
        description: "Updated description",
        fetchFrequency: 7200,
      });

      expect(updateResult.success).toBe(true);
      if (!updateResult.success) return;

      expect(updateResult.data.url).toBe(newUrl);
      expect(updateResult.data.name).toBe("Updated Feed Name");
      expect(updateResult.data.fetchFrequency).toBe(7200);

      // Feed source ID should change when URL changes
      const newFeedSourceId = updateResult.data.feedSourceId;
      expect(newFeedSourceId).not.toBe(initialFeedSourceId);
    });

    it("should update metadata without changing feed source", async () => {
      const timestamp = Date.now();
      const feedUrl = `https://techcrunch.com/feed?test=${timestamp}&meta=1`;

      // Create initial feed
      const createResult = await repository.create({
        id: testFeedId,
        userId: testUserId,
        name: "Original Name",
        url: feedUrl,
        description: "Original description",
        category: "Technology",
        sourceType: "rss",
        fetchFrequency: 3600,
      });

      expect(createResult.success).toBe(true);
      if (!createResult.success) return;

      const originalFeedSourceId = createResult.data.feedSourceId;

      // Update only metadata (no URL or fetchFrequency change)
      const updateResult = await repository.update(testFeedId, {
        name: "Updated Name Only",
        description: "Updated description only",
        category: "Updated Category",
      });

      expect(updateResult.success).toBe(true);
      if (!updateResult.success) return;

      expect(updateResult.data.name).toBe("Updated Name Only");
      expect(updateResult.data.description).toBe("Updated description only");
      expect(updateResult.data.category).toBe("Updated Category");

      // Feed source ID should remain the same for metadata-only updates
      expect(updateResult.data.feedSourceId).toBe(originalFeedSourceId);
    });
  });

  describe("Feed Retrieval", () => {
    it("should retrieve feeds for authenticated user", async () => {
      const timestamp = Date.now();

      // Create a test feed
      const createResult = await repository.create({
        id: testFeedId,
        userId: testUserId,
        name: "Retrieval Test Feed",
        url: `https://techcrunch.com/feed?test=${timestamp}&retrieval=1`,
        description: "Feed for retrieval testing",
        category: "Technology",
        sourceType: "rss",
        fetchFrequency: 3600,
      });

      expect(createResult.success).toBe(true);
      if (!createResult.success) return;

      // Retrieve all feeds for user
      const getAllResult = await repository.findByUserId(testUserId);

      expect(getAllResult.success).toBe(true);
      if (!getAllResult.success) return;

      expect(getAllResult.data.length).toBeGreaterThan(0);

      // Find our test feed
      const testFeed = getAllResult.data.find((feed) => feed.id === testFeedId);
      expect(testFeed).toBeDefined();
      expect(testFeed?.name).toBe("Retrieval Test Feed");
    });

    it("should retrieve specific feed by ID", async () => {
      const timestamp = Date.now();

      // Create a test feed
      const createResult = await repository.create({
        id: testFeedId,
        userId: testUserId,
        name: "Specific Feed Test",
        url: `https://techcrunch.com/feed?test=${timestamp}&specific=1`,
        description: "Feed for specific retrieval",
        category: "Technology",
        sourceType: "rss",
        fetchFrequency: 3600,
      });

      expect(createResult.success).toBe(true);
      if (!createResult.success) return;

      // Retrieve specific feed
      const getByIdResult = await repository.findById(testFeedId);

      expect(getByIdResult.success).toBe(true);
      if (!getByIdResult.success) return;

      expect(getByIdResult.data).not.toBeNull();
      expect(getByIdResult.data?.id).toBe(testFeedId);
      expect(getByIdResult.data?.name).toBe("Specific Feed Test");
    });
  });

  describe("Feed Deletion", () => {
    it("should delete feed subscription successfully", async () => {
      const timestamp = Date.now();

      // Create a test feed
      const createResult = await repository.create({
        id: testFeedId,
        userId: testUserId,
        name: "Feed to Delete",
        url: `https://techcrunch.com/feed?test=${timestamp}&delete=1`,
        description: "Feed for deletion testing",
        category: "Technology",
        sourceType: "rss",
        fetchFrequency: 3600,
      });

      expect(createResult.success).toBe(true);
      if (!createResult.success) return;

      // Delete the feed
      const deleteResult = await repository.delete(testFeedId);

      expect(deleteResult.success).toBe(true);

      // Verify feed no longer exists
      const getByIdResult = await repository.findById(testFeedId);
      expect(getByIdResult.success).toBe(true);
      if (getByIdResult.success) {
        expect(getByIdResult.data).toBeNull();
      }
    });
  });
});
