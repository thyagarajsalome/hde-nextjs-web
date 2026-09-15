-- Migration: Create kitchen_designs table with indexes and RLS
CREATE TABLE IF NOT EXISTS public.kitchen_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  alt_text TEXT NOT NULL,
  
  -- Kitchen Specifications
  layout_shape TEXT NOT NULL CHECK (layout_shape IN ('L-Shape', 'U-Shape', 'Parallel', 'Straight', 'Island')),
  dimensions TEXT NOT NULL,
  countertop_length_ft NUMERIC(5,2),
  cabinet_finish TEXT NOT NULL,
  countertop_material TEXT NOT NULL,
  features TEXT[] DEFAULT '{}',
  
  -- Cost Estimation (INR)
  min_cost INT NOT NULL,
  max_cost INT NOT NULL,
  formatted_budget TEXT NOT NULL,
  rate_per_unit TEXT,
  
  -- Cloudflare R2 Asset Details
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_name TEXT NOT NULL,
  aspect_ratio TEXT DEFAULT '9:16',
  file_size_kb INT,
  
  -- Search & Meta
  keywords TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for fast search and SEO filters
CREATE INDEX IF NOT EXISTS idx_kitchen_shape ON public.kitchen_designs(layout_shape);
CREATE INDEX IF NOT EXISTS idx_kitchen_active ON public.kitchen_designs(is_active);
CREATE INDEX IF NOT EXISTS idx_kitchen_slug ON public.kitchen_designs(slug);
CREATE INDEX IF NOT EXISTS idx_kitchen_created ON public.kitchen_designs(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.kitchen_designs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to active designs
DROP POLICY IF EXISTS "Public can view active kitchen designs" ON public.kitchen_designs;
CREATE POLICY "Public can view active kitchen designs"
  ON public.kitchen_designs
  FOR SELECT
  USING (is_active = true);

-- Policy: Allow authenticated users / admins full access
DROP POLICY IF EXISTS "Authenticated users full access to kitchen designs" ON public.kitchen_designs;
CREATE POLICY "Authenticated users full access to kitchen designs"
  ON public.kitchen_designs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Allow anon service key insert/update/delete for admin operations if configured
DROP POLICY IF EXISTS "Service role full access to kitchen designs" ON public.kitchen_designs;
CREATE POLICY "Service role full access to kitchen designs"
  ON public.kitchen_designs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
