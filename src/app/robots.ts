import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headerList = await headers();
  const host = headerList.get('host')?.toLowerCase() || 'www.homedesignenglish.com';
  const isUS = host.startsWith('us.') || host.includes('us.localhost');
  const isDubai = host.startsWith('dubai.') || host.includes('dubai.localhost');

  const privateDisallows = [
    '/dashboard/',
    '/signin/',
    '/signup/',
    '/dev-links/',
    '/admin/',
  ];

  if (isUS) {
    return {
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: privateDisallows,
      },
      sitemap: 'https://us.homedesignenglish.com/sitemap.xml',
    };
  }

  if (isDubai) {
    return {
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: privateDisallows,
      },
      sitemap: 'https://dubai.homedesignenglish.com/sitemap.xml',
    };
  }

  // India Mode (www.homedesignenglish.com)
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: privateDisallows,
    },
    sitemap: 'https://www.homedesignenglish.com/sitemap.xml',
  };
}
