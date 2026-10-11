import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/upgrade/', '/signin/', '/signup/', '/dev-links/', '/admin/'],
    },
    sitemap: [
      'https://www.homedesignenglish.com/sitemap.xml',
      'https://us.homedesignenglish.com/sitemap.xml',
      'https://dubai.homedesignenglish.com/sitemap.xml',
    ],
  };
}
