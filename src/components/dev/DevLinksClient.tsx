'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { TOP_CONVERSION_PAIRS } from '@/data/landUnits';

interface CityItem {
  slug: string;
  city_name: string;
  state_name?: string;
  country?: string;
}

interface DubaiAreaItem {
  slug: string;
  name: string;
}

interface BlogPostItem {
  slug: string;
  title?: string;
}

interface DevLinksClientProps {
  usCities: CityItem[];
  inCities: CityItem[];
  dubaiAreas: DubaiAreaItem[];
  blogPosts?: BlogPostItem[];
}

type TabType = 'all' | 'usa' | 'india' | 'uae' | 'blogs' | 'hubs';
type StatusFilter = 'all' | 'passed' | 'failed' | 'unchecked';

export default function DevLinksClient({ usCities, inCities, dubaiAreas, blogPosts = [] }: DevLinksClientProps) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<Record<string, number>>({});
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [copied, setCopied] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Compile all structured links
  const allUrls = useMemo(() => {
    const list: { url: string; label: string; region: 'usa' | 'india' | 'uae' | 'blogs' | 'hubs'; group: string }[] = [];

    // Core & State Hubs
    list.push({ url: '/real-estate/texas', label: 'Texas Real Estate Hub', region: 'hubs', group: 'State Hubs' });
    list.push({ url: '/real-estate/florida', label: 'Florida Real Estate Hub', region: 'hubs', group: 'State Hubs' });
    list.push({ url: '/real-estate/california', label: 'California Real Estate Hub', region: 'hubs', group: 'State Hubs' });
    list.push({ url: '/dubai-property', label: 'Dubai Property Hub', region: 'hubs', group: 'State Hubs' });
    list.push({ url: '/dubai-property/calculator', label: 'Dubai Buying Cost Calculator', region: 'hubs', group: 'State Hubs' });

    // USA City Tools
    usCities.forEach(loc => {
      const g = `${loc.city_name}, ${loc.state_name || 'USA'}`;
      list.push({ url: `/cost/construction-in-${loc.slug}`, label: 'Construction Cost', region: 'usa', group: g });
      list.push({ url: `/real-estate/rent-vs-buy-in-${loc.slug}`, label: 'Rent vs Buy', region: 'usa', group: g });
      list.push({ url: `/real-estate/property-tax-in-${loc.slug}`, label: 'Property Tax', region: 'usa', group: g });
      list.push({ url: `/real-estate/salary-needed-to-buy-in-${loc.slug}`, label: 'Salary Needed', region: 'usa', group: g });
      list.push({ url: `/real-estate/remodel-roi-in-${loc.slug}`, label: 'Remodel ROI', region: 'usa', group: g });
      list.push({ url: `/real-estate/kitchen-remodel-in-${loc.slug}`, label: 'Kitchen Remodel', region: 'usa', group: g });
      list.push({ url: `/real-estate/home-addition-in-${loc.slug}`, label: 'Home Addition', region: 'usa', group: g });
      list.push({ url: `/real-estate/swimming-pool-cost-in-${loc.slug}`, label: 'Swimming Pool', region: 'usa', group: g });
      list.push({ url: `/real-estate/pickleball-court-cost-in-${loc.slug}`, label: 'Pickleball Court', region: 'usa', group: g });
      list.push({ url: `/real-estate/outdoor-kitchen-cost-in-${loc.slug}`, label: 'Outdoor Kitchen', region: 'usa', group: g });
    });

    // India City Tools
    inCities.forEach(loc => {
      const g = `${loc.city_name}, ${loc.state_name || 'India'}`;
      list.push({ url: `/cost/construction-in-${loc.slug}`, label: 'Building Cost', region: 'india', group: g });
      list.push({ url: `/cost/interior-design-in-${loc.slug}`, label: 'Interior Design', region: 'india', group: g });
      list.push({ url: `/cost/flooring-in-${loc.slug}`, label: 'Flooring Cost', region: 'india', group: g });
      list.push({ url: `/cost/painting-in-${loc.slug}`, label: 'Painting Cost', region: 'india', group: g });
    });

    // Indian Land Measurement Converters
    list.push({ url: '/land-converter', label: 'Main Land Measurement Converter', region: 'india', group: '📐 Indian Land Measurement Tools' });
    TOP_CONVERSION_PAIRS.forEach(pair => {
      list.push({ url: `/land-converter/${pair.slug}`, label: pair.title.replace(' Converter', ''), region: 'india', group: '📐 Indian Land Measurement Tools' });
    });

    // UAE Area Pages & Property Types
    const propertyTypes = ['apartments', 'villas', 'townhouses', 'penthouses', 'off-plan-properties'];
    dubaiAreas.forEach(area => {
      const g = `${area.name} (Dubai)`;
      list.push({ url: `/dubai-property/areas/${area.slug}`, label: 'Main Area Guide', region: 'uae', group: g });
      propertyTypes.forEach(pt => {
        list.push({ url: `/dubai-property/buy/${pt}-for-sale-in-${area.slug}`, label: `${pt.replace('-', ' ')}`, region: 'uae', group: g });
      });
    });

    // Blog Articles
    blogPosts.forEach(post => {
      list.push({ url: `/blog/${post.slug}`, label: post.title || post.slug, region: 'blogs', group: 'Editorial Pillar Posts' });
    });

    return list;
  }, [usCities, inCities, dubaiAreas, blogPosts]);

  // Filtered URLs based on tab, search query, and health check status
  const filteredUrls = useMemo(() => {
    return allUrls.filter(item => {
      // Tab filter
      if (activeTab !== 'all' && item.region !== activeTab) return false;

      // Status filter
      if (statusFilter !== 'all') {
        const status = results[item.url];
        if (statusFilter === 'passed' && status !== 200) return false;
        if (statusFilter === 'failed' && (!status || status === 200)) return false;
        if (statusFilter === 'unchecked' && status) return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        return item.url.toLowerCase().includes(q) ||
               item.label.toLowerCase().includes(q) ||
               item.group.toLowerCase().includes(q);
      }

      return true;
    });
  }, [allUrls, activeTab, statusFilter, search, results]);

  // Group filtered URLs by their group (City or Category)
  const groupedUrls = useMemo(() => {
    const groups: Record<string, typeof filteredUrls> = {};
    filteredUrls.forEach(item => {
      if (!groups[item.group]) groups[item.group] = [];
      groups[item.group].push(item);
    });
    return groups;
  }, [filteredUrls]);

  // Health Check runner
  const runHealthCheck = async () => {
    if (checking) return;
    setChecking(true);

    const urlsToCheck = filteredUrls.map(i => i.url);
    setProgress({ current: 0, total: urlsToCheck.length });

    const BATCH_SIZE = 8;
    const newResults = { ...results };

    for (let i = 0; i < urlsToCheck.length; i += BATCH_SIZE) {
      const batch = urlsToCheck.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async (url) => {
          try {
            const res = await fetch(url, { method: 'HEAD' });
            newResults[url] = res.status;
          } catch {
            newResults[url] = 500;
          }
        })
      );
      setResults({ ...newResults });
      setProgress({ current: Math.min(i + BATCH_SIZE, urlsToCheck.length), total: urlsToCheck.length });
    }

    setChecking(false);
  };

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: prev[groupName] === undefined ? true : !prev[groupName]
    }));
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    Object.keys(groupedUrls).forEach(g => { next[g] = true; });
    setExpandedGroups(next);
  };

  const collapseAll = () => {
    const next: Record<string, boolean> = {};
    Object.keys(groupedUrls).forEach(g => { next[g] = false; });
    setExpandedGroups(next);
  };

  const copyUrlsToClipboard = () => {
    const text = filteredUrls.map(i => `https://www.homedesignenglish.com${i.url}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const passedCount = Object.values(results).filter(s => s === 200).length;
  const failedCount = Object.values(results).filter(s => s && s !== 200).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
                <i className="fas fa-sitemap"></i>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Developer SEO URL Matrix
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Internal validation engine for all dynamically generated routes & programmatic SEO silos.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={copyUrlsToClipboard}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold shadow-sm transition flex items-center gap-2 cursor-pointer"
              title="Copy all matching URLs to clipboard for Google Search Console"
            >
              <i className={`fas ${copied ? 'fa-check text-green-500' : 'fa-copy text-primary'}`}></i>
              <span>{copied ? 'Copied to Clipboard!' : `Copy URLs (${filteredUrls.length})`}</span>
            </button>

            <button
              onClick={runHealthCheck}
              disabled={checking}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {checking ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Checking {progress.current}/{progress.total}...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-stethoscope"></i>
                  <span>Run Health Check</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-6">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total URLs</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{allUrls.length}</div>
          </div>
          <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-500">🇺🇸 USA Pages</div>
            <div className="text-2xl font-black text-blue-900 mt-0.5">{usCities.length * 10}</div>
          </div>
          <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600">🇮🇳 India Pages</div>
            <div className="text-2xl font-black text-amber-900 mt-0.5">{inCities.length * 4}</div>
          </div>
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">🇦🇪 Dubai UAE</div>
            <div className="text-2xl font-black text-emerald-900 mt-0.5">{dubaiAreas.length * 6 + 2}</div>
          </div>
          <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-3.5 col-span-2 sm:col-span-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-purple-600">Blogs & Hubs</div>
            <div className="text-2xl font-black text-purple-900 mt-0.5">{blogPosts.length + 5}</div>
          </div>
        </div>

        {/* Progress bar if scanning */}
        {checking && (
          <div className="mt-4">
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-2 transition-all duration-300"
                style={{ width: `${(progress.current / Math.max(progress.total, 1)) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-gray-500 mt-1 font-medium">
              <span>Testing active routes ({progress.current} of {progress.total})</span>
              <span>{Math.round((progress.current / Math.max(progress.total, 1)) * 100)}%</span>
            </div>
          </div>
        )}

        {/* Health Check Results Summary */}
        {Object.keys(results).length > 0 && !checking && (
          <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-4">
              <span className="text-emerald-700 flex items-center gap-1.5">
                <i className="fas fa-check-circle"></i> {passedCount} Healthy (200 OK)
              </span>
              {failedCount > 0 && (
                <span className="text-rose-700 flex items-center gap-1.5">
                  <i className="fas fa-times-circle"></i> {failedCount} Failed
                </span>
              )}
            </div>
            <button
              onClick={() => setResults({})}
              className="text-gray-400 hover:text-gray-600 text-[11px] font-bold uppercase"
            >
              Clear Results
            </button>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Region Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'all', label: 'All Links', count: allUrls.length },
                { id: 'usa', label: '🇺🇸 USA', count: usCities.length * 10 },
                { id: 'india', label: '🇮🇳 India', count: inCities.length * 4 },
                { id: 'uae', label: '🇦🇪 UAE', count: dubaiAreas.length * 6 + 2 },
                { id: 'hubs', label: 'State Hubs', count: 5 },
                { id: 'blogs', label: 'Blogs', count: blogPosts.length },
              ] as const
            ).map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-secondary text-white shadow-sm'
                      : 'bg-gray-100/70 text-gray-600 hover:bg-gray-200/70'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-white text-gray-500'}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Accordion Actions */}
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <button onClick={expandAll} className="hover:text-primary transition cursor-pointer">
              <i className="fas fa-expand-arrows-alt mr-1"></i> Expand All
            </button>
            <span>•</span>
            <button onClick={collapseAll} className="hover:text-primary transition cursor-pointer">
              <i className="fas fa-compress-arrows-alt mr-1"></i> Collapse All
            </button>
          </div>
        </div>

        {/* Live Search Input & Status Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-gray-100">
          <div className="relative flex-1 w-full">
            <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search across 1,000+ URLs, cities (e.g. Austin, Mumbai, Marina, pool, emi)..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>

          {Object.keys(results).length > 0 && (
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="text-xs font-bold border border-gray-200 rounded-xl px-2.5 py-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Statuses</option>
                <option value="passed">✅ 200 OK Only</option>
                <option value="failed">❌ Failed Only</option>
                <option value="unchecked">⏳ Unchecked Only</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Showing Count */}
      <div className="flex items-center justify-between text-xs text-gray-500 font-medium px-2">
        <span>
          Showing <strong>{filteredUrls.length}</strong> of {allUrls.length} total URLs
          {search && <span> matching &ldquo;{search}&rdquo;</span>}
        </span>
        <span>{Object.keys(groupedUrls).length} location / category groups</span>
      </div>

      {/* Grouped Accordion List */}
      <div className="space-y-4">
        {Object.entries(groupedUrls).map(([groupName, items]) => {
          const isExpanded = expandedGroups[groupName] !== false; // default expanded
          return (
            <div
              key={groupName}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:border-gray-200"
            >
              {/* Group Header Card */}
              <button
                type="button"
                onClick={() => toggleGroup(groupName)}
                className="w-full px-5 py-3.5 flex items-center justify-between bg-gray-50/70 hover:bg-gray-100/60 transition cursor-pointer select-none text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span className="font-bold text-sm text-slate-900">{groupName}</span>
                  <span className="text-[11px] font-bold text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                    {items.length} {items.length === 1 ? 'URL' : 'URLs'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-400">
                  <span className="text-[11px] font-medium hidden sm:inline">
                    {isExpanded ? 'Collapse' : 'Expand'}
                  </span>
                  <i
                    className={`fas fa-chevron-down text-xs transition-transform duration-200 ${
                      isExpanded ? 'rotate-180 text-primary' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Collapsible Content */}
              {isExpanded && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 bg-white border-t border-gray-100">
                  {items.map((item) => {
                    const status = results[item.url];
                    return (
                      <div
                        key={item.url}
                        className="group flex items-center justify-between gap-2 p-2.5 rounded-xl border border-gray-150 hover:border-primary/40 hover:bg-primary/5 transition"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-slate-800 group-hover:text-primary transition truncate">
                              {item.label}
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono truncate mt-0.5">
                            {item.url}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {status === 200 && (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md">
                              200 OK
                            </span>
                          )}
                          {status && status !== 200 && (
                            <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md">
                              {status}
                            </span>
                          )}

                          <Link
                            href={item.url}
                            target="_blank"
                            className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-primary group-hover:text-white text-gray-500 flex items-center justify-center text-xs transition shadow-2xs"
                            title={`Open ${item.url} in new tab`}
                          >
                            <i className="fas fa-external-link-alt text-[10px]"></i>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {filteredUrls.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center text-gray-400">
            <i className="fas fa-search text-3xl mb-3 text-gray-300"></i>
            <p className="text-sm font-bold text-gray-600">No SEO links match your criteria</p>
            <p className="text-xs text-gray-400 mt-1">Try clearing your search query or selecting a different tab filter.</p>
            <button
              onClick={() => { setSearch(''); setActiveTab('all'); setStatusFilter('all'); }}
              className="mt-4 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow hover:bg-primary-hover transition cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
