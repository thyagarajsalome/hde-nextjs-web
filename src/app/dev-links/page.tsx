import React from 'react';
import DevLinksClient from '@/components/dev/DevLinksClient';
import { supabase } from '@/config/supabaseClient';

export const metadata = {
  title: 'Dev Dashboard - SEO Links',
  robots: {
    index: false,
    follow: false,
  },
};

const USA_CITIES_FALLBACK = [
  { slug: 'dallas-texas', city_name: 'Dallas', state_name: 'Texas', country: 'USA' },
  { slug: 'miami-florida', city_name: 'Miami', state_name: 'Florida', country: 'USA' },
  { slug: 'atlanta-georgia', city_name: 'Atlanta', state_name: 'Georgia', country: 'USA' },
  { slug: 'seattle-washington', city_name: 'Seattle', state_name: 'Washington', country: 'USA' },
  { slug: 'phoenix-arizona', city_name: 'Phoenix', state_name: 'Arizona', country: 'USA' },
  { slug: 'chicago-illinois', city_name: 'Chicago', state_name: 'Illinois', country: 'USA' },
  { slug: 'denver-colorado', city_name: 'Denver', state_name: 'Colorado', country: 'USA' },
  { slug: 'charlotte-north-carolina', city_name: 'Charlotte', state_name: 'North Carolina', country: 'USA' },
  { slug: 'orlando-florida', city_name: 'Orlando', state_name: 'Florida', country: 'USA' },
  { slug: 'nashville-tennessee', city_name: 'Nashville', state_name: 'Tennessee', country: 'USA' },
  { slug: 'las-vegas-nevada', city_name: 'Las Vegas', state_name: 'Nevada', country: 'USA' },
  { slug: 'tampa-florida', city_name: 'Tampa', state_name: 'Florida', country: 'USA' },
  { slug: 'raleigh-north-carolina', city_name: 'Raleigh', state_name: 'North Carolina', country: 'USA' },
  { slug: 'salt-lake-city-utah', city_name: 'Salt Lake City', state_name: 'Utah', country: 'USA' },
  { slug: 'san-diego-california', city_name: 'San Diego', state_name: 'California', country: 'USA' }
];

export const revalidate = 0; // Always fetch fresh data on reload

export default async function DevLinksPage() {
  const { data: locations, error } = await supabase
    .from('pseo_locations')
    .select('country, state_name, city_name, slug')
    .order('country', { ascending: false })
    .order('state_name', { ascending: true })
    .order('city_name', { ascending: true });

  if (error || !locations) {
    return <div className="p-10 text-red-500">Error fetching locations from Supabase.</div>;
  }

  let usCities = locations.filter((loc: any) => loc.country === 'USA');
  const inCities = locations.filter((loc: any) => loc.country === 'INDIA');

  const existingSlugs = new Set(usCities.map((l: any) => l.slug));
  const toAdd = USA_CITIES_FALLBACK.filter((c: any) => !existingSlugs.has(c.slug));
  usCities = [...usCities, ...toAdd];


  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <DevLinksClient usCities={usCities} inCities={inCities} />
    </div>
  );
}
