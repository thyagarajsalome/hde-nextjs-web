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

  const usCities = locations.filter(loc => loc.country === 'USA');
  const inCities = locations.filter(loc => loc.country === 'INDIA');

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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* USA SECTION */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              ???? USA Pages ({usCities.length})
            </h2>
            <ul className="space-y-2">
              {usCities.map((loc) => (
                <li key={loc.slug} className="flex flex-col border-l-2 border-gray-200 pl-3 hover:border-primary transition-colors">
                  <Link 
                    href={/cost/construction-in- + loc.slug} 
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

          {/* INDIA SECTION */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              ???? India Pages ({inCities.length})
            </h2>
            <ul className="space-y-2">
              {inCities.map((loc) => (
                <li key={loc.slug} className="flex flex-col border-l-2 border-gray-200 pl-3 hover:border-primary transition-colors">
                  <Link 
                    href={/cost/construction-in- + loc.slug} 
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
