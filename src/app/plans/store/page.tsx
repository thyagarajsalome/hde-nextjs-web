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

const POPULAR_DIMENSIONS = [
  { label: 'All Dimensions', value: 'all' },
  { label: '20×30 (600 Sq.ft)', value: '20x30' },
  { label: '30×40 (1,200 Sq.ft)', value: '30x40' },
  { label: '30×50 (1,500 Sq.ft)', value: '30x50' },
  { label: '40×60 (2,400 Sq.ft)', value: '40x60' },
];

const FACING_OPTIONS = [
  { label: 'All Directions', value: 'all' },
  { label: 'East-Facing (Morning Solar)', value: 'East' },
  { label: 'North-Facing (Diffused Daylighting)', value: 'North' },
  { label: 'West-Facing (Cross-Breeze)', value: 'West' },
  { label: 'South-Facing (Thermal Mass)', value: 'South' },
];

export default function HousePlanDrawingStorePage() {
  const { user, hasPaid, planTier, isDeveloper } = useUser();
  const [plans, setPlans] = useState<HousePlanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedDim, setSelectedDim] = useState('all');
  const [selectedFacing, setSelectedFacing] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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
      const data = await HousePlanStoreService.getAllPlans({ activeOnly: true });
      setPlans(data);
    } catch (err) {
      console.error('Failed to load store plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

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

  // Filtered Plans List
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      if (selectedDim !== 'all' && !plan.dimensions?.toLowerCase().includes(selectedDim.toLowerCase())) {
        return false;
      }
      if (selectedFacing !== 'all' && !plan.facing?.toLowerCase().includes(selectedFacing.toLowerCase())) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = plan.title?.toLowerCase().includes(q);
        const matchesDim = plan.dimensions?.toLowerCase().includes(q);
        const matchesDesc = plan.description?.toLowerCase().includes(q);
        const matchesFacing = plan.facing?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDim && !matchesDesc && !matchesFacing) return false;
      }
      return true;
    });
  }, [plans, selectedDim, selectedFacing, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Hero Header - Warm Light Cream Architectural Theme */}
      <section className="bg-gradient-to-b from-[#FFFDF9] via-[#FAF7F2] to-[#F5EFE6] text-slate-900 py-12 px-4 sm:px-6 lg:px-8 border-b border-[#E8DFC8]">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
              <Link href="/" className="hover:text-blue-600">
                Home
              </Link>
              <span>/</span>
              <Link href="/plans" className="hover:text-blue-600">
                House Plans
              </Link>
              <span>/</span>
              <span className="text-amber-800 font-bold">Drawing Store</span>
            </div>

            {/* Direct Link to Upload PDF Plans */}
            <Link
              href="/admin/plans"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-[#0f2042] hover:bg-blue-900 text-white shadow-sm transition border border-blue-900/40 w-fit"
            >
              <i className="fas fa-cloud-arrow-up text-amber-400"></i>
              <span>Upload PDF Plans (Admin) →</span>
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#0f2042]">
                Architectural House Plans
              </h1>
            </div>

            {/* Value Highlights */}
            <div className="bg-white/90 border border-[#E8DFC8] p-5 rounded-2xl shadow-sm backdrop-blur-md space-y-3 shrink-0 lg:max-w-xs w-full">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">
                Drawing Pack Highlights:
              </span>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <i className="fas fa-check-circle text-emerald-600 text-xs shrink-0"></i>
                  <span>300 DPI High-Res Vector PDF</span>
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-check-circle text-emerald-600 text-xs shrink-0"></i>
                  <span>Solar &amp; Cross-Ventilation Compliant</span>
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-check-circle text-emerald-600 text-xs shrink-0"></i>
                  <span>Room &amp; Electrical Points Schedule</span>
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-check-circle text-emerald-600 text-xs shrink-0"></i>
                  <span>Instant Download for ₹499 (or Free with Pro)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl p-5 border border-[#E8DFC8] shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-grow max-w-md">
              <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by plot size, BHK, facing direction..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedDim}
                onChange={(e) => setSelectedDim(e.target.value)}
                className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200"
              >
                {POPULAR_DIMENSIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedFacing}
                onChange={(e) => setSelectedFacing(e.target.value)}
                className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200"
              >
                {FACING_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>

              {(selectedDim !== 'all' || selectedFacing !== 'all' || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDim('all');
                    setSelectedFacing('all');
                    setSearchQuery('');
                  }}
                  className="text-xs font-bold text-rose-600 hover:underline px-2 py-1"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <span>
              Showing <strong className="text-blue-600 font-black">{filteredPlans.length}</strong> available drawing packs
            </span>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-slate-400">
                Cloudflare R2 Vector Storage
              </span>
              <Link
                href="/admin/plans"
                className="text-xs font-black text-[#0f2042] hover:text-blue-900 bg-amber-100/90 hover:bg-amber-200/90 px-3 py-1 rounded-lg border border-amber-300 flex items-center gap-1.5 shadow-2xs transition"
              >
                <i className="fas fa-plus text-amber-700 text-[10px]"></i>
                <span>Upload New PDF Plan</span>
              </Link>
            </div>
          </div>
        </div>

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
                  className="bg-white rounded-2xl border border-[#E8DFC8] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Thumbnail with Watermark Trigger */}
                  <div
                    className="relative aspect-[4/3] bg-slate-950 overflow-hidden cursor-pointer"
                    onClick={() => setActivePlan(plan)}
                  >
                    <img
                      src={
                        plan.file_url?.startsWith('http')
                          ? plan.file_url
                          : `https://pub-b20d9352722b43219ceb523a3a0c89d5.r2.dev/house-plans/${plan.file_url?.replace(/^\/+/, '')}`
                      }
                      alt={plan.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      loading="lazy"
                    />

                    {/* Watermark badge on thumbnail if locked */}
                    {!unlocked && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-3 pointer-events-none">
                        <div className="bg-black/70 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/20 text-center transform -rotate-12">
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 block">
                            HDE Watermarked Preview
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-black bg-blue-600/90 text-white backdrop-blur-md shadow-xs">
                        {plan.dimensions} Plot
                      </span>

                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-black/70 text-amber-300 border border-white/10 backdrop-blur-md flex items-center gap-1">
                        <i className="fas fa-compass text-[10px]"></i>
                        {plan.facing}
                      </span>
                    </div>

                    {/* Bottom Hover Overlay */}
                    <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between text-white text-xs opacity-90">
                      <span className="font-bold">
                        {plan.floors || 'G+1'} • {plan.bedrooms} BHK
                      </span>
                      <span className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
                        <i className="fas fa-eye text-[10px]"></i> View Details
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3
                        onClick={() => setActivePlan(plan)}
                        className="text-base font-black text-slate-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer line-clamp-2"
                      >
                        {plan.title}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    {/* Spatial Metrics Pills */}
                    <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 dark:bg-zinc-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Built-Up</span>
                        <span className="text-xs font-black text-slate-800 dark:text-zinc-200">
                          {builtUp} <span className="text-[9px] font-normal">sq.ft</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Carpet</span>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                          {carpet} <span className="text-[9px] font-normal">sq.ft</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Points</span>
                        <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                          ~{electricalPts}
                        </span>
                      </div>
                    </div>

                    {/* Orientation Badge */}
                    <div className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 flex items-center gap-1.5 bg-blue-50/50 dark:bg-blue-950/20 px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-900/30">
                      <i className="fas fa-sun text-amber-500 text-xs shrink-0"></i>
                      <span className="truncate">
                        {plan.facing}-Facing Directional Solar Alignment
                      </span>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Drawing Pack</span>
                        <div className="text-base font-black text-slate-900 dark:text-zinc-100">
                          {unlocked ? (
                            <span className="text-emerald-600 dark:text-emerald-400 text-xs uppercase tracking-wider font-bold">
                              ✓ Unlocked
                            </span>
                          ) : (
                            <>
                              ₹{price}{' '}
                              <span className="text-[10px] font-normal text-slate-400 line-through">₹1,499</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-5xl bg-[#FFFDF9] rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto border border-[#E8DFC8] animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full">
                    {activePlan.dimensions} Blueprint Pack
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400">
                    {activePlan.floors || 'G+1'} Structure
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 mt-1">
                  {activePlan.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setActivePlan(null)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-300 flex items-center justify-center transition cursor-pointer shrink-0"
              >
                <i className="fas fa-times text-sm"></i>
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

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setActivePlan(null)}
                  className="px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition"
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
                          : `https://pub-b20d9352722b43219ceb523a3a0c89d5.r2.dev/house-plans/${url.replace(/^\/+/, '')}`;
                        window.open(target, '_blank');
                      }
                    }}
                    className="px-5 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <i className="fas fa-file-pdf"></i>
                    Download Clean PDF
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handlePurchasePlan(activePlan)}
                    disabled={checkoutInProgress}
                    className="px-6 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md shadow-amber-950/20 transition flex items-center gap-2 cursor-pointer"
                  >
                    <i className="fas fa-unlock-alt"></i>
                    Unlock Vector PDF (₹{activePlan.price_inr || 499})
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
