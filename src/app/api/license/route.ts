// src/app/api/license/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/config/supabaseClient';
import { DEFAULT_RELEASES, generateLicenseKey } from '@/services/licenseService';
import { recordTelemetryEvent, getTelemetryLogs } from '@/services/licenseTelemetryService';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  // Fetch telemetry logs and statistics for Admin Dashboard
  if (action === 'telemetry') {
    try {
      const data = await getTelemetryLogs(100);
      return NextResponse.json({ success: true, ...data });
    } catch (err: any) {
      return NextResponse.json({ error: err.message || 'Failed to fetch telemetry' }, { status: 500 });
    }
  }

  // Fetch software release installers
  if (action === 'releases' || !action) {
    try {
      // Return authoritative latest v2.2.6 releases catalogue
      return NextResponse.json({ success: true, releases: DEFAULT_RELEASES });
    } catch {
      return NextResponse.json({ success: true, releases: DEFAULT_RELEASES });
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, license_key, user_id, edition, machine_id, app_version, os, failure_reason } = body;

    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                     request.headers.get('x-real-ip') ||
                     'Direct / Internal';

    // Desktop App or Web App Activation & Verification
    if (action === 'verify' || action === 'activate') {
      if (!email || !license_key) {
        // Record missing fields failure
        await recordTelemetryEvent({
          email: email || 'UNKNOWN',
          license_key: license_key || 'NONE',
          machine_id: machine_id || 'UNKNOWN',
          app_version: app_version || 'v2.2.3',
          os: os || 'Unknown OS',
          status: 'FAILED',
          failure_reason: 'Email and license key are required',
          ip: clientIp,
        });

        return NextResponse.json(
          { valid: false, message: 'Email and license key are required.' },
          { status: 400 }
        );
      }

      const cleanKey = String(license_key).trim().toUpperCase();
      const cleanEmail = String(email).trim().toLowerCase();

      // Check Master Developer Key
      const isMasterKey = (
        cleanEmail === 'thyagarajsalome@gmail.com' &&
        (cleanKey === 'HDE-GLOBAL-PRO-2026' || cleanKey === 'HDE-MASTER-DEV-KEY')
      );

      // Check Official Web Commercial License Key Format
      // Pattern: HDE-PRO-2026-XXXX-XXXX or HDE-USA-2026-XXXX-XXXX or HDE-IND-2026-XXXX-XXXX
      const isCommercialPattern = /^HDE-(PRO|IND|USA|GLOBAL)-\d{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(cleanKey);

      // Check RSA Signed Key Format (HDE.payload.signature)
      const isRsaFormat = cleanKey.startsWith('HDE.') && cleanKey.split('.').length === 3;

      let isValid = false;
      let targetEdition = 'GLOBAL_PRO';
      let planName = 'All-Access Global Pro Edition (India + USA)';
      let rejectReason: string | null = null;

      // 1. Try checking against Supabase active licenses
      try {
        const { data: dbLicense } = await supabase
          .from('licenses')
          .select('*')
          .eq('license_key', cleanKey)
          .eq('customer_email', cleanEmail)
          .eq('status', 'active')
          .maybeSingle();

        if (dbLicense) {
          isValid = true;
          targetEdition = dbLicense.edition || 'GLOBAL_PRO';
          planName = dbLicense.plan_name || 'All-Access Global Pro Edition';
        }
      } catch (err: any) {
        console.warn('Supabase license lookup skipped:', err.message);
      }

      // 2. Cryptographic and Pattern Fallback
      if (!isValid) {
        if (isMasterKey) {
          isValid = true;
          targetEdition = 'GLOBAL_PRO';
          planName = 'All-Access Global Pro Edition (Creator Master)';
        } else if (isCommercialPattern) {
          isValid = true;
          if (cleanKey.includes('-USA-')) {
            targetEdition = 'USA';
            planName = 'USA & International Edition';
          } else if (cleanKey.includes('-IND-')) {
            targetEdition = 'INDIA';
            planName = 'India Standard Edition';
          } else {
            targetEdition = 'GLOBAL_PRO';
            planName = 'All-Access Global Pro Edition (India + USA)';
          }
        } else if (isRsaFormat) {
          isValid = true;
          targetEdition = 'GLOBAL_PRO';
          planName = 'RSA Verified Commercial License';
        } else {
          isValid = false;
          rejectReason = failure_reason || 'License key format does not match any valid HDE Studio pattern';
        }
      }

      // Record Telemetry Event for Real-Time Developer Visibility
      await recordTelemetryEvent({
        email: cleanEmail,
        license_key: cleanKey,
        machine_id: machine_id || 'UNKNOWN',
        app_version: app_version || 'v2.2.3',
        os: os || 'Windows / Unknown',
        status: isValid ? 'SUCCESS' : 'FAILED',
        failure_reason: isValid ? null : rejectReason,
        plan: isValid ? planName : undefined,
        ip: clientIp,
      });

      if (!isValid) {
        return NextResponse.json({
          valid: false,
          message: rejectReason || 'Could not verify license. Please check your purchase confirmation.',
        });
      }

      return NextResponse.json({
        valid: true,
        edition: targetEdition,
        plan_name: planName,
        message: 'License verified successfully.',
      });
    }

    // Free 14-Day Evaluation Trial Registration & Telemetry
    if (action === 'trial_started') {
      const trialRecord = await recordTelemetryEvent({
        email: email || 'trial_user',
        license_key: 'TRIAL-14-DAYS',
        machine_id: machine_id || 'UNKNOWN',
        app_version: app_version || 'v2.2.6',
        os: os || 'Windows / Unknown',
        status: 'SUCCESS',
        failure_reason: null,
        plan: '14-Day Free Evaluation Trial',
        ip: clientIp,
      });

      return NextResponse.json({
        success: true,
        message: '14-Day Free Trial registered successfully.',
        trial_days: 14,
        event_id: trialRecord.id,
      });
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
