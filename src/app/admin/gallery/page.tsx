// src/app/admin/gallery/page.tsx
import React from 'react';
import Link from 'next/link';

export default function AdminGalleryHubPage() {
  const sections = [
    {
      title: 'Modular Kitchen Designs',
      description: 'Manage 9:16 modular kitchen photo cards, L-shape/U-shape layouts, dimensions, and approximate INR budgets.',
      href: '/admin/gallery/kitchen',
      icon: 'fa-kitchen-set',
      status: 'Live & Ready',
      count: 'Active CRUD',
      accent: 'border-emerald-500/40 bg-emerald-500/5 text-emerald-600',
    },
    {
      title: 'Modern Bathroom & Tile Concepts',
      description: 'Manage 9:16 bathroom photos, wet & dry partitions, vanity units, tile concepts, and approximate INR budgets.',
      href: '/admin/gallery/bathroom',
      icon: 'fa-bath',
      status: 'Live & Ready',
      count: 'Active CRUD',
      accent: 'border-blue-500/40 bg-blue-500/5 text-blue-600',
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold mb-1">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <span className="text-gray-400">Admin</span>
            <span>/</span>
            <span className="text-primary font-bold">Gallery Hub</span>
          </div>
          <h1 className="text-3xl font-black text-secondary dark:text-zinc-100 flex items-center gap-3">
            <i className="fas fa-images text-primary"></i>
            HDE Gallery Administration Hub
          </h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
            Select a room category to manage visual design assets, specifications, and budget ranges.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((sec) => (
            <div
              key={sec.title}
              className={`p-6 rounded-2xl border-2 transition-all flex flex-col justify-between ${sec.accent}`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-900 shadow-sm flex items-center justify-center text-xl text-primary">
                    <i className={`fas ${sec.icon}`}></i>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white dark:bg-zinc-800 shadow-xs border border-gray-100 dark:border-zinc-700">
                    {sec.status}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">{sec.title}</h2>
                <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">{sec.description}</p>
              </div>

              <div className="pt-6">
                {sec.href !== '#' ? (
                  <Link
                    href={sec.href}
                    className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white dark:text-zinc-950 font-bold text-sm shadow-md transition-all"
                  >
                    <span>Manage {sec.title}</span>
                    <i className="fas fa-arrow-right text-xs"></i>
                  </Link>
                ) : (
                  <button
                    disabled
                    className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gray-200 dark:bg-zinc-800 text-gray-400 font-bold text-sm cursor-not-allowed"
                  >
                    <span>Coming in Next Phase</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
