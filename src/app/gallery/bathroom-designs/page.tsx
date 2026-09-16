"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { BathroomDesign, BathroomLayoutType } from '@/types/gallery';
import { bathroomGalleryService } from '@/services/bathroomGalleryService';
import { estimateIndiaBathroomCost, CostEstimateResult } from '@/utils/indiaCostEstimator';

const LAYOUT_TYPES: BathroomLayoutType[] = [
  'Master Bathroom',
  'Wet & Dry Partition',
  'Compact 3-Fixture',
  'Powder Room',
  'Luxury Suite'
];

export default function BathroomGalleryPage() {
  const [designs, setDesigns] = useState<BathroomDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('All');
  const [activeModalDesign, setActiveModalDesign] = useState<BathroomDesign | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(15);
  const [loadingStage, setLoadingStage] = useState('Connecting to design database...');
  const router = useRouter();

  // Interactive Auto-Calculator State within Design Card/Modal (India Engine)
  const [calcLength, setCalcLength] = useState<number>(8);
  const [calcWidth, setCalcWidth] = useState<number>(7);
  const [calcSqft, setCalcSqft] = useState<number>(56);
  const [calcTier, setCalcTier] = useState<'Standard' | 'Premium' | 'Luxury'>('Premium');
  const [calcResult, setCalcResult] = useState<CostEstimateResult | null>(null);

  const handleLengthChange = (val: number) => {
    setCalcLength(val);
    const w = Number(calcWidth) || 0;
    const sqft = val > 0 && w > 0 ? val * w : calcSqft;
    if (val > 0 && w > 0) setCalcSqft(sqft);
    if (activeModalDesign) {
      setCalcResult(estimateIndiaBathroomCost({
        lengthFt: val,
        widthFt: w,
        areaSqFt: sqft,
        layoutType: (activeModalDesign.layout_type as BathroomLayoutType) || 'Wet & Dry Partition',
        qualityTier: calcTier
      }));
    }
  };

  const handleWidthChange = (val: number) => {
    setCalcWidth(val);
    const l = Number(calcLength) || 0;
    const sqft = val > 0 && l > 0 ? l * val : calcSqft;
    if (val > 0 && l > 0) setCalcSqft(sqft);
    if (activeModalDesign) {
      setCalcResult(estimateIndiaBathroomCost({
        lengthFt: l,
        widthFt: val,
        areaSqFt: sqft,
        layoutType: (activeModalDesign.layout_type as BathroomLayoutType) || 'Wet & Dry Partition',
        qualityTier: calcTier
      }));
    }
  };

  const handleSqftChange = (val: number) => {
    setCalcSqft(val);
    if (activeModalDesign) {
      setCalcResult(estimateIndiaBathroomCost({
        lengthFt: calcLength,
        widthFt: calcWidth,
        areaSqFt: val,
        layoutType: (activeModalDesign.layout_type as BathroomLayoutType) || 'Wet & Dry Partition',
        qualityTier: calcTier
      }));
    }
  };

  const handleTierChange = (val: 'Standard' | 'Premium' | 'Luxury') => {
    setCalcTier(val);
    if (activeModalDesign) {
      setCalcResult(estimateIndiaBathroomCost({
        lengthFt: calcLength,
        widthFt: calcWidth,
        areaSqFt: calcSqft,
        layoutType: (activeModalDesign.layout_type as BathroomLayoutType) || 'Wet & Dry Partition',
        qualityTier: val
      }));
    }
  };

  const handleCalculateBudget = () => {
    const l = Number(calcLength) || 0;
    const w = Number(calcWidth) || 0;
    const sqft = Number(calcSqft) || (l > 0 && w > 0 ? l * w : 56);
    const res = estimateIndiaBathroomCost({
      lengthFt: l,
      widthFt: w,
      areaSqFt: sqft,
      layoutType: (activeModalDesign?.layout_type as BathroomLayoutType) || 'Wet & Dry Partition',
      qualityTier: calcTier
    });
    setCalcResult(res);
  };

  useEffect(() => {
    let progressTimer: NodeJS.Timeout;

    // Smooth incremental progress counter while fetching data
    progressTimer = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev < 42) {
          setLoadingStage('Connecting to bathroom design catalog...');
          return prev + Math.floor(Math.random() * 8) + 5;
        }
        if (prev < 78) {
          setLoadingStage('Loading waterproofing & CP fittings (Jaquar/Kohler)...');
          return prev + Math.floor(Math.random() * 6) + 3;
        }
        if (prev < 94) {
          setLoadingStage('Optimizing 9:16 mobile previews...');
          return prev + Math.floor(Math.random() * 3) + 1;
        }
        return prev;
      });
    }, 120);

    async function loadData() {
      setLoading(true);
      try {
        const data = await bathroomGalleryService.getActiveDesigns();
        setLoadingProgress(100);
        setLoadingStage('Catalog ready!');
        setTimeout(() => {
          setDesigns(data);
          setLoading(false);
        }, 220);
      } catch (err) {
        console.error('Failed to load bathroom gallery:', err);
        setLoading(false);
      } finally {
        clearInterval(progressTimer);
      }
    }
    loadData();

    return () => clearInterval(progressTimer);
  }, []);

  // Two-phase loading: fetch full detail when modal opens and initialize auto-calculator for this card
  const handleOpenModal = useCallback(async (design: BathroomDesign) => {
    // Parse dimensions from this design card
    const sqftMatch = design.dimensions?.match(/(\d+(?:\.\d+)?)\s*(?:sq\s*ft|sqft)/i);
    const dimMatch = design.dimensions?.match(/(\d+(?:\.\d+)?)\s*(?:ft|'|feet)?\s*[×xX*]\s*(\d+(?:\.\d+)?)/i);
    const l = dimMatch ? Math.round(Number(dimMatch[1])) : 8;
    const w = dimMatch ? Math.round(Number(dimMatch[2])) : 7;
    const s = sqftMatch ? Math.round(Number(sqftMatch[1])) : (l > 0 && w > 0 ? l * w : 56);
    const tier = (design.quality_tier as any) || 'Premium';

    setCalcLength(l);
    setCalcWidth(w);
    setCalcSqft(s);
    setCalcTier(tier);
    setCalcResult(estimateIndiaBathroomCost({
      lengthFt: l,
      widthFt: w,
      areaSqFt: s,
      layoutType: (design.layout_type as BathroomLayoutType) || 'Wet & Dry Partition',
      qualityTier: tier
    }));

    setActiveModalDesign(design);
    setModalLoading(true);
    try {
      const full = await bathroomGalleryService.getDesignById(design.id);
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

  const filteredDesigns = selectedType === 'All'
    ? designs
    : designs.filter(d => d.layout_type === selectedType);

  const handleOpenCalculator = (design: BathroomDesign) => {
    const params = new URLSearchParams({
      calc: 'india-bathroom',
      area: String(calcSqft || '56'),
      type: design.layout_type || 'Wet & Dry Partition',
      title: design.title || '',
      tier: calcTier,
    });
    if (calcLength) params.set('length', String(calcLength));
    if (calcWidth) params.set('width', String(calcWidth));
    if (design.fittings_brand) params.set('fittings', design.fittings_brand);
    if (design.partition_type) params.set('partition', design.partition_type);
    if (design.tile_concept) params.set('tiles', design.tile_concept);

    router.push(`/app?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8">
      
      {/* Structured Schema JSON-LD for Google SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Modern Bathroom Designs & Cost in India (2026)",
            "description": "Explore 9:16 modern bathroom designs with wet and dry partitions, vanity concepts, and approximate INR budgets in India.",
            "url": "https://www.homedesignenglish.com/gallery/bathroom-designs",
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
          <span className="text-primary font-bold">Bathroom Designs</span>
        </div>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
            <span>🇮🇳</span> India Mode &bull; 2026 Realistic Cost Estimates
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-secondary dark:text-zinc-100 tracking-tight leading-tight">
            Modern Bathroom Designs <br className="hidden sm:inline" />
            <span className="text-primary">&amp; Approximate Budgets</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-zinc-400 leading-relaxed">
            Discover modern bathroom interior ideas curated for Indian apartments and villas. Each concept features wet/dry partitions, vanity layouts, tile recommendations, and approximate INR renovation costs.
          </p>
        </div>

        {/* Shape / Layout Filter Pills */}
        <div className="flex items-center justify-center flex-wrap gap-2 pt-2">
          {['All', ...LAYOUT_TYPES].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedType === type
                  ? 'bg-primary text-white dark:text-zinc-950 shadow-md scale-105'
                  : 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:border-primary'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Designs Grid (Mobile First 9:16 Aspect Ratio) */}
        {loading ? (
          <div className="space-y-8 py-4">
            {/* Dynamic Progress Card */}
            <div className="max-w-md mx-auto p-5 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-lg text-center space-y-3.5">
              <div className="flex items-center justify-between text-xs font-bold px-1">
                <span className="text-gray-700 dark:text-zinc-300 flex items-center gap-2">
                  <i className="fas fa-spinner fa-spin text-primary"></i>
                  <span>{loadingStage}</span>
                </span>
                <span className="text-primary font-mono text-sm font-black">{loadingProgress}%</span>
              </div>

              {/* Smooth Progress Bar Track */}
              <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-3 overflow-hidden p-0.5 border border-gray-100 dark:border-zinc-700">
                <div 
                  className="bg-gradient-to-r from-[#c5a059] to-[#e4c278] h-full rounded-full transition-all duration-200 ease-out shadow-xs"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-gray-400 dark:text-zinc-500 font-medium">
                Fetching HD 9:16 bathroom concepts &amp; CP fittings...
              </p>
            </div>

            {/* Skeleton Grid (9:16 cards shimmer placeholders) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div 
                  key={n} 
                  className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 shadow-sm animate-pulse flex flex-col"
                >
                  <div className="relative aspect-[9/16] w-full bg-gray-100 dark:bg-zinc-800/80 flex flex-col items-center justify-center p-4">
                    <i className="fas fa-bath text-3xl text-gray-300 dark:text-zinc-700 mb-2"></i>
                    <span className="text-[11px] text-gray-400 dark:text-zinc-600 font-medium">Loading layout...</span>
                  </div>
                  <div className="p-4 space-y-2.5">
                    <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded-md w-3/4"></div>
                    <div className="h-3 bg-gray-100 dark:bg-zinc-800/60 rounded-md w-1/2"></div>
                    <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 flex justify-between">
                      <div className="h-3 bg-gray-100 dark:bg-zinc-800/60 rounded-md w-1/3"></div>
                      <div className="h-3 bg-primary/20 rounded-md w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredDesigns.length === 0 ? (
          <div className="py-16 text-center text-gray-500 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-8">
            <i className="fas fa-bath text-3xl text-gray-300 mb-2"></i>
            <p className="text-sm font-semibold">No bathroom designs found for this layout.</p>
            <button
              onClick={() => setSelectedType('All')}
              className="mt-4 px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold"
            >
              View All Bathrooms
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
                      {design.layout_type}
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
                    <p className="text-[11px] font-semibold text-emerald-400">Approx. Renovation Cost</p>
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
                      {design.tile_concept}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100 dark:border-zinc-800">
                    <span className="text-[11px] text-gray-400 font-medium">
                      {design.partition_type}
                    </span>
                    <span className="text-primary font-bold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>⚡ Auto-Calculate</span>
                      <i className="fas fa-arrow-right text-[10px]"></i>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Gallery Level Disclaimer */}
        <div className="p-3.5 rounded-2xl bg-gray-100/70 dark:bg-zinc-900 border border-gray-200/60 dark:border-zinc-800 text-[11px] text-gray-500 dark:text-zinc-400 leading-relaxed flex items-start gap-2.5 max-w-4xl mx-auto">
          <i className="fas fa-info-circle text-gray-400 dark:text-zinc-500 mt-0.5 shrink-0 text-xs"></i>
          <span>
            <strong className="font-semibold text-gray-600 dark:text-zinc-300">Disclaimer:</strong> Cost and estimation are given approximate only. Actual cost might increase as per the site measurements, current market price on materials and labour charges. In images, few elements were added to enhance the interior design presentation; those are not part of the standard estimation.
          </span>
        </div>

      </div>

      {/* Lightbox / Specification Modal */}
      {activeModalDesign && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn"
          onClick={() => setActiveModalDesign(null)}
        >
          <div 
            className="relative bg-white dark:bg-zinc-900 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-gray-100 dark:border-zinc-800 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-1 md:grid-cols-12">
              
              {/* Left: 9:16 High-Res Image View */}
              <div className="md:col-span-5 bg-zinc-950 relative aspect-[9/16] md:aspect-auto md:min-h-[500px] flex items-center justify-center overflow-hidden">
                <Image
                  src={activeModalDesign.image_url}
                  alt={activeModalDesign.alt_text || activeModalDesign.title}
                  width={720}
                  height={1280}
                  priority
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-black bg-black/70 text-white backdrop-blur-md">
                  {activeModalDesign.layout_type}
                </span>
              </div>

              {/* Right: Specifications & Deep Link */}
              <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6 overflow-y-auto max-h-[85vh]">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                        🇮🇳 India Bathroom Design
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-secondary dark:text-zinc-100 mt-1">
                        {activeModalDesign.title}
                      </h2>
                    </div>
                    <button
                      onClick={() => setActiveModalDesign(null)}
                      className="p-2 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 text-gray-500 font-bold cursor-pointer"
                    >
                      <i className="fas fa-times text-sm"></i>
                    </button>
                  </div>

                {/* ⚡ Auto-Calculate Budget from Sq.Ft (India Engine) */}
                <div className="p-4 sm:p-5 rounded-3xl bg-[#fffcf5] dark:bg-amber-950/20 border border-[#fde68a] dark:border-amber-900/40 shadow-xs space-y-4">
                  <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-amber-200/50 dark:border-amber-900/30">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center text-xs shrink-0">
                        <i className="fas fa-calculator"></i>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-xs flex items-center gap-1.5">
                          <span className="text-amber-500">⚡</span>
                          <span>Auto-Calculate Budget from Sq.Ft</span>
                        </h3>
                        <p className="text-gray-500 dark:text-zinc-400 text-[10px] leading-tight">
                          Enter dimensions to auto-populate pricing.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCalculateBudget}
                      className="px-3 py-1.5 rounded-lg bg-[#c5a059] hover:bg-[#b38e47] text-white font-bold text-[11px] shadow-xs transition flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer"
                    >
                      <i className="fas fa-bolt text-[10px]"></i>
                      Calculate
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 dark:text-zinc-400 mb-1">Length (ft)</label>
                      <input
                        type="number"
                        min="3"
                        max="50"
                        value={calcLength}
                        onChange={(e) => handleLengthChange(Number(e.target.value))}
                        className="w-full p-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-bold text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 dark:text-zinc-400 mb-1">Width (ft)</label>
                      <input
                        type="number"
                        min="3"
                        max="50"
                        value={calcWidth}
                        onChange={(e) => handleWidthChange(Number(e.target.value))}
                        className="w-full p-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-bold text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 dark:text-zinc-400 mb-1">Area (sq ft)</label>
                      <input
                        type="number"
                        min="10"
                        max="1000"
                        value={calcSqft}
                        onChange={(e) => handleSqftChange(Number(e.target.value))}
                        className="w-full p-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-zinc-900 text-sm font-black text-amber-700 dark:text-amber-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-zinc-400 mb-1">Quality Tier</label>
                    <select
                      value={calcTier}
                      onChange={(e) => handleTierChange(e.target.value as any)}
                      className="w-full p-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-bold text-gray-900 dark:text-white"
                    >
                      <option value="Standard">Standard — Jaquar / Hindware</option>
                      <option value="Premium">Premium — Kohler / Grohe</option>
                      <option value="Luxury">Luxury — Hansgrohe / Toto</option>
                    </select>
                  </div>

                  {/* Approximate Total Budget Result Box */}
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2 shadow-xs">
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 block">
                        Approximate Total Budget
                      </span>
                      <span className="text-base sm:text-lg font-black text-amber-900 dark:text-amber-300 font-mono whitespace-nowrap">
                        {calcResult?.formattedBudget || activeModalDesign.formatted_budget}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-gray-500 dark:text-zinc-400 shrink-0 whitespace-nowrap">
                      {calcResult?.ratePerUnit || activeModalDesign.rate_per_unit || '₹2,450 / sq ft'}
                    </span>
                  </div>
                </div>

                  {/* Key Specs Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800">
                      <span className="text-gray-400 block font-semibold">Dimensions</span>
                      <span className="font-bold text-gray-800 dark:text-zinc-200 text-sm">{activeModalDesign.dimensions}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800">
                      <span className="text-gray-400 block font-semibold">Partition</span>
                      <span className="font-bold text-gray-800 dark:text-zinc-200 line-clamp-1">{activeModalDesign.partition_type}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800">
                      <span className="text-gray-400 block font-semibold">Vanity Style</span>
                      <span className="font-bold text-gray-800 dark:text-zinc-200 line-clamp-1">{activeModalDesign.vanity_type}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800">
                      <span className="text-gray-400 block font-semibold">CP Fittings</span>
                      <span className="font-bold text-gray-800 dark:text-zinc-200 line-clamp-1">{activeModalDesign.fittings_brand}</span>
                    </div>
                  </div>

                  {/* Tile Concept Details */}
                  <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 space-y-1">
                    <p className="text-[11px] font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wide">
                      <i className="fas fa-layer-group mr-1.5"></i> Tile Concept &amp; Wall Dado
                    </p>
                    <p className="text-xs text-gray-700 dark:text-zinc-300 font-medium leading-relaxed">
                      {activeModalDesign.tile_concept}
                    </p>
                  </div>

                  {/* Features Badges */}
                  {activeModalDesign.features && activeModalDesign.features.length > 0 && (
                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                        Included Features &amp; Hardware:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeModalDesign.features.map((feat, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300"
                          >
                            <i className="fas fa-check text-emerald-500 text-[10px] mr-1.5"></i>
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Small Gray Disclaimer */}
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/60 dark:border-zinc-800/80 text-[11px] text-gray-500 dark:text-zinc-400 leading-relaxed flex items-start gap-2">
                    <i className="fas fa-info-circle text-gray-400 dark:text-zinc-500 mt-0.5 shrink-0 text-xs"></i>
                    <span>
                      <strong className="font-semibold text-gray-600 dark:text-zinc-300">Disclaimer:</strong> Cost and estimation are given approximate only. Actual cost might increase as per the site measurements, current market price on materials and labour charges. In images, few elements were added to enhance the interior design presentation; those are not part of the standard estimation.
                    </span>
                  </div>
                </div>

                {/* Deep-link CTA to India Calculator */}
                <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 space-y-2">
                  <button
                    onClick={() => handleOpenCalculator(activeModalDesign)}
                    className="w-full py-3.5 rounded-xl bg-[#c5a059] hover:bg-[#b38e47] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <i className="fas fa-calculator"></i>
                    <span>Customize in India Bathroom Calculator</span>
                    <i className="fas fa-arrow-right text-xs"></i>
                  </button>
                  <p className="text-[11px] text-center text-gray-400">
                    Open India Interior Calculator to calculate based on your exact city rates and dimensions.
                  </p>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
