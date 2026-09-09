"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "../../context/UserContext";
import { useRegion } from "../../context/RegionContext";

type CalculatorType = "construction" | "india-emi" | "interior" | "doors-windows" | "flooring" | "painting" | "plumbing" | "electrical" | "materials" | "usa-framing" | "usa-roofing" | "usa-accent-wall" | "usa-flooring" | "usa-plumbing" | "usa-electrical" | "usa-rent-vs-buy" | "usa-salary-calculator" | "usa-property-tax" | "usa-remodel-roi" | "usa-garden-bed" | "usa-interior-design" | "usa-kitchen-remodel" | "usa-bathroom-remodel" | "usa-home-addition" | "usa-swimming-pool" | "usa-pickleball-court" | "usa-outdoor-kitchen" | "visualizer";

interface CalculatorTabsProps {
  activeCalculator: CalculatorType;
  setActiveCalculator: (calculator: CalculatorType) => void;
  hasPaid: boolean;
}

const INDIA_CALCULATORS = [
  { id: "construction",  name: "Construction",   icon: "fas fa-home",        reqTier: 0 },
  { id: "india-emi",     name: "Home Loan EMI",  icon: "fas fa-university",  reqTier: 0 },
  { id: "interior",      name: "Interiors",      icon: "fas fa-couch",       reqTier: 0 },
  { id: "flooring",      name: "Flooring",       icon: "fas fa-layer-group", reqTier: 0 },
  { id: "painting",      name: "Painting",       icon: "fas fa-paint-roller",reqTier: 0 },
  { id: "doors-windows", name: "Doors/Windows",  icon: "fas fa-door-open",   reqTier: 0 },
  { id: "plumbing",      name: "Plumbing",       icon: "fas fa-bath",        reqTier: 0 },
  { id: "electrical",    name: "Electrical",     icon: "fas fa-bolt",        reqTier: 0 },
  { id: "materials",     name: "Materials BOQ",  icon: "fas fa-cubes",       reqTier: 0 },
] as const;

const USA_CALCULATORS = [
  { id: "usa-rent-vs-buy", name: "Rent vs. Buy", icon: "fas fa-balance-scale", reqTier: 0 },
  { id: "usa-salary-calculator", name: "Salary Needed", icon: "fas fa-money-bill-wave", reqTier: 0 },
  { id: "usa-property-tax", name: "Property Tax", icon: "fas fa-file-invoice-dollar", reqTier: 0 },
  { id: "usa-garden-bed", name: "Garden Bed", icon: "fas fa-leaf", reqTier: 0 },
  { id: "usa-interior-design", name: "Interior Design", icon: "fas fa-couch", reqTier: 0 },
  { id: "usa-kitchen-remodel", name: "Kitchen Remodel", icon: "fas fa-utensils", reqTier: 0 },
  { id: "usa-bathroom-remodel", name: "Bathroom Remodel", icon: "fas fa-bath", reqTier: 0 },
  { id: "usa-home-addition", name: "Home Addition", icon: "fas fa-house-user", reqTier: 0 },
  { id: "usa-swimming-pool", name: "Swimming Pool", icon: "fas fa-swimming-pool", reqTier: 0 },
  { id: "visualizer", name: "Paint Visualizer", icon: "fas fa-palette", reqTier: 0 },
  { id: "usa-remodel-roi", name: "Remodel ROI", icon: "fas fa-hammer", reqTier: 0 },
  { id: "usa-roofing", name: "Roofing & Shingles", icon: "fas fa-home", reqTier: 0 },
  { id: "usa-flooring", name: "Flooring", icon: "fas fa-layer-group", reqTier: 0 },
  { id: "usa-framing", name: "Framing & Drywall", icon: "fas fa-hammer", reqTier: 0 },
  { id: "usa-accent-wall", name: "Accent Walls & Woodwork", icon: "fas fa-border-all", reqTier: 0 },
  { id: "usa-plumbing", name: "Plumbing", icon: "fas fa-bath", reqTier: 0 },
  { id: "usa-electrical", name: "Electrical", icon: "fas fa-bolt", reqTier: 0 },
  { id: "usa-pickleball-court", name: "Pickleball Court", icon: "fas fa-table-tennis", reqTier: 0 },
  { id: "usa-outdoor-kitchen", name: "Outdoor Kitchen", icon: "fas fa-fire-burner", reqTier: 0 },
] as const;

