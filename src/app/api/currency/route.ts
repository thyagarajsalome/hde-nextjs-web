import { NextResponse } from 'next/server';

// Fallback rates in case the forex API is unreachable or rate limited
const FALLBACK_RATES: Record<string, number> = {
  AED: 1,
  INR: 22.85,
  USD: 0.272,
  GBP: 0.215,
  EUR: 0.252,
};

export const revalidate = 86400; // Cache for 24 hours on Vercel's Edge CDN

export async function GET() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/AED', {
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      throw new Error(`Forex API returned status ${res.status}`);
    }

    const data = await res.json();

    if (!data.rates || !data.rates.INR || !data.rates.USD) {
      throw new Error('Incomplete rates returned');
    }

    return NextResponse.json(
      {
        base: 'AED',
        rates: {
          AED: 1,
          INR: Math.round(data.rates.INR * 100) / 100,
          USD: Math.round(data.rates.USD * 1000) / 1000,
          GBP: Math.round((data.rates.GBP || 0.215) * 1000) / 1000,
          EUR: Math.round((data.rates.EUR || 0.252) * 1000) / 1000,
        },
        updatedAt: data.time_last_update_utc || new Date().toISOString(),
        source: 'live',
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
        },
      }
    );
  } catch (error) {
    console.warn('Using fallback exchange rates:', error);
    return NextResponse.json(
      {
        base: 'AED',
        rates: FALLBACK_RATES,
        updatedAt: new Date().toISOString(),
        source: 'fallback',
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
        },
      }
    );
  }
}
