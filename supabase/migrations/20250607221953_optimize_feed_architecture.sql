-- Migration: Optimize Feed Architecture
-- Separates global feed sources from user subscriptions for better scalability and sync efficiency

-- Step 1: Create global feed sources table
CREATE TABLE IF NOT EXISTS public.feed_sources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    url TEXT UNIQUE NOT NULL,
    source_type TEXT DEFAULT 'rss' CHECK (source_type IN ('rss', 'website', 'youtube', 'twitter', 'newsletter')),
    last_fetched_at TIMESTAMP WITH TIME ZONE,
    fetch_frequency INTEGER DEFAULT 3600, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Step 2: Create user feed subscriptions table (relationship between users and feed sources)
CREATE TABLE IF NOT EXISTS public.user_feed_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    feed_source_id UUID REFERENCES public.feed_sources(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL, -- User-customized name
    description TEXT,    -- User-customized description
    category TEXT,       -- User-customized category
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, feed_source_id)
);

-- Step 3: Migrate existing data from content_sources to new structure
-- First, insert unique feed sources
INSERT INTO public.feed_sources (url, source_type, last_fetched_at, fetch_frequency, created_at, updated_at)
SELECT DISTINCT 
    url,
    source_type,
    MAX(last_fetched_at) as last_fetched_at,
    AVG(fetch_frequency)::INTEGER as fetch_frequency,
    MIN(created_at) as created_at,
    MAX(updated_at) as updated_at
FROM public.content_sources
GROUP BY url, source_type
ON CONFLICT (url) DO NOTHING;

-- Step 4: Migrate user subscriptions
INSERT INTO public.user_feed_subscriptions (user_id, feed_source_id, name, description, category, is_active, created_at, updated_at)
SELECT 
    cs.user_id,
    fs.id as feed_source_id,
    cs.name,
    cs.description,
    cs.category,
    cs.is_active,
    cs.created_at,
    cs.updated_at
FROM public.content_sources cs
JOIN public.feed_sources fs ON cs.url = fs.url AND cs.source_type = fs.source_type;

-- Step 5: Add new column to content_items to reference feed_sources instead of content_sources
ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS feed_source_id UUID REFERENCES public.feed_sources(id) ON DELETE CASCADE;

-- Step 6: Update content_items to reference feed_sources
UPDATE public.content_items 
SET feed_source_id = fs.id
FROM public.content_sources cs
JOIN public.feed_sources fs ON cs.url = fs.url AND cs.source_type = fs.source_type
WHERE public.content_items.source_id = cs.id;

-- Step 7: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_feed_sources_url ON public.feed_sources(url);
CREATE INDEX IF NOT EXISTS idx_feed_sources_last_fetched_at ON public.feed_sources(last_fetched_at);
CREATE INDEX IF NOT EXISTS idx_feed_sources_source_type ON public.feed_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_user_feed_subscriptions_user_id ON public.user_feed_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feed_subscriptions_feed_source_id ON public.user_feed_subscriptions(feed_source_id);
CREATE INDEX IF NOT EXISTS idx_user_feed_subscriptions_is_active ON public.user_feed_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_content_items_feed_source_id ON public.content_items(feed_source_id);

-- Step 8: Enable RLS on new tables
ALTER TABLE public.feed_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feed_subscriptions ENABLE ROW LEVEL SECURITY;

-- Step 9: Create RLS policies for feed_sources (read-only for authenticated users)
CREATE POLICY "Anyone can view feed sources" ON public.feed_sources
    FOR SELECT USING (auth.role() = 'authenticated');

-- Step 10: Create RLS policies for user_feed_subscriptions
CREATE POLICY "Users can view own feed subscriptions" ON public.user_feed_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feed subscriptions" ON public.user_feed_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own feed subscriptions" ON public.user_feed_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own feed subscriptions" ON public.user_feed_subscriptions
    FOR DELETE USING (auth.uid() = user_id);

-- Step 11: Update content_items RLS policy to work with new structure
DROP POLICY IF EXISTS "Users can view content items from their sources" ON public.content_items;

CREATE POLICY "Users can view content items from their subscribed sources" ON public.content_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_feed_subscriptions ufs 
            WHERE ufs.feed_source_id = content_items.feed_source_id 
            AND ufs.user_id = auth.uid()
        )
    );

-- Step 12: Add triggers for updated_at on new tables
CREATE TRIGGER handle_updated_at_feed_sources
    BEFORE UPDATE ON public.feed_sources
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_user_feed_subscriptions
    BEFORE UPDATE ON public.user_feed_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Note: content_sources table will be kept for now to ensure no data loss
-- In a future migration, after confirming everything works, we can drop it
-- For now, we'll just add a comment to indicate it's deprecated
COMMENT ON TABLE public.content_sources IS 'DEPRECATED: This table is replaced by feed_sources + user_feed_subscriptions. Will be removed in future migration after verification.';