-- ==============================================================================
-- 07_create_cad_tutorials.sql
-- Table and RLS setup for HDE Studio CAD Video Tutorials Masterclass
-- Managed by: thyagaraja1983@gmail.com
-- ==============================================================================

-- 1. Create cad_tutorials table
CREATE TABLE IF NOT EXISTS public.cad_tutorials (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('walls', 'doors-windows', 'dimensions', 'blocks', 'structure', 'export', 'all')),
  category_label TEXT NOT NULL,
  duration TEXT DEFAULT '3:00',
  youtube_id TEXT DEFAULT '',
  icon TEXT DEFAULT 'fa-pen-ruler',
  badge TEXT,
  description TEXT,
  key_takeaways JSONB DEFAULT '[]'::jsonb,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes for fast category filtering and ordered retrieval
CREATE INDEX IF NOT EXISTS idx_cad_tutorials_category ON public.cad_tutorials(category);
CREATE INDEX IF NOT EXISTS idx_cad_tutorials_display_order ON public.cad_tutorials(display_order ASC);
CREATE INDEX IF NOT EXISTS idx_cad_tutorials_updated ON public.cad_tutorials(updated_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.cad_tutorials ENABLE ROW LEVEL SECURITY;

-- 4. Policy: Public can view tutorials (needed for the download page masterclass gallery)
DROP POLICY IF EXISTS "Public can view CAD tutorials" ON public.cad_tutorials;
CREATE POLICY "Public can view CAD tutorials"
  ON public.cad_tutorials
  FOR SELECT
  USING (true);

-- 5. Policy: Admin (thyagaraja1983@gmail.com) has full CRUD control (Insert, Update, Delete)
DROP POLICY IF EXISTS "Admin can manage CAD tutorials" ON public.cad_tutorials;
CREATE POLICY "Admin can manage CAD tutorials"
  ON public.cad_tutorials
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'email') = 'thyagaraja1983@gmail.com'
  )
  WITH CHECK (
    (auth.jwt() ->> 'email') = 'thyagaraja1983@gmail.com'
  );
