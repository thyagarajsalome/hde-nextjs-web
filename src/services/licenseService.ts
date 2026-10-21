// src/services/licenseService.ts
import { supabase } from '../config/supabaseClient';

export interface AppRelease {
  id: string;
  version: string;
  platform: 'windows' | 'macos' | 'linux';
  installer_type: 'exe' | 'dmg' | 'deb' | 'zip' | 'tar.gz';
  title: string;
  download_url: string;
  file_size_mb: number;
  release_notes?: string;
  is_latest: boolean;
}

export interface DesktopLicense {
  id: string;
  user_id: string;
  customer_email: string;
  license_key: string;
  edition: 'INDIA' | 'USA' | 'GLOBAL_PRO';
  plan_name: string;
  status: 'active' | 'suspended' | 'revoked' | 'expired';
  max_devices: number;
  created_at: string;
  expires_at?: string | null;
}

// Fallback release catalogue in case Supabase table is not yet migrated
export const DEFAULT_RELEASES: AppRelease[] = [
  {
    id: 'win-exe-2.2.7',
    version: 'v2.2.7',
    platform: 'windows',
    installer_type: 'exe',
    title: 'HDE Studio Windows Installer (Setup.exe)',
    download_url: 'https://pub-b20d9352722b43219ceb523a3a0c89d5.r2.dev/releases/v2.2.7/HDE-Studio-Setup-v2.2.7.exe',
    file_size_mb: 39.1,
    release_notes: 'v2.2.7: 14-day full free trial, AutoCAD-style 2-point dimensioning, wall auto-dimensioning, 60+ architectural vector blocks, dynamic dimension chains.',
    is_latest: true
  },
  {
    id: 'win-zip-2.2.7',
    version: 'v2.2.7',
    platform: 'windows',
    installer_type: 'zip',
    title: 'HDE Studio Windows Portable (.zip)',
    download_url: 'https://github.com/thyagarajsalome/HDE-Studio-Releases/releases/download/v2.2.7/HDE-Studio.jar',
    file_size_mb: 8.5,
    release_notes: 'Standalone portable zero-installation archive for Windows 10/11 64-bit.',
    is_latest: false
  },
  {
    id: 'linux-zip-2.2.7',
    version: 'v2.2.7',
    platform: 'linux',
    installer_type: 'zip',
    title: 'HDE Studio Linux Portable (.zip)',
    download_url: 'https://github.com/thyagarajsalome/HDE-Studio-Releases/releases/download/v2.2.7/HDE-Studio-v2.2.7-Linux-Portable.zip',
    file_size_mb: 8.4,
    release_notes: 'Cross-distro portable Linux bundle with hde-studio.sh launcher and desktop menu entry.',
    is_latest: true
  },
  {
    id: 'mac-dmg-2.2.7',
    version: 'v2.2.7',
    platform: 'macos',
    installer_type: 'dmg',
    title: 'HDE Studio macOS DMG (.dmg)',
    download_url: 'https://github.com/thyagarajsalome/HDE-Studio-Releases/releases/download/v2.2.7/HDE-Studio.dmg',
    file_size_mb: 61.7,
    release_notes: 'Native macOS disk image application bundle for Apple Silicon and Intel Macs.',
    is_latest: true
  }
];

/**
 * Generate a random block of characters
 */
function randomBlock(len = 4): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing 0/O, 1/I
  let res = '';
  for (let i = 0; i < len; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}

/**
 * Generates an HDE Studio desktop-compatible license key
 * Compatible with HousePlanCADApp.LicenseManager
 */
export function generateLicenseKey(edition: 'INDIA' | 'USA' | 'GLOBAL_PRO'): string {
  const year = new Date().getFullYear();
  const b1 = randomBlock(4);
  const b2 = randomBlock(4);

  if (edition === 'GLOBAL_PRO') {
    return `HDE-PRO-${year}-${b1}-${b2}`;
  } else if (edition === 'USA') {
    return `HDE-USA-${year}-${b1}-${b2}`;
  } else {
    return `HDE-IND-${year}-${b1}-${b2}`;
  }
}

/**
 * Fetch latest software releases
 */
export async function getLatestReleases(): Promise<AppRelease[]> {
  return DEFAULT_RELEASES;
}

/**
 * Fetch user's desktop license by User ID
 */
export async function getUserLicense(userId: string): Promise<DesktopLicense | null> {
  if (!userId) return null;
  try {
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return data as DesktopLicense;
  } catch (err) {
    console.error('Error fetching user license:', err);
    return null;
  }
}

/**
 * Claim or automatically create a desktop license for the logged-in user
 */
export async function claimOrCreateLicense(
  userId: string,
  email: string,
  regionCode: string = 'IN',
  planTier: string = 'free'
): Promise<DesktopLicense | null> {
  if (!userId || !email) return null;

  // Check if license already exists
  const existing = await getUserLicense(userId);
  if (existing) return existing;

  // Determine license edition based on user's web tier and region
  let edition: 'INDIA' | 'USA' | 'GLOBAL_PRO' = 'GLOBAL_PRO';
  let planName = 'All-Access Global Pro Edition';

  if (planTier === 'pro') {
    edition = 'GLOBAL_PRO';
    planName = 'All-Access Global Pro Edition (India + USA)';
  } else if (regionCode === 'US') {
    edition = 'USA';
    planName = 'USA & International Edition';
  } else if (regionCode === 'IN') {
    edition = 'INDIA';
    planName = 'India Standard Edition';
  }

  const key = generateLicenseKey(edition);

  try {
    const { data, error } = await supabase
      .from('licenses')
      .insert({
        user_id: userId,
        customer_email: email.trim().toLowerCase(),
        license_key: key,
        edition,
        plan_name: planName,
        status: 'active',
        max_devices: 1,
      })
      .select()
      .single();

    if (error) {
      console.warn('Could not insert license to Supabase (table might not exist yet):', error.message);
      // Return transient license so user is not blocked
      return {
        id: 'transient-' + Date.now(),
        user_id: userId,
        customer_email: email,
        license_key: key,
        edition,
        plan_name: planName,
        status: 'active',
        max_devices: 1,
        created_at: new Date().toISOString()
      };
    }

    return data as DesktopLicense;
  } catch (err) {
    console.error('Failed to claim license:', err);
    return null;
  }
}
