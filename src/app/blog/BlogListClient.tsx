"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRegion } from '@/context/RegionContext';
import { BlogPost } from '@/lib/mdx';

interface BlogListClientProps {
  posts: BlogPost[];
}

const ALL_CATEGORIES = [
  { id: 'all', label: 'All Guides', icon: 'fas fa-layer-group' },
  { id: 'construction', label: 'Construction & Cost', match: ['Construction', 'Budgeting', 'Roof', 'Block', 'Brick'], icon: 'fas fa-trowel-bricks' },
  { id: 'loans', label: 'Home Loans & EMI', match: ['Home Loans', 'Finance', 'EMI', 'Salary'], icon: 'fas fa-calculator' },
  { id: 'kitchen', label: 'Kitchen & Interior', match: ['Kitchen', 'Interior'], icon: 'fas fa-kitchen-set' },
  { id: 'bathroom', label: 'Bathroom & Remodel', match: ['Bathroom', 'Renovation', 'Remodel'], icon: 'fas fa-bath' },
  { id: 'real-estate', label: 'Real Estate & Renting', match: ['Real Estate', 'Rent', 'Property', 'Dubai'], icon: 'fas fa-house-chimney' },
  { id: 'luxury', label: 'Luxury Upgrades', match: ['Luxury', 'Pickleball', 'Pool'], icon: 'fas fa-gem' },
];

