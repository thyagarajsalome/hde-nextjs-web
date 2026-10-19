"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";

interface WinterProject {
  id: string;
  name: string;
  category: "weatherproofing" | "insulation" | "painting" | "hvac" | "lighting" | "diy";
  icon: string;
  diyCost: number;
  proCost: number;
  annualSavings: number;
  description: string;
  savingsNote: string;
}

const WINTER_PROJECTS: WinterProject[] = [
  {
    id: "drafts",
    name: "Window & Door Weatherstripping",
    category: "weatherproofing",
    icon: "fa-wind",
    diyCost: 85,
    proCost: 350,
    annualSavings: 180,
    description: "Install silicone caulk, door sweeps, and foam gaskets behind exterior wall outlets.",
    savingsNote: "Cuts cold draft infiltration by up to 15%"
  },
  {
    id: "insulation",
    name: "Attic Insulation Top-Up (R-49)",
    category: "insulation",
    icon: "fa-cubes-stacked",
    diyCost: 950,
    proCost: 2400,
    annualSavings: 420,
    description: "Add blown-in cellulose or fiberglass to achieve R-49+ thermal boundary.",
    savingsNote: "Average 15% reduction in winter heating bills"
  },
  {
    id: "thermostat",
    name: "Smart Thermostat Upgrade",
    category: "hvac",
    icon: "fa-temperature-arrow-down",
    diyCost: 160,
    proCost: 320,
    annualSavings: 150,
    description: "Install an ENERGY STAR smart thermostat with automated night/away temperature setbacks.",
    savingsNote: "8% to 12% annual heating energy reduction"
  },
  {
    id: "painting",
    name: "Off-Season Interior Painting (2 Rooms)",
    category: "painting",
    icon: "fa-paint-roller",
    diyCost: 180,
    proCost: 750,
    annualSavings: 0,
    description: "Brighten dark winter rooms with high-LRV warm white latex paint.",
    savingsNote: "Save 15–20% on painter labor during winter slow season"
  },
  {
    id: "lighting",
    name: "Warm 2700K Ambient Lighting Overhaul",
    category: "lighting",
    icon: "fa-lightbulb",
    diyCost: 140,
    proCost: 480,
    annualSavings: 80,
    description: "Swap builder-grade fixtures for warm chandeliers, dimmers, and high-CRI LED bulbs.",
    savingsNote: "75% electricity drop vs older incandescent bulbs"
  },
  {
    id: "backsplash",
    name: "Kitchen Tile Backsplash (DIY)",
    category: "diy",
    icon: "fa-border-all",
    diyCost: 320,
    proCost: 1100,
    annualSavings: 0,
    description: "Install ceramic subway tile or peel-and-stick composite tile over kitchen prep walls.",
    savingsNote: "High aesthetic ROI for indoor winter weekends"
  }
];

export default function WinterProjectEstimator() {
  const [selectedProjects, setSelectedProjects] = useState<string[]>([
    "drafts",
    "insulation",
    "thermostat"
  ]);
  const [mode, setMode] = useState<"diy" | "pro">("diy");

  const toggleProject = (id: string) => {
    setSelectedProjects((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const totals = useMemo(() => {
    const selected = WINTER_PROJECTS.filter((p) => selectedProjects.includes(p.id));
    const totalCost = selected.reduce(
      (sum, p) => sum + (mode === "diy" ? p.diyCost : p.proCost),
      0
    );
    const totalSavings = selected.reduce((sum, p) => sum + p.annualSavings, 0);
    const paybackYears = totalSavings > 0 ? (totalCost / totalSavings).toFixed(1) : "N/A";

    return {
      totalCost,
      totalSavings,
      paybackYears,
      count: selected.length
    };
  }, [selectedProjects, mode]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 lg:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider mb-2">
            <i className="fas fa-calculator text-blue-600"></i>
            <span>Interactive US Estimator</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Winter Home Improvement &amp; Energy ROI Calculator
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Select the winter upgrades you plan to tackle. Calculate your upfront cost and projected annual utility bill savings.
          </p>
        </div>

        {/* DIY vs Pro Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setMode("diy")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              mode === "diy"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <i className="fas fa-hammer mr-1.5 text-amber-500"></i>
            DIY Material
          </button>
          <button
            type="button"
            onClick={() => setMode("pro")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              mode === "pro"
                ? "bg-primary text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <i className="fas fa-user-gear mr-1.5"></i>
            Hire Pro Contractor
          </button>
        </div>
      </div>

      {/* Projects Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {WINTER_PROJECTS.map((project) => {
          const isSelected = selectedProjects.includes(project.id);
          const currentCost = mode === "diy" ? project.diyCost : project.proCost;

          return (
            <div
              key={project.id}
              onClick={() => toggleProject(project.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between space-y-4 ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/30"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-primary shadow-2xs">
                    <i className={`fas ${project.icon} text-sm`}></i>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-primary text-white"
                        : "border border-slate-300 text-transparent"
                    }`}
                  >
                    <i className="fas fa-check"></i>
                  </div>
                </div>

                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                    {project.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Estimated Cost
                  </span>
                  <span className="font-black text-slate-900">${currentCost}</span>
                </div>
                {project.annualSavings > 0 ? (
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 block">
                      Energy Savings
                    </span>
                    <span className="font-black text-emerald-700">
                      +${project.annualSavings}/yr
                    </span>
                  </div>
                ) : (
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-amber-600 block">
                      Value Perk
                    </span>
                    <span className="font-bold text-amber-700 text-[11px]">
                      Aesthetic ROI
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Results Summary Box */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-2 text-center md:text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <i className="fas fa-shield-halved"></i>
            <span>{totals.count} Winter Projects Selected</span>
          </span>
          <h4 className="text-2xl font-black">Your Estimated Winter Investment</h4>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
            Invest in strategic sealing and thermal upgrades to cut heating costs and stay comfortable all season.
          </p>
        </div>

        <div className="flex items-center gap-6 sm:gap-8 shrink-0">
          <div className="text-center md:text-right">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
              Total Upfront Cost
            </span>
            <span className="text-3xl sm:text-4xl font-black text-white">
              ${totals.totalCost.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              ({mode === "diy" ? "DIY Materials" : "With Labor"})
            </span>
          </div>

          <div className="w-px h-14 bg-white/15 hidden sm:block"></div>

          <div className="text-center md:text-right">
            <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400 block">
              Annual Bill Savings
            </span>
            <span className="text-3xl sm:text-4xl font-black text-emerald-400">
              ${totals.totalSavings.toLocaleString()}/yr
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Payback in {totals.paybackYears} {totals.paybackYears === "1.0" ? "year" : "years"}
            </span>
          </div>
        </div>
      </div>

      {/* Plan Renovations CTA */}
      <div className="p-4 sm:p-6 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center text-lg shrink-0">
            <i className="fas fa-drafting-compass"></i>
          </div>
          <div>
            <strong className="font-bold text-slate-900 block text-sm">
              Planning room additions or interior layout changes this winter?
            </strong>
            <span className="text-slate-600 text-xs">
              Model precise floor plans and furniture clearances with HDE Studio CAD.
            </span>
          </div>
        </div>
        <Link
          href="/download"
          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-xs transition-all no-underline shrink-0 flex items-center gap-2 cursor-pointer"
        >
          <span>Download CAD Studio Free</span>
          <i className="fas fa-arrow-right text-xs"></i>
        </Link>
      </div>
    </div>
  );
}
