-- ============================================================================
-- HDE ARCHITECTURAL HOUSE PLANS & BLUEPRINT STORE
-- Supabase PostgreSQL Migration Script (Fixes RLS and Schema Cache)
-- ============================================================================

-- 1. Add Store & Architectural Drawing columns to existing house_plans table
ALTER TABLE house_plans 
ADD COLUMN IF NOT EXISTS pdf_url TEXT,
ADD COLUMN IF NOT EXISTS carpet_area_sqft NUMERIC,
ADD COLUMN IF NOT EXISTS built_up_area_sqft NUMERIC,
ADD COLUMN IF NOT EXISTS living_hall_sqft NUMERIC DEFAULT 220,
ADD COLUMN IF NOT EXISTS kitchen_sqft NUMERIC DEFAULT 90,
ADD COLUMN IF NOT EXISTS electrical_points_count INTEGER DEFAULT 45,
ADD COLUMN IF NOT EXISTS orientation_notes TEXT DEFAULT 'Optimal Solar & Cross-Ventilation Alignment',
ADD COLUMN IF NOT EXISTS price_inr NUMERIC DEFAULT 499,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 2. Create Indexes for fast filtering by dimensions and facing
CREATE INDEX IF NOT EXISTS idx_house_plans_dimensions ON house_plans(dimensions);
CREATE INDEX IF NOT EXISTS idx_house_plans_facing ON house_plans(facing);
CREATE INDEX IF NOT EXISTS idx_house_plans_is_active ON house_plans(is_active);

-- 3. Fix Row-Level Security (RLS) policies so anyone can view, and admin can insert/update/delete
ALTER TABLE house_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public all access on house_plans" ON house_plans;
DROP POLICY IF EXISTS "Allow public select on house_plans" ON house_plans;
DROP POLICY IF EXISTS "Allow public insert on house_plans" ON house_plans;
DROP POLICY IF EXISTS "Allow public update on house_plans" ON house_plans;
DROP POLICY IF EXISTS "Allow public delete on house_plans" ON house_plans;

CREATE POLICY "Allow public all access on house_plans" 
ON house_plans 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 4. Reload PostgREST Schema Cache immediately so new columns are recognized
NOTIFY pgrst, 'reload schema';
