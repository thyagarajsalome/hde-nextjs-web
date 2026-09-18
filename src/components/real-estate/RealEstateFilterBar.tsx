// src/components/real-estate/RealEstateFilterBar.tsx
"use client";

import React from "react";
import { ListingIntent, PropertyCategory, BhkType } from "@/types/realEstate";
import { BANGALORE_LOCALITIES, PROPERTY_CATEGORIES, BHK_OPTIONS } from "@/data/bangaloreLocalities";

interface RealEstateFilterBarProps {
  intent: ListingIntent;
  onIntentChange: (intent: ListingIntent) => void;
  category: PropertyCategory | "all";
  onCategoryChange: (cat: PropertyCategory | "all") => void;
  bhk: BhkType | "all";
  onBhkChange: (bhk: BhkType | "all") => void;
  locality: string;
  onLocalityChange: (loc: string) => void;
  onReset: () => void;
}

export default function RealEstateFilterBar({
  intent,
  onIntentChange,
  category,
  onCategoryChange,
  bhk,
  onBhkChange,
  locality,
  onLocalityChange,
  onReset,
}: RealEstateFilterBarProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs space-y-4 mb-8">
      {/* Top Row: Intent Tabs (Buy vs Rent) and Locality Dropdown */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        {/* Buy / Rent Switch */}
        <div className="inline-flex p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => onIntentChange("sale")}
            className={`px-6 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              intent === "sale"
                ? "bg-white text-secondary shadow-xs font-black"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <i className="fas fa-tag mr-1.5 text-primary text-xs"></i>
            Buy Properties
          </button>
          <button
            onClick={() => onIntentChange("rent")}
            className={`px-6 py-2 rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              intent === "rent"
                ? "bg-white text-secondary shadow-xs font-black"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <i className="fas fa-key mr-1.5 text-primary text-xs"></i>
            Rent Homes
          </button>
        </div>

        {/* Locality Quick Selector */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none"></i>
            <select
              value={locality}
              onChange={(e) => onLocalityChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer transition-all"
            >
              <option value="">All Bangalore Localities</option>
              {BANGALORE_LOCALITIES.map((loc) => (
                <option key={loc.id} value={loc.name}>
                  {loc.name} ({loc.zone})
                </option>
              ))}
            </select>
            <i className="fas fa-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none"></i>
          </div>

          {(locality || category !== "all" || bhk !== "all") && (
            <button
              onClick={onReset}
              className="px-3 py-2.5 text-xs text-gray-400 hover:text-red-500 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              title="Reset all filters"
            >
              <i className="fas fa-rotate-left"></i>
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Middle Row: Property Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 hidden sm:inline">
          Type:
        </span>
        <button
          onClick={() => onCategoryChange("all")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            category === "all"
              ? "bg-[#4165af] text-white shadow-xs"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/60"
          }`}
        >
          All Types
        </button>
        {PROPERTY_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id as PropertyCategory)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              category === cat.id
                ? "bg-[#4165af] text-white shadow-xs"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/60"
            }`}
          >
            <i className={`${cat.icon} text-[10px]`}></i>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Bottom Row: BHK configuration pills (hidden if Plot is selected) */}
      {category !== "plot" && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 hidden sm:inline">
            BHK:
          </span>
          <button
            onClick={() => onBhkChange("all")}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              bhk === "all"
                ? "bg-primary text-white shadow-xs"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/60"
            }`}
          >
            Any BHK
          </button>
          {BHK_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => onBhkChange(opt as BhkType)}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                bhk === opt
                  ? "bg-primary text-white shadow-xs"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/60"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
