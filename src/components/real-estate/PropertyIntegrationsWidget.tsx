// src/components/real-estate/PropertyIntegrationsWidget.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RealEstateProperty } from "@/types/realEstate";
import {
  getMatchingPlanForPlot,
  calculatePlotConstruction,
  calculateMonthlyEMI,
  calculateKarnatakaRegistration,
  calculateApproxInteriorCost,
  formatINRCompact,
} from "@/utils/realEstateFlow";

interface PropertyIntegrationsWidgetProps {
  property: RealEstateProperty;
}

export default function PropertyIntegrationsWidget({
  property,
}: PropertyIntegrationsWidgetProps) {
  const isPlot = property.category === "plot";
  const [showGovtBreakdown, setShowGovtBreakdown] = useState(false);

  // 1. PLOT DATA FLOW
  if (isPlot) {
    const plan = getMatchingPlanForPlot(property.plot_area_sqft);
    const construction = calculatePlotConstruction(property.plot_area_sqft);
    const totalProjectCost = property.price + construction.standardCost;
    const loanPrincipal = Math.round(totalProjectCost * 0.8);
    const compositeMonthlyEMI = calculateMonthlyEMI(loanPrincipal, 8.5, 20);

    return (
      <section className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200/80 shadow-xs space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-[#4165AF] border border-[#4165AF]/20 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
              <i className="fas fa-layer-group text-[10px]"></i>
              <span>Plot Development &amp; Construction Advisor</span>
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-secondary mt-2">
              Turn this Site into Your Dream Home
            </h3>
            <p className="text-xs text-gray-500 max-w-xl mt-0.5">
              Seamlessly connected to architectural floor plans, construction material bills, and composite home loans.
            </p>
          </div>
          <div className="text-right shrink-0 bg-slate-50 px-3.5 py-2 rounded-xl border border-gray-100 hidden sm:block">
            <span className="text-[10px] text-gray-400 block font-semibold uppercase">Total Project Est.</span>
            <span className="text-base font-black text-[#4165AF]">{formatINRCompact(totalProjectCost)}</span>
          </div>
        </div>

        {/* 3 Action Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pillar 1: Matching Floor Plan */}
          <div className="bg-gradient-to-b from-blue-50/40 to-white rounded-xl p-4 border border-blue-100/80 flex flex-col justify-between hover:border-[#4165AF]/40 transition shadow-2xs">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#4165AF]/10 text-[#4165AF] flex items-center justify-center text-sm">
                <i className="fas fa-drafting-compass"></i>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Architectural Blueprint
                </span>
                <h4 className="text-sm font-bold text-gray-900 mt-0.5">
                  {plan.dimensions} Floor Plan
                </h4>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Ideal G+1 duplex blueprint with Vastu zoning and parking portico designed for a {property.plot_area_sqft || 1200} sq ft site.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-blue-100/60">
              <Link
                href={`/plans/${plan.slug}`}
                className="w-full py-2 px-3 rounded-lg bg-[#4165AF] hover:bg-[#355393] text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <span>Explore Blueprints</span>
                <i className="fas fa-arrow-right text-[10px]"></i>
              </Link>
            </div>
          </div>

          {/* Pillar 2: Construction Estimator */}
          <div className="bg-gradient-to-b from-amber-50/40 to-white rounded-xl p-4 border border-amber-100/80 flex flex-col justify-between hover:border-amber-300 transition shadow-2xs">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center text-sm">
                <i className="fas fa-calculator"></i>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Estimated Construction
                </span>
                <h4 className="text-sm font-bold text-gray-900 mt-0.5">
                  ~₹{construction.standardLakhs} Lakhs
                </h4>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Complete construction budget for ~{construction.recommendedBuiltUpSqft} sq ft built-up area at ₹2,200/sqft standard rate.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-amber-100/60">
              <Link
                href={`/?calc=construction&area=${construction.recommendedBuiltUpSqft}#tools`}
                className="w-full py-2 px-3 rounded-lg bg-[#c5a059] hover:bg-[#b38e47] text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <span>Customize BOM Bill</span>
                <i className="fas fa-arrow-right text-[10px]"></i>
              </Link>
            </div>
          </div>

          {/* Pillar 3: Composite Plot + House Loan */}
          <div className="bg-gradient-to-b from-emerald-50/40 to-white rounded-xl p-4 border border-emerald-100/80 flex flex-col justify-between hover:border-emerald-300 transition shadow-2xs">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-sm">
                <i className="fas fa-university"></i>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Composite Loan EMI
                </span>
                <h4 className="text-sm font-bold text-gray-900 mt-0.5">
                  ₹{compositeMonthlyEMI.toLocaleString("en-IN")}/mo
                </h4>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Bank loan covering 80% of plot ({formatINRCompact(property.price)}) + building ({formatINRCompact(construction.standardCost)}) @ 8.5% for 20 yrs.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-100/60">
              <Link
                href={`/?calc=india-emi&amount=${loanPrincipal}#tools`}
                className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <span>Calculate Loan EMI</span>
                <i className="fas fa-arrow-right text-[10px]"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 2. APARTMENT / VILLA / RESIDENTIAL DATA FLOW
  const loanPrincipal = Math.round(property.price * 0.8);
  const downPayment = Math.round(property.price * 0.2);
  const flatMonthlyEMI = calculateMonthlyEMI(loanPrincipal, 8.5, 20);
  const govtCharges = calculateKarnatakaRegistration(property.price);
  const interior = calculateApproxInteriorCost(property.bhk);

  return (
    <section className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200/80 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-[#4165AF] border border-[#4165AF]/20 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
            <i className="fas fa-shield-alt text-[10px]"></i>
            <span>Buyer Financial &amp; Move-In Toolkit</span>
          </span>
          <h3 className="text-lg sm:text-xl font-extrabold text-secondary mt-2">
            Smart Purchase &amp; Move-in Cost Planner
          </h3>
          <p className="text-xs text-gray-500 max-w-xl mt-0.5">
            Forecast your monthly EMI, government registration charges, and interior design budget before making an offer.
          </p>
        </div>
        <div className="text-right shrink-0 bg-slate-50 px-3.5 py-2 rounded-xl border border-gray-100 hidden sm:block">
          <span className="text-[10px] text-gray-400 block font-semibold uppercase">Est. Monthly EMI</span>
          <span className="text-base font-black text-[#4165AF]">₹{flatMonthlyEMI.toLocaleString("en-IN")}/mo</span>
        </div>
      </div>

      {/* 3 Action Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1: Instant EMI */}
        <div className="bg-gradient-to-b from-blue-50/40 to-white rounded-xl p-4 border border-blue-100/80 flex flex-col justify-between hover:border-[#4165AF]/40 transition shadow-2xs">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#4165AF]/10 text-[#4165AF] flex items-center justify-center text-sm">
              <i className="fas fa-calculator"></i>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Home Loan EMI (80% LTV)
              </span>
              <h4 className="text-sm font-bold text-gray-900 mt-0.5">
                ₹{flatMonthlyEMI.toLocaleString("en-IN")}/mo
              </h4>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Based on {formatINRCompact(downPayment)} (20%) down payment and {formatINRCompact(loanPrincipal)} loan at 8.5% for 20 years.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-blue-100/60">
            <Link
              href={`/?calc=india-emi&amount=${loanPrincipal}#tools`}
              className="w-full py-2 px-3 rounded-lg bg-[#4165AF] hover:bg-[#355393] text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <span>Customize EMI Schedule</span>
              <i className="fas fa-arrow-right text-[10px]"></i>
            </Link>
          </div>
        </div>

        {/* Pillar 2: Interior Design */}
        <div className="bg-gradient-to-b from-amber-50/40 to-white rounded-xl p-4 border border-amber-100/80 flex flex-col justify-between hover:border-amber-300 transition shadow-2xs">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center text-sm">
              <i className="fas fa-couch"></i>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Interior &amp; Modular Kitchen
              </span>
              <h4 className="text-sm font-bold text-gray-900 mt-0.5">
                ₹{interior.minLakhs} - ₹{interior.maxLakhs} Lakhs
              </h4>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Typical woodwork, modular kitchen with chimney, false ceiling, and wardrobes for a {property.bhk} unit.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-amber-100/60">
            <Link
              href={`/?calc=interior&bhk=${encodeURIComponent(property.bhk)}&area=${property.super_builtup_sqft || 1200}#tools`}
              className="w-full py-2 px-3 rounded-lg bg-[#c5a059] hover:bg-[#b38e47] text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <span>Estimate Interior Cost</span>
              <i className="fas fa-arrow-right text-[10px]"></i>
            </Link>
          </div>
        </div>

        {/* Pillar 3: Karnataka Stamp Duty & Registration */}
        <div className="bg-gradient-to-b from-slate-50 to-white rounded-xl p-4 border border-gray-200/80 flex flex-col justify-between hover:border-gray-300 transition shadow-2xs">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-slate-200/80 text-slate-700 flex items-center justify-center text-sm">
              <i className="fas fa-stamp"></i>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Karnataka Registration &amp; Tax
              </span>
              <h4 className="text-sm font-bold text-gray-900 mt-0.5">
                ~{formatINRCompact(govtCharges.totalGovtCharges)} ({govtCharges.effectivePercentage}%)
              </h4>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Mandatory government registration costs including 5% stamp duty, 1% registration fee, and statutory cess.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowGovtBreakdown(!showGovtBreakdown)}
              className="w-full py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{showGovtBreakdown ? "Hide Fee Details" : "View Fee Details"}</span>
              <i className={`fas fa-chevron-${showGovtBreakdown ? "up" : "down"} text-[10px]`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Karnataka Registration Breakdown */}
      {showGovtBreakdown && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2 animate-fadeIn">
          <div className="flex justify-between py-1 border-b border-gray-200/70">
            <span className="text-gray-600">Stamp Duty (5% on Market Value)</span>
            <span className="font-bold text-gray-800">₹{govtCharges.stampDuty.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-200/70">
            <span className="text-gray-600">Registration Fee (1%)</span>
            <span className="font-bold text-gray-800">₹{govtCharges.registrationFee.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-200/70">
            <span className="text-gray-600">Cess &amp; Surcharge (~10% on Stamp Duty)</span>
            <span className="font-bold text-gray-800">₹{govtCharges.cess.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between pt-1 font-extrabold text-[#4165AF]">
            <span>Total Government Charges</span>
            <span>₹{govtCharges.totalGovtCharges.toLocaleString("en-IN")}</span>
          </div>
        </div>
      )}
    </section>
  );
}
