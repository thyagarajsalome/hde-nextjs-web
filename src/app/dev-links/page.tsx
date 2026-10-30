import React from 'react';
import DevLinksClient from '@/components/dev/DevLinksClient';
import { supabase } from '@/config/supabaseClient';
import { DUBAI_AREAS } from '@/data/dubaiAreas';
import { CITIES_DATA } from '@/components/layout/CityContent';
import { getAllPosts } from '@/lib/mdx';
import { USA_CITIES_FALLBACK } from '@/data/usaCities';

export const metadata = {
  title: 'Dev Dashboard - SEO Links Matrix',
  robots: {
    index: false,
    follow: false,
  },
};

export const revalidate = 0; // Always fresh on reload

export default async function DevLinksPage() {
  // Fetch locations from Supabase
  const { data: dbLocations } = await supabase
    .from('pseo_locations')
    .select('country, state_name, city_name, slug')
    .order('country', { ascending: false })
    .order('state_name', { ascending: true })
    .order('city_name', { ascending: true });

  const locations = dbLocations || [];

  // USA Cities
  let usCities = locations.filter((loc: any) => loc.country === 'USA');
  const existingUSSlugs = new Set(usCities.map((l: any) => l.slug));
  const toAddUS = USA_CITIES_FALLBACK.filter((c: any) => !existingUSSlugs.has(c.slug));
  usCities = [...usCities, ...toAddUS];

  // India Cities (with CITIES_DATA fallback)
  let inCities = locations.filter((loc: any) => loc.country === 'INDIA');
  if (inCities.length === 0) {
    inCities = Object.values(CITIES_DATA).map(c => ({
      slug: c.slug,
      city_name: c.cityName,
      state_name: c.stateName,
      country: 'INDIA'
    }));
  }

  // Blog Posts
  const rawPosts = getAllPosts();
  const blogPosts = rawPosts.map(p => ({
    slug: p.slug,
    title: p.meta?.title || p.slug
  }));

  return (
    <div className="min-h-screen bg-slate-100/70 p-4 md:p-8">
      <DevLinksClient
        usCities={usCities}
        inCities={inCities}
        dubaiAreas={DUBAI_AREAS}
        blogPosts={blogPosts}
      />
    </div>
  );
}
