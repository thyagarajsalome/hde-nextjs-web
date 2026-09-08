"use client";

import React from "react";
import Link from "next/link";
import DubaiPropertyCalculatorClient from "@/components/dubai/DubaiPropertyCalculatorClient";
import DubaiLeadForm from "@/components/dubai/DubaiLeadForm";

export default function DubaiPropertyCalculatorPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back to Hub Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/dubai-property"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <i className="fas fa-arrow-left text-xs"></i>
          <span>Back to Dubai Property Hub</span>
        </Link>
        <Link
          href="/dubai-property/partners"
          className="text-xs font-semibold text-gray-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
        >
          <span>Broker Partner Portal &rarr;</span>
        </Link>
      </div>

      {/* Main Calculator */}
      <DubaiPropertyCalculatorClient showTitle={true} />

      {/* Verified Expert Consultation */}
      <div id="connect-expert" className="mt-16 scroll-mt-20">
        <div className="bg-slate-50 dark:bg-zinc-900 p-8 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-black text-slate-900 dark:text-zinc-100">
              Ready to Discuss Properties with a Licensed Specialist?
            </h3>
            <p className="text-sm text-gray-600 dark:text-zinc-400 mt-2">
              Connect with verified RERA advisors for unit allocations, off-plan launches, and cross-border investment structuring. Zero advisory fees.
            </p>
          </div>
          <DubaiLeadForm source="Dubai Standalone Calculator Route" />
        </div>
      </div>
    </div>
  );
}

