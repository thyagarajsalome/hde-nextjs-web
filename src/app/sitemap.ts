import { MetadataRoute } from 'next';
import { CITIES_DATA } from '@/components/layout/CityContent';
import { getAllPosts } from '@/lib/mdx';
import { supabase } from '@/config/supabaseClient';
import { TOP_CONVERSION_PAIRS } from '@/data/landUnits';

const BASE_URL = 'https://www.homedesignenglish.com';

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
    },
    {
      url: `${BASE_URL}/real-estate/texas`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/real-estate/florida`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/real-estate/california`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/disclaimer`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/directory`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/land-converter`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    }
  ];

  // Dynamic City SEO Routes from Supabase
  const { data: locations } = await supabase.from('pseo_locations').select('slug, country');
  let cityRoutes: MetadataRoute.Sitemap = [];
  let realEstateRoutes: MetadataRoute.Sitemap = [];
  
  if (locations && locations.length > 0) {
    cityRoutes = locations.flatMap((loc: any) => [
      {
        url: `${BASE_URL}/cost/construction-in-${loc.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/cost/interior-design-in-${loc.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/cost/flooring-in-${loc.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/cost/painting-in-${loc.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }
    ]);

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
      realEstateRoutes.push({
        url: `${BASE_URL}/real-estate/pickleball-court-cost-in-${loc.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
      realEstateRoutes.push({
        url: `${BASE_URL}/real-estate/outdoor-kitchen-cost-in-${loc.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });
  } else {
    // Fallback
    cityRoutes = Object.keys(CITIES_DATA).flatMap((cityKey) => [
      {
        url: `${BASE_URL}/cost/construction-in-${cityKey}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/cost/interior-design-in-${cityKey}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/cost/flooring-in-${cityKey}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/cost/painting-in-${cityKey}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }
    ]);

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
      realEstateRoutes.push({
        url: `${BASE_URL}/real-estate/pickleball-court-cost-in-${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
      realEstateRoutes.push({
        url: `${BASE_URL}/real-estate/outdoor-kitchen-cost-in-${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });
  }

  // Dynamic Blog Routes
  const blogPosts = getAllPosts();
  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => {
    const isValidDate = post.meta.date && !isNaN(Date.parse(post.meta.date));
    return {
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: isValidDate ? new Date(post.meta.date) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    };
  });

  // Dubai Property Routes
  const DUBAI_AREAS = [
    'dubai-marina', 'downtown-dubai', 'business-bay', 'jvc',
    'dubai-hills', 'palm-jumeirah', 'jlt', 'dubai-creek-harbour',
    'mbr-city', 'arabian-ranches', 'dubai-south', 'jbr',
    'dubai-silicon-oasis', 'al-barsha', 'dubai-sports-city'
  ];

  const dubaiRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/dubai-property`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/dubai-property/calculator`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...DUBAI_AREAS.map(slug => ({
      url: `${BASE_URL}/dubai-property/areas/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    } as const))
  ];

  const PROPERTY_TYPES = ['apartments', 'villas', 'townhouses', 'penthouses', 'off-plan-properties'];
  
  DUBAI_AREAS.forEach(areaSlug => {
    PROPERTY_TYPES.forEach(pt => {
      dubaiRoutes.push({
        url: `${BASE_URL}/dubai-property/buy/${pt}-for-sale-in-${areaSlug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });
  });

  const landConverterRoutes: MetadataRoute.Sitemap = TOP_CONVERSION_PAIRS.map(pair => ({
    url: `${BASE_URL}/land-converter/${pair.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    ...staticRoutes,
    ...cityRoutes,
    ...realEstateRoutes,
    ...blogRoutes,
    ...dubaiRoutes,
    ...landConverterRoutes
  ];
}
