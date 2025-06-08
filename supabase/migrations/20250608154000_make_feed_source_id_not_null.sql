-- Make feed_source_id NOT NULL in content_items table
-- This ensures data integrity in the new feed architecture
-- First, ensure no existing records have null feed_source_id
-- If any exist, they would need to be cleaned up or assigned a default feed source
UPDATE content_items
SET
    feed_source_id = (
        SELECT
            id
        FROM
            feed_sources
        LIMIT
            1
    )
WHERE
    feed_source_id IS NULL;

-- Now make the column NOT NULL
ALTER TABLE content_items
ALTER COLUMN feed_source_id
SET
    NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN content_items.feed_source_id IS 'Required reference to feed_sources table - ensures every content item has a valid source';