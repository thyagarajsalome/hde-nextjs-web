import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/upgrade/', '/signin/', '/signup/', '/dev-links/'],
    },
    sitemap: 'https://www.homedesignenglish.com/sitemap.xml',
  };
}
