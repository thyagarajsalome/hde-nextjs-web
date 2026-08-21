import React from 'react';
import Link from 'next/link';
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
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        <div className="border-b border-gray-100 pb-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <i className="fas fa-hammer text-primary"></i> 
            Developer Dashboard: SEO Links
          </h1>
          <p className="text-gray-500 mt-2">
            This is a hidden page (<code className="bg-gray-100 px-2 py-0.5 rounded text-sm">/dev-links</code>) with a robots.txt rule to prevent Google from indexing it. 
            Use this to quickly verify all {locations.length} dynamically generated pages.
          </p>
          <div className="mt-4 flex gap-4">
            <Link href="/upgrade" target="_blank" className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-bold hover:opacity-90">
              <i className="fas fa-credit-card"></i> View Upgrade Page (Region Aware)
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* USA SECTION */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i className="fas fa-globe-americas text-blue-600"></i> USA Generated URLs ({usCities.length * 5})
            </h2>
            <p className="text-xs text-gray-500 mb-4">Showing 5 unique SEO routes per city ({usCities.length} cities total)</p>
            <ul className="space-y-4">
              {usCities.map((loc) => (
                <li key={loc.slug} className="flex flex-col border-l-2 border-gray-200 pl-3 hover:border-primary transition-colors">
                  <span className="text-xs font-bold text-gray-500 mb-1">{loc.city_name}, {loc.state_name}</span>
                  <Link 
                    href={'/cost/construction-in-' + loc.slug} 
                    target="_blank"
                    className="text-primary hover:underline font-medium text-sm"
                  >
                    /cost/construction-in-{loc.slug}
                  </Link>
                  <Link 
                    href={'/real-estate/rent-vs-buy-in-' + loc.slug} 
                    target="_blank"
                    className="text-primary hover:underline font-medium text-sm"
                  >
                    /real-estate/rent-vs-buy-in-{loc.slug}
                  </Link>
                  <Link 
                    href={'/real-estate/property-tax-in-' + loc.slug} 
                    target="_blank"
                    className="text-primary hover:underline font-medium text-sm"
                  >
                    /real-estate/property-tax-in-{loc.slug}
                  </Link>
                  <Link 
                    href={'/real-estate/salary-needed-to-buy-in-' + loc.slug} 
                    target="_blank"
                    className="text-primary hover:underline font-medium text-sm"
                  >
                    /real-estate/salary-needed-to-buy-in-{loc.slug}
                  </Link>
                  <Link 
                    href={'/real-estate/remodel-roi-in-' + loc.slug} 
                    target="_blank"
                    className="text-primary hover:underline font-medium text-sm"
                  >
                    /real-estate/remodel-roi-in-{loc.slug}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* INDIA SECTION */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i className="fas fa-map-marker-alt text-orange-500"></i> India Generated URLs ({inCities.length})
            </h2>
            <ul className="space-y-2">
              {inCities.map((loc) => (
                <li key={loc.slug} className="flex flex-col border-l-2 border-gray-200 pl-3 hover:border-primary transition-colors">
                  <Link 
                    href={'/cost/construction-in-' + loc.slug} 
                    target="_blank"
                    className="text-primary hover:underline font-medium text-sm"
                  >
                    /cost/construction-in-{loc.slug}
                  </Link>
                  <span className="text-xs text-gray-400">{loc.city_name}, {loc.state_name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
