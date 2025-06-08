-- Migration: Remove Deprecated Content Sources Table
-- This migration safely removes the deprecated content_sources table and cleans up related references
-- All data has been migrated to feed_sources + user_feed_subscriptions structure

-- Step 1: Verify that feed_source_id column exists and is populated in content_items
-- This is a safety check to ensure the migration was successful
DO $$
BEGIN
    -- Check if feed_source_id column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'content_items' 
        AND column_name = 'feed_source_id'
        AND table_schema = 'public'
    ) THEN
        RAISE EXCEPTION 'feed_source_id column not found in content_items table. Migration cannot proceed safely.';
    END IF;

    -- Check if there are content_items with NULL feed_source_id but non-NULL source_id
    IF EXISTS (
        SELECT 1 FROM public.content_items 
        WHERE feed_source_id IS NULL AND source_id IS NOT NULL
    ) THEN
        RAISE EXCEPTION 'Found content_items with NULL feed_source_id but non-NULL source_id. Data migration incomplete.';
    END IF;
END $$;

-- Step 2: Remove the old source_id column from content_items
-- This column referenced the deprecated content_sources table
ALTER TABLE public.content_items DROP COLUMN IF EXISTS source_id;

-- Step 3: Drop any remaining indexes on content_sources table
DROP INDEX IF EXISTS idx_content_sources_user_id;
DROP INDEX IF EXISTS idx_content_sources_url;
DROP INDEX IF EXISTS idx_content_sources_source_type;
DROP INDEX IF EXISTS idx_content_sources_is_active;
DROP INDEX IF EXISTS idx_content_sources_last_fetched_at;

-- Step 4: Drop any triggers on content_sources table
DROP TRIGGER IF EXISTS handle_updated_at_content_sources ON public.content_sources;

-- Step 5: Drop RLS policies on content_sources table
DROP POLICY IF EXISTS "Users can view own content sources" ON public.content_sources;
DROP POLICY IF EXISTS "Users can insert own content sources" ON public.content_sources;
DROP POLICY IF EXISTS "Users can update own content sources" ON public.content_sources;
DROP POLICY IF EXISTS "Users can delete own content sources" ON public.content_sources;

-- Step 6: Finally, drop the deprecated content_sources table
DROP TABLE IF EXISTS public.content_sources;

-- Step 7: Add a comment to document this cleanup
COMMENT ON TABLE public.feed_sources IS 'Global feed sources table. Replaces the deprecated content_sources table for better scalability.';
COMMENT ON TABLE public.user_feed_subscriptions IS 'User subscriptions to feed sources. Separates user-specific data from global feed sources.';