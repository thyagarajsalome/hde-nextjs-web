-- ==============================================================================
-- 06_fix_supabase_rls_security.sql
-- Resolution for Supabase Security Advisory: rls_disabled_in_public
-- Project: HDE (ncontvjtfhsabphxfuhb)
-- ==============================================================================

-- STEP 1: Automatically Enable Row Level Security (RLS) on ALL public tables
DO $$
DECLARE
    tbl RECORD;
BEGIN
    FOR tbl IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
          AND rowsecurity = false
    ) LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl.tablename);
        RAISE NOTICE 'Enabled RLS on public.%', tbl.tablename;
    END LOOP;
END $$;


-- ==============================================================================
-- STEP 2: Configure Explicit Security Policies for Each Table
-- ==============================================================================

-- 1. HERO BANNERS (Public read, admin write)
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'hero_banners') THEN
        ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public can view hero banners" ON public.hero_banners;
        CREATE POLICY "Public can view hero banners" ON public.hero_banners FOR SELECT USING (true);
        
        DROP POLICY IF EXISTS "Authenticated users manage hero banners" ON public.hero_banners;
        CREATE POLICY "Authenticated users manage hero banners" ON public.hero_banners FOR ALL TO authenticated USING (true);
    END IF;
END $$;


-- 2. HOUSE PLANS (Public read, authenticated upload/edit)
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'house_plans') THEN
        ALTER TABLE public.house_plans ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public can view house plans" ON public.house_plans;
        CREATE POLICY "Public can view house plans" ON public.house_plans FOR SELECT USING (true);

        DROP POLICY IF EXISTS "Authenticated users insert house plans" ON public.house_plans;
        CREATE POLICY "Authenticated users insert house plans" ON public.house_plans FOR INSERT TO authenticated WITH CHECK (true);

        DROP POLICY IF EXISTS "Authenticated users update house plans" ON public.house_plans;
        CREATE POLICY "Authenticated users update house plans" ON public.house_plans FOR UPDATE TO authenticated USING (true);
    END IF;
END $$;


-- 3. PSEO DATA TABLES (Public read-only for SEO pages)
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pseo_locations') THEN
        ALTER TABLE public.pseo_locations ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public can view pseo_locations" ON public.pseo_locations;
        CREATE POLICY "Public can view pseo_locations" ON public.pseo_locations FOR SELECT USING (true);
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pseo_construction_rates') THEN
        ALTER TABLE public.pseo_construction_rates ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public can view pseo_construction_rates" ON public.pseo_construction_rates;
        CREATE POLICY "Public can view pseo_construction_rates" ON public.pseo_construction_rates FOR SELECT USING (true);
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pseo_painting_data') THEN
        ALTER TABLE public.pseo_painting_data ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Public can view pseo_painting_data" ON public.pseo_painting_data;
        CREATE POLICY "Public can view pseo_painting_data" ON public.pseo_painting_data FOR SELECT USING (true);
    END IF;
END $$;


-- 4. USER PROFILES (Users can only read & edit their own profile)
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
        CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

        DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
        CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

        DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
        CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;


-- 5. SAVED USER PROJECTS (Users can only access their own calculations)
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'projects') THEN
        ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Users manage own projects" ON public.projects;
        CREATE POLICY "Users manage own projects" ON public.projects FOR ALL USING (auth.uid() = user_id);
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_projects') THEN
        ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Users manage own user_projects" ON public.user_projects;
        CREATE POLICY "Users manage own user_projects" ON public.user_projects FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;


-- 6. DIRECTORY PROFESSIONALS (Public can view, pros manage own listing)
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'professionals') THEN
        ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Public can view professionals" ON public.professionals;
        CREATE POLICY "Public can view professionals" ON public.professionals FOR SELECT USING (true);

        DROP POLICY IF EXISTS "Pros can manage own listing" ON public.professionals;
        CREATE POLICY "Pros can manage own listing" ON public.professionals FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;


-- 7. DUBAI LEADS & AGENTS (Public can submit leads/inquiries; only authenticated/admins can view)
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'dubai_leads') THEN
        ALTER TABLE public.dubai_leads ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Anyone can submit dubai leads" ON public.dubai_leads;
        CREATE POLICY "Anyone can submit dubai leads" ON public.dubai_leads FOR INSERT WITH CHECK (true);

        DROP POLICY IF EXISTS "Authenticated users view dubai leads" ON public.dubai_leads;
        CREATE POLICY "Authenticated users view dubai leads" ON public.dubai_leads FOR SELECT TO authenticated USING (true);
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'dubai_agents') THEN
        ALTER TABLE public.dubai_agents ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Public can view active dubai agents" ON public.dubai_agents;
        CREATE POLICY "Public can view active dubai agents" ON public.dubai_agents FOR SELECT USING (true);

        DROP POLICY IF EXISTS "Anyone can register as dubai agent" ON public.dubai_agents;
        CREATE POLICY "Anyone can register as dubai agent" ON public.dubai_agents FOR INSERT WITH CHECK (true);
    END IF;
END $$;


-- ==============================================================================
-- STEP 3: Verification Query
-- Returns any remaining unprotected tables (should return 0 rows)
-- ==============================================================================
SELECT 
    schemaname, 
    tablename, 
    rowsecurity AS rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = false;
