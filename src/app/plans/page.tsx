import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import PlanGallery from '@/features/plans/PlanGallery';

export const metadata: Metadata = {
  title: '100+ House Plans & 2D Floor Designs in India | HDE',
  description: 'Download 100+ architectural house plans and 2D floor designs in India. 1, 2, 3 BHK duplex layouts with parking and estimated building budgets.',
  keywords: 'house plans india, 30x40 house plans, 20x30 house plans, architectural floor plans, 2 bhk house design, duplex house plan, 3 bhk floor plan with parking, small house design',
  alternates: {
    canonical: 'https://www.homedesignenglish.com/plans',
  },
  openGraph: {
    title: '100+ House Plans & 2D Floor Designs in India | HDE',
    description: 'Browse modern Indian house plans for 20x30, 30x40, 30x50, 40x60 plots. Download high-resolution blueprints and calculate building costs.',
    url: 'https://www.homedesignenglish.com/plans',
    siteName: 'Home Design English (HDE)',
    locale: 'en_IN',
    type: 'website',
  }
};

export default function PlanGalleryRoute() {
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* SEO Discovery Header - Warm Light Cream Architectural Theme */}
      <section className="bg-gradient-to-b from-[#FFFDF9] via-[#FAF7F2] to-[#F5EFE6] border-b border-[#E8DFC8] py-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100/80 px-3.5 py-1.5 rounded-full border border-amber-200/60 inline-block">
              🇮🇳 India Floor Plan Library &amp; Blueprints
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0f2042] tracking-tight">
              House Plans &amp; 2D Floor Designs
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Explore modern architectural floor plans tailored for Indian plot sizes, municipal setback bylaws, and family living requirements.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/plans/store"
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-[#FFFDF9] hover:bg-amber-50 text-[#0f2042] hover:text-amber-900 text-xs sm:text-sm font-black shadow-xs hover:shadow-md transition no-underline border border-[#E8DFC8] hover:border-[#c5a059]"
              >
                <i className="fas fa-file-pdf text-amber-600 text-sm"></i>
                <span>Browse Vector PDF Plans Store (300 DPI Working Blueprints)</span>
                <i className="fas fa-arrow-right text-[11px] text-amber-600"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Blueprint Gallery */}
      <PlanGallery />
    </div>
  );
}
