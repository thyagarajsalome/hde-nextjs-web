// src/app/bangalore/disclaimer/page.tsx
import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Real Estate Disclaimer & RERA Notice | HDE Bangalore",
  description: "RERA compliance, safe harbor intermediary status, and buyer due diligence notice for Bangalore Real Estate.",
};

export default function BangaloreDisclaimerPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] py-12">
      <div className="container mx-auto px-4 max-w-4xl bg-white rounded-2xl p-8 sm:p-12 border border-gray-200/80 shadow-xs">
        <div className="mb-8 border-b border-gray-100 pb-6">
          <Link href="/bangalore/properties" className="text-primary hover:underline text-xs font-bold flex items-center gap-1.5 mb-2 no-underline">
            <i className="fas fa-arrow-left text-[10px]"></i>
            <span>Back to Bangalore Properties</span>
          </Link>
          <h1 className="text-3xl font-black text-secondary tracking-tight">
            Real Estate Intermediary &amp; RERA Disclaimer
          </h1>
          <p className="text-xs text-gray-400 mt-1">Information Technology Act 2000 &bull; Section 79 Safe Harbor</p>
        </div>

        <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs sm:text-sm font-medium">
            <i className="fas fa-triangle-exclamation mr-2 text-amber-600"></i>
            <strong>Important Buyer Advisory:</strong> Never transfer token advances or booking deposits without verifying physical original title deeds, Encumbrance Certificate (EC) for 30 years, and K-RERA project approvals with a qualified advocate in Bangalore.
          </div>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">1. Intermediary Status (Section 79 of IT Act)</h2>
            <p>
              Home Design English (HDE) operates strictly as a neutral technology platform enabling third-party property owners, brokers, and builders to publish listings. HDE is not a licensed real estate broker, lender, appraiser, or escrow entity. We do not participate in negotiations or property conveyancing.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">2. Verification of Land Titles &amp; Khata Classification</h2>
            <p>
              Properties advertised in Bangalore carry varied municipal recognitions (BBMP A Khata, B Khata, BDA, BMRDA, or Gram Panchayat). HDE does not independently investigate, survey, or warrant the legitimacy of any Khata certificate, conversion order, or land title. Buyers must engage an independent legal counsel to conduct title due diligence.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">3. Transit &amp; Landmark Distances</h2>
            <p>
              Distances to Kempegowda International Airport, Metro stations, railway hubs, and IT corridors are approximate figures provided by listers or calculated via public road routing tools. Actual transit times vary based on Bangalore traffic conditions, peak hours, and metro construction routes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">4. Limitation of Liability</h2>
            <p>
              Under no circumstances shall HDE, its developers, or affiliates be liable for any direct, indirect, or consequential financial losses arising from transactions initiated between buyers and property posters.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
