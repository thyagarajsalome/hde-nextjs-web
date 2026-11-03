"use client";

import React from "react";

export interface ArchitecturalFilterState {
  searchQuery: string;
  areaFilter: string;
  facingFilter: string;
  bhkFilter: string;
  dimensionFilter: string;
}

export const INITIAL_ARCHITECTURAL_FILTER_STATE: ArchitecturalFilterState = {
  searchQuery: "",
  areaFilter: "all",
  facingFilter: "all",
  bhkFilter: "all",
  dimensionFilter: "all",
};

/**
 * Shared filter matching predicate for both Gallery and Vector PDF Store.
 * Eliminates redundant filter implementations across the codebase.
 */
export function matchesArchitecturalPlanFilter(
  plan: {
    title?: string;
    dimensions?: string;
    facing?: string;
    description?: string;
    area_sqft?: number;
    bedrooms?: number;
  },
  filters: ArchitecturalFilterState
): boolean {
  // 1. Keyword search (title, dimensions, facing, description, area, BHK)
  if (filters.searchQuery.trim()) {
    const q = filters.searchQuery.toLowerCase().trim();
    const matchesQuery =
      plan.title?.toLowerCase().includes(q) ||
      plan.dimensions?.toLowerCase().includes(q) ||
      plan.facing?.toLowerCase().includes(q) ||
      plan.description?.toLowerCase().includes(q) ||
      plan.area_sqft?.toString().includes(q) ||
      (plan.bedrooms !== undefined && `${plan.bedrooms} bhk`.toLowerCase().includes(q));
    if (!matchesQuery) return false;
  }

  // 2. Facing Filter
  if (filters.facingFilter !== "all") {
    if (!plan.facing || !plan.facing.toLowerCase().includes(filters.facingFilter.toLowerCase())) {
      return false;
    }
  }

  // 3. Area Filter (with standard tolerance ranges)
  if (filters.areaFilter !== "all") {
    const area = plan.area_sqft || 0;
    if (filters.areaFilter === "600" && (area < 500 || area > 700)) return false;
    if (filters.areaFilter === "800" && (area < 701 || area > 900)) return false;
    if (filters.areaFilter === "1000" && (area < 901 || area > 1100)) return false;
    if (filters.areaFilter === "1200" && (area < 1101 || area > 1350)) return false;
    if (filters.areaFilter === "1500" && (area < 1351 || area > 1650)) return false;
    if (filters.areaFilter === "1800" && (area < 1651 || area > 2000)) return false;
    if (filters.areaFilter === "2400" && (area < 2001 || area > 2800)) return false;
    if (
      (filters.areaFilter === "3200+" || filters.areaFilter === "3200" || filters.areaFilter === "4000+") &&
      area <= 2800
    )
      return false;
  }

  // 4. Dimension Filter
  if (filters.dimensionFilter !== "all") {
    const cleanTarget = filters.dimensionFilter.toLowerCase().replace(/[^0-9x]/g, "");
    const cleanDim = (plan.dimensions || "").toLowerCase().replace(/[^0-9x]/g, "");
    if (!cleanDim.includes(cleanTarget)) return false;
  }

  // 5. BHK Filter
  if (filters.bhkFilter !== "all") {
    if (filters.bhkFilter === "4+") {
      if ((plan.bedrooms || 0) < 4) return false;
    } else {
      if (plan.bedrooms !== parseInt(filters.bhkFilter, 10)) return false;
    }
  }

  return true;
}

export interface ArchitecturalPlansFilterProps {
  filters: ArchitecturalFilterState;
  onFilterChange: (updates: Partial<ArchitecturalFilterState>) => void;
  onResetFilters: () => void;
  onSetSpecificFilter?: (area: string, facing: string, dim?: string) => void;
  totalCount: number;
  itemLabel?: string;
  title?: string;
  subtitle?: string;
}

/**
 * Universal Filter Component for Architectural House Plans and PDF Drawings
 */
