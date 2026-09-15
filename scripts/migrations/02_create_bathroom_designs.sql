-- Migration: 02_create_bathroom_designs.sql
-- Description: Table schema for India Mode Bathroom Designs Gallery

CREATE TABLE IF NOT EXISTS public.bathroom_designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    meta_title TEXT,
    meta_description TEXT,
    alt_text TEXT NOT NULL,
    
    -- Bathroom Specifications
    layout_type TEXT NOT NULL CHECK (layout_type IN ('Master Bathroom', 'Wet & Dry Partition', 'Compact 3-Fixture', 'Powder Room', 'Luxury Suite')),
    dimensions TEXT NOT NULL,
    tile_concept TEXT NOT NULL,
    vanity_type TEXT NOT NULL,
    fittings_brand TEXT NOT NULL,
    partition_type TEXT NOT NULL,
    features TEXT[] DEFAULT '{}',
    
    -- Pricing (INR)
    min_cost NUMERIC NOT NULL,
    max_cost NUMERIC NOT NULL,
    formatted_budget TEXT NOT NULL,
    rate_per_unit TEXT,
    
    -- Cloudflare R2 / Image Assets
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    file_name TEXT NOT NULL,
    aspect_ratio TEXT DEFAULT '9:16',
    file_size_kb INTEGER,
    
    -- Search & Metadata
    keywords TEXT[] DEFAULT '{}',
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing for fast filtering & search
CREATE INDEX IF NOT EXISTS idx_bathroom_designs_layout_type ON public.bathroom_designs(layout_type);
CREATE INDEX IF NOT EXISTS idx_bathroom_designs_is_active ON public.bathroom_designs(is_active);
CREATE INDEX IF NOT EXISTS idx_bathroom_designs_display_order ON public.bathroom_designs(display_order);
CREATE INDEX IF NOT EXISTS idx_bathroom_designs_slug ON public.bathroom_designs(slug);

-- Enable Row Level Security
ALTER TABLE public.bathroom_designs ENABLE ROW LEVEL SECURITY;

-- Public can view active designs
CREATE POLICY "Allow public read access to active bathroom designs"
ON public.bathroom_designs FOR SELECT
USING (is_active = true);

-- Allow authenticated users / service role full access
CREATE POLICY "Allow full access to bathroom designs for authenticated admins"
ON public.bathroom_designs FOR ALL
USING (auth.role() = 'authenticated' OR auth.role() = 'service_role')
WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');