export default function BlogListClient({ posts }: BlogListClientProps) {
  const { region, setRegion } = useRegion();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Strict region isolation (IN, US, or AE)
  const activeRegion = region === 'US' ? 'US' : region === 'AE' ? 'AE' : 'IN';

  // Strict region filtering - NEVER mix India, USA, and Dubai articles
  const regionalPosts = useMemo(() => {
    return posts.filter((post) => {
      const pRegion = post.meta.region?.toUpperCase();
      if (pRegion === 'GLOBAL') return true;
      if (activeRegion === 'US') return pRegion === 'US';
      if (activeRegion === 'AE') return pRegion === 'AE';
      // Default India mode (IN): ONLY return India articles
      return pRegion === 'IN';
    });
  }, [posts, activeRegion]);

  // Dynamically show only category pills that actually exist for the active region
  const visibleCategories = useMemo(() => {
    return ALL_CATEGORIES.filter((cat) => {
      if (cat.id === 'all') return true;
      if (!cat.match) return false;
      return regionalPosts.some((post) =>
        cat.match!.some(
          (m) =>
            post.meta.category.toLowerCase().includes(m.toLowerCase()) ||
            post.slug.toLowerCase().includes(m.toLowerCase())
        )
      );
    });
  }, [regionalPosts]);

  // Search & category filtering within the active region
  const filteredPosts = useMemo(() => {
    return regionalPosts.filter((post) => {
      // Category match
      if (activeCategory !== 'all') {
        const catConfig = ALL_CATEGORIES.find((c) => c.id === activeCategory);
        if (catConfig && catConfig.match) {
          const matches = catConfig.match.some(
            (m) =>
              post.meta.category.toLowerCase().includes(m.toLowerCase()) ||
              post.slug.toLowerCase().includes(m.toLowerCase())
          );
          if (!matches) return false;
        }
      }

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = post.meta.title.toLowerCase().includes(q);
        const inDesc = (post.meta.description || '').toLowerCase().includes(q);
        const inCat = post.meta.category.toLowerCase().includes(q);
        return inTitle || inDesc || inCat;
      }

      return true;
    });
  }, [regionalPosts, activeCategory, searchQuery]);

  // Featured flagship post strictly from the current region
  const isShowingAllDefault = activeCategory === 'all' && !searchQuery.trim();
  const featuredPost = isShowingAllDefault
    ? regionalPosts.find((p) => p.meta.featured) || regionalPosts[0]
    : null;
  const standardPosts = isShowingAllDefault
    ? regionalPosts.filter((p) => p.slug !== featuredPost?.slug)
    : filteredPosts;

  const regionNames: Record<string, { label: string; flag: string }> = {
    IN: { label: 'India Mode', flag: '🇮🇳' },
    US: { label: 'USA Mode', flag: '🇺🇸' },
    AE: { label: 'Dubai / UAE Mode', flag: '🇦🇪' },
  };

  return (
    <div className="space-y-8">
      {/* Region Status & Search Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/90 shadow-xs space-y-4">
        {/* Region Indicator and Switcher */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span>{regionNames[activeRegion]?.flag}</span>
              <span>Showing <strong>{regionNames[activeRegion]?.label}</strong> Guides</span>
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              {regionalPosts.length} guides
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold">
            <span className="text-slate-400 font-medium text-[11px] mr-1">Switch Region:</span>
            <button
              onClick={() => {
                setRegion('IN');
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                activeRegion === 'IN'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-gray-200'
              }`}
            >
              🇮🇳 India
            </button>
            <button
              onClick={() => {
                setRegion('US');
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                activeRegion === 'US'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-gray-200'
              }`}
            >
              🇺🇸 USA
            </button>
            <button
              onClick={() => {
                setRegion('AE');
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                activeRegion === 'AE'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-gray-200'
              }`}
            >
              🇦🇪 Dubai
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input
            type="text"
            placeholder={`Search ${regionNames[activeRegion]?.label} guides (e.g. ${
              activeRegion === 'IN'
                ? 'modular kitchen, cement rates, home loan EMI, brick vs block'
                : activeRegion === 'US'
                ? 'pickleball court, rent vs buy, outdoor kitchen, permit'
                : 'DLD fees, service charge, off-plan'
            })...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4165af] focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm p-1 cursor-pointer"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Pills (Strictly for active region) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {visibleCategories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                  isActive
                    ? 'bg-[#4165af] text-white border-[#4165af] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-gray-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <i className={`${cat.icon} text-[11px] ${isActive ? 'text-white' : 'text-slate-500'}`}></i>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured Cornerstone Article Card (White Background, Pure Regional) */}
      {featuredPost && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-extrabold uppercase tracking-wider border border-amber-200">
                <i className="fas fa-star text-amber-500 text-[10px]"></i>
                Featured {regionNames[activeRegion]?.label} Guide
              </span>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <i className="far fa-clock text-[11px]"></i>
                {featuredPost.meta.readingTime}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 group-hover:text-[#4165af] transition-colors leading-snug">
              <Link href={`/blog/${featuredPost.slug}`} className="no-underline text-inherit">
                {featuredPost.meta.title}
              </Link>
            </h2>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-3">
              {featuredPost.meta.description}
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 flex-wrap gap-4">
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span><i className="far fa-calendar-alt mr-1.5"></i>{featuredPost.meta.date}</span>
                <span>&bull;</span>
                <span>By {featuredPost.meta.author}</span>
              </div>

              <Link
                href={`/blog/${featuredPost.slug}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4165af] hover:bg-[#325291] text-white text-xs font-extrabold rounded-xl transition shadow-xs hover:shadow-md no-underline"
              >
                <span>Read Complete Guide</span>
                <i className="fas fa-arrow-right text-[11px]"></i>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Results Count & Reset */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{filteredPosts.length}</strong> {filteredPosts.length === 1 ? 'guide' : 'guides'}
          {activeCategory !== 'all' && ` in ${ALL_CATEGORIES.find((c) => c.id === activeCategory)?.label}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </span>
        {(searchQuery || activeCategory !== 'all') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}
            className="text-[#4165af] hover:underline font-bold cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Regional Post Cards Grid */}
      {standardPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {standardPosts.map((post) => (
            <Link
              href={`/blog/${post.slug}`}
              key={post.slug}
              className="group no-underline block h-full"
            >
              <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-2xs hover:shadow-lg hover:border-gray-300 transition-all duration-200 hover:-translate-y-1 h-full flex flex-col justify-between">
                <div>
                  {/* Category & Read Time Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-[#4165af]/10 text-[#4165af] tracking-wider">
                      {post.meta.category}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                      <i className="far fa-clock text-[10px]"></i>
                      {post.meta.readingTime}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 group-hover:text-[#4165af] transition-colors leading-snug">
                    {post.meta.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed mb-4">
                    {post.meta.description}
                  </p>
                </div>

                {/* Footer Metadata */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-gray-100 mt-auto">
                  <span>{post.meta.date}</span>
                  <span className="font-bold text-[#4165af] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Read Guide <i className="fas fa-arrow-right text-[10px]"></i>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 max-w-md mx-auto shadow-xs space-y-3">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xl mx-auto">
            <i className="fas fa-magnifying-glass"></i>
          </div>
          <h4 className="text-base font-bold text-slate-900">No matching guides found</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            No guides found matching &quot;{searchQuery}&quot; for {regionNames[activeRegion]?.label}. Try a different keyword or reset filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}
            className="px-4 py-2 bg-[#4165af] text-white text-xs font-bold rounded-xl hover:bg-[#325291] transition cursor-pointer"
          >
            Show All {regionNames[activeRegion]?.label} Guides
          </button>
        </div>
      )}
    </div>
  );
}
