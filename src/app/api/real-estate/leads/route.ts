// src/app/api/real-estate/leads/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/config/supabaseClient';
import { SAMPLE_BANGALORE_PROPERTIES } from '@/data/sampleProperties';

// In-memory rate limiting map for anti-scraping: max 10 phone reveals per IP per 10 minutes
const leadRateLimitMap = new Map<string, { count: number; resetTime: number }>();

export async function POST(request: Request) {
  try {
    // Rate limit check
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown-ip';

    const now = Date.now();
    const rateData = leadRateLimitMap.get(clientIp);

    if (rateData && now < rateData.resetTime) {
      if (rateData.count >= 10) {
        return NextResponse.json(
          { error: 'Too many inquiries requested. Please wait a few minutes before viewing more numbers.' },
          { status: 429 }
        );
      }
      rateData.count += 1;
    } else {
      leadRateLimitMap.set(clientIp, { count: 1, resetTime: now + 10 * 60 * 1000 });
    }

    const body = await request.json();
    const {
      property_id,
      is_dealer = false,
      buyer_name,
      buyer_phone,
      buyer_email,
      purchase_timeline = 'within_3_months',
      interested_in_home_loan = false,
      interested_in_site_visits = true,
      agreed_to_terms = true,
    } = body;

    if (!property_id) {
      return NextResponse.json({ error: 'property_id is required' }, { status: 400 });
    }

    if (!buyer_name || !buyer_phone) {
      return NextResponse.json({ error: 'Name and Phone Number are required' }, { status: 400 });
    }

    // Clean and strictly validate 10-digit Indian mobile number
    const cleanPhone = buyer_phone.replace(/[^0-9]/g, '');
    if (
      cleanPhone.length !== 10 ||
      !/^[6-9]\d{9}$/.test(cleanPhone) ||
      /^(\d)\1{9}$/.test(cleanPhone) ||
      cleanPhone === '1234567890'
    ) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9' },
        { status: 400 }
      );
    }

    // 1. Fetch the property contact details from Supabase (or fallback sample data)
    let sellerPhone = '';
    let sellerName = '';
    let propertyTitle = '';
    let sellerUserId: string | null = null;

    try {
      const { data: propData, error } = await supabase
        .from('real_estate_properties')
        .select('contact_phone, contact_name, title, user_id')
        .eq('id', property_id)
        .maybeSingle();

      if (propData && !error) {
        sellerPhone = propData.contact_phone;
        sellerName = propData.contact_name;
        propertyTitle = propData.title;
        sellerUserId = propData.user_id || null;
      }
    } catch (err) {
      console.warn('Supabase property query failed, falling back to sample data:', err);
    }

    // Fallback if property is from initial seed list
    if (!sellerPhone) {
      const sample = SAMPLE_BANGALORE_PROPERTIES.find((p) => p.id === property_id);
      if (sample) {
        sellerPhone = sample.contact_phone;
        sellerName = sample.contact_name;
        propertyTitle = sample.title;
      } else {
        sellerPhone = '+91 98860 12345';
        sellerName = 'Verified Owner';
        propertyTitle = 'Bangalore Property';
      }
    }

    // 2. Insert the lead into Supabase
    try {
      await supabase.from('real_estate_leads').insert({
        property_id,
        seller_user_id: sellerUserId,
        is_dealer: Boolean(is_dealer),
        buyer_name,
        buyer_phone: cleanPhone,
        buyer_email: buyer_email || null,
        purchase_timeline,
        interested_in_home_loan: Boolean(interested_in_home_loan),
        interested_in_site_visits: Boolean(interested_in_site_visits),
        agreed_to_terms: Boolean(agreed_to_terms),
      });

      // Increment inquiry count on property
      await supabase.rpc('increment_property_inquiries', { prop_id: property_id });
    } catch (dbErr) {
      console.warn('Lead insertion to DB warning:', dbErr);
    }

    // 3. Construct WhatsApp URL
    const cleanSellerDigits = sellerPhone.replace(/[^0-9]/g, '');
    const waNumber = cleanSellerDigits.startsWith('91') ? cleanSellerDigits : `91${cleanSellerDigits}`;
    const waMessage = encodeURIComponent(
      `Hello ${sellerName}, I saw your listing for "${propertyTitle}" on Home Design English (HDE). I am interested and would like to know more details.`
    );
    const whatsappUrl = `https://wa.me/${waNumber}?text=${waMessage}`;

    return NextResponse.json({
      success: true,
      revealed: true,
      sellerName,
      sellerPhone,
      whatsappUrl,
    });
  } catch (error: any) {
    console.error('Lead submission error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to submit inquiry' },
      { status: 500 }
    );
  }
}
