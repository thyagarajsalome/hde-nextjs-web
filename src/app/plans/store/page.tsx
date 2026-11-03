"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  HousePlanRecord,
  HousePlanStoreService,
} from '@/services/housePlanStoreService';
import { useUser } from '@/context/UserContext';
import { WatermarkedPlanViewer } from '@/components/plans/WatermarkedPlanViewer';
import { PlanTradeCostCalculator } from '@/components/plans/PlanTradeCostCalculator';
import { openRazorpayCheckout } from '@/lib/razorpayClient';
import {
  ArchitecturalPlansFilter,
  ArchitecturalFilterState,
  INITIAL_ARCHITECTURAL_FILTER_STATE,
  matchesArchitecturalPlanFilter,
} from '@/components/plans/ArchitecturalPlansFilter';

/**
 * Interactive 4:3 Architectural Blueprint Thumbnail with Generous Height & Cursor-Tracked Pan & Zoom
 */
const PlanCardThumbnail: React.FC<{
  plan: HousePlanRecord;
  onClick: () => void;
}> = ({ plan, onClick }) => {
  const [zoomOrigin, setZoomOrigin] = useState<{ x: number; y: number } | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomOrigin({ x, y });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setZoomOrigin(null);
  };

  const imageUrl = plan.file_url?.startsWith('http')
    ? plan.file_url
    : plan.file_url?.startsWith('pdf-plans/')
      ? `https://pub-b20d9352722b43219ceb523a3a0c89d5.r2.dev/${plan.file_url.replace(/^\/+/, '')}`
      : `https://pub-b20d9352722b43219ceb523a3a0c89d5.r2.dev/pdf-plans/${plan.file_url?.replace(/^\/+/, '')}`;

  const isPdf = plan.file_url?.toLowerCase().endsWith('.pdf');

  return (
    <div
      className="relative aspect-[4/3] min-h-[240px] sm:min-h-[265px] bg-white dark:bg-zinc-900 overflow-hidden cursor-crosshair border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-center select-none"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isPdf ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#0f2042] text-amber-200 p-6 text-center">
          <i className="fas fa-file-pdf text-rose-500 text-4xl mb-3"></i>
          <span className="text-xs font-bold text-white line-clamp-1 px-2">{plan.title}</span>
          <span className="text-[10px] uppercase tracking-wider font-bold text-amber-300 mt-1 bg-white/10 px-2 py-0.5 rounded">
            Vector PDF Blueprint
          </span>
        </div>
      ) : (
        <img
          src={imageUrl}
          alt={plan.title}
          className="w-full h-full object-contain p-2 pointer-events-none will-change-transform"
          loading="lazy"
          style={{
            transformOrigin: zoomOrigin ? `${zoomOrigin.x}% ${zoomOrigin.y}%` : 'center center',
            transform: zoomOrigin ? 'scale(2.2)' : 'scale(1)',
            transition: zoomOrigin ? 'transform 0.08s ease-out' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        />
      )}

      {/* Top Badges (Subtle opacity reduction on hover so drawing is unobstructed) */}
      <div
        className={`absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none transition-opacity duration-200 ${
          isHovered ? 'opacity-35' : 'opacity-100'
        }`}
      >
        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-[#0f2042]/90 text-white shadow-xs">
          {plan.dimensions} Plot
        </span>

        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/90 text-[#0f2042] border border-slate-200/90 shadow-xs flex items-center gap-1">
          <i className="fas fa-compass text-[9px] text-[#c5a059]"></i>
          {plan.facing}
        </span>
      </div>

      {/* Dynamic Hover Inspection Pill */}
      {isHovered && (
        <div className="absolute top-2.5 inset-x-0 flex justify-center pointer-events-none z-20 animate-fadeIn">
          <div className="bg-[#0f2042]/90 text-[#c5a059] px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide shadow-md backdrop-blur-xs flex items-center gap-1.5 border border-[#c5a059]/40">
            <i className="fas fa-magnifying-glass-plus text-[9px] animate-pulse"></i>
            <span>Move cursor to pan rooms • Click to expand</span>
          </div>
        </div>
      )}

      {/* Bottom subtle bar */}
      <div
        className={`absolute bottom-0 inset-x-0 px-2.5 py-1 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent flex items-center justify-between text-white text-[10px] transition-opacity duration-200 ${
          isHovered ? 'opacity-90' : 'opacity-100'
        }`}
      >
        <span className="font-semibold">
          {plan.floors || 'G+1'} • {plan.bedrooms} BHK
        </span>
        <span className="text-amber-300 font-bold flex items-center gap-1">
          <i className="fas fa-expand text-[9px]"></i> Click to Expand
        </span>
      </div>
    </div>
  );
};

export default function HousePlanDrawingStorePage() {
  const { user, hasPaid, planTier, isDeveloper } = useUser();
  const isAdmin = Boolean(user && user.email?.toLowerCase() === 'thyagaraja1983@gmail.com');
  const [plans, setPlans] = useState<HousePlanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States (Universal Architectural Filter State)
  const [filters, setFilters] = useState<ArchitecturalFilterState>(INITIAL_ARCHITECTURAL_FILTER_STATE);

  // Selected Plan Modal State
  const [activePlan, setActivePlan] = useState<HousePlanRecord | null>(null);

  // Purchased Plans Tracker (local storage fallback for standalone ₹499 purchases)
  const [purchasedPlanIds, setPurchasedPlanIds] = useState<string[]>([]);
  const [checkoutInProgress, setCheckoutInProgress] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('hde_purchased_plan_ids');
      if (stored) {
        setPurchasedPlanIds(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      // Do not show default mock plans with no PDF files attached. Only load real uploaded plans from Supabase.
      const realPlans = await HousePlanStoreService.getAllPlans({ activeOnly: true, includeFallbacks: false });
      setPlans(realPlans);
    } catch (err) {
      console.error('Failed to load store plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      localStorage.removeItem('hde_custom_house_plans');
    } catch {}
    loadPlans();
  }, []);

  const handleAdminDeletePlan = async (plan: HousePlanRecord) => {
    if (!window.confirm(`⚠️ Permanently delete plan "${plan.title}" from Supabase database AND Cloudflare R2 storage?`)) return;
    try {
      const res = await HousePlanStoreService.deletePlan(plan.id, {
        file_url: plan.file_url,
        pdf_url: plan.pdf_url,
      });
      if (!res.success) throw new Error(res.error || 'Failed to delete plan');
      setPlans((prev) => prev.filter((p) => p.id !== plan.id));
      alert(`Plan "${plan.title}" deleted permanently from database and Cloudflare storage.`);
    } catch (err: any) {
      alert(`Deletion error: ${err.message}`);
    }
  };

  // Determine if a plan is unlocked for current visitor
  const isPlanUnlocked = (planId: string) => {
    // 1. Pro / Paid / Developer members are ALWAYS unlocked
    if (isDeveloper || hasPaid || planTier === 'pro') return true;

    // 2. Standalone purchase of this specific plan
    if (purchasedPlanIds.includes(planId)) return true;

    // 3. Fallback dev access check
    if (typeof window !== 'undefined') {
      if (
        window.localStorage.getItem('hde_developer_mode') === 'true' ||
        window.localStorage.getItem('hde_user_has_paid') === 'true'
      ) {
        return true;
      }
    }

    return false;
  };

  // Launch Razorpay ₹499 checkout for a specific drawing pack
  const handlePurchasePlan = (plan: HousePlanRecord) => {
    if (isPlanUnlocked(plan.id)) return;

    setCheckoutInProgress(true);
    const price = plan.price_inr || 499;

    openRazorpayCheckout({
      amountInRupees: price,
      itemName: `${plan.dimensions} Architectural Working Drawings`,
      description: `Complete Vector PDF Blueprint + Structural Grid (${plan.title})`,
      prefill: {
        name: user?.user_metadata?.full_name || '',
        email: user?.email || '',
      },
      onSuccess: (paymentId) => {
        setCheckoutInProgress(false);
        const updated = [...purchasedPlanIds, plan.id];
        setPurchasedPlanIds(updated);
        try {
          localStorage.setItem('hde_purchased_plan_ids', JSON.stringify(updated));
        } catch {}
        alert(`Payment Successful! (Ref: ${paymentId})\nYour high-resolution vector PDF blueprint is now unlocked.`);
      },
      onFailure: (err) => {
        setCheckoutInProgress(false);
        if (err?.message !== 'Payment dismissed by user') {
          alert('Payment could not be completed. Please try again.');
        }
      },
    });
  };

  // Filtered Plans List using shared architectural matcher
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => matchesArchitecturalPlanFilter(plan, filters));
  }, [plans, filters]);

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-zinc-950">
      {/* SEO Discovery Header */}
      <section className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 py-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3.5 py-1.5 rounded-full inline-block">
              📐 300 DPI Vector PDF Working Drawings
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
              Architectural PDF Plans &amp; Blueprints
            </h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-zinc-400 leading-relaxed">
              Download high-resolution 300 DPI vector PDF architectural blueprints, municipal sanction drawings, and 2D floor plans with structural setbacks, electrical schedules, and bill of quantities for Indian plots.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/plans"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0f2042] text-amber-300 hover:bg-[#1a3260] text-xs font-bold shadow-xs transition no-underline border border-amber-300/30"
              >
                <i className="fas fa-images text-amber-400"></i>
                <span>Browse Free House Plans Gallery (100+ Concepts)</span>
                <i className="fas fa-arrow-right text-[10px]"></i>
              </Link>
              {isAdmin && (
                <Link
                  href="/admin/plans"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-100/90 hover:bg-amber-200 text-[#0f2042] text-xs font-bold shadow-xs transition no-underline border border-amber-300"
                >
                  <i className="fas fa-cloud-arrow-up text-amber-700"></i>
                  <span>Upload PDF Plans (Admin)</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Universal Architectural Plans Filter (Zero-Redundancy Component) */}
        <ArchitecturalPlansFilter
          filters={filters}
          onFilterChange={(updates) => setFilters((prev) => ({ ...prev, ...updates }))}
          onResetFilters={() => setFilters(INITIAL_ARCHITECTURAL_FILTER_STATE)}
          onSetSpecificFilter={(area, facing, dim = 'all') => {
            setFilters({
              areaFilter: area,
              facingFilter: facing,
              dimensionFilter: dim,
              bhkFilter: 'all',
              searchQuery: '',
            });
          }}
          totalCount={filteredPlans.length}
          itemLabel={filteredPlans.length === 1 ? 'available pdf-plan' : 'available pdf-plans'}
          title="Filter Architectural PDF Plans"
          subtitle="Filter vector blueprints by exact plot size, entrance facing, dimensions, and BHK."
        />

        {/* Blueprint Cards Grid */}
        {loading ? (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <i className="fas fa-circle-notch fa-spin text-3xl text-blue-600"></i>
            <p className="text-xs font-bold">Loading architectural blueprints...</p>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-zinc-800 space-y-3">
            <i className="fas fa-drafting-compass text-4xl text-slate-300 dark:text-zinc-700"></i>
            <h3 className="text-base font-bold text-slate-700 dark:text-zinc-300">
              No drawing plans match your active filters
            </h3>
            <p className="text-xs text-slate-400">
              Try choosing "All Dimensions" or "All Directions" to view available architectural layouts.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => {
              const unlocked = isPlanUnlocked(plan.id);
              const builtUp = plan.built_up_area_sqft || plan.area_sqft;
              const carpet = plan.carpet_area_sqft || Math.round((plan.area_sqft || 1200) * 0.75);
              const electricalPts = plan.electrical_points_count || 45;
              const price = plan.price_inr || 499;

              return (
                <div
                  key={plan.id}
                  className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Interactive 16:9 Architectural Blueprint Thumbnail with Pan-Zoom on Hover */}
                  <PlanCardThumbnail
                    plan={plan}
                    onClick={() => setActivePlan(plan)}
                  />

                  {/* Body Content - Compact, crisp, highlighted around the plan */}
                  <div className="p-3.5 sm:p-4 flex-grow flex flex-col justify-between space-y-2.5">
                    <div className="space-y-1">
                      <h3
                        onClick={() => setActivePlan(plan)}
                        title={plan.title}
                        className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-100 hover:text-blue-700 transition cursor-pointer line-clamp-1"
                      >
                        {plan.title}
                      </h3>

                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2 leading-tight">
                        {plan.description}
                      </p>
                    </div>

                    {/* Spatial Metrics Pills */}
                    <div className="grid grid-cols-3 gap-1 text-center bg-slate-50 dark:bg-zinc-800/40 p-1.5 rounded-lg border border-slate-100 dark:border-zinc-800">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Built-Up</span>
                        <span className="text-[11px] font-bold text-slate-750 dark:text-zinc-200">
                          {builtUp} <span className="text-[8px] font-normal text-slate-400">sq.ft</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Carpet</span>
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          {carpet} <span className="text-[8px] font-normal text-slate-400">sq.ft</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Points</span>
                        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                          ~{electricalPts}
                        </span>
                      </div>
                    </div>

                    {/* Solar Directional Alignment */}
                    <div className="text-[10px] font-medium text-slate-600 dark:text-zinc-400 flex items-center gap-1.5 bg-amber-50/60 dark:bg-amber-950/20 px-2 py-0.5 rounded border border-amber-200/60 dark:border-amber-900/30">
                      <i className="fas fa-sun text-amber-500 text-[10px] shrink-0"></i>
                      <span className="truncate">
                        {plan.facing}-Facing Directional Solar Alignment
                      </span>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">PDF PLAN</span>
                        <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-zinc-100">
                          {unlocked ? (
                            <span className="text-emerald-600 dark:text-emerald-400 text-[10px] uppercase tracking-wider font-bold">
                              ✓ Unlocked
                            </span>
                          ) : (
                            <>
                              ₹{price}{' '}
                              <span className="text-[9px] font-normal text-slate-400 line-through">₹1,499</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAdminDeletePlan(plan);
                            }}
                            className="p-2 text-xs font-bold rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 transition cursor-pointer"
                            title="Delete plan permanently from Supabase & Cloudflare storage"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setActivePlan(plan)}
                          className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition cursor-pointer"
                        >
                          Cost &amp; Preview
                        </button>

                        {unlocked ? (
                          <button
                            type="button"
                            onClick={() => setActivePlan(plan)}
                            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <i className="fas fa-file-pdf"></i>
                            Download
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handlePurchasePlan(plan)}
                            disabled={checkoutInProgress}
                            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-900/20 transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <i className="fas fa-lock-open text-[11px]"></i>
                            Unlock ₹{price}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Plan Details & Watermark Modal */}
      {activePlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-2xl space-y-3 sm:space-y-4 max-h-[94vh] overflow-y-auto border border-slate-200 dark:border-zinc-800 animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200 dark:border-zinc-800">
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {activePlan.dimensions} Blueprint Pack
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    {activePlan.floors || 'G+1'} Structure
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 mt-1 truncate">
                  {activePlan.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setActivePlan(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer shrink-0"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </div>

            {/* In-Browser Watermarked Blueprint Viewer */}
            <WatermarkedPlanViewer
              imageUrl={activePlan.file_url}
              pdfUrl={activePlan.pdf_url}
              title={activePlan.title}
              isUnlocked={isPlanUnlocked(activePlan.id)}
              priceInr={activePlan.price_inr || 499}
              onUnlockClick={() => handlePurchasePlan(activePlan)}
            />

            {/* Turnkey Trade Budget & Spatial Area Breakdown Engine */}
            <PlanTradeCostCalculator plan={activePlan} />

            {/* Architectural Description */}
            {activePlan.description && (
              <div className="bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-slate-200/60 dark:border-zinc-800 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Architectural Specifications &amp; Notes
                </span>
                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {activePlan.description}
                </p>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-200 dark:border-zinc-800">
              <div className="text-xs text-slate-500 dark:text-zinc-400">
                <span>Need modifications? </span>
                <Link
                  href={`/calculator?area=${activePlan.area_sqft}&floors=${encodeURIComponent(activePlan.floors || 'G+1')}&facing=${encodeURIComponent(activePlan.facing || 'East')}`}
                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                >
                  Customize in Construction Calculator →
                </Link>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setActivePlan(null)}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition"
                >
                  Close
                </button>

                {isPlanUnlocked(activePlan.id) ? (
                  <button
                    type="button"
                    onClick={() => {
                      const url = activePlan.pdf_url || activePlan.file_url;
                      if (url) {
                        const target = url.startsWith('http')
                          ? url
                          : url.startsWith('house-plans/')
                            ? `https://pub-b20d9352722b43219ceb523a3a0c89d5.r2.dev/${url.replace(/^\/+/, '')}`
                            : `https://pub-b20d9352722b43219ceb523a3a0c89d5.r2.dev/house-plans/${url.replace(/^\/+/, '')}`;
                        window.open(target, '_blank');
                      }
                    }}
                    className="px-4 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <i className="fas fa-file-pdf text-[11px]"></i>
                    <span>Download Clean PDF</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handlePurchasePlan(activePlan)}
                    disabled={checkoutInProgress}
                    className="px-4 py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <i className="fas fa-lock-open text-[11px]"></i>
                    <span>Unlock Vector PDF (₹{activePlan.price_inr || 499})</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
