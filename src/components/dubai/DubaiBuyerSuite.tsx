"use client";

import React, { useState } from "react";
import DubaiPropertyCalculatorClient from "@/components/dubai/DubaiPropertyCalculatorClient";
import DubaiLeadForm from "@/components/dubai/DubaiLeadForm";

interface DubaiBuyerSuiteProps {
  initialTab?: "calculator" | "consultation";
}

export default function DubaiBuyerSuite({
  initialTab = "calculator",
}: DubaiBuyerSuiteProps) {
  const [activeTab, setActiveTab] = useState<"calculator" | "consultation">(initialTab);

  return (
    <div id="tools" className="w-full scroll-mt-16">
      {/* Tab Navigation Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-slate-100 dark:bg-zinc-800/80 p-1.5 rounded-2xl flex items-center justify-between border border-gray-200 dark:border-zinc-700 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab("calculator")}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
              activeTab === "calculator"
                ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-md ring-1 ring-black/5 dark:ring-white/10"
                : "text-gray-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-white/40"
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
              activeTab === "calculator" ? "bg-primary/10 text-primary" : "bg-gray-200 dark:bg-zinc-700 text-gray-500"
            }`}>
              <i className="fas fa-calculator"></i>
            </div>
            <div className="text-left">
              <span className="block leading-tight font-extrabold">Buying Cost Calculator</span>
              <span className="block text-[11px] font-normal text-gray-500 dark:text-zinc-400">DLD 4%, Mortgage &amp; Cash Needs</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("consultation")}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
              activeTab === "consultation"
                ? "bg-white dark:bg-zinc-900 text-[#0f2042] dark:text-zinc-100 shadow-md ring-1 ring-black/5 dark:ring-white/10"
                : "text-gray-600 dark:text-zinc-400 hover:text-[#0f2042] dark:hover:text-zinc-200 hover:bg-white/40"
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
              activeTab === "consultation" ? "bg-[#0f2042]/10 text-[#0f2042] dark:text-[#c5a059]" : "bg-gray-200 dark:bg-zinc-700 text-gray-500"
            }`}>
              <i className="fas fa-user-shield"></i>
            </div>
            <div className="text-left">
              <span className="block leading-tight font-extrabold">Verified Expert Advisory</span>
              <span className="block text-[11px] font-normal text-gray-500 dark:text-zinc-400">Free Consultation &amp; Launch Access</span>
            </div>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === "calculator" && (
        <div className="animate-fadeIn">
          <DubaiPropertyCalculatorClient 
            showTitle={false} 
            onConsultationClick={() => setActiveTab("consultation")} 
          />
        </div>
      )}

      {activeTab === "consultation" && (
        <div className="animate-fadeIn max-w-5xl mx-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 border border-gray-200 dark:border-zinc-800 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0f2042]/5 text-[#0f2042] dark:text-[#c5a059] font-extrabold text-xs tracking-wider uppercase border border-[#c5a059]/30">
                  <i className="fas fa-shield-alt text-[#c5a059]"></i>
                  <span>Zero Advisory Fees</span>
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-black text-[#0f2042] dark:text-zinc-100 tracking-tight leading-snug">
                  Get Matched With a Verified RERA Property Specialist
                </h2>

                <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
                  Whether you are planning your first off-plan unit, seeking 5–9% rental yields, or acquiring a prime residential family residence, our certified specialists advise you with unbiased market data.
                </p>

                <div className="space-y-3.5 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                      <i className="fas fa-check"></i>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-200">First-Look Developer Allocations</h4>
                      <p className="text-[11px] text-gray-500 dark:text-zinc-400">Direct developer allocations before global public launch.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                      <i className="fas fa-check"></i>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-200">RERA Escrow &amp; Milestone Protection</h4>
                      <p className="text-[11px] text-gray-500 dark:text-zinc-400">Guidance on verified escrow account banking and construction audit compliance.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                      <i className="fas fa-check"></i>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-200">Global Cross-Border Remittance Help</h4>
                      <p className="text-[11px] text-gray-500 dark:text-zinc-400">Compliant bank wire transfers from India (RBI LRS), UK, EU, and Americas.</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-gray-100 dark:border-zinc-800 text-xs text-gray-500">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200 font-bold mb-1">
                    <i className="fas fa-info-circle text-primary"></i>
                    <span>Need to run numbers first?</span>
                  </div>
                  <span>Switch back to the </span>
                  <button 
                    type="button" 
                    onClick={() => setActiveTab("calculator")} 
                    className="text-primary hover:underline font-bold"
                  >
                    Buying Cost Calculator
                  </button>
                  <span> to customize your unit budget, DLD fees, and down payment.</span>
                </div>
              </div>

              <div className="lg:col-span-7">
                <DubaiLeadForm source="Dubai Main Hub - Unified Advisory Tab" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
