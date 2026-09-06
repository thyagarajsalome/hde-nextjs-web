import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import PlanGallery from '@/features/plans/PlanGallery';
import { HOUSE_PLAN_SEO_DATA } from '@/data/housePlanSeoData';

export const metadata: Metadata = {
  title: '100+ Modern House Plans & Floor Designs in India | 20x30, 30x40, 30x50, 40x60 | HDE',
  description: 'Download 100+ architectural house plans and 2D floor designs for India. 1 BHK, 2 BHK, 3 BHK duplex plans with car parking, optimal airflow & lighting, and estimated construction budgets.',
  keywords: 'house plans india, 30x40 house plans, 20x30 house plans, architectural floor plans, 2 bhk house design, duplex house plan, 3 bhk floor plan with parking, small house design',
  alternates: {
    canonical: 'https://www.homedesignenglish.com/plans',
  },
  openGraph: {
    title: '100+ Modern House Plans & Floor Designs in India | HDE',
    description: 'Browse modern Indian house plans for 20x30, 30x40, 30x50, 40x60 plots. Download high-resolution blueprints and calculate building costs.',
    url: 'https://www.homedesignenglish.com/plans',
    siteName: 'Home Design English (HDE)',
    locale: 'en_IN',
    type: 'website',
  }
};

export default function PlanGalleryRoute() {
  const planList = Object.values(HOUSE_PLAN_SEO_DATA);
  const dimensionPlans = planList.filter((p) => p.category === 'dimension');
  const facingPlans = planList.filter((p) => p.category === 'facing');
  const bhkPlans = planList.filter((p) => p.category === 'bhk' || p.category === 'budget');

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-zinc-950">
      {/* SEO Discovery Header */}
      <section className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 py-10">
        <div className="container mx-auto px-4 max-w-7xl space-y-6">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3.5 py-1.5 rounded-full">
              🇮🇳 India Floor Plan Library &amp; Blueprints
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
              House Plans &amp; 2D Floor Designs
            </h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-zinc-400 leading-relaxed">
              Explore modern architectural floor plans tailored for Indian plot sizes, municipal setback bylaws, and family living requirements.
            </p>
          </div>

          {/* Quick Category Browser Chips */}
          <div className="space-y-4 pt-2 max-w-5xl mx-auto">
            {/* By Plot Dimensions */}
            <div>
              <span className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block mb-2">
                Popular Plot Dimensions:
              </span>
              <div className="flex flex-wrap gap-2">
                {dimensionPlans.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/plans/${item.slug}`}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-gray-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-zinc-950 transition no-underline"
                  >
                    {item.shortTitle}
                  </Link>
                ))}
              </div>
            </div>

            {/* By Entrance Facing & BHK */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <span className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block mb-2">
                  By Plot Orientation:
                </span>
                <div className="flex flex-wrap gap-2">
                  {facingPlans.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/plans/${item.slug}`}
                      className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200/60 hover:bg-amber-600 hover:text-white transition no-underline"
                    >
                      {item.shortTitle}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block mb-2">
                  By Configuration:
                </span>
                <div className="flex flex-wrap gap-2">
                  {bhkPlans.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/plans/${item.slug}`}
                      className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 hover:bg-emerald-600 hover:text-white transition no-underline"
                    >
                      {item.shortTitle}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Blueprint Gallery */}
      <PlanGallery />
    </div>
  );
}
