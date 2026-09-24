-- Migration: 05_update_bathroom_designs_layout_constraint.sql
-- Description: Update bathroom_designs check constraint to officially include 'Compact 3-Fixture'

-- 1. Drop the existing layout check constraint
ALTER TABLE public.bathroom_designs DROP CONSTRAINT IF EXISTS bathroom_designs_layout_type_check;

-- 2. Add the comprehensive check constraint with all 5 bathroom layout options
ALTER TABLE public.bathroom_designs ADD CONSTRAINT bathroom_designs_layout_type_check
CHECK (layout_type IN ('Master Bathroom', 'Wet & Dry Partition', 'Compact 3-Fixture', 'Powder Room', 'Luxury Suite'));

-- 3. Update existing compact 3-fixture rows to have explicit 'Compact 3-Fixture' layout_type
UPDATE public.bathroom_designs
SET layout_type = 'Compact 3-Fixture'
WHERE slug LIKE '%3-fixture%' OR title ILIKE '%3-fixture%';
