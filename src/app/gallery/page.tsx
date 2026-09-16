import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Interior Design Gallery — Modular Kitchen & Bathroom Designs | HDE',
  description: 'Explore trending modular kitchen layouts and modern bathroom designs in India. View real-time turnkey budget estimates, materials (IS:710 Marine Ply, Quartz, Vitrified Tiles), and 3D floor dimensions.',
  keywords: 'interior design gallery, modular kitchen designs india, modern bathroom designs, u shape kitchen, l shape kitchen, wet dry bathroom partition, turnkey interior cost calculator',
  alternates: {
    canonical: 'https://www.homedesignenglish.com/gallery',
  },
  openGraph: {
    title: 'Interior Design Gallery — Modular Kitchen & Bathroom Designs | HDE',
    description: 'Browse architectural interior design galleries with instant square-foot budget calculators and IS:710 specifications.',
    url: 'https://www.homedesignenglish.com/gallery',
    siteName: 'Home Design English (HDE)',
    locale: 'en_IN',
    type: 'website',
  }
};

export default function GalleryHubPage() {
  const galleryHubs = [
    {
      id: 'kitchen',
      title: 'Modular Kitchen Designs',
      tagline: 'Turnkey Carpentry, IS:710 Marine Ply & Baskets',
      description: 'Discover trending Indian modular kitchen layouts engineered for heavy cooking, deep spice storage, and durable quartz counters. Includes live budget estimation from room sq ft.',
      href: '/gallery/kitchen-designs',
      image: 'https://pub-b20d9352722b43219ceb523a3a0c89d5.r2.dev/gallery/kitchen/kitchen.webp',
      badge: 'Popular Gallery',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      icon: 'fas fa-kitchen-set',
      highlights: [
        'L-Shape, Parallel, U-Shape & Island layouts',
        'BWP 710 Marine Ply & High-Gloss Acrylic',
        'Auto-Calculate Budget from Sq.Ft (India Engine)',
        'Detailed hardware, loft storage & appliance specs'
      ],
      ctaText: 'Explore Kitchen Gallery',
    },
    {
      id: 'bathroom',
      title: 'Modern Bathroom Designs',
      tagline: 'Waterproofing, Toughened Glass & CP Fittings',
      description: 'Browse wet & dry partition bathrooms, master suites, and compact apartment layouts. Complete with waterproofing checklists, vitrified tile concepts, and branded CP fittings.',
      href: '/gallery/bathroom-designs',
      image: 'https://pub-b20d9352722b43219ceb523a3a0c89d5.r2.dev/gallery/bathroom/bathroom.webp',
      badge: 'Trending Designs',
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      icon: 'fas fa-bath',
      highlights: [
        'Wet & Dry 10mm glass partition layouts',
        'Jaquar, Kohler & Grohe fittings comparison',
        'Sunken slab waterproofing & anti-skid floor specs',
        'Turnkey renovation costs calculated by dimensions'
      ],
      ctaText: 'Explore Bathroom Gallery',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/20">
            <i className="fas fa-sparkles text-[11px]"></i>
            Architectural Interior Library
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
            Interior Design Galleries
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-zinc-400 leading-relaxed">
            Browse verified Indian modular kitchen and modern bathroom designs. Every card includes interactive square-foot budget calculations, material grades, and turnkey execution costs.
          </p>
        </div>

        {/* Main Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {galleryHubs.map((hub) => (
            <div
              key={hub.id}
              className="group bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Visual Cover */}
                <div className="relative aspect-16/9 overflow-hidden bg-slate-100 dark:bg-zinc-800">
                  <Image
                    src={hub.image}
                    alt={hub.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md bg-white/90 dark:bg-zinc-900/90 ${hub.badgeColor}`}>
                      {hub.badge}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <div className="flex items-center gap-2.5 text-white">
                      <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-sm">
                        <i className={hub.icon}></i>
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold leading-tight">{hub.title}</h2>
                        <span className="text-xs text-zinc-200">{hub.tagline}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Description */}
                <div className="p-6 sm:p-7 space-y-5">
                  <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
                    {hub.description}
                  </p>

                  <div className="space-y-2.5 pt-2 border-t border-gray-100 dark:border-zinc-800">
                    <span className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block">
                      Key Highlights:
                    </span>
                    <ul className="space-y-2 text-xs font-medium text-gray-700 dark:text-zinc-300">
                      {hub.highlights.map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <i className="fas fa-check-circle text-[#c5a059] shrink-0"></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 sm:p-7 pt-0">
                <Link
                  href={hub.href}
                  className="w-full py-3.5 px-6 rounded-2xl bg-primary hover:bg-primary-hover text-white dark:text-zinc-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 text-center no-underline"
                >
                  <span>{hub.ctaText}</span>
                  <i className="fas fa-arrow-right text-xs"></i>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Cross-Navigation & Calculators */}
        <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-center space-y-4">
          <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100">
            Need Detailed Estimations For Your Home?
          </h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-2xl mx-auto">
            Use our specialized India Construction, Interior Design, and 2D Floor Plan tools to plan your turnkey residential construction with precision.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/app?calc=india-kitchen"
              className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-200 text-xs font-bold transition flex items-center gap-2 no-underline"
            >
              <i className="fas fa-calculator text-[#c5a059]"></i>
              Kitchen Calculator
            </Link>
            <Link
              href="/app?calc=india-bathroom"
              className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-200 text-xs font-bold transition flex items-center gap-2 no-underline"
            >
              <i className="fas fa-calculator text-[#c5a059]"></i>
              Bathroom Calculator
            </Link>
            <Link
              href="/plans"
              className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-200 text-xs font-bold transition flex items-center gap-2 no-underline"
            >
              <i className="fas fa-drafting-compass text-[#c5a059]"></i>
              House Plans (2D)
            </Link>
          </div>
        </div>

        {/* Small Gray Disclaimer */}
        <div className="p-3.5 rounded-2xl bg-gray-100/70 dark:bg-zinc-900 border border-gray-200/60 dark:border-zinc-800 text-[11px] text-gray-500 dark:text-zinc-400 leading-relaxed flex items-start gap-2.5 max-w-4xl mx-auto">
          <i className="fas fa-info-circle text-gray-400 dark:text-zinc-500 mt-0.5 shrink-0 text-xs"></i>
          <span>
            <strong className="font-semibold text-gray-600 dark:text-zinc-300">Disclaimer:</strong> Cost and estimation are given approximate only. Actual cost might increase as per the site measurements, current market price on materials and labour charges. In images, few elements were added to enhance the interior design presentation; those are not part of the standard estimation.
          </span>
        </div>

      </div>
    </div>
  );
}
