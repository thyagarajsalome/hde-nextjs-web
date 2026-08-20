import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Vercel automatically injects the user's country code (e.g., 'US', 'IN', 'GB') into this header
  const country = request.headers.get('x-vercel-ip-country') || 'UNKNOWN';
  
  return NextResponse.json({ country });
}
