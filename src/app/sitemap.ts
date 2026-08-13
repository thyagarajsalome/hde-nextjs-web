import { MetadataRoute } from 'next';
import { CITIES_DATA } from '@/components/layout/CityContent';

const BASE_URL = 'https://homedesignenglish.com';

export default function sitemap(): MetadataRoute.Sitemap {
  // Static Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/plans`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/directory`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/app`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }
  ];

  // Dynamic City SEO Routes
  const cityRoutes: MetadataRoute.Sitemap = Object.keys(CITIES_DATA).map((cityKey) => ({
    url: `${BASE_URL}/cost/construction-in-${cityKey}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  return [...staticRoutes, ...cityRoutes];
}
