"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "../../context/UserContext";
import { useRegion } from "../../context/RegionContext";

type CalculatorType = "construction" | "india-emi" | "india-kitchen" | "india-bathroom" | "interior" | "doors-windows" | "flooring" | "painting" | "plumbing" | "electrical" | "materials" | "usa-framing" | "usa-roofing" | "usa-accent-wall" | "usa-flooring" | "usa-plumbing" | "usa-electrical" | "usa-rent-vs-buy" | "usa-salary-calculator" | "usa-property-tax" | "usa-remodel-roi" | "usa-garden-bed" | "usa-interior-design" | "usa-kitchen-remodel" | "usa-bathroom-remodel" | "usa-home-addition" | "usa-swimming-pool" | "usa-pickleball-court" | "usa-outdoor-kitchen" | "visualizer";

interface CalculatorTabsProps {
  activeCalculator: CalculatorType;
  setActiveCalculator: (calculator: CalculatorType) => void;
  hasPaid: boolean;
}

interface TabItem {
  id: CalculatorType;
  name: string;
  icon: string;
  reqTier: number;
  category: string;
  tagline?: string;
}

const INDIA_CATEGORIES = [
  { id: "all", name: "All Tools", icon: "fas fa-th-large" },
  { id: "civil", name: "🏗️ Civil Construction & Core Trades", icon: "fas fa-hard-hat" },
  { id: "interiors", name: "🛋️ Interiors & Renovation", icon: "fas fa-couch", isPro: true },
  { id: "finance", name: "💰 Finance & Planning", icon: "fas fa-coins" },
];

const INDIA_CALCULATORS: TabItem[] = [
  // 🏗️ Civil Construction & Core Trades (Full New House Construction - 100% FREE FOR ALL)
  { id: "construction",    name: "Civil Construction",  icon: "fas fa-home",        reqTier: 0, category: "civil", tagline: "7-Phase structural RCC build" },
  { id: "materials",       name: "Materials BOQ",       icon: "fas fa-cubes",       reqTier: 1, category: "civil", tagline: "Detailed 7-phase structural BOQ" },
  { id: "plumbing",        name: "Plumbing & Sump",     icon: "fas fa-faucet",      reqTier: 0, category: "civil", tagline: "Whole-house water lines & motor" },
  { id: "electrical",      name: "Electrical & Conduit",icon: "fas fa-bolt",        reqTier: 0, category: "civil", tagline: "Concealed wiring points & board" },
  { id: "doors-windows",   name: "Doors & Windows",     icon: "fas fa-door-open",   reqTier: 0, category: "civil", tagline: "Teak, flush doors & UPVC frames" },

  // 🛋️ Interiors & Renovation (Specific Room Fit-Outs & Modernization - PRO SUITE)
  { id: "india-kitchen",   name: "Modular Kitchen",     icon: "fas fa-kitchen-set", reqTier: 1, category: "interiors", tagline: "IS:710 Marine ply, Rft & baskets" },
  { id: "india-bathroom",  name: "Bathroom Renovation", icon: "fas fa-bath",        reqTier: 1, category: "interiors", tagline: "Waterproofing, diverters & glass" },
  { id: "interior",        name: "Full Home Interiors", icon: "fas fa-couch",       reqTier: 1, category: "interiors", tagline: "Whole-flat woodwork & false ceiling" },
  { id: "flooring",        name: "Flooring & Tiling",   icon: "fas fa-layer-group", reqTier: 1, category: "interiors", tagline: "Vitrified, marble & granite" },
  { id: "painting",        name: "Painting & Putty",    icon: "fas fa-paint-roller",reqTier: 1, category: "interiors", tagline: "Interior emulsion & exterior apex" },

  // 💰 Finance & Planning
  { id: "india-emi",       name: "Home Loan EMI",       icon: "fas fa-university",  reqTier: 0, category: "finance", tagline: "SBI/HDFC bank comparison & schedule" },
];