const CalculatorTabs: React.FC<CalculatorTabsProps> = ({ activeCalculator, setActiveCalculator, hasPaid }) => {
  const { tierValue } = useUser();
  const { region } = useRegion();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useRouter();

  const CALCULATORS = region === 'US' ? USA_CALCULATORS : INDIA_CALCULATORS;

  useEffect(() => {
    // If we switched regions, ensure the active calculator is valid for this region
    const usaCalcs = ['usa-framing', 'usa-roofing', 'usa-accent-wall', 'usa-flooring', 'usa-plumbing', 'usa-electrical', 'usa-rent-vs-buy', 'usa-salary-calculator', 'usa-property-tax', 'usa-remodel-roi', 'usa-garden-bed', 'usa-interior-design', 'usa-kitchen-remodel', 'usa-bathroom-remodel', 'usa-home-addition', 'usa-swimming-pool', 'usa-pickleball-court', 'usa-outdoor-kitchen', 'visualizer'];
    if (region === 'US' && !usaCalcs.includes(activeCalculator)) {
      setActiveCalculator('usa-framing');
    } else if (region === 'IN' && usaCalcs.includes(activeCalculator)) {
      setActiveCalculator('construction');
    }
  }, [region, activeCalculator, setActiveCalculator]);

  const currentCalc = CALCULATORS.find(c => c.id === activeCalculator) || CALCULATORS[0];

  const handleTabClick = (id: CalculatorType) => {
    setActiveCalculator(id);
    setIsDropdownOpen(false);
  };

  return (
    <div className="w-full pt-2 pb-4">
      {/* PRO / ACCOUNT STATUS BAR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-4 px-4 py-3 bg-gradient-to-r from-[#0f2042]/5 via-[#c5a059]/10 to-transparent border border-[#c5a059]/30 dark:border-[#c5a059]/25 rounded-2xl shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-xs text-gray-700 dark:text-zinc-300">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-extrabold text-gray-900 dark:text-zinc-100">Calculators 100% Free</span>
          </div>
          <span className="hidden sm:inline text-gray-300 dark:text-zinc-600">•</span>
          <div className="flex items-center gap-1.5 flex-wrap text-gray-600 dark:text-zinc-400 font-medium">
            <span className="font-bold text-[#0f2042] dark:text-[#c5a059]">Pro Benefits:</span>
            <span className="bg-[#c5a059]/15 dark:bg-[#c5a059]/20 text-[#0f2042] dark:text-[#c5a059] border border-[#c5a059]/30 px-2 py-0.5 rounded-md text-[11px] font-bold">💾 Cloud Saves</span>
            <span className="bg-[#c5a059]/15 dark:bg-[#c5a059]/20 text-[#0f2042] dark:text-[#c5a059] border border-[#c5a059]/30 px-2 py-0.5 rounded-md text-[11px] font-bold">📄 Bank &amp; Contractor PDFs</span>
            <span className="bg-[#c5a059]/15 dark:bg-[#c5a059]/20 text-[#0f2042] dark:text-[#c5a059] border border-[#c5a059]/30 px-2 py-0.5 rounded-md text-[11px] font-bold">🧱 7-Phase BOQ</span>
            <span className="bg-[#c5a059]/15 dark:bg-[#c5a059]/20 text-[#0f2042] dark:text-[#c5a059] border border-[#c5a059]/30 px-2 py-0.5 rounded-md text-[11px] font-bold">♾️ Lifetime Access</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <Link
            href="/upgrade#compare"
            className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200 underline whitespace-nowrap"
          >
            Compare Plans
          </Link>
          <Link
            href="/upgrade"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#c5a059] hover:bg-[#b38e47] text-[#0f2042] shadow-xs hover:shadow-md transition-all no-underline shrink-0 cursor-pointer border border-[#b38e47]/30"
          >
            <i className="fas fa-crown text-[10px] text-[#0f2042]"></i>
            <span>
              {hasPaid 
                ? "Pro Account Active" 
                : (region === 'US' ? "Get Pro Account ($9.99)" : region === 'IN' ? "Get Pro Account (₹199)" : "Get Pro Account")}
            </span>
          </Link>
        </div>
      </div>

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
                onClick={() => handleTabClick(calc.id as CalculatorType)}
                className={`w-full flex items-center justify-between px-5 py-4 border-b border-gray-50 dark:border-zinc-800 last:border-none hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors
                  ${activeCalculator === calc.id ? "bg-primary/10" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <i className={`${calc.icon} ${activeCalculator === calc.id ? 'text-primary' : 'text-gray-400 dark:text-zinc-500'}`}></i>
                  <span className={`text-sm ${activeCalculator === calc.id ? 'font-bold text-secondary dark:text-zinc-100' : 'text-gray-600 dark:text-zinc-400'}`}>{calc.name}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TABLET & DESKTOP GRID (Visible on >=768px - No sliding, all visible) */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-3">
        {CALCULATORS.map(({ id, name, icon }) => {
          const isActive = activeCalculator === id;

          return (
            <button
              key={id}
              onClick={() => handleTabClick(id as CalculatorType)}
              className={`flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 border-2
                ${isActive ? "bg-white dark:bg-zinc-900 text-secondary dark:text-zinc-100 border-primary shadow-md scale-[1.02]" : "bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 border-gray-100 dark:border-zinc-800 hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-zinc-800/40"}`}
            >
              <i className={`${icon} ${isActive ? "text-primary text-base" : "text-gray-400 dark:text-zinc-500"}`}></i>
              <span className="whitespace-nowrap">{name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalculatorTabs;

