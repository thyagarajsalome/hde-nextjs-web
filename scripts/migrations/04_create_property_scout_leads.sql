-- scripts/migrations/04_create_property_scout_leads.sql

CREATE TABLE IF NOT EXISTS public.property_scout_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    locality_name VARCHAR(100) NOT NULL,
    property_category VARCHAR(50) NOT NULL DEFAULT 'flat', -- 'flat', 'plot', 'villa', 'shop'
    intent VARCHAR(20) NOT NULL DEFAULT 'rent',            -- 'rent', 'sale'
    
    approx_price_or_rent NUMERIC(14, 2),
    expected_finders_fee NUMERIC(10, 2) DEFAULT 2000,      -- e.g. ₹2,000 finder fee
    finders_fee_type VARCHAR(20) DEFAULT 'fixed_amount',   -- 'fixed_amount' or 'percent_split'
    
    board_photo_url TEXT,
    property_address_hint TEXT NOT NULL,                  -- e.g. "Near Wipro Gate, Sarjapur Road"
    
    -- Owner Contact (Kept protected/masked)
    owner_name VARCHAR(100),
    owner_phone VARCHAR(20) NOT NULL,
    
    -- Referrer Ramu's Contact
    scout_name VARCHAR(100) NOT NULL,
    scout_phone VARCHAR(20) NOT NULL,
    scout_upi_id VARCHAR(100),                            -- For direct settlement from broker/buyer
    
    status VARCHAR(30) DEFAULT 'active',                  -- 'active', 'deal_in_progress', 'deal_closed'
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for instant locality filtering
CREATE INDEX IF NOT EXISTS idx_scout_leads_locality ON public.property_scout_leads(locality_name, status);

-- Row Level Security (RLS)
ALTER TABLE public.property_scout_leads ENABLE ROW LEVEL SECURITY;

-- Drop existing restrictive policies if present
DROP POLICY IF EXISTS "Public can view active scout leads" ON public.property_scout_leads;
DROP POLICY IF EXISTS "Authenticated users can insert scout leads" ON public.property_scout_leads;
DROP POLICY IF EXISTS "Users can update their own scout leads" ON public.property_scout_leads;
DROP POLICY IF EXISTS "Allow insert scout leads" ON public.property_scout_leads;
DROP POLICY IF EXISTS "Allow select scout leads" ON public.property_scout_leads;
DROP POLICY IF EXISTS "Allow update scout leads" ON public.property_scout_leads;
DROP POLICY IF EXISTS "Allow delete scout leads" ON public.property_scout_leads;

-- 1. Everyone can view scout leads
CREATE POLICY "Allow select scout leads"
    ON public.property_scout_leads
    FOR SELECT
    USING (true);

-- 2. Allow guest or authenticated users to insert scout leads
CREATE POLICY "Allow insert scout leads"
    ON public.property_scout_leads
    FOR INSERT
    WITH CHECK (true);

-- 3. Allow update (e.g. marking deal closed or editing details)
CREATE POLICY "Allow update scout leads"
    ON public.property_scout_leads
    FOR UPDATE
    USING (true);

-- 4. Allow delete (e.g. removing closed deal data)
CREATE POLICY "Allow delete scout leads"
    ON public.property_scout_leads
    FOR DELETE
    USING (true);
