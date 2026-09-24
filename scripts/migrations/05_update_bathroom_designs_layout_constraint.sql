-- Migration: 05_update_bathroom_designs_layout_constraint.sql
-- Description: Standardize all existing rows and apply check constraint safely

-- 1. Drop the existing layout check constraint first
ALTER TABLE public.bathroom_designs DROP CONSTRAINT IF EXISTS bathroom_designs_layout_type_check;

-- 2. Clean up and standardize all rows FIRST before adding the constraint
UPDATE public.bathroom_designs
SET layout_type = 'Compact 3-Fixture'
WHERE layout_type ILIKE '%compact%' OR layout_type ILIKE '%3-fixture%' OR title ILIKE '%3-fixture%';

UPDATE public.bathroom_designs
SET layout_type = 'Master Bathroom'
WHERE layout_type ILIKE '%master%';

UPDATE public.bathroom_designs
SET layout_type = 'Powder Room'
WHERE layout_type ILIKE '%powder%';

UPDATE public.bathroom_designs
SET layout_type = 'Luxury Suite'
WHERE layout_type ILIKE '%luxury%' OR layout_type ILIKE '%suite%';

-- Fallback any unknown / invalid / NULL values to 'Wet & Dry Partition'
UPDATE public.bathroom_designs
SET layout_type = 'Wet & Dry Partition'
WHERE layout_type NOT IN ('Master Bathroom', 'Wet & Dry Partition', 'Compact 3-Fixture', 'Powder Room', 'Luxury Suite')
   OR layout_type IS NULL;

-- 3. Now add the constraint (will succeed 100% since all rows are clean)
ALTER TABLE public.bathroom_designs ADD CONSTRAINT bathroom_designs_layout_type_check
CHECK (layout_type IN ('Master Bathroom', 'Wet & Dry Partition', 'Compact 3-Fixture', 'Powder Room', 'Luxury Suite'));
