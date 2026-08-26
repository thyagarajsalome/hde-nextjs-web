'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface DevLinksClientProps {
  usCities: any[];
  inCities: any[];
}

export default function DevLinksClient({ usCities, inCities }: DevLinksClientProps) {
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<Record<string, number>>({});
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const runHealthCheck = async () => {
    if (checking) return;
    setChecking(true);
    setResults({});
    
    // Build array of all URLs to check
    const urls: string[] = [];
    usCities.forEach(loc => {
      urls.push(`/cost/construction-in-${loc.slug}`);
      urls.push(`/real-estate/rent-vs-buy-in-${loc.slug}`);
      urls.push(`/real-estate/property-tax-in-${loc.slug}`);
      urls.push(`/real-estate/salary-needed-to-buy-in-${loc.slug}`);
      urls.push(`/real-estate/remodel-roi-in-${loc.slug}`);
      urls.push(`/real-estate/kitchen-remodel-in-${loc.slug}`);
      urls.push(`/real-estate/home-addition-in-${loc.slug}`);
      urls.push(`/real-estate/swimming-pool-cost-in-${loc.slug}`);
      urls.push(`/real-estate/pickleball-court-cost-in-${loc.slug}`);
      urls.push(`/real-estate/outdoor-kitchen-cost-in-${loc.slug}`);
    });
    
    inCities.forEach(loc => {
      urls.push(`/cost/construction-in-${loc.slug}`);
    });

    setProgress({ current: 0, total: urls.length });

    // Process in small batches to not overload browser
    const BATCH_SIZE = 5;
    const newResults: Record<string, number> = {};

    for (let i = 0; i < urls.length; i += BATCH_SIZE) {
      const batch = urls.slice(i, i + BATCH_SIZE);
      
      await Promise.all(batch.map(async (url) => {
        try {
          const res = await fetch(url, { method: 'HEAD' });
          newResults[url] = res.status;
        } catch (e) {
          newResults[url] = 500;
        }
      }));

      setResults({ ...newResults });
      setProgress({ current: Math.min(i + BATCH_SIZE, urls.length), total: urls.length });
    }

    setChecking(false);
  };

  const renderBadge = (url: string) => {
    const status = results[url];
    if (!status) return null;
    
    if (status === 200) {
      return <span className="ml-2 text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1"><i className="fas fa-check"></i> 200 OK</span>;
    }
    
    return <span className="ml-2 text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1"><i className="fas fa-times"></i> {status} ERROR</span>;
  };

  const passedCount = Object.values(results).filter(s => s === 200).length;
  const failedCount = Object.values(results).filter(s => s && s !== 200).length;
  const isComplete = progress.total > 0 && progress.current === progress.total;

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
      <div className="border-b border-gray-100 pb-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <i className="fas fa-hammer text-primary"></i> 
          Developer Dashboard: SEO Links
        </h1>
        <p className="text-gray-500 mt-2">
          This is a hidden page (<code className="bg-gray-100 px-2 py-0.5 rounded text-sm">/dev-links</code>) with a robots.txt rule to prevent Google from indexing it. 
          Use this to quickly verify all dynamically generated pages.
        </p>

        <div className="mt-6 p-5 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Automated SEO Link Checker</h3>
              <p className="text-sm text-gray-500">Ping all generated URLs to ensure they return 200 OK.</p>
            </div>
            <button 
              onClick={runHealthCheck}
              disabled={checking}
              className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold hover:bg-primary-600 transition disabled:opacity-50 flex items-center gap-2"
            >
              {checking ? (
                <><i className="fas fa-circle-notch fa-spin"></i> Checking {progress.current}/{progress.total}...</>
              ) : (
                <><i className="fas fa-stethoscope"></i> Run Health Check</>
              )}
            </button>
          </div>

          {progress.total > 0 && (
            <div className="mt-4 flex gap-4 text-sm font-medium">
              <span className="text-blue-600">{progress.current} / {progress.total} Scanned</span>
              {isComplete && <span className="text-green-600">{passedCount} Passed</span>}
              {isComplete && failedCount > 0 && <span className="text-red-600">{failedCount} Failed</span>}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* USA SECTION */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <i className="fas fa-globe-americas text-blue-600"></i> USA Generated URLs ({usCities.length * 10})
          </h2>
          <p className="text-xs text-gray-500 mb-4">Showing 10 unique SEO routes per city ({usCities.length} cities total)</p>
          <ul className="space-y-4">
            {usCities.map((loc) => (
              <li key={loc.slug} className="flex flex-col border-l-2 border-gray-200 pl-3 hover:border-primary transition-colors">
                <span className="text-xs font-bold text-gray-500 mb-1">{loc.city_name}, {loc.state_name}</span>
                
                <div className="flex items-center py-1">
                  <Link href={'/cost/construction-in-' + loc.slug} target="_blank" className="text-primary hover:underline font-medium text-sm">
                    /cost/construction-in-{loc.slug}
                  </Link>
                  {renderBadge('/cost/construction-in-' + loc.slug)}
                </div>

                <div className="flex items-center py-1">
                  <Link href={'/real-estate/rent-vs-buy-in-' + loc.slug} target="_blank" className="text-primary hover:underline font-medium text-sm">
                    /real-estate/rent-vs-buy-in-{loc.slug}
                  </Link>
                  {renderBadge('/real-estate/rent-vs-buy-in-' + loc.slug)}
                </div>

                <div className="flex items-center py-1">
                  <Link href={'/real-estate/property-tax-in-' + loc.slug} target="_blank" className="text-primary hover:underline font-medium text-sm">
                    /real-estate/property-tax-in-{loc.slug}
                  </Link>
                  {renderBadge('/real-estate/property-tax-in-' + loc.slug)}
                </div>

                <div className="flex items-center py-1">
                  <Link href={'/real-estate/salary-needed-to-buy-in-' + loc.slug} target="_blank" className="text-primary hover:underline font-medium text-sm">
                    /real-estate/salary-needed-to-buy-in-{loc.slug}
                  </Link>
                  {renderBadge('/real-estate/salary-needed-to-buy-in-' + loc.slug)}
                </div>

                <div className="flex items-center py-1">
                  <Link href={'/real-estate/remodel-roi-in-' + loc.slug} target="_blank" className="text-primary hover:underline font-medium text-sm">
                    /real-estate/remodel-roi-in-{loc.slug}
                  </Link>
                  {renderBadge('/real-estate/remodel-roi-in-' + loc.slug)}
                </div>

                <div className="flex items-center py-1">
                  <Link href={'/real-estate/kitchen-remodel-in-' + loc.slug} target="_blank" className="text-primary hover:underline font-medium text-sm">
                    /real-estate/kitchen-remodel-in-{loc.slug}
                  </Link>
                  {renderBadge('/real-estate/kitchen-remodel-in-' + loc.slug)}
                </div>

                <div className="flex items-center py-1">
                  <Link href={'/real-estate/home-addition-in-' + loc.slug} target="_blank" className="text-primary hover:underline font-medium text-sm">
                    /real-estate/home-addition-in-{loc.slug}
                  </Link>
                  {renderBadge('/real-estate/home-addition-in-' + loc.slug)}
                </div>

                <div className="flex items-center py-1">
                  <Link href={'/real-estate/swimming-pool-cost-in-' + loc.slug} target="_blank" className="text-primary hover:underline font-medium text-sm">
                    /real-estate/swimming-pool-cost-in-{loc.slug}
                  </Link>
                  {renderBadge('/real-estate/swimming-pool-cost-in-' + loc.slug)}
                </div>

                <div className="flex items-center py-1">
                  <Link href={'/real-estate/pickleball-court-cost-in-' + loc.slug} target="_blank" className="text-primary hover:underline font-medium text-sm">
                    /real-estate/pickleball-court-cost-in-{loc.slug}
                  </Link>
                  {renderBadge('/real-estate/pickleball-court-cost-in-' + loc.slug)}
                </div>

                <div className="flex items-center py-1">
                  <Link href={'/real-estate/outdoor-kitchen-cost-in-' + loc.slug} target="_blank" className="text-primary hover:underline font-medium text-sm">
                    /real-estate/outdoor-kitchen-cost-in-{loc.slug}
                  </Link>
                  {renderBadge('/real-estate/outdoor-kitchen-cost-in-' + loc.slug)}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* INDIA SECTION */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <i className="fas fa-map-marker-alt text-orange-500"></i> India Generated URLs ({inCities.length})
          </h2>
          <ul className="space-y-4">
            {inCities.map((loc) => (
              <li key={loc.slug} className="flex flex-col border-l-2 border-gray-200 pl-3 hover:border-primary transition-colors">
                <span className="text-xs font-bold text-gray-500 mb-1">{loc.city_name}, {loc.state_name}</span>
                
                <div className="flex items-center py-1">
                  <Link href={'/cost/construction-in-' + loc.slug} target="_blank" className="text-primary hover:underline font-medium text-sm">
                    /cost/construction-in-{loc.slug}
                  </Link>
                  {renderBadge('/cost/construction-in-' + loc.slug)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
