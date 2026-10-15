-- ==============================================================================
-- HDE STUDIO DESKTOP CAD: DATABASE MIGRATION SCRIPT
-- Tables: app_releases, licenses
-- Compatible with: Supabase / PostgreSQL 14+
-- ==============================================================================

-- 1. App Releases & Installers Table
create table if not exists public.app_releases (
    id uuid primary key default gen_random_uuid(),
    version text not null default 'v2.1',
    platform text not null check (platform in ('windows', 'macos', 'linux')),
    installer_type text not null check (installer_type in ('exe', 'dmg', 'deb', 'zip', 'tar.gz')),
    title text not null,
    download_url text not null,
    file_size_mb numeric(6, 2) not null,
    release_notes text,
    is_latest boolean default false,
    created_at timestamp with time zone default now()
);

-- Index for quick release lookups
create index if not exists idx_app_releases_platform on public.app_releases(platform, is_latest);

-- Enable RLS for public read access
alter table public.app_releases enable row level security;

create policy "Public can read app releases"
    on public.app_releases
    for select
    using (true);

-- 2. Commercial & Desktop Licenses Table
create table if not exists public.licenses (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete set null,
    customer_email text not null,
    license_key text unique not null,
    edition text not null check (edition in ('INDIA', 'USA', 'GLOBAL_PRO')),
    plan_name text not null,
    status text not null default 'active' check (status in ('active', 'suspended', 'revoked', 'expired')),
    max_devices int default 2,
    activated_devices jsonb default '[]'::jsonb,
    created_at timestamp with time zone default now(),
    expires_at timestamp with time zone
);

-- Index for user queries and desktop license verification
create index if not exists idx_licenses_user_id on public.licenses(user_id);
create index if not exists idx_licenses_key_email on public.licenses(license_key, customer_email);

-- Enable RLS
alter table public.licenses enable row level security;

-- Policy: Users can view their own licenses
create policy "Users can view own licenses"
    on public.licenses
    for select
    using (auth.uid() = user_id);

-- Policy: Authenticated users can insert their own license upon claiming
create policy "Users can claim own license"
    on public.licenses
    for insert
    with check (auth.uid() = user_id);

-- 3. Seed Initial Releases for v2.1
insert into public.app_releases (version, platform, installer_type, title, download_url, file_size_mb, release_notes, is_latest)
values 
  ('v2.1', 'windows', 'exe', 'HDE Studio Windows Installer (Setup.exe)', 'https://github.com/thyagarajsalome/HDE-Studio_Java-Project/releases/download/v2.1/HDE-Studio-Setup-v2.1.exe', 38.90, 'Full automated Windows installer with embedded JRE 21, desktop shortcuts, and Indian/USA AutoCAD catalogs.', true),
  ('v2.1', 'windows', 'zip', 'HDE Studio Windows Portable (.zip)', 'https://github.com/thyagarajsalome/HDE-Studio_Java-Project/releases/download/v2.1/HDE-Studio-v2.1-Windows-Portable.zip', 61.20, 'Zero-installation standalone portable zip for Windows 10/11 64-bit.', false),
  ('v2.1', 'linux', 'zip', 'HDE Studio Linux Portable (.zip)', 'https://github.com/thyagarajsalome/HDE-Studio_Java-Project/releases/download/v2.1/HDE-Studio-v2.1-Linux-Portable.zip', 5.38, 'Cross-distro portable Linux bundle with hde-studio.sh launcher and desktop shortcut.', true),
  ('v2.1', 'macos', 'dmg', 'HDE Studio macOS Apple Silicon / Intel (.dmg)', 'https://github.com/thyagarajsalome/HDE-Studio_Java-Project/releases/download/v2.1/HDE-Studio.dmg', 65.00, 'Native macOS disk image application bundle.', true)
on conflict do nothing;