export const ArchitecturalPlansFilter: React.FC<ArchitecturalPlansFilterProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  onSetSpecificFilter,
  totalCount,
  itemLabel = "architectural plans",
  title = "Filter Architectural Plans",
  subtitle = "Filter blueprints by exact plot size, entrance facing, dimensions, and BHK.",
}) => {
  const { searchQuery, areaFilter, facingFilter, bhkFilter, dimensionFilter } = filters;

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    facingFilter !== "all" ||
    areaFilter !== "all" ||
    dimensionFilter !== "all" ||
    bhkFilter !== "all";

  const handleQuickFilter = (area: string, facing: string, dim: string = "all") => {
    if (onSetSpecificFilter) {
      onSetSpecificFilter(area, facing, dim);
    } else {
      onFilterChange({
        areaFilter: area,
        facingFilter: facing,
        dimensionFilter: dim,
        searchQuery: "",
      });
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-7 shadow-sm border border-gray-200/80 dark:border-zinc-800 mb-8 space-y-5">
      {/* Header with Title and Reset */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <i className="fas fa-sliders text-primary text-base"></i>
            <span>{title}</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{subtitle}</p>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200/60 dark:border-red-800/40 px-3.5 py-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40 transition w-fit cursor-pointer"
          >
            <i className="fas fa-rotate-left text-[11px]"></i> Reset Filters
          </button>
        )}
      </div>

      {/* Filter Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Keyword Search */}
        <div className="lg:col-span-2 relative">
          <label className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">
            Search Blueprint
          </label>
          <div className="relative">
            <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              placeholder="e.g. 1200 sqft, 30x40, East, Duplex..."
              className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-xl outline-none focus:border-primary focus:bg-white dark:focus:bg-zinc-800 transition text-slate-900 dark:text-zinc-100"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onFilterChange({ searchQuery: "" })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
                aria-label="Clear search"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>

        {/* Plot Area Dropdown */}
        <div>
          <label className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">
            Plot Area (Sq Ft)
          </label>
          <select
            value={areaFilter}
            onChange={(e) => onFilterChange({ areaFilter: e.target.value })}
            className="w-full py-2.5 px-3 text-xs sm:text-sm bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-xl outline-none focus:border-primary focus:bg-white dark:focus:bg-zinc-800 transition font-medium text-slate-800 dark:text-zinc-200 cursor-pointer"
          >
            <option value="all">All Plot Sizes</option>
            <option value="600">600 sq ft (20×30)</option>
            <option value="800">800 sq ft (20×40)</option>
            <option value="1000">1,000 sq ft (20×50 / 25×40)</option>
            <option value="1200">1,200 sq ft (30×40)</option>
            <option value="1500">1,500 sq ft (30×50)</option>
            <option value="1800">1,800 sq ft (30×60)</option>
            <option value="2400">2,400 sq ft (40×60)</option>
            <option value="3200+">3,200+ sq ft (40×80)</option>
          </select>
        </div>

        {/* Facing Dropdown */}
        <div>
          <label className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">
            Plot Orientation
          </label>
          <select
            value={facingFilter}
            onChange={(e) => onFilterChange({ facingFilter: e.target.value })}
            className="w-full py-2.5 px-3 text-xs sm:text-sm bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-xl outline-none focus:border-primary focus:bg-white dark:focus:bg-zinc-800 transition font-medium text-slate-800 dark:text-zinc-200 cursor-pointer"
          >
            <option value="all">All Facings</option>
            <option value="East">🌅 East Facing</option>
            <option value="North">🧭 North Facing</option>
            <option value="West">🌇 West Facing</option>
            <option value="South">☀️ South Facing</option>
          </select>
        </div>

        {/* Bedrooms / BHK Dropdown */}
        <div>
          <label className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">
            Bedrooms (BHK)
          </label>
          <select
            value={bhkFilter}
            onChange={(e) => onFilterChange({ bhkFilter: e.target.value })}
            className="w-full py-2.5 px-3 text-xs sm:text-sm bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-xl outline-none focus:border-primary focus:bg-white dark:focus:bg-zinc-800 transition font-medium text-slate-800 dark:text-zinc-200 cursor-pointer"
          >
            <option value="all">All BHK Configurations</option>
            <option value="1">1 BHK Plan</option>
            <option value="2">2 BHK Plan</option>
            <option value="3">3 BHK Plan</option>
            <option value="4+">4+ BHK Luxury</option>
          </select>
        </div>
      </div>

      {/* Quick One-Click Filter Pills */}
      <div className="pt-2">
        <span className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block mb-2">
          Popular One-Click Filters:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onResetFilters}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition border cursor-pointer ${
              !hasActiveFilters
                ? "bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent shadow-xs"
                : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:border-gray-300"
            }`}
          >
            ⭐ All Plans
          </button>

          {/* 1200 Sqft East Facing */}
          <button
            type="button"
            onClick={() => handleQuickFilter("1200", "East", "30x40")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition border cursor-pointer ${
              areaFilter === "1200" && facingFilter === "East"
                ? "bg-primary text-white border-primary shadow-xs"
                : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-300/60 hover:bg-emerald-600 hover:text-white"
            }`}
          >
            🎯 1200 sqft East Facing
          </button>

          <button
            type="button"
            onClick={() => handleQuickFilter("600", "all", "20x30")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition border cursor-pointer ${
              areaFilter === "600"
                ? "bg-primary text-white border-primary shadow-xs"
                : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:bg-gray-200"
            }`}
          >
            📐 20×30 (600 sqft)
          </button>

          <button
            type="button"
            onClick={() => handleQuickFilter("1200", "all", "30x40")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition border cursor-pointer ${
              areaFilter === "1200" && facingFilter === "all"
                ? "bg-primary text-white border-primary shadow-xs"
                : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:bg-gray-200"
            }`}
          >
            📐 30×40 (1200 sqft)
          </button>

          <button
            type="button"
            onClick={() => handleQuickFilter("1500", "all", "30x50")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition border cursor-pointer ${
              areaFilter === "1500"
                ? "bg-primary text-white border-primary shadow-xs"
                : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:bg-gray-200"
            }`}
          >
            📐 30×50 (1500 sqft)
          </button>

          <button
            type="button"
            onClick={() => handleQuickFilter("2400", "all", "40x60")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition border cursor-pointer ${
              areaFilter === "2400"
                ? "bg-primary text-white border-primary shadow-xs"
                : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:bg-gray-200"
            }`}
          >
            📐 40×60 (2400 sqft)
          </button>

          <button
            type="button"
            onClick={() =>
              onFilterChange({
                facingFilter: "East",
                areaFilter: "all",
                dimensionFilter: "all",
              })
            }
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition border cursor-pointer ${
              facingFilter === "East" && areaFilter === "all"
                ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                : "bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200/60 hover:bg-amber-600 hover:text-white"
            }`}
          >
            🌅 East Facing Only
          </button>

          <button
            type="button"
            onClick={() =>
              onFilterChange({
                facingFilter: "North",
                areaFilter: "all",
                dimensionFilter: "all",
              })
            }
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition border cursor-pointer ${
              facingFilter === "North" && areaFilter === "all"
                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                : "bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 border-blue-200/60 hover:bg-blue-600 hover:text-white"
            }`}
          >
            🧭 North Facing Only
          </button>

          <button
            type="button"
            onClick={() =>
              onFilterChange({
                bhkFilter: "3",
                areaFilter: "all",
                facingFilter: "all",
                dimensionFilter: "all",
              })
            }
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition border cursor-pointer ${
              bhkFilter === "3" && areaFilter === "all" && facingFilter === "all"
                ? "bg-primary text-white border-primary shadow-xs"
                : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:bg-gray-200"
            }`}
          >
            🛏️ 3 BHK Duplex
          </button>
        </div>
      </div>

      {/* Results Counter Bar */}
      <div className="flex items-center justify-between pt-2 text-xs text-gray-500 dark:text-zinc-400 font-medium">
        <p>
          Showing{" "}
          <strong className="text-slate-900 dark:text-zinc-100 font-bold">
            {totalCount}
          </strong>{" "}
          {itemLabel}
          {hasActiveFilters && <span> matching active filters</span>}
        </p>
        {hasActiveFilters && (
          <span className="text-[11px] text-primary font-bold bg-primary/10 px-2.5 py-0.5 rounded-full">
            Filters Active
          </span>
        )}
      </div>
    </div>
  );
};
