import React from 'react';
import { Metadata } from 'next';
import PlanGallery from '@/features/plans/PlanGallery';

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
  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-zinc-950">
      {/* SEO Discovery Header */}
      <section className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 py-10">
        <div className="container mx-auto px-4 max-w-7xl">
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
        </div>
      </section>

      {/* Interactive Blueprint Gallery */}
      <PlanGallery />
    </div>
  );
}
