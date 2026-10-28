import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { CITIES_DATA } from '@/components/layout/CityContent';
import { getAllPosts } from '@/lib/mdx';
import { supabase } from '@/config/supabaseClient';
import { TOP_CONVERSION_PAIRS } from '@/data/landUnits';
import { HOUSE_PLAN_SEO_DATA } from '@/data/housePlanSeoData';
import { PARTNER_SEO_SLUGS } from '@/data/dubaiPartnerSeoData';
import { BANGALORE_LOCALITIES } from '@/data/bangaloreLocalities';
import { TARGET_CATEGORY_TEMPLATES } from '@/data/bangaloreMarketData';

const USA_CITIES_FALLBACK = [
  'dallas-texas', 'miami-florida', 'atlanta-georgia', 'seattle-washington',
  'phoenix-arizona', 'chicago-illinois', 'denver-colorado', 'charlotte-north-carolina',
  'orlando-florida', 'nashville-tennessee', 'las-vegas-nevada', 'tampa-florida',
  'raleigh-north-carolina', 'salt-lake-city-utah', 'san-diego-california'
];

const INDIA_CITIES_FALLBACK = [
  'mumbai', 'bengaluru', 'delhi-ncr', 'chennai', 'hyderabad', 'pune',
  'ahmedabad', 'kolkata', 'jaipur', 'lucknow', 'surat', 'nagpur'
];

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headerList = await headers();
  const host = headerList.get('host')?.toLowerCase() || 'www.homedesignenglish.com';

  const isUS = host.startsWith('us.') || host.includes('us.localhost');
  const isDubai = host.startsWith('dubai.') || host.includes('dubai.localhost');

  const protocol = host.includes('localhost') ? 'http' : 'https';
  const BASE_URL = isUS 
    ? `${protocol}://us.homedesignenglish.com` 
    : isDubai 
    ? `${protocol}://dubai.homedesignenglish.com` 
    : `${protocol}://www.homedesignenglish.com`;

  // 1. Fetch locations from Supabase
  const { data: locations } = await supabase.from('pseo_locations').select('slug, country');

  // ==========================================
  // CASE 1: US SUBDOMAIN (us.homedesignenglish.com)
  // ==========================================
  if (isUS) {
    const usaLocations = (locations || []).filter((loc: any) => loc.country === 'USA');
    const existingUsaSlugs = new Set(usaLocations.map((l: any) => l.slug));
    USA_CITIES_FALLBACK.forEach((slug) => {
      if (!existingUsaSlugs.has(slug)) {
        usaLocations.push({ slug, country: 'USA' });
      }
    });

    const realEstateRoutes: MetadataRoute.Sitemap = [];
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
        url: `${BASE_URL}/real-estate/kitchen-remodel-in-${loc.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
      realEstateRoutes.push({
        url: `${BASE_URL}/real-estate/bathroom-remodel-in-${loc.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
      realEstateRoutes.push({
        url: `${BASE_URL}/real-estate/home-addition-in-${loc.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
      realEstateRoutes.push({
        url: `${BASE_URL}/real-estate/swimming-pool-cost-in-${loc.slug}`,
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
      realEstateRoutes.push({
        url: `${BASE_URL}/real-estate/barndominium-cost-in-${loc.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });

    const blogPosts = getAllPosts();
    const usBlogRoutes: MetadataRoute.Sitemap = blogPosts
      .filter(p => p.meta.region?.toUpperCase() === 'US' || p.meta.region?.toUpperCase() === 'GLOBAL')
      .map(p => ({
        url: `${BASE_URL}/blog/${p.slug}`,
        lastModified: p.meta.date && !isNaN(Date.parse(p.meta.date)) ? new Date(p.meta.date) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));

    return [
      {
        url: `${BASE_URL}/`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${BASE_URL}/real-estate`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.98,
      },
      {
        url: `${BASE_URL}/real-estate/texas`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.95,
      },
      {
        url: `${BASE_URL}/real-estate/florida`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.95,
      },
      {
        url: `${BASE_URL}/real-estate/california`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.95,
      },
      {
        url: `${BASE_URL}/download`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${BASE_URL}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.85,
      },
      ...realEstateRoutes,
      ...usBlogRoutes,
    ];
  }

  // ==========================================
  // CASE 2: DUBAI SUBDOMAIN (dubai.homedesignenglish.com)
  // ==========================================
  if (isDubai) {
    const DUBAI_AREAS = [
      'dubai-marina', 'downtown-dubai', 'business-bay', 'jvc',
      'dubai-hills', 'palm-jumeirah', 'jlt', 'dubai-creek-harbour',
      'mbr-city', 'arabian-ranches', 'dubai-south', 'jbr',
      'dubai-silicon-oasis', 'al-barsha', 'dubai-sports-city'
    ];

    const PROPERTY_TYPES = ['apartments', 'villas', 'townhouses', 'penthouses', 'off-plan-properties'];
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
      {
        url: `${BASE_URL}/dubai-property/partners`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      ...DUBAI_AREAS.map(slug => ({
        url: `${BASE_URL}/dubai-property/areas/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      } as const))
    ];

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

    const dubaiPartnerRoutes: MetadataRoute.Sitemap = PARTNER_SEO_SLUGS.map(slug => ({
      url: `${BASE_URL}/dubai-property/partners/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    const blogPosts = getAllPosts();
    const dubaiBlogRoutes: MetadataRoute.Sitemap = blogPosts
      .filter(p => p.meta.region?.toUpperCase() === 'UAE' || p.meta.region?.toUpperCase() === 'GLOBAL')
      .map(p => ({
        url: `${BASE_URL}/blog/${p.slug}`,
        lastModified: p.meta.date && !isNaN(Date.parse(p.meta.date)) ? new Date(p.meta.date) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));

    return [
      {
        url: `${BASE_URL}/`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      ...dubaiRoutes,
      ...dubaiPartnerRoutes,
      ...dubaiBlogRoutes,
    ];
  }

  // ==========================================
  // CASE 3: MAIN INDIA DOMAIN (www.homedesignenglish.com)
  // Strictly India & global features only.
  // NO US Real Estate or Dubai pages.
  // ==========================================
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/plans`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/gallery/kitchen-designs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/gallery/bathroom-designs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/app`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/download`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
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
    },
    {
      url: `${BASE_URL}/home-planning`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/register-pro`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/upgrade`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/bangalore/properties`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/bangalore/post-property`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/bangalore/referrals`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/bangalore/post-referral`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    }
  ];

  // Indian cities for /cost/ programmatic pages
  const indiaLocations = (locations || []).filter((loc: any) => loc.country?.toUpperCase() === 'INDIA');
  const existingIndiaSlugs = new Set(indiaLocations.map((l: any) => l.slug));
  INDIA_CITIES_FALLBACK.forEach(slug => {
    if (!existingIndiaSlugs.has(slug)) {
      indiaLocations.push({ slug, country: 'INDIA' });
    }
  });

  const cityRoutes: MetadataRoute.Sitemap = indiaLocations.flatMap((loc: any) => [
    {
      url: `${BASE_URL}/cost/construction-in-${loc.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/cost/interior-design-in-${loc.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
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
    },
    {
      url: `${BASE_URL}/cost/home-loan-emi-in-${loc.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/cost/building-material-cost-in-${loc.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }
  ]);

  // Dynamic Blog Routes (India / Global)
  const blogPosts = getAllPosts();
  const PILLAR_GUIDES = [
    'modular-kitchen-designs-cost-layouts-india',
    'modern-bathroom-designs-india-cost-guide',
    'house-construction-cost-in-india-2026',
    'home-loan-emi-calculator-guide-sbi-hdfc',
    'winter-home-decor-ideas-cozy-styling-guide',
    'winter-home-improvement-projects-cost-checklist'
  ];

  const blogRoutes: MetadataRoute.Sitemap = blogPosts
    .filter(p => p.meta.region?.toUpperCase() === 'INDIA' || p.meta.region?.toUpperCase() === 'GLOBAL' || !p.meta.region)
    .map((post) => {
      const isValidDate = post.meta.date && !isNaN(Date.parse(post.meta.date));
      const isPillar = PILLAR_GUIDES.includes(post.slug);
      return {
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: isValidDate ? new Date(post.meta.date) : new Date(),
        changeFrequency: isPillar ? 'weekly' as const : 'monthly' as const,
        priority: isPillar ? 0.9 : 0.8,
      };
    });

  const landConverterRoutes: MetadataRoute.Sitemap = TOP_CONVERSION_PAIRS.map(pair => ({
    url: `${BASE_URL}/land-converter/${pair.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  const housePlanRoutes: MetadataRoute.Sitemap = Object.keys(HOUSE_PLAN_SEO_DATA).map((slug) => ({
    url: `${BASE_URL}/plans/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // Bangalore Real Estate Programmatic Routes (24 localities x 6 templates)
  const bangaloreRoutes: MetadataRoute.Sitemap = [];
  BANGALORE_LOCALITIES.forEach((loc) => {
    TARGET_CATEGORY_TEMPLATES.forEach((tmpl) => {
      bangaloreRoutes.push({
        url: `${BASE_URL}/bangalore/${tmpl.prefix}${loc.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.85,
      });
    });
  });

  return [
    ...staticRoutes,
    ...cityRoutes,
    ...blogRoutes,
    ...landConverterRoutes,
    ...housePlanRoutes,
    ...bangaloreRoutes,
  ];
}
