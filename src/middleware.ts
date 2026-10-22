import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * India-only programmatic SEO route prefixes.
 * These pages must NEVER be indexed or served on the US domain (us.homedesignenglish.com).
 * Any visitor or bot requesting these on US mode will be permanently (301) redirected to
 * the authoritative India mode domain (www.homedesignenglish.com).
 */
const INDIA_ONLY_PREFIXES = [
  '/bangalore',
  '/land-converter',
];

// Indian city slugs used across /cost/ programmatic pages
const INDIA_CITY_SLUGS = [
  'bengaluru',
  'mumbai',
  'delhi-ncr',
  'chennai',
  'hyderabad',
  'pune',
  'ahmedabad',
  'kolkata',
  'jaipur',
  'lucknow',
  'surat',
  'nagpur',
];

export function middleware(request: NextRequest) {
  const host = request.headers.get('host')?.toLowerCase() || '';
  const pathname = request.nextUrl.pathname.toLowerCase();

  // Detect US subdomain or local US development host
  const isUS = host.startsWith('us.') || host.includes('us.localhost');

  if (isUS) {
    // 1. Check if route matches India-only programmatic hubs (/bangalore, /land-converter)
    const isIndiaHub = INDIA_ONLY_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );

    // 2. Check if route is an Indian city construction cost pSEO page
    const isIndiaCostPage =
      pathname.startsWith('/cost/') &&
      INDIA_CITY_SLUGS.some((slug) => pathname.includes(slug));

    if (isIndiaHub || isIndiaCostPage) {
      const targetUrl = new URL(
        request.nextUrl.pathname + request.nextUrl.search,
        'https://www.homedesignenglish.com'
      );
      return NextResponse.redirect(targetUrl, 301);
    }

    // 3. If Dubai property is requested on US domain, redirect to Dubai domain
    if (pathname === '/dubai-property' || pathname.startsWith('/dubai-property/')) {
      const targetUrl = new URL(
        request.nextUrl.pathname + request.nextUrl.search,
        'https://dubai.homedesignenglish.com'
      );
      return NextResponse.redirect(targetUrl, 301);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static, _next/image
     * - static files (.png, .jpg, .ico, .svg, .webp, .xml, .txt)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images|icons|assets|.*\\..*).*)',
  ],
};