const USA_CALCULATORS: TabItem[] = [
  { id: "usa-rent-vs-buy", name: "Rent vs. Buy", icon: "fas fa-balance-scale", reqTier: 0, category: "realty" },
  { id: "usa-salary-calculator", name: "Salary Needed", icon: "fas fa-money-bill-wave", reqTier: 0, category: "realty" },
  { id: "usa-property-tax", name: "Property Tax", icon: "fas fa-file-invoice-dollar", reqTier: 0, category: "realty" },
  { id: "usa-garden-bed", name: "Garden Bed", icon: "fas fa-leaf", reqTier: 0, category: "outdoor" },
  { id: "usa-interior-design", name: "Interior Design", icon: "fas fa-couch", reqTier: 0, category: "remodel" },
  { id: "usa-kitchen-remodel", name: "Kitchen Remodel", icon: "fas fa-utensils", reqTier: 0, category: "remodel" },
  { id: "usa-bathroom-remodel", name: "Bathroom Remodel", icon: "fas fa-bath", reqTier: 0, category: "remodel" },
  { id: "usa-home-addition", name: "Home Addition", icon: "fas fa-house-user", reqTier: 1, category: "remodel" },
  { id: "usa-swimming-pool", name: "Swimming Pool", icon: "fas fa-swimming-pool", reqTier: 1, category: "outdoor" },
  { id: "visualizer", name: "Paint Visualizer", icon: "fas fa-palette", reqTier: 0, category: "trades" },
  { id: "usa-remodel-roi", name: "Remodel ROI", icon: "fas fa-hammer", reqTier: 0, category: "remodel" },
  { id: "usa-roofing", name: "Roofing & Shingles", icon: "fas fa-home", reqTier: 0, category: "trades" },
  { id: "usa-flooring", name: "Flooring", icon: "fas fa-layer-group", reqTier: 0, category: "trades" },
  { id: "usa-framing", name: "Framing & Drywall", icon: "fas fa-hammer", reqTier: 0, category: "trades" },
  { id: "usa-accent-wall", name: "Accent Walls & Woodwork", icon: "fas fa-border-all", reqTier: 0, category: "trades" },
  { id: "usa-plumbing", name: "Plumbing", icon: "fas fa-bath", reqTier: 0, category: "trades" },
  { id: "usa-electrical", name: "Electrical", icon: "fas fa-bolt", reqTier: 0, category: "trades" },
  { id: "usa-pickleball-court", name: "Pickleball Court", icon: "fas fa-table-tennis", reqTier: 1, category: "outdoor" },
  { id: "usa-outdoor-kitchen", name: "Outdoor Kitchen", icon: "fas fa-fire-burner", reqTier: 1, category: "outdoor" },
];

