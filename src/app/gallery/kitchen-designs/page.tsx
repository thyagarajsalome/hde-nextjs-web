"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { KitchenDesign, KitchenLayoutShape } from '@/types/gallery';
import { KitchenGalleryService } from '@/services/kitchenGalleryService';

const SHAPES: KitchenLayoutShape[] = ['L-Shape', 'U-Shape', 'Parallel', 'Straight', 'Island'];

export default function KitchenGalleryPage() {
  const [designs, setDesigns] = useState<KitchenDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShape, setSelectedShape] = useState<string>('All');
  const [activeModalDesign, setActiveModalDesign] = useState<KitchenDesign | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
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

  // Two-phase loading: fetch full detail when modal opens
  const handleOpenModal = useCallback(async (design: KitchenDesign) => {
    // Show modal immediately with card data
    setActiveModalDesign(design);
    // Fetch full detail in background (for fields not in card columns)
    setModalLoading(true);
    try {
      const full = await KitchenGalleryService.getDesignById(design.id);
      if (full) setActiveModalDesign(full);
    } catch {
      // Card data is sufficient as fallback
    } finally {
      setModalLoading(false);
    }
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

  // Navigate to India Modular Kitchen Calculator with pre-filled specs
  const handleOpenCalculator = (design: KitchenDesign) => {
    const sqftMatch = design.dimensions?.match(/(\d+(?:\.\d+)?)\s*(?:sq\s*ft|sqft)/i);
    const dimMatch = design.dimensions?.match(/(\d+(?:\.\d+)?)\s*(?:ft|'|feet)?\s*[×xX*]\s*(\d+(?:\.\d+)?)/i);
    const length = dimMatch ? dimMatch[1] : '';
    const width = dimMatch ? dimMatch[2] : '';
    const sqft = sqftMatch ? sqftMatch[1] : (length && width ? String(Math.round(Number(length) * Number(width))) : '120');

    const params = new URLSearchParams({
      calc: 'india-kitchen',
      area: sqft,
      shape: design.layout_shape || '',
      title: design.title || '',
    });
    if (length) params.set('length', length);
    if (width) params.set('width', width);
    if (design.cabinet_finish) params.set('finish', design.cabinet_finish);
    if (design.countertop_material) params.set('countertop', design.countertop_material);

    router.push(`/app?${params.toString()}`);
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
            "hasPart": filteredDesigns.slice(0, 10).map((item) => ({
              "@type": "ImageObject",
              "contentUrl": item.image_url,
              "name": item.title,
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
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <i className="fas fa-kitchen-set"></i>
            <span>Indian Modular Kitchen Portfolio &bull; 9:16 Showcase</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-secondary dark:text-zinc-100 tracking-tight">
            Modular Kitchen Designs &amp; Cost
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-zinc-400 leading-relaxed">
            Discover 9:16 mobile-first modular kitchen design ideas curated for Indian flats and homes. Each concept includes layout shapes, room dimensions, material finishes, and approximate INR modular costs.
          </p>
        </div>

        {/* Layout Shape Filter Pills */}
        <div className="flex items-center justify-center flex-wrap gap-2 pt-2">
          {['All', ...SHAPES].map((shape) => (
            <button
              key={shape}
              onClick={() => setSelectedShape(shape)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedShape === shape
                  ? 'bg-primary text-white dark:text-zinc-950 shadow-md scale-105'
                  : 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:border-primary'
              }`}
            >
              {shape}
            </button>
          ))}
        </div>

        {/* Designs Grid (Mobile First 9:16 Aspect Ratio) */}
        {loading ? (
          <div className="py-20 text-center text-gray-400 text-sm">
            <i className="fas fa-circle-notch fa-spin text-2xl text-primary mb-3"></i>
            <p>Loading kitchen designs...</p>
          </div>
        ) : filteredDesigns.length === 0 ? (
          <div className="py-16 text-center text-gray-500 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-8">
            <i className="fas fa-kitchen-set text-3xl text-gray-300 mb-2"></i>
            <p className="text-sm font-semibold">No kitchen designs found for this layout.</p>
            <button
              onClick={() => setSelectedShape('All')}
              className="mt-4 px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold"
            >
              View All Kitchens
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDesigns.map((design) => (
              <div
                key={design.id}
                onClick={() => handleOpenModal(design)}
                className="group relative bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
              >
                {/* 9:16 Aspect Ratio Image Container */}
                <div className="relative aspect-[9/16] w-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
                  <Image
                    src={design.image_url}
                    alt={design.alt_text || design.title}
                    width={720}
                    height={1280}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10 pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 dark:bg-zinc-900/90 text-gray-800 dark:text-zinc-200 backdrop-blur-md shadow-xs border border-white/20">
                      {design.layout_shape}
                    </span>
                    {design.is_featured && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500 text-white shadow-xs uppercase tracking-wider">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Bottom Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>

                  {/* On-Image Budget Pill */}
                  <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none">
                    <p className="text-[11px] font-semibold text-emerald-400">Approx. Modular Cost</p>
                    <p className="text-lg font-black text-white leading-tight drop-shadow-sm">
                      {design.formatted_budget}
                    </p>
                    <p className="text-[10px] text-gray-300 font-medium mt-0.5">
                      {design.dimensions}
                    </p>
                  </div>
                </div>

                {/* Card Details Footer */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-zinc-100 group-hover:text-primary transition-colors line-clamp-1">
                      {design.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 line-clamp-1">
                      {design.cabinet_finish} &bull; {design.countertop_material}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100 dark:border-zinc-800">
                    <span className="text-[11px] text-gray-400 font-medium">
                      {design.layout_shape} Kitchen
                    </span>
                    <span className="text-primary font-bold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>View Specs</span>
                      <i className="fas fa-arrow-right text-[10px]"></i>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Interactive Detail Modal (Lightbox View) */}
      {activeModalDesign && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn"
          onClick={() => setActiveModalDesign(null)}
        >
          <div 
            className="relative bg-white dark:bg-zinc-900 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-gray-100 dark:border-zinc-800 my-auto grid grid-cols-1 md:grid-cols-12"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Image (9:16 preview) */}
            <div className="md:col-span-5 bg-zinc-950 relative aspect-[9/16] md:aspect-auto md:min-h-[500px]">
              <Image
                src={activeModalDesign.image_url}
                alt={activeModalDesign.alt_text}
                width={720}
                height={1280}
                priority
                className="w-full h-full object-cover"
              />
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-black bg-black/70 text-white backdrop-blur-md">
                {activeModalDesign.layout_shape}
              </span>
            </div>

            {/* Modal Specs & CTA */}
            <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6 overflow-y-auto max-h-[85vh]">
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
