"use client";

import React, { useState } from "react";
import Link from "next/link";

interface Area {
  name: string;
  icon: string;
  tagline: string;
  slug: string;
}

export default function DubaiAreaList({ areas }: { areas: Area[] }) {
  const [expandedArea, setExpandedArea] = useState<string | null>(null);

  const toggleExpand = (slug: string) => {
    if (expandedArea === slug) {
      setExpandedArea(null);
    } else {
      setExpandedArea(slug);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-950 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden">
      <div className="divide-y divide-gray-100 dark:divide-zinc-800">
        {areas.map((area) => {
          const isExpanded = expandedArea === area.slug;
          return (
            <div key={area.slug} className="group">
              <button
                onClick={() => toggleExpand(area.slug)}
                className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors focus:outline-none"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 flex items-center justify-center text-gray-400 dark:text-zinc-500 text-xl group-hover:text-primary transition-colors">
                    <i className={area.icon}></i>
                  </div>
                  <span className="text-lg font-semibold text-slate-900 dark:text-zinc-100 group-hover:text-primary transition-colors">
                    {area.name}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="hidden sm:inline text-sm text-gray-500 dark:text-zinc-500 truncate max-w-xs">
                    {area.tagline}
                  </span>
                  <i 
                    className={`fas fa-chevron-down text-gray-400 dark:text-zinc-500 transition-transform duration-300 ${isExpanded ? "rotate-180 text-primary" : ""}`}
                  ></i>
                </div>
              </button>
              
              {isExpanded && (
                <div className="px-6 py-4 bg-gray-50 dark:bg-zinc-900/30 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="text-gray-600 dark:text-zinc-400 text-sm">
                    <p className="font-medium text-slate-800 dark:text-zinc-200 mb-1">About {area.name}</p>
                    <p>{area.tagline}. Discover property prices, ROI, amenities, and more.</p>
                  </div>
                  <Link 
                    href={`/dubai-property/areas/${area.slug}`}
                    className="whitespace-nowrap px-5 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
                  >
                    View Full Guide &rarr;
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
