-- Quick test to verify the new database architecture
-- Run this in Supabase Studio or pgAdmin to test the tables
-- Test 1: Verify tables exist
SELECT
    table_name
FROM
    information_schema.tables
WHERE
    table_schema = 'public'
    AND table_name IN ('feed_sources', 'user_feed_subscriptions');

-- Test 2: Verify foreign key relationships
SELECT
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE
    tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('user_feed_subscriptions', 'content_items');

-- Test 3: Verify JOIN query structure (like what our repository uses)
SELECT
    ufs.id,
    ufs.name,
    ufs.user_id,
    ufs.is_active,
    fs.url,
    fs.source_type,
    fs.last_fetched_at,
    fs.fetch_frequency
FROM
    user_feed_subscriptions ufs
    JOIN feed_sources fs ON ufs.feed_source_id = fs.id
LIMIT
    5;