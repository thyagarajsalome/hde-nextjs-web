"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { KitchenDesign, KitchenLayoutShape } from '@/types/gallery';
import { KitchenGalleryService } from '@/services/kitchenGalleryService';

const SHAPES: KitchenLayoutShape[] = ['L-Shape', 'U-Shape', 'Parallel', 'Straight', 'Island'];

export default function KitchenGalleryPage() {
  const [designs, setDesigns] = useState<KitchenDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShape, setSelectedShape] = useState<string>('All');
  const [activeModalDesign, setActiveModalDesign] = useState<KitchenDesign | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await KitchenGalleryService.getDesigns('All', true);
        setDesigns(data);
      } catch (err) {
        console.error('Failed to load kitchen gallery:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveModalDesign(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredDesigns = selectedShape === 'All'
    ? designs
    : designs.filter(d => d.layout_shape === selectedShape);

  // Navigate to India Interior Calculator
  const handleOpenCalculator = (design: KitchenDesign) => {
    router.push('/app');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8">
      
      {/* Structured Schema JSON-LD for Google SEO & Image Search */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Modular Kitchen Designs & Cost in India (2026)",
            "description": "Explore 9:16 modular kitchen designs with layout shapes, dimensions, and approximate INR budgets in India.",
            "url": "https://www.homedesignenglish.com/gallery/kitchen-designs",
            "inLanguage": "en-IN",
            "hasPart": filteredDesigns.map((item) => ({
              "@type": "ImageObject",
              "contentUrl": item.image_url,
              "name": item.title,
              "description": item.meta_description,
              "encodingFormat": "image/webp"
            }))
          })
        }}
      />

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-zinc-400">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-400">Inspiration Gallery</span>
          <span>/</span>
          <span className="text-primary font-bold">Modular Kitchen Designs</span>
        </div>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <span>🇮🇳</span> India Mode &bull; 2026 Realistic Cost Estimates
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-secondary dark:text-zinc-100 tracking-tight leading-tight">
            Modular Kitchen Designs <br className="hidden sm:inline" />
            <span className="text-primary">&amp; Approximate Budgets</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-zinc-400 leading-relaxed">
            Browse real 9:16 mobile-first modular kitchen design ideas tailored for Indian homes. Each design includes layout shapes, room dimensions, material finishes, and estimated budget ranges in INR.
          </p>
        </div>

        {/* Layout Shape Filter Bar */}
        <div className="flex items-center justify-center">
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm max-w-full">
            <button
              onClick={() => setSelectedShape('All')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                selectedShape === 'All'
                  ? 'bg-secondary text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-md'
                  : 'text-gray-600 dark:text-zinc-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
            >
              All Shapes ({designs.length})
            </button>
            {SHAPES.map((shape) => {
              const count = designs.filter(d => d.layout_shape === shape).length;
              return (
                <button
                  key={shape}
                  onClick={() => setSelectedShape(shape)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    selectedShape === shape
                      ? 'bg-secondary text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-md'
                      : 'text-gray-600 dark:text-zinc-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {shape} {count > 0 && <span className="opacity-70 text-[11px]">({count})</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* 9:16 Visual Card Grid */}
        {loading ? (
          <div className="py-24 text-center text-gray-400">
            <i className="fas fa-spinner fa-spin text-3xl mb-3 text-primary"></i>
            <p className="font-bold text-sm">Loading kitchen designs...</p>
          </div>
        ) : filteredDesigns.length === 0 ? (
          <div className="py-20 text-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-3xl">
            <i className="fas fa-kitchen-set text-4xl mb-3 opacity-20"></i>
            <p className="font-bold text-base">No designs found for this layout</p>
            <button
              onClick={() => setSelectedShape('All')}
              className="mt-3 text-xs font-bold text-primary hover:underline"
            >
              View All Layouts
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredDesigns.map((design) => (
              <div
                key={design.id}
                onClick={() => setActiveModalDesign(design)}
                className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-end"
              >
                {/* Background Image */}
                <img
                  src={design.image_url}
                  alt={design.alt_text}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-black/60 text-white backdrop-blur-md border border-white/10 shadow-sm">
                    {design.layout_shape}
                  </span>
                  {design.is_featured && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-primary text-white dark:text-zinc-950 uppercase tracking-tight shadow-md">
                      Featured
                    </span>
                  )}
                </div>

                {/* Bottom Gradient Overlay */}
                <div className="relative z-10 p-4 bg-gradient-to-t from-black via-black/70 to-transparent pt-16 text-white space-y-1.5">
                  <h3 className="font-bold text-xs sm:text-sm line-clamp-2 leading-snug drop-shadow-sm group-hover:text-primary-light transition-colors">
                    {design.title}
                  </h3>
                  
                  <div className="flex items-center justify-between text-[11px] text-gray-300 font-medium pt-1 border-t border-white/15">
                    <span>{design.dimensions}</span>
                    <span className="font-bold text-amber-400 text-xs">
                      {design.formatted_budget}
                    </span>
                  </div>

                  <div className="pt-2">
                    <span className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg bg-white/20 hover:bg-white text-white hover:text-secondary text-[11px] font-bold backdrop-blur-md transition-all">
                      <span>View Details &amp; Cost</span>
                      <i className="fas fa-arrow-right text-[9px]"></i>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Informative Guidance Section (SEO + User Value) */}
        <div className="mt-16 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 p-6 sm:p-10 space-y-6">
          <div className="max-w-3xl">
            <h2 className="text-xl sm:text-2xl font-black text-secondary dark:text-zinc-100">
              How to Plan Your Modular Kitchen Budget in India
            </h2>
            <p className="text-sm text-gray-600 dark:text-zinc-400 mt-2 leading-relaxed">
              In Indian homes, modular kitchen pricing is determined by running counter length, carcass woodwork material (BWP 710 marine plywood vs HDHMR), and shutter finishes:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-150 dark:border-zinc-800">
              <div className="text-xs font-bold text-primary uppercase">Budget Friendly</div>
              <h3 className="font-bold text-gray-900 dark:text-zinc-100 mt-1">High-Pressure Laminate</h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                Standard 0.8mm to 1mm laminates offer extreme scratch resistance and moisture resistance. Ideal for budgets between ₹1 Lakh to ₹1.8 Lakhs.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-150 dark:border-zinc-800">
              <div className="text-xs font-bold text-primary uppercase">Modern &amp; Glossy</div>
              <h3 className="font-bold text-gray-900 dark:text-zinc-100 mt-1">High-Gloss Acrylic</h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                Mirror-like reflective finish that makes compact kitchens look spacious. Extremely easy to wipe clean. Typical cost ₹1.5 Lakhs to ₹2.6 Lakhs.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-150 dark:border-zinc-800">
              <div className="text-xs font-bold text-primary uppercase">Ultra Luxury</div>
              <h3 className="font-bold text-gray-900 dark:text-zinc-100 mt-1">PU Lacquer &amp; Quartz</h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                Seamless satin spray-painted finish paired with stain-resistant engineered quartz countertops and Blum tandem drawer hardware. ₹2.5 Lakhs+.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Interactive Detail Modal (Lightbox View) */}
      {activeModalDesign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-12 overflow-hidden"
          >
            {/* Modal Image (9:16 preview) */}
            <div className="md:col-span-5 bg-zinc-950 relative aspect-[9/16] md:aspect-auto md:min-h-[500px]">
              <img
                src={activeModalDesign.image_url}
                alt={activeModalDesign.alt_text}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-black bg-black/70 text-white backdrop-blur-md">
                {activeModalDesign.layout_shape}
              </span>
            </div>

            {/* Modal Specs & CTA */}
            <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                      🇮🇳 India Modular Kitchen Design
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-secondary dark:text-zinc-100 mt-1">
                      {activeModalDesign.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => setActiveModalDesign(null)}
                    className="p-2 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 text-gray-500 font-bold"
                  >
                    <i className="fas fa-times text-sm"></i>
                  </button>
                </div>

                {/* Estimated Budget Box */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-400 block">
                      Approximate Total Budget
                    </span>
                    <span className="text-xl font-black text-amber-900 dark:text-amber-300 font-mono">
                      {activeModalDesign.formatted_budget}
                    </span>
                  </div>
                  {activeModalDesign.rate_per_unit && (
                    <span className="text-xs font-bold text-gray-500 dark:text-zinc-400">
                      {activeModalDesign.rate_per_unit}
                    </span>
                  )}
                </div>

                {/* Key Specifications Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800">
                    <span className="text-gray-400 block font-semibold">Layout Shape</span>
                    <span className="font-bold text-gray-800 dark:text-zinc-200 text-sm">{activeModalDesign.layout_shape}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800">
                    <span className="text-gray-400 block font-semibold">Dimensions</span>
                    <span className="font-bold text-gray-800 dark:text-zinc-200 text-sm">{activeModalDesign.dimensions}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800">
                    <span className="text-gray-400 block font-semibold">Cabinet Finish</span>
                    <span className="font-bold text-gray-800 dark:text-zinc-200">{activeModalDesign.cabinet_finish}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800">
                    <span className="text-gray-400 block font-semibold">Countertop</span>
                    <span className="font-bold text-gray-800 dark:text-zinc-200">{activeModalDesign.countertop_material}</span>
                  </div>
                </div>

                {/* Features Tags */}
                {activeModalDesign.features && activeModalDesign.features.length > 0 && (
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                      Included Accessories &amp; Features:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeModalDesign.features.map((feat, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300"
                        >
                          <i className="fas fa-check text-primary text-[10px] mr-1.5"></i>
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Conversion Actions */}
              <div className="pt-4 border-t border-gray-200 dark:border-zinc-800 space-y-2.5">
                <button
                  onClick={() => handleOpenCalculator(activeModalDesign)}
                  className="w-full py-4 rounded-xl bg-primary hover:bg-primary-hover text-white dark:text-zinc-950 font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                  <i className="fas fa-calculator"></i>
                  <span>Customize in India Kitchen Calculator</span>
                  <i className="fas fa-arrow-right text-xs"></i>
                </button>
                <p className="text-[11px] text-center text-gray-400">
                  Open India Interior Calculator to calculate based on your exact city rates and dimensions.
                </p>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
