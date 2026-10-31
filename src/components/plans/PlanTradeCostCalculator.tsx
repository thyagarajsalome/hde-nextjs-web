"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { getHousePlanTradeBreakdown } from '@/utils/calculatorEngines';
import { HousePlanRecord } from '@/services/housePlanStoreService';

interface PlanTradeCostCalculatorProps {
  plan: HousePlanRecord;
  className?: string;
}

export const PlanTradeCostCalculator: React.FC<PlanTradeCostCalculatorProps> = ({
  plan,
  className = "",
}) => {
  const breakdown = useMemo(() => {
    return getHousePlanTradeBreakdown(
      plan.area_sqft || 1200,
      plan.floors || "G+1",
      plan.bedrooms || 3,
      plan.bathrooms || 3,
      plan.dimensions || "30x40"
    );
  }, [plan.area_sqft, plan.floors, plan.bedrooms, plan.bathrooms, plan.dimensions]);

  const builtUpArea = plan.built_up_area_sqft || breakdown.builtUpAreaSqft;
  const carpetArea = plan.carpet_area_sqft || breakdown.carpetAreaSqft;
  const livingHallSqft = plan.living_hall_sqft || Math.round(carpetArea * 0.22);
  const kitchenSqft = plan.kitchen_sqft || Math.round(carpetArea * 0.10);
  const electricalPoints = plan.electrical_points_count || Math.round((plan.bedrooms || 3) * 12 + (plan.bathrooms || 3) * 4 + 18);

  // 20-Year Home Loan EMI calculation (80% loan @ 8.5% p.a. for 240 months)
  const monthlyEmiFormatted = useMemo(() => {
    const loan = breakdown.totalTurnkeyCost * 0.8;
    const r = 8.5 / 12 / 100;
    const n = 240;
    const emi = Math.round((loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    return `₹${emi.toLocaleString('en-IN')}`;
  }, [breakdown.totalTurnkeyCost]);

  const orientationText = plan.orientation_notes || `${plan.facing || 'East'}-Facing Solar & Cross-Ventilation Alignment`;

  return (
    <div className={`bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xs space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-zinc-800">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-full">
            🇮🇳 Architectural Spatial &amp; Turnkey Cost Engine
          </span>
          <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100 mt-2">
            Integrated Trade Budget &amp; Area Breakdown
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Calculated based on current CPWD &amp; Indian market schedule of rates for {plan.dimensions} ({plan.floors})
          </p>
        </div>

        <Link
          href={`/calculator?area=${plan.area_sqft}&floors=${encodeURIComponent(plan.floors || 'G+1')}&facing=${encodeURIComponent(plan.facing || 'East')}`}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-[#0f2042] bg-amber-100/80 hover:bg-amber-200/90 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/50 transition border border-amber-200 dark:border-amber-800/60 shrink-0 self-start sm:self-center"
        >
          <i className="fas fa-sliders text-amber-600 dark:text-amber-400"></i>
          <span>Fine-tune in Calculator</span>
        </Link>
      </div>

      {/* Spatial Blueprint Metrics (Living Hall, Kitchen, Carpet, Built-up, Points) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Plot Area</span>
          <span className="text-base font-black text-slate-800 dark:text-zinc-100">
            {plan.area_sqft} <span className="text-[11px] font-normal text-slate-500">sq.ft</span>
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">({plan.dimensions})</span>
        </div>

        <div className="bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Built-Up Area</span>
          <span className="text-base font-black text-blue-600 dark:text-blue-400">
            {builtUpArea} <span className="text-[11px] font-normal text-slate-500">sq.ft</span>
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">{plan.floors || 'G+1'} Structure</span>
        </div>

        <div className="bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Carpet Area</span>
          <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
            {carpetArea} <span className="text-[11px] font-normal text-slate-500">sq.ft</span>
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">~75% Usable</span>
        </div>

        <div className="bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Living Hall</span>
          <span className="text-base font-black text-amber-600 dark:text-amber-400">
            ~{livingHallSqft} <span className="text-[11px] font-normal text-slate-500">sq.ft</span>
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Open Layout</span>
        </div>

        <div className="bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Modular Kitchen</span>
          <span className="text-base font-black text-purple-600 dark:text-purple-400">
            ~{kitchenSqft} <span className="text-[11px] font-normal text-slate-500">sq.ft</span>
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">+ Utility Wash</span>
        </div>

        <div className="bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Electrical Points</span>
          <span className="text-base font-black text-rose-600 dark:text-rose-400">
            ~{electricalPoints} <span className="text-[11px] font-normal text-slate-500">Points</span>
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">IS-732 Norm</span>
        </div>
      </div>

      {/* Directional Alignment Badge */}
      <div className="p-3 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 rounded-xl flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
          <i className="fas fa-compass text-sm"></i>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 block">
            Directional Orientation &amp; Micro-Climate Alignment
          </span>
          <p className="text-xs text-slate-600 dark:text-zinc-300">
            {orientationText}
          </p>
        </div>
      </div>

      {/* Trade-by-Trade Cost Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Trade-by-Trade Budget Breakdown
          </h4>
          <span className="text-xs font-bold text-slate-600 dark:text-zinc-300">
            Total Turnkey: <span className="text-blue-600 dark:text-blue-400 font-black text-sm">₹{breakdown.totalTurnkeyCostLakhs} Lakhs</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {breakdown.tradeList.map((trade) => (
            <div
              key={trade.id}
              className="p-3 rounded-xl bg-slate-50/70 dark:bg-zinc-800/40 border border-slate-200/50 dark:border-zinc-800/80 hover:border-blue-300 dark:hover:border-blue-700/60 transition flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white dark:bg-zinc-700 shadow-xs border border-slate-200 dark:border-zinc-600 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <i className={`${trade.icon} text-sm`}></i>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                    {trade.name}
                  </h5>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-400 line-clamp-1 max-w-[200px] sm:max-w-[240px]">
                    {trade.specs}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-black text-slate-900 dark:text-zinc-100 block">
                  {trade.costFormatted}
                </span>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-200/60 dark:bg-zinc-700 px-1.5 py-0.5 rounded">
                  {trade.pctOfTotal}% of total
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Turnkey Summary & 20-Year EMI Callout */}
      <div className="p-4 bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-blue-300 block">
            Estimated Complete Construction Budget
          </span>
          <div className="text-2xl font-black mt-0.5">
            ₹{breakdown.totalTurnkeyCostLakhs} Lakhs
            <span className="text-xs font-normal text-blue-200 ml-2">
              (~₹{Math.round(breakdown.totalTurnkeyCost / builtUpArea).toLocaleString('en-IN')}/sq.ft built-up)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/10 px-4 py-2.5 rounded-lg border border-white/10">
          <div>
            <span className="text-[10px] text-slate-300 block uppercase font-bold tracking-wider">
              20-Yr Home Loan EMI
            </span>
            <span className="text-base font-black text-amber-300">
              {monthlyEmiFormatted}/mo
            </span>
          </div>
          <span className="text-[10px] text-slate-300 font-mono">
            @ 8.5% p.a.
          </span>
        </div>
      </div>
    </div>
  );
};
