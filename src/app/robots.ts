import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/upgrade/', '/signin/', '/signup/'],
    },
    sitemap: 'https://homedesignenglish.com/sitemap.xml',
  };
}
