"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../context/UserContext";
import { useRegion } from "../../context/RegionContext";

type CalculatorType = "construction" | "interior" | "doors-windows" | "flooring" | "painting" | "plumbing" | "electrical" | "materials" | "usa-framing" | "usa-roofing" | "usa-accent-wall" | "usa-flooring" | "usa-plumbing" | "usa-electrical" | "usa-rent-vs-buy" | "usa-salary-calculator" | "visualizer";

interface CalculatorTabsProps {
  activeCalculator: CalculatorType;
  setActiveCalculator: (calculator: CalculatorType) => void;
  hasPaid: boolean;
}

const INDIA_CALCULATORS = [
  { id: "construction",  name: "Construction",   icon: "fas fa-home",        reqTier: 0 },
  { id: "interior",      name: "Interiors",      icon: "fas fa-couch",       reqTier: 1 },
  { id: "flooring",      name: "Flooring",       icon: "fas fa-layer-group", reqTier: 1 },
  { id: "painting",      name: "Painting",       icon: "fas fa-paint-roller",reqTier: 1 },
  { id: "doors-windows", name: "Doors/Windows",  icon: "fas fa-door-open",   reqTier: 2 },
  { id: "plumbing",      name: "Plumbing",       icon: "fas fa-bath",        reqTier: 2 },
  { id: "electrical",    name: "Electrical",     icon: "fas fa-bolt",        reqTier: 2 },
  { id: "materials",     name: "Materials BOQ",  icon: "fas fa-cubes",       reqTier: 3 },
] as const;

const USA_CALCULATORS = [
  { id: "usa-rent-vs-buy", name: "Rent vs. Buy", icon: "fas fa-balance-scale", reqTier: 0 },
  { id: "usa-salary-calculator", name: "Salary Needed", icon: "fas fa-money-bill-wave", reqTier: 0 },
  { id: "usa-roofing", name: "Roofing & Shingles", icon: "fas fa-home", reqTier: 0 },
  { id: "usa-accent-wall", name: "Accent Walls & Woodwork", icon: "fas fa-border-all", reqTier: 0 },
  { id: "usa-framing", name: "Framing & Drywall", icon: "fas fa-hammer", reqTier: 0 },
  { id: "usa-flooring", name: "Flooring", icon: "fas fa-layer-group", reqTier: 1 },
  { id: "usa-plumbing", name: "Plumbing", icon: "fas fa-bath", reqTier: 2 },
  { id: "usa-electrical", name: "Electrical", icon: "fas fa-bolt", reqTier: 2 },
  { id: "visualizer", name: "Paint Visualizer", icon: "fas fa-palette", reqTier: 0 },
] as const;

const CalculatorTabs: React.FC<CalculatorTabsProps> = ({ activeCalculator, setActiveCalculator, hasPaid }) => {
  const { tierValue } = useUser();
  const { region } = useRegion();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useRouter();

  const CALCULATORS = region === 'US' ? USA_CALCULATORS : INDIA_CALCULATORS;

  useEffect(() => {
    // If we switched regions, ensure the active calculator is valid for this region
    const usaCalcs = ['usa-framing', 'usa-roofing', 'usa-accent-wall', 'usa-flooring', 'usa-plumbing', 'usa-electrical', 'usa-rent-vs-buy', 'usa-salary-calculator', 'visualizer'];
    if (region === 'US' && !usaCalcs.includes(activeCalculator)) {
      setActiveCalculator('usa-framing');
    } else if (region === 'IN' && usaCalcs.includes(activeCalculator)) {
      setActiveCalculator('construction');
    }
  }, [region, activeCalculator, setActiveCalculator]);

  const currentCalc = CALCULATORS.find(c => c.id === activeCalculator) || CALCULATORS[0];

  const handleTabClick = (id: CalculatorType, reqTier: number) => {
    if (tierValue < reqTier) {
      navigate.push("/upgrade");
    } else {
      setActiveCalculator(id);
      setIsDropdownOpen(false);
    }
  };

  return (
    <div className="w-full pt-2 pb-4">
      {/* MOBILE DROPDOWN (Visible only on <768px) */}
      <div className="md:hidden relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center justify-between px-4 py-4 bg-white dark:bg-zinc-900 border-2 border-gray-100 dark:border-zinc-800 rounded-2xl shadow-sm text-secondary dark:text-zinc-100 font-bold"
        >
          <div className="flex items-center gap-3">
            <i className={`${currentCalc.icon} text-primary`}></i>
            <span>{currentCalc.name}</span>
          </div>
          <i className={`fas fa-chevron-${isDropdownOpen ? 'up' : 'down'} text-gray-400 dark:text-zinc-500`}></i>
        </button>

        {isDropdownOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
            {CALCULATORS.map((calc) => (
              <button
                key={calc.id}
                onClick={() => handleTabClick(calc.id as CalculatorType, calc.reqTier)}
                className={`w-full flex items-center justify-between px-5 py-4 border-b border-gray-50 dark:border-zinc-800 last:border-none hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors
                  ${activeCalculator === calc.id ? "bg-primary/10" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <i className={`${calc.icon} ${activeCalculator === calc.id ? 'text-primary' : 'text-gray-400 dark:text-zinc-500'}`}></i>
                  <span className={`text-sm ${activeCalculator === calc.id ? 'font-bold text-secondary dark:text-zinc-100' : 'text-gray-600 dark:text-zinc-400'}`}>{calc.name}</span>
                </div>
                {tierValue < calc.reqTier && <i className="fas fa-lock text-xs text-gray-300 dark:text-zinc-600"></i>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TABLET & DESKTOP GRID (Visible on >=768px - No sliding, all visible) */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-3">
        {CALCULATORS.map(({ id, name, icon, reqTier }) => {
          const isActive = activeCalculator === id;
          const isLocked = tierValue < reqTier;

          return (
            <button
              key={id}
              onClick={() => handleTabClick(id as CalculatorType, reqTier)}
              className={`flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 border-2
                ${isActive ? "bg-white dark:bg-zinc-900 text-secondary dark:text-zinc-100 border-primary shadow-md scale-[1.02]" : "bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 border-gray-100 dark:border-zinc-800 hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-zinc-800/40"}
                ${isLocked ? "opacity-80" : ""}`}
            >
              <i className={`${icon} ${isActive ? "text-primary text-base" : "text-gray-400 dark:text-zinc-500"}`}></i>
              <span className="whitespace-nowrap">{name}</span>
              {isLocked && <i className="fas fa-lock text-[10px] ml-1 opacity-40"></i>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalculatorTabs;