const CalculatorTabs: React.FC<CalculatorTabsProps> = ({ activeCalculator, setActiveCalculator, hasPaid }) => {
  const router = useRouter();
  const { region } = useRegion();
  const { planTier, role } = useUser();
  const isUserPaid = Boolean(hasPaid || role === 'admin' || (planTier && planTier !== 'free'));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const CALCULATORS = region === 'US' ? USA_CALCULATORS : INDIA_CALCULATORS;

  // When activeCalculator changes externally (e.g. from deep link), auto-align category
  useEffect(() => {
    if (region === 'IN') {
      const found = INDIA_CALCULATORS.find(c => c.id === activeCalculator);
      if (found && selectedCategory !== "all" && found.category !== selectedCategory) {
        setSelectedCategory(found.category);
      }
    }
  }, [activeCalculator, region]);

  useEffect(() => {
    // If we switched regions, ensure the active calculator is valid for this region
    const usaCalcs = ['usa-framing', 'usa-roofing', 'usa-accent-wall', 'usa-flooring', 'usa-plumbing', 'usa-electrical', 'usa-rent-vs-buy', 'usa-salary-calculator', 'usa-property-tax', 'usa-remodel-roi', 'usa-garden-bed', 'usa-interior-design', 'usa-kitchen-remodel', 'usa-bathroom-remodel', 'usa-home-addition', 'usa-swimming-pool', 'usa-pickleball-court', 'usa-outdoor-kitchen', 'visualizer'];
    
    // Do not override if URL explicitly requested this specific calculator
    if (typeof window !== 'undefined') {
      const urlCalc = new URLSearchParams(window.location.search).get('calc');
      if (urlCalc && urlCalc === activeCalculator) {
        return;
      }
    }

    if (region === 'US' && !usaCalcs.includes(activeCalculator)) {
      setActiveCalculator('usa-framing');
    } else if (region === 'IN' && usaCalcs.includes(activeCalculator)) {
      setActiveCalculator('construction');
    }
  }, [region, activeCalculator, setActiveCalculator]);

  const currentCalc = CALCULATORS.find(c => c.id === activeCalculator) || CALCULATORS[0];

  const handleTabClick = (id: CalculatorType) => {
    const allCalcs = [...INDIA_CALCULATORS, ...USA_CALCULATORS];
    const targetCalc = allCalcs.find(c => c.id === id);
    if (!isUserPaid && targetCalc && targetCalc.reqTier > 0) {
      router.push(`/upgrade?calc=${id}`);
      setIsDropdownOpen(false);
      return;
    }
    setActiveCalculator(id);
    setIsDropdownOpen(false);
  };

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    if (catId !== 'all') {
      const inCat = INDIA_CALCULATORS.filter(c => c.category === catId);
      if (inCat.length > 0 && !inCat.some(c => c.id === activeCalculator)) {
        const firstFree = inCat.find(c => c.reqTier === 0);
        if (firstFree) {
          setActiveCalculator(firstFree.id);
        } else if (isUserPaid) {
          setActiveCalculator(inCat[0].id);
        }
      }
    }
  };

  // Filtered calculators for India mode
  const displayedCalculators = useMemo(() => {
    if (region !== 'IN' || selectedCategory === 'all') {
      return CALCULATORS;
    }
    return INDIA_CALCULATORS.filter(c => c.category === selectedCategory);
  }, [region, selectedCategory, CALCULATORS]);

  return (
    <div className="w-full pt-2 pb-4 space-y-4">
      {/* PRO / ACCOUNT STATUS BAR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-[#0f2042]/5 via-[#c5a059]/10 to-transparent border border-[#c5a059]/30 dark:border-[#c5a059]/25 rounded-2xl shadow-xs">
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
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#c5a059] hover:bg-[#b38e47] text-white shadow-xs hover:shadow-md transition-all no-underline shrink-0 cursor-pointer border border-[#b38e47]/30"
          >
            <i className="fas fa-crown text-[10px] text-white"></i>
            <span>
              {isUserPaid ? "Pro Account Active" : "Go Pro"}
            </span>
          </Link>
        </div>
      </div>

      {/* INDIA MODE: CATEGORY FILTER PILLS (Removes redundancy & groups tools by lifecycle) */}
      {region === 'IN' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {INDIA_CATEGORIES.map((cat) => {
            const isCatActive = selectedCategory === cat.id;
            const count = cat.id === 'all' 
              ? INDIA_CALCULATORS.length 
              : INDIA_CALCULATORS.filter(c => c.category === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isCatActive
                    ? 'bg-primary text-white dark:text-zinc-950 shadow-sm scale-[1.02]'
                    : 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:border-primary/50'
                }`}
              >
                <span>{cat.name}</span>
                {cat.isPro && !isUserPaid ? (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-extrabold flex items-center gap-1 shrink-0 ${
                    isCatActive 
                      ? 'bg-white/20 text-white dark:text-zinc-950' 
                      : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                  }`}>
                    <i className="fas fa-lock text-[8px]"></i>
                    <span>PRO</span>
                  </span>
                ) : (cat.id === 'civil' || cat.id === 'finance') ? (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black flex items-center gap-1 shrink-0 tracking-wider ${
                    isCatActive 
                      ? 'bg-white/20 text-white dark:text-zinc-950' 
                      : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25'
                  }`}>
                    <i className="fas fa-check text-[8px]"></i>
                    <span>FREE</span>
                  </span>
                ) : null}
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isCatActive ? 'bg-white/25 text-white dark:text-zinc-950' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* MOBILE DROPDOWN (Visible only on <768px) */}
      <div className="md:hidden relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center justify-between px-4 py-4 bg-white dark:bg-zinc-900 border-2 border-gray-100 dark:border-zinc-800 rounded-2xl shadow-sm text-secondary dark:text-zinc-100 font-bold"
        >
          <div className="flex items-center gap-3">
            <i className={`${currentCalc.icon} text-primary`}></i>
            <div className="text-left">
              <span className="block">{currentCalc.name}</span>
              {currentCalc.tagline && (
                <span className="text-[10px] text-gray-400 block font-normal">{currentCalc.tagline}</span>
              )}
            </div>
          </div>
          <i className={`fas fa-chevron-${isDropdownOpen ? 'up' : 'down'} text-gray-400 dark:text-zinc-500`}></i>
        </button>

        {isDropdownOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden max-h-[70vh] overflow-y-auto">
            {region === 'IN' ? (
              // Grouped Mobile View for India Mode
              <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                {INDIA_CATEGORIES.filter(c => c.id !== 'all').map((cat) => {
                  const items = INDIA_CALCULATORS.filter(c => c.category === cat.id);
                  return (
                    <div key={cat.id} className="p-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1 block">
                        {cat.name}
                      </span>
                      {items.map((calc) => (
                        <button
                          key={calc.id}
                          onClick={() => handleTabClick(calc.id as CalculatorType)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors cursor-pointer text-left ${
                            activeCalculator === calc.id ? "bg-primary/10" : "hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                          }`}
                        >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-3">
                                <i className={`${calc.icon} ${activeCalculator === calc.id ? 'text-primary' : 'text-gray-400'}`}></i>
                                <div>
                                  <span className={`text-xs block ${activeCalculator === calc.id ? 'font-bold text-primary' : 'font-semibold text-gray-800 dark:text-zinc-200'}`}>
                                    {calc.name}
                                  </span>
                                  {calc.tagline && (
                                    <span className="text-[10px] text-gray-400 block leading-tight">{calc.tagline}</span>
                                  )}
                                </div>
                              </div>
                              {!isUserPaid && calc.reqTier > 0 ? (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 font-extrabold flex items-center gap-1 shrink-0 border border-amber-500/20">
                                  <i className="fas fa-lock text-[8px]"></i>
                                  <span>PRO</span>
                                </span>
                              ) : calc.reqTier === 0 ? (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-black flex items-center gap-1 shrink-0 border border-emerald-500/25 tracking-wider">
                                  <i className="fas fa-check text-[8px]"></i>
                                  <span>FREE</span>
                                </span>
                              ) : null}
                            </div>
                          </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            ) : (
              // Standard USA View
              CALCULATORS.map((calc) => (
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
                  {!isUserPaid && calc.reqTier > 0 ? (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 font-extrabold flex items-center gap-1 shrink-0 border border-amber-500/20">
                      <i className="fas fa-lock text-[8px]"></i>
                      <span>PRO</span>
                    </span>
                  ) : calc.reqTier === 0 ? (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-black flex items-center gap-1 shrink-0 border border-emerald-500/25 tracking-wider">
                      <i className="fas fa-check text-[8px]"></i>
                      <span>FREE</span>
                    </span>
                  ) : null}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* TABLET & DESKTOP GRID (Categorized, clean, balanced columns) */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {displayedCalculators.map(({ id, name, icon, tagline, reqTier }) => {
          const isActive = activeCalculator === id;

          return (
            <button
              key={id}
              onClick={() => handleTabClick(id as CalculatorType)}
              className={`flex flex-col items-start p-3.5 rounded-2xl text-left transition-all duration-200 border-2 cursor-pointer
                ${isActive 
                  ? "bg-white dark:bg-zinc-900 border-primary shadow-md scale-[1.02]" 
                  : "bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800 hover:border-primary/40 hover:bg-primary/5 dark:hover:bg-zinc-800/40"}`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm ${
                    isActive ? "bg-primary text-white" : "bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400"
                  }`}>
                    <i className={icon}></i>
                  </span>
                  <span className={`text-xs font-bold leading-tight ${
                    isActive ? "text-secondary dark:text-zinc-100" : "text-gray-800 dark:text-zinc-300"
                  }`}>
                    {name}
                  </span>
                </div>
                {!isUserPaid && reqTier > 0 ? (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 font-extrabold flex items-center gap-1 border border-amber-500/20 shrink-0">
                    <i className="fas fa-lock text-[8px]"></i>
                    <span>PRO</span>
                  </span>
                ) : reqTier === 0 ? (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-black flex items-center gap-1 border border-emerald-500/25 shrink-0 tracking-wider">
                    <i className="fas fa-check text-[8px]"></i>
                    <span>FREE</span>
                  </span>
                ) : null}
              </div>
              {tagline && (
                <span className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1.5 line-clamp-1">
                  {tagline}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalculatorTabs;
