-- Migration: Fix Feed Sources RLS Policies
-- Add missing INSERT policy for feed_sources table
-- Add INSERT policy for feed_sources (authenticated users can insert new feed sources)
CREATE POLICY "Authenticated users can insert feed sources" ON public.feed_sources FOR INSERT
WITH
    CHECK (auth.role () = 'authenticated');

-- Add UPDATE policy for feed_sources (authenticated users can update feed sources)
CREATE POLICY "Authenticated users can update feed sources" ON public.feed_sources FOR
UPDATE USING (auth.role () = 'authenticated');