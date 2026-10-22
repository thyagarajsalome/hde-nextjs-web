import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headerList = await headers();
  const host = headerList.get('host')?.toLowerCase() || 'www.homedesignenglish.com';
  const isUS = host.startsWith('us.') || host.includes('us.localhost');
  const isDubai = host.startsWith('dubai.') || host.includes('dubai.localhost');

  if (isUS) {
    return {
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/signin/',
          '/signup/',
          '/dev-links/',
          '/admin/',
          '/bangalore/',
          '/land-converter/',
          '/cost/construction-in-bengaluru',
          '/cost/construction-in-mumbai',
          '/cost/construction-in-delhi-ncr',
          '/cost/construction-in-chennai',
          '/cost/construction-in-hyderabad',
          '/cost/construction-in-pune',
          '/cost/construction-in-ahmedabad',
          '/cost/construction-in-kolkata',
          '/cost/construction-in-jaipur',
          '/cost/construction-in-lucknow',
          '/cost/construction-in-surat',
          '/cost/construction-in-nagpur',
          '/dubai-property/',
        ],
      },
      sitemap: 'https://us.homedesignenglish.com/sitemap.xml',
    };
  }

  if (isDubai) {
    return {
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/signin/',
          '/signup/',
          '/dev-links/',
          '/admin/',
          '/bangalore/',
          '/land-converter/',
          '/cost/',
          '/real-estate/',
        ],
      },
      sitemap: 'https://dubai.homedesignenglish.com/sitemap.xml',
    };
  }

  // India Mode (www.homedesignenglish.com)
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/signin/', '/signup/', '/dev-links/', '/admin/'],
    },
    sitemap: 'https://www.homedesignenglish.com/sitemap.xml',
  };
}
