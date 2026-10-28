import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Regional Domain Isolation Middleware:
 * Strictly prevents cross-indexing between USA, India, and Dubai domains.
 *
 * 1. US domain (us.homedesignenglish.com):
 *    - Only serves US Real Estate (/real-estate/*), US calculators, US blog, and software download.
 *    - Permanently (301) redirects India-only routes (/bangalore, /land-converter, /cost, /plans) to www.homedesignenglish.com
 *    - Permanently (301) redirects Dubai routes (/dubai-property) to dubai.homedesignenglish.com
 *
 * 2. India / Main domain (www.homedesignenglish.com):
 *    - Only serves India construction costs, Bangalore real estate, land converters, and house plans.
 *    - Permanently (301) redirects US Real Estate (/real-estate, /real-estate/*) to us.homedesignenglish.com
 *    - Permanently (301) redirects Dubai property (/dubai-property, /dubai-property/*) to dubai.homedesignenglish.com
 *
 * 3. Dubai domain (dubai.homedesignenglish.com):
 *    - Only serves Dubai property listings, area guides, and DLD fee calculators.
 *    - Permanently (301) redirects US Real Estate to us.homedesignenglish.com
 *    - Permanently (301) redirects India-only routes to www.homedesignenglish.com
 */

const INDIA_ONLY_PREFIXES = [
  '/bangalore',
  '/land-converter',
  '/cost',
  '/plans',
];

export function middleware(request: NextRequest) {
  const host = request.headers.get('host')?.toLowerCase() || '';
  const pathname = request.nextUrl.pathname.toLowerCase();

  const isUS = host.startsWith('us.') || host.includes('us.localhost');
  const isDubai = host.startsWith('dubai.') || host.includes('dubai.localhost');
  const isIndia = !isUS && !isDubai;

  // 1. USA SUBDOMAIN ROUTING
  if (isUS) {
    // Check if India-only feature is requested on US domain
    const isIndiaRoute = INDIA_ONLY_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );

    if (isIndiaRoute) {
      const targetUrl = new URL(
        request.nextUrl.pathname + request.nextUrl.search,
        'https://www.homedesignenglish.com'
      );
      return NextResponse.redirect(targetUrl, 301);
    }

    // Check if Dubai route is requested on US domain
    if (pathname === '/dubai-property' || pathname.startsWith('/dubai-property/')) {
      const targetUrl = new URL(
        request.nextUrl.pathname + request.nextUrl.search,
        'https://dubai.homedesignenglish.com'
      );
      return NextResponse.redirect(targetUrl, 301);
    }
  }

  // 2. INDIA MAIN DOMAIN ROUTING
  if (isIndia) {
    // If US Real Estate is requested on India domain, 301 redirect to US subdomain
    if (pathname === '/real-estate' || pathname.startsWith('/real-estate/')) {
      const targetUrl = new URL(
        request.nextUrl.pathname + request.nextUrl.search,
        'https://us.homedesignenglish.com'
      );
      return NextResponse.redirect(targetUrl, 301);
    }

    // If Dubai property is requested on India domain, 301 redirect to Dubai subdomain
    if (pathname === '/dubai-property' || pathname.startsWith('/dubai-property/')) {
      const targetUrl = new URL(
        request.nextUrl.pathname + request.nextUrl.search,
        'https://dubai.homedesignenglish.com'
      );
      return NextResponse.redirect(targetUrl, 301);
    }
  }

  // 3. DUBAI SUBDOMAIN ROUTING
  if (isDubai) {
    if (pathname === '/real-estate' || pathname.startsWith('/real-estate/')) {
      const targetUrl = new URL(
        request.nextUrl.pathname + request.nextUrl.search,
        'https://us.homedesignenglish.com'
      );
      return NextResponse.redirect(targetUrl, 301);
    }

    const isIndiaRoute = INDIA_ONLY_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );

    if (isIndiaRoute) {
      const targetUrl = new URL(
        request.nextUrl.pathname + request.nextUrl.search,
        'https://www.homedesignenglish.com'
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
