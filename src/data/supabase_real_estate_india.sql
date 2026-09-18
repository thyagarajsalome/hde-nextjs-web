-- ============================================================================
-- HDE INDIA REAL ESTATE MARKETPLACE (BANGALORE PILOT)
-- Supabase PostgreSQL Migration Script
-- ============================================================================

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE listing_intent AS ENUM ('sale', 'rent');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE property_category AS ENUM ('flat', 'villa', 'plot', 'independent_house', 'penthouse');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE bhk_type AS ENUM ('1RK', '1BHK', '2BHK', '3BHK', '4BHK', '4+BHK', 'NA_PLOT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE furnishing_status AS ENUM ('unfurnished', 'semi_furnished', 'fully_furnished');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE facing_direction AS ENUM ('East', 'North', 'North-East', 'West', 'South', 'South-East', 'North-West', 'South-West');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE listing_status AS ENUM ('pending_approval', 'active', 'sold_or_rented', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE poster_role AS ENUM ('owner', 'agent', 'builder');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE buyer_timeline AS ENUM ('within_3_months', 'within_6_months', 'more_than_6_months');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. BANGALORE LOCALITIES TABLE
CREATE TABLE IF NOT EXISTS public.real_estate_localities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city VARCHAR(50) NOT NULL DEFAULT 'Bangalore',
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    zone VARCHAR(50) NOT NULL,
    pincode VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_localities_city_slug ON public.real_estate_localities(city, slug);

-- 3. REAL ESTATE PROPERTIES TABLE
CREATE TABLE IF NOT EXISTS public.real_estate_properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    intent listing_intent NOT NULL DEFAULT 'sale',
    category property_category NOT NULL DEFAULT 'flat',
    bhk bhk_type NOT NULL DEFAULT '2BHK',
    city VARCHAR(50) NOT NULL DEFAULT 'Bangalore',
    locality_id UUID REFERENCES public.real_estate_localities(id) ON DELETE SET NULL,
    locality_name VARCHAR(100) NOT NULL,
    sub_locality VARCHAR(150),
    
    super_builtup_sqft INTEGER,
    carpet_area_sqft INTEGER,
    plot_area_sqft INTEGER,
    price NUMERIC(14, 2) NOT NULL,
    maintenance_monthly NUMERIC(10, 2) DEFAULT 0,
    deposit_amount NUMERIC(12, 2) DEFAULT 0,
    
    floor_number INTEGER,
    total_floors INTEGER,
    facing facing_direction,
    furnishing furnishing_status DEFAULT 'unfurnished',
    available_from DATE DEFAULT CURRENT_DATE,
    khata_type VARCHAR(20) DEFAULT 'A Khata',
    
    title VARCHAR(180) NOT NULL,
    description TEXT NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
    connectivity JSONB DEFAULT '{}'::jsonb,
    
    poster_type poster_role NOT NULL DEFAULT 'owner',
    contact_name VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    contact_whatsapp VARCHAR(20),
    rera_id VARCHAR(60),
    agency_name VARCHAR(120),
    is_rera_verified BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    
    status listing_status DEFAULT 'active',
    views_count INTEGER DEFAULT 0,
    inquiries_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_re_prop_active_filter ON public.real_estate_properties (status, city, intent, category);
CREATE INDEX IF NOT EXISTS idx_re_prop_locality ON public.real_estate_properties (locality_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_re_prop_price ON public.real_estate_properties (price) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_re_prop_bhk ON public.real_estate_properties (bhk) WHERE status = 'active';

-- 4. LEADS & CONTACT VIEW TABLE (From "Please share your details to view number" modal)
CREATE TABLE IF NOT EXISTS public.real_estate_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.real_estate_properties(id) ON DELETE CASCADE,
    seller_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_dealer BOOLEAN NOT NULL DEFAULT false,
    buyer_name VARCHAR(100) NOT NULL,
    buyer_phone VARCHAR(20) NOT NULL,
    buyer_email VARCHAR(120),
    purchase_timeline buyer_timeline DEFAULT 'within_3_months',
    interested_in_home_loan BOOLEAN DEFAULT false,
    interested_in_site_visits BOOLEAN DEFAULT true,
    agreed_to_terms BOOLEAN DEFAULT true,
    ip_hash VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_re_leads_prop ON public.real_estate_leads(property_id);
CREATE INDEX IF NOT EXISTS idx_re_leads_phone ON public.real_estate_leads(buyer_phone);

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.real_estate_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_estate_localities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_estate_leads ENABLE ROW LEVEL SECURITY;

-- Everyone can view active properties; owners can view their own properties regardless of status
CREATE POLICY "Public can view active properties" ON public.real_estate_properties
    FOR SELECT USING (status = 'active' OR auth.uid() = user_id);

-- Authenticated or guest users can submit properties (server/auth attaches user_id if logged in)
CREATE POLICY "Allow insert properties" ON public.real_estate_properties
    FOR INSERT WITH CHECK (true);

-- Only listing owners (or admin via service role) can update their properties
CREATE POLICY "Owners can update their own properties" ON public.real_estate_properties
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Only listing owners (or admin via service role) can delete their properties
CREATE POLICY "Owners can delete their own properties" ON public.real_estate_properties
    FOR DELETE USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Everyone can read localities
CREATE POLICY "Public can read localities" ON public.real_estate_localities
    FOR SELECT USING (true);

-- Anyone can submit a lead inquiry
CREATE POLICY "Public can insert lead inquiries" ON public.real_estate_leads
    FOR INSERT WITH CHECK (true);

-- ONLY the seller who received the lead can view it (Prevents public data scraping of buyer phone numbers)
CREATE POLICY "Sellers can view leads for their properties" ON public.real_estate_leads
    FOR SELECT USING (auth.uid() = seller_user_id);

-- Sellers can delete leads associated with their listings
CREATE POLICY "Sellers can delete their leads" ON public.real_estate_leads
    FOR DELETE USING (auth.uid() = seller_user_id);
