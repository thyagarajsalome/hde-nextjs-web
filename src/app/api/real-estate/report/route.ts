// src/app/api/real-estate/report/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { propertyId, propertyTitle, reason, details, reporterContact } = body;

    if (!propertyId || !reason) {
      return NextResponse.json({ error: 'Property ID and reason are required' }, { status: 400 });
    }

    // Log the moderation report for immediate admin audit
    console.warn(`[MODERATION ALERT] Property ${propertyId} ("${propertyTitle}") reported for: ${reason}. Details: ${details || 'None'}. Reporter: ${reporterContact || 'Anonymous'}`);

    return NextResponse.json({
      success: true,
      message: 'Report received. Our moderation team will review this listing within 24 hours.'
    });
  } catch (error: any) {
    console.error('Error reporting listing:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
