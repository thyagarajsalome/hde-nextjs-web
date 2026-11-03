import React, { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import CalculatorFeature from "@/components/layout/CalculatorFeature";

export const metadata: Metadata = {
  title: "House Construction Cost Calculator (2026) | Material & Budget Estimator | HDE",
  description: "Calculate house construction costs, material quantities (cement, steel, sand, bricks), interior design budgets, and home loan EMIs with accurate 2026 Indian market rates.",
  keywords: "construction cost calculator, house building estimate india, materials quantity calculator, cement steel calculator, home loan emi calculator, 1500 sqft house construction cost",
  alternates: {
    canonical: "https://www.homedesignenglish.com/calculator",
  },
  openGraph: {
    title: "House Construction Cost Calculator (2026) | HDE",
    description: "Accurate Indian construction and interior cost calculator with bill of quantities.",
    url: "https://www.homedesignenglish.com/calculator",
    siteName: "Home Design English (HDE)",
    locale: "en_IN",
    type: "website",
  },
};

export default function CalculatorRoute() {
  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-zinc-950">
      {/* SEO Discovery Header */}
      <section className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 py-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3.5 py-1.5 rounded-full inline-block">
              🏗️ 2026 Construction Cost Estimator
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
              House Construction Cost Calculator
            </h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-zinc-400 leading-relaxed">
              Calculate turnkey building budgets, cement/steel material quantities, and trade breakdowns based on current CPWD schedule of rates.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/plans/store"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0f2042] text-amber-300 hover:bg-[#1a3260] text-xs font-bold shadow-xs transition no-underline border border-amber-300/30"
              >
                <i className="fas fa-file-pdf text-rose-400"></i>
                <span>Browse Vector PDF Architectural Blueprints</span>
                <i className="fas fa-arrow-right text-[10px]"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Calculator Engine */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Suspense fallback={<div className="p-16 text-center text-xs font-bold text-gray-400">Loading Construction Calculator...</div>}>
          <CalculatorFeature />
        </Suspense>
      </div>
    </div>
  );
}
