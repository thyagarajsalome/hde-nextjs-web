"use client";

import React from "react";
import Link from "next/link";
import FlooringVisualizer from "./FlooringVisualizer";
import { useRegion } from "@/context/RegionContext";

export default function FlooringVisualizerPageClient() {
  const { region, setRegion, isReady } = useRegion();

  if (!isReady) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0f2042]"></div>
      </div>
    );
  }

  // Strictly available for USA users
  if (region !== "US") {
    const switchToUsa = () => {
      setRegion("US");
      if (
        typeof window !== "undefined" &&
        !window.location.hostname.includes("localhost") &&
        !window.location.hostname.includes("127.0.0.1")
      ) {
        window.location.href = "https://us.homedesignenglish.com/flooring-visualizer";
      }
    };

    return (
      <div className="min-h-[65vh] bg-slate-50 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0f2042] flex items-center justify-center text-xl mx-auto">
            <i className="fas fa-flag-usa"></i>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            USA Interactive Flooring Visualizer
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            This room flooring visualizer and its material finishes (LVP, Honey Oak Hardwood, Carpet &amp; Tile) are exclusively tailored for US homes on{" "}
            <span className="font-semibold text-slate-800">us.homedesignenglish.com</span>.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={switchToUsa}
              className="px-4 py-2.5 rounded-xl bg-[#0f2042] hover:bg-[#1a3360] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Open in USA Mode 🇺🇸
            </button>
            <Link
              href="/"
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors no-underline"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0f2042] border border-blue-200 text-[11px] font-bold uppercase tracking-wider">
            <i className="fas fa-layer-group text-[#c5a059]"></i>
            <span>USA Home Design Visualizer</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Interactive Flooring Visualizer
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Preview Hardwood, Luxury Vinyl Plank (LVP), Tile, and Wall-to-Wall Carpet side by side in American Living Rooms and Kitchens.
          </p>
        </header>

        <FlooringVisualizer />

        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Ready to Price Your Flooring Project?
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Calculate square footage with 10–15% waste factor, US installation labor, underlayment, and baseboards.
            </p>
          </div>
          <Link
            href="/?region=US&calc=usa-flooring#tools"
            className="px-5 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#b58e45] text-white font-bold text-xs sm:text-sm transition-colors no-underline whitespace-nowrap shrink-0"
          >
            Open USA Flooring Cost Estimator →
          </Link>
        </div>
      </div>
    </div>
  );
}
