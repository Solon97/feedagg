-- Digestly Database Schema
-- Create tables for user management, content feeds, and saved content

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    digest_frequency TEXT DEFAULT 'daily' CHECK (digest_frequency IN ('daily', 'weekly', 'monthly')),
    digest_time TIME DEFAULT '09:00:00',
    timezone TEXT DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Content sources/feeds table
CREATE TABLE IF NOT EXISTS public.content_sources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    source_type TEXT DEFAULT 'rss' CHECK (source_type IN ('rss', 'website', 'youtube', 'twitter', 'newsletter')),
    description TEXT,
    category TEXT,
    is_active BOOLEAN DEFAULT true,
    last_fetched_at TIMESTAMP WITH TIME ZONE,
    fetch_frequency INTEGER DEFAULT 3600, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, url)
);

-- Content items table
CREATE TABLE IF NOT EXISTS public.content_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    source_id UUID REFERENCES public.content_sources(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    summary TEXT,
    author TEXT,
    url TEXT NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    thumbnail_url TEXT,
    read_time_minutes INTEGER,
    content_hash TEXT UNIQUE, -- to prevent duplicates
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Saved content table (user bookmarks)
CREATE TABLE IF NOT EXISTS public.saved_content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content_item_id UUID REFERENCES public.content_items(id) ON DELETE CASCADE NOT NULL,
    is_read BOOLEAN DEFAULT false,
    is_favorite BOOLEAN DEFAULT false,
    notes TEXT,
    tags TEXT[], -- array of tags
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, content_item_id)
);

-- Digest history table
CREATE TABLE IF NOT EXISTS public.digest_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    digest_date DATE NOT NULL,
    content_item_ids UUID[], -- array of content item IDs included in digest
    email_sent_at TIMESTAMP WITH TIME ZONE,
    email_opened_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, digest_date)
);

-- User preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    email_notifications BOOLEAN DEFAULT true,
    digest_preview BOOLEAN DEFAULT true,
    content_per_digest INTEGER DEFAULT 10,
    preferred_categories TEXT[],
    blocked_keywords TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_content_sources_user_id ON public.content_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_content_sources_is_active ON public.content_sources(is_active);
CREATE INDEX IF NOT EXISTS idx_content_items_source_id ON public.content_items(source_id);
CREATE INDEX IF NOT EXISTS idx_content_items_published_at ON public.content_items(published_at);
CREATE INDEX IF NOT EXISTS idx_content_items_content_hash ON public.content_items(content_hash);
CREATE INDEX IF NOT EXISTS idx_saved_content_user_id ON public.saved_content(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_content_content_item_id ON public.saved_content(content_item_id);
CREATE INDEX IF NOT EXISTS idx_saved_content_is_read ON public.saved_content(is_read);
CREATE INDEX IF NOT EXISTS idx_saved_content_is_favorite ON public.saved_content(is_favorite);
CREATE INDEX IF NOT EXISTS idx_digest_history_user_id ON public.digest_history(user_id);
CREATE INDEX IF NOT EXISTS idx_digest_history_digest_date ON public.digest_history(digest_date);

-- Row Level Security (RLS) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digest_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Content sources policies
CREATE POLICY "Users can view own content sources" ON public.content_sources
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own content sources" ON public.content_sources
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own content sources" ON public.content_sources
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own content sources" ON public.content_sources
    FOR DELETE USING (auth.uid() = user_id);

-- Content items policies (read-only for users, managed by server)
CREATE POLICY "Users can view content items from their sources" ON public.content_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.content_sources cs 
            WHERE cs.id = content_items.source_id 
            AND cs.user_id = auth.uid()
        )
    );

-- Saved content policies
CREATE POLICY "Users can view own saved content" ON public.saved_content
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved content" ON public.saved_content
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved content" ON public.saved_content
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved content" ON public.saved_content
    FOR DELETE USING (auth.uid() = user_id);

-- Digest history policies
CREATE POLICY "Users can view own digest history" ON public.digest_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own digest history" ON public.digest_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON public.user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- Functions and triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_content_sources
    BEFORE UPDATE ON public.content_sources
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_content_items
    BEFORE UPDATE ON public.content_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_user_preferences
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();