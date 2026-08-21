import { MetadataRoute } from 'next';
import { CITIES_DATA } from '@/components/layout/CityContent';
import { getAllPosts } from '@/lib/mdx';
import { supabase } from '@/config/supabaseClient';

const BASE_URL = 'https://homedesignenglish.com';

const USA_CITIES_FALLBACK = [
  'dallas-texas', 'miami-florida', 'atlanta-georgia', 'seattle-washington',
  'phoenix-arizona', 'chicago-illinois', 'denver-colorado', 'charlotte-north-carolina',
  'orlando-florida', 'nashville-tennessee', 'las-vegas-nevada', 'tampa-florida',
  'raleigh-north-carolina', 'salt-lake-city-utah', 'san-diego-california'
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
    },
    {
      url: `${BASE_URL}/visualizer`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    }
  ];

  // Dynamic City SEO Routes from Supabase
  const { data: locations } = await supabase.from('pseo_locations').select('slug, country');
  let cityRoutes: MetadataRoute.Sitemap = [];
  let realEstateRoutes: MetadataRoute.Sitemap = [];
  
  if (locations && locations.length > 0) {
    cityRoutes = locations.map((loc: any) => ({
      url: `${BASE_URL}/cost/construction-in-${loc.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    // USA Real Estate tools
    const usaLocations = locations.filter((loc: any) => loc.country === 'USA');
    
    // Merge fallbacks
    const existingSlugs = new Set(usaLocations.map((l: any) => l.slug));
    USA_CITIES_FALLBACK.forEach((slug) => {
      if (!existingSlugs.has(slug)) {
        usaLocations.push({ slug, country: 'USA' });
      }
    });

    usaLocations.forEach((loc: any) => {
      realEstateRoutes.push({
        url: `${BASE_URL}/real-estate/rent-vs-buy-in-${loc.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
      realEstateRoutes.push({
        url: `${BASE_URL}/real-estate/property-tax-in-${loc.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
      realEstateRoutes.push({
        url: `${BASE_URL}/real-estate/salary-needed-to-buy-in-${loc.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
      realEstateRoutes.push({
        url: `${BASE_URL}/real-estate/remodel-roi-in-${loc.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });
  } else {
    // Fallback
    cityRoutes = Object.keys(CITIES_DATA).map((cityKey) => ({
      url: `${BASE_URL}/cost/construction-in-${cityKey}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    USA_CITIES_FALLBACK.forEach((slug) => {
      realEstateRoutes.push({
        url: `${BASE_URL}/real-estate/rent-vs-buy-in-${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
      realEstateRoutes.push({
        url: `${BASE_URL}/real-estate/property-tax-in-${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
      realEstateRoutes.push({
        url: `${BASE_URL}/real-estate/salary-needed-to-buy-in-${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
      realEstateRoutes.push({
        url: `${BASE_URL}/real-estate/remodel-roi-in-${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });
  }

  // Dynamic Blog Routes
  const blogPosts = getAllPosts();
  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.meta.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...cityRoutes, ...realEstateRoutes, ...blogRoutes];
}
