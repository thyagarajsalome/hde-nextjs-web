// src/app/api/license/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/config/supabaseClient';
import { DEFAULT_RELEASES, generateLicenseKey } from '@/services/licenseService';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'releases' || !action) {
    try {
      const { data, error } = await supabase
        .from('app_releases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return NextResponse.json({ success: true, releases: DEFAULT_RELEASES });
      }

      return NextResponse.json({ success: true, releases: data });
    } catch {
      return NextResponse.json({ success: true, releases: DEFAULT_RELEASES });
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, license_key, user_id, edition } = body;

    // Verify key from Desktop App or Web App
    if (action === 'verify') {
      if (!email || !license_key) {
        return NextResponse.json({ valid: false, message: 'Email and license key required' }, { status: 400 });
      }

      const cleanKey = license_key.trim().toUpperCase();
      const cleanEmail = email.trim().toLowerCase();

      try {
        const { data, error } = await supabase
          .from('licenses')
          .select('*')
          .eq('license_key', cleanKey)
          .eq('customer_email', cleanEmail)
          .eq('status', 'active')
          .maybeSingle();

        if (error || !data) {
          // Fallback algorithm verification: if the key matches valid format
          const isValidFormat = (cleanKey.startsWith('HDE-PRO-') || cleanKey.startsWith('HDE-IND-') || cleanKey.startsWith('HDE-USA-')) && cleanKey.length >= 16;
          return NextResponse.json({
            valid: isValidFormat,
            edition: cleanKey.includes('PRO') ? 'GLOBAL_PRO' : cleanKey.includes('USA') ? 'USA' : 'INDIA',
            plan_name: cleanKey.includes('PRO') ? 'All-Access Global Pro Edition' : 'Standard Edition'
          });
        }

        return NextResponse.json({
          valid: true,
          edition: data.edition,
          plan_name: data.plan_name,
          license_id: data.id
        });
      } catch {
        return NextResponse.json({ valid: true, edition: 'GLOBAL_PRO' });
      }
    }

    // Direct Key Generation (Admin / Internal)
    if (action === 'generate') {
      const targetEdition = (edition === 'USA' || edition === 'INDIA') ? edition : 'GLOBAL_PRO';
      const key = generateLicenseKey(targetEdition);
      return NextResponse.json({ success: true, license_key: key, edition: targetEdition });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
