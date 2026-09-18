// src/components/real-estate/CrossSellBanner.tsx
import React from "react";
import Link from "next/link";
import { PropertyCategory } from "@/types/realEstate";

export default function CrossSellBanner({
  category = "plot",
  localityName = "Bangalore",
}: {
  category?: PropertyCategory;
  localityName?: string;
}) {
  if (category === "plot" || category === "independent_house") {
    return (
      <div className="bg-[#f8fafc] rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-xs my-8 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium uppercase tracking-wider mb-3">
            <i className="fas fa-compass-drafting text-[11px]"></i>
            <span>Next Step After Buying a Site</span>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-secondary mb-2">
            Planning to build on your site in {localityName}?
          </h3>
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
            Get instant 2026 construction cost estimates, structural material quantities (cement, steel, sand), and explore 24+ architectural 2D CAD floor plans for 30x40, 30x50, and 40x60 plots.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/plans"
              className="px-5 py-2.5 bg-[#4165af] hover:bg-[#355393] text-white text-xs sm:text-sm font-medium rounded-xl transition-all shadow-xs flex items-center gap-2 no-underline"
            >
              <i className="fas fa-layer-group text-xs"></i>
              <span>Browse House Plans</span>
            </Link>
            <Link
              href="/#tools"
              className="px-5 py-2.5 bg-white hover:bg-gray-100 text-secondary border border-gray-200 text-xs sm:text-sm font-medium rounded-xl transition-all flex items-center gap-2 no-underline"
            >
              <i className="fas fa-calculator text-xs"></i>
              <span>Estimate Construction Cost</span>
            </Link>
          </div>
        </div>

        {/* Subtle decorative background watermark */}
        <div className="absolute right-6 bottom-2 text-gray-200/70 text-8xl sm:text-9xl pointer-events-none select-none hidden md:block">
          <i className="fas fa-drafting-compass"></i>
        </div>
      </div>
    );
  }

  // Flats & Villas Cross-Sell
  return (
    <div className="bg-[#f8fafc] rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-xs my-8 relative overflow-hidden">
      <div className="relative z-10 max-w-2xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium uppercase tracking-wider mb-3">
          <i className="fas fa-couch text-[11px]"></i>
          <span>Interior &amp; Woodwork Estimator</span>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-secondary mb-2">
          Planning Interiors for your Flat or Villa in {localityName}?
        </h3>
        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
          Calculate modular kitchen packages, bedroom wardrobes, and false ceiling costs using BWP marine-grade plywood and premium acrylic finishes.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/gallery/kitchen-designs"
            className="px-5 py-2.5 bg-[#4165af] hover:bg-[#355393] text-white text-xs sm:text-sm font-medium rounded-xl transition-all shadow-xs flex items-center gap-2 no-underline"
          >
            <i className="fas fa-utensils text-xs"></i>
            <span>Modular Kitchen Designs &amp; Rates</span>
          </Link>
          <Link
            href="/gallery/bathroom-designs"
            className="px-5 py-2.5 bg-white hover:bg-gray-100 text-secondary border border-gray-200 text-xs sm:text-sm font-medium rounded-xl transition-all flex items-center gap-2 no-underline"
          >
            <i className="fas fa-bath text-xs"></i>
            <span>Modern Bathroom Designs</span>
          </Link>
        </div>
      </div>

      <div className="absolute right-6 bottom-2 text-gray-200/70 text-8xl sm:text-9xl pointer-events-none select-none hidden md:block">
        <i className="fas fa-couch"></i>
      </div>
    </div>
  );
}
