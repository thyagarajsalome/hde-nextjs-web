"use client";
// src/features/dashboard/Dashboard.tsx
import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "../../context/UserContext";
import { ProjectService } from "../../services/projectService";
import { useToast } from "../../context/ToastContext";
import { useRegion } from "../../context/RegionContext";
import WhatsAppShareButton from "../../components/ui/WhatsAppShareButton";
import { DesktopLicense, getUserLicense } from "../../services/licenseService";

interface CalculatorMeta {
  label: string;
  icon: string;
  color: string;
  category: string;
}

const CALCULATOR_META: Record<string, CalculatorMeta> = {
  // India Calculators
  construction:    { label: "House Construction",    icon: "fas fa-home",         color: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200", category: "structure" },
  "india-emi":     { label: "Home Loan EMI",         icon: "fas fa-university",   color: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200", category: "finance" },
  materials:       { label: "Materials BOQ",         icon: "fas fa-cubes",        color: "bg-stone-50 dark:bg-stone-900/40 text-stone-600 dark:text-stone-400 border-stone-200", category: "structure" },
  interior:        { label: "Interior Design",       icon: "fas fa-couch",        color: "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200", category: "interiors" },
  "doors-windows": { label: "Doors & Windows",      icon: "fas fa-door-open",    color: "bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 border-sky-200", category: "finishes" },
  flooring:        { label: "Flooring",              icon: "fas fa-layer-group",  color: "bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 border-teal-200", category: "finishes" },
  painting:        { label: "House Painting",        icon: "fas fa-paint-roller", color: "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-200", category: "finishes" },
  plumbing:        { label: "Plumbing",              icon: "fas fa-bath",         color: "bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 border-cyan-200", category: "systems" },
  electrical:      { label: "Electrical",            icon: "fas fa-bolt",         color: "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 border-yellow-200", category: "systems" },
  
  // USA Calculators
  "usa-framing":   { label: "Framing & Lumber",      icon: "fas fa-ruler-combined",color: "bg-amber-50 text-amber-600 border-amber-200", category: "structure" },
  "usa-roofing":   { label: "Roofing & Shingles",    icon: "fas fa-warehouse",   color: "bg-blue-50 text-blue-600 border-blue-200", category: "structure" },
  "usa-accent-wall":{ label: "Accent Wall",         icon: "fas fa-border-all",  color: "bg-indigo-50 text-indigo-600 border-indigo-200", category: "interiors" },
  "usa-rent-vs-buy":{ label: "Rent vs Buy",         icon: "fas fa-balance-scale",color: "bg-green-50 text-green-600 border-green-200", category: "finance" },
  "usa-property-tax":{ label: "Property Tax",       icon: "fas fa-file-invoice-dollar", color: "bg-red-50 text-red-600 border-red-200", category: "finance" },
  "usa-salary-calculator":{ label: "Salary Needed",  icon: "fas fa-money-bill-wave", color: "bg-emerald-50 text-emerald-600 border-emerald-200", category: "finance" },
  "usa-remodel-roi":{ label: "Remodel ROI",         icon: "fas fa-chart-line",   color: "bg-violet-50 text-violet-600 border-violet-200", category: "finance" },
  "usa-swimming-pool":{ label: "Swimming Pool",     icon: "fas fa-swimming-pool",color: "bg-sky-50 text-sky-600 border-sky-200", category: "luxury" },
  "usa-pickleball-court":{ label: "Pickleball Court", icon: "fas fa-table-tennis", color: "bg-orange-50 text-orange-600 border-orange-200", category: "luxury" },
  "usa-outdoor-kitchen":{ label: "Outdoor Kitchen",  icon: "fas fa-fire-burner", color: "bg-rose-50 text-rose-600 border-rose-200", category: "luxury" },
  "usa-kitchen-remodel":{ label: "Kitchen Remodel",  icon: "fas fa-utensils", color: "bg-amber-50 text-amber-600 border-amber-200", category: "interiors" },
  "usa-home-addition":{ label: "Home Addition",     icon: "fas fa-house-user", color: "bg-indigo-50 text-indigo-600 border-indigo-200", category: "structure" },
  "usa-garden-bed":{ label: "Garden Bed",           icon: "fas fa-leaf", color: "bg-teal-50 text-teal-600 border-teal-200", category: "finishes" },
  "usa-flooring":  { label: "USA Flooring",          icon: "fas fa-layer-group", color: "bg-teal-50 text-teal-600 border-teal-200", category: "finishes" },
  "usa-plumbing":  { label: "USA Plumbing",          icon: "fas fa-bath", color: "bg-cyan-50 text-cyan-600 border-cyan-200", category: "systems" },
  "usa-electrical":{ label: "USA Electrical",       icon: "fas fa-bolt", color: "bg-yellow-50 text-yellow-600 border-yellow-200", category: "systems" },
  "usa-interior-design":{ label: "USA Interiors",   icon: "fas fa-couch", color: "bg-rose-50 text-rose-600 border-rose-200", category: "interiors" },

  // UAE / Dubai
  "dubai-property":{ label: "Dubai Property",      icon: "fas fa-city", color: "bg-amber-50 text-amber-600 border-amber-200", category: "finance" },
};

const ADMIN_EMAIL = "thyagaraja1983@gmail.com";

export default function Dashboard() {
  const { user, hasPaid, credits, planTier, loading, whatsappNumber, updateWhatsAppNumber } = useUser();
  const { region, setRegion } = useRegion();
  const { showToast } = useToast();
  const router = useRouter();

  const isAdmin = Boolean(user && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());

  const [projects, setProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [waInput, setWaInput] = useState("");
  const [savingWa, setSavingWa] = useState(false);
  const [showWaPrompt, setShowWaPrompt] = useState(true);
  const [desktopLicense, setDesktopLicense] = useState<DesktopLicense | null>(null);
  const [keyCopied, setKeyCopied] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const data = await ProjectService.getAllByUser(user!.id);
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
      getUserLicense(user.id)
        .then((lic) => {
          if (lic && lic.status === "active" && lic.edition === "GLOBAL_PRO") {
            setDesktopLicense(lic);
          } else {
            setDesktopLicense(null);
          }
        })
        .catch((err) => console.error("License fetch error:", err));
    }
  }, [user, region, planTier]);

  const handleCopyLicenseKey = () => {
    if (!desktopLicense?.license_key) return;
    navigator.clipboard.writeText(desktopLicense.license_key);
    setKeyCopied(true);
    showToast("License key copied to clipboard!", "success");
    setTimeout(() => setKeyCopied(false), 3000);
  };

  // Format Indian currency cleanly with Lakhs / Crores
  const formatIndianCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return "—";
    const formatted = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

    if (amount >= 10000000) {
      return `${formatted} (${(amount / 10000000).toFixed(2)} Cr)`;
    }
    if (amount >= 100000) {
      return `${formatted} (${(amount / 100000).toFixed(2)} L)`;
    }
    return formatted;
  };

  // Open a saved project in its live calculator with strict regional isolation
  const handleOpenProjectInCalculator = (project: any) => {
    const isUsa = project.type?.startsWith("usa-");
    const targetRegion: "IN" | "US" = isUsa ? "US" : "IN";
    setRegion(targetRegion);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("hde_region", targetRegion);
      window.localStorage.setItem("hde_active_calc", project.type);
      window.localStorage.setItem("hde_load_project", JSON.stringify(project));
    }
    router.push(`/#tools`);
  };

  const handleDelete = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    const isConfirmed = window.confirm("Are you sure you want to delete this saved estimate?");
    if (!isConfirmed) return;
    try {
      await ProjectService.deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      if (selectedProject?.id === projectId) setSelectedProject(null);
      showToast("Estimate deleted successfully!", "success");
    } catch {
      showToast("Failed to delete estimate.", "error");
    }
  };

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Category filter
      if (categoryFilter !== "all") {
        const meta = CALCULATOR_META[p.type];
        if (meta?.category !== categoryFilter) return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name?.toLowerCase().includes(q);
        const matchesType = p.type?.toLowerCase().includes(q);
        return matchesName || matchesType;
      }
      return true;
    });
  }, [projects, categoryFilter, searchQuery]);

  // Aggregate project portfolio metrics
  const portfolioStats = useMemo(() => {
    let totalCostSum = 0;
    projects.forEach((p) => {
      const cost = Number(p.data?.totalCost || 0);
      if (!isNaN(cost)) totalCostSum += cost;
    });
    return {
      totalCostSum,
      totalCount: projects.length,
    };
  }, [projects]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-xl p-8">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold mb-4">
            <i className="fas fa-lock"></i>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-800 dark:text-zinc-100 mb-2">Sign In to Dashboard</h2>
          <p className="text-gray-500 dark:text-zinc-400 text-sm mb-6">
            Access your saved construction estimates, bill of quantities (BOQ), and project reports.
          </p>
          <Link
            href="/signin"
            className="block w-full py-3.5 bg-primary hover:bg-primary-hover text-white dark:text-zinc-950 rounded-xl font-bold shadow-md transition no-underline"
          >
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-zinc-950 py-8">
      <div className="container mx-auto px-4 max-w-6xl space-y-6 animate-fade-in">

        {/* WhatsApp Notification Banner (dismissible) */}
        {!whatsappNumber && showWaPrompt && (
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 text-xl shadow-xs">
                <i className="fab fa-whatsapp"></i>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  Receive Project Estimates on WhatsApp
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                  Connect your WhatsApp number to receive PDF calculation summaries, BOQs, and floor plan updates directly.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:self-center">
              <input
                type="tel"
                placeholder={region === "AE" ? "+971 50 123 4567" : region === "US" ? "+1 (555) 123-4567" : "+91 98765 43210"}
                value={waInput}
                onChange={(e) => setWaInput(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-44 sm:w-52"
              />
              <button
                type="button"
                onClick={async () => {
                  if (!waInput.trim()) return;
                  setSavingWa(true);
                  const ok = await updateWhatsAppNumber(waInput);
                  setSavingWa(false);
                  if (ok) {
                    showToast("WhatsApp number connected successfully!", "success");
                  }
                }}
                disabled={savingWa || !waInput.trim()}
                className="px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {savingWa ? "Saving..." : "Connect"}
              </button>
              <button
                type="button"
                onClick={() => setShowWaPrompt(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 text-xs cursor-pointer"
                title="Dismiss"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Header Bar */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-gray-150 dark:border-zinc-800 p-6 sm:p-7">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                  Tier: {planTier.toUpperCase()}
                </span>
                {whatsappNumber && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                    <i className="fab fa-whatsapp text-emerald-500"></i>
                    <span>{whatsappNumber}</span>
                  </span>
                )}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-700/60 px-2.5 py-0.5 rounded-full hover:bg-amber-100 transition no-underline"
                    title="Open Developer Admin Command Center"
                  >
                    <i className="fas fa-shield-halved text-amber-600"></i>
                    <span>Superadmin Hub →</span>
                  </Link>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
                My Projects &amp; Saved Estimates
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
                Access your saved BOQs, inspect cost breakdowns, and manage your account credits.
              </p>
            </div>

            {/* Header Call-To-Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href="/#tools"
                className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition flex items-center gap-2 no-underline cursor-pointer"
                title="Go to Home page to explore calculators"
              >
                <i className="fas fa-calculator text-primary"></i>
                <span>+ New Calculation</span>
              </Link>

              <Link
                href="/upgrade"
                className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-xs transition flex items-center gap-2 no-underline cursor-pointer"
              >
                <i className="fas fa-plus-circle"></i>
                <span>Add Credits / Upgrade</span>
              </Link>
            </div>
          </div>

          {/* Core Metrics: Credits, Saved Projects, Portfolio Total, Plan Tier */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {/* 1. Available Credits */}
            <div className={`p-4 rounded-xl border transition ${
              credits === 0
                ? "bg-red-50/70 border-red-200 dark:bg-red-950/20"
                : "bg-slate-50 dark:bg-zinc-800/40 border-slate-100 dark:border-zinc-800"
            }`}>
              <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-zinc-400 mb-1">
                <span>Available Credits</span>
                <i className={`fas fa-coins ${credits === 0 ? "text-red-500" : "text-primary"}`}></i>
              </div>
              <div className={`text-2xl font-black ${credits === 0 ? "text-red-600" : "text-slate-900 dark:text-zinc-100"}`}>
                {credits}
              </div>
              <div className="text-[10px] text-gray-400 mt-1">
                {credits === 0 ? "Exhausted • Buy more" : "Valid for saving & PDF"}
              </div>
            </div>

            {/* 2. Total Saved Projects */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
              <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-zinc-400 mb-1">
                <span>Saved Projects</span>
                <i className="fas fa-folder-open text-blue-500"></i>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-zinc-100">
                {loadingProjects ? "..." : projects.length}
              </div>
              <div className="text-[10px] text-gray-400 mt-1">
                Cloud synced estimates
              </div>
            </div>

            {/* 3. Total Portfolio Value */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
              <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-zinc-400 mb-1">
                <span>Total Portfolio Value</span>
                <i className="fas fa-chart-pie text-emerald-500"></i>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 truncate">
                {region === "US"
                  ? `$${portfolioStats.totalCostSum.toLocaleString()}`
                  : region === "AE"
                  ? `AED ${portfolioStats.totalCostSum.toLocaleString()}`
                  : portfolioStats.totalCostSum >= 100000
                  ? `₹${(portfolioStats.totalCostSum / 100000).toFixed(1)} L`
                  : `₹${portfolioStats.totalCostSum.toLocaleString("en-IN")}`}
              </div>
              <div className="text-[10px] text-gray-400 mt-1 truncate">
                Across {portfolioStats.totalCount} saved calculations
              </div>
            </div>

            {/* 4. Plan Tier */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
              <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-zinc-400 mb-1">
                <span>Plan Tier</span>
                <i className="fas fa-crown text-amber-500"></i>
              </div>
              <div className="text-xl sm:text-2xl font-black capitalize text-slate-900 dark:text-zinc-100">
                {planTier}
              </div>
              <div className="text-[10px] text-gray-400 mt-1">
                {hasPaid ? "Full tools unlocked" : "Free starter tier"}
              </div>
            </div>
          </div>

          {/* Credits Alert if Exhausted */}
          {credits === 0 && (
            <div className="mt-5 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-red-900 dark:text-red-300 text-xs">
              <div className="flex items-center gap-3">
                <i className="fas fa-exclamation-triangle text-red-600 text-base shrink-0"></i>
                <div>
                  <strong>You have 0 credits remaining.</strong> Saving custom estimates and generating detailed PDF bills requires active credits.
                </div>
              </div>
              <Link
                href="/upgrade"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg whitespace-nowrap shadow-xs transition no-underline"
              >
                Buy Credits (From ₹199)
              </Link>
            </div>
          )}

          {/* Desktop CAD License Key (Compact, only visible if user has an active Pro license) */}
          {desktopLicense && (
            <div className="mt-5 p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm">
                  <i className="fas fa-cube"></i>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">HDE Studio CAD Pro License</div>
                  <div className="font-mono text-xs text-amber-400 mt-0.5 select-all">
                    {desktopLicense.license_key}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLicenseKey}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <i className={keyCopied ? "fas fa-check text-emerald-400" : "fas fa-copy"}></i>
                  <span>{keyCopied ? "Copied" : "Copy Key"}</span>
                </button>
                <Link
                  href="/download"
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition no-underline"
                >
                  Download App
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* --- SAVED ESTIMATES & PROJECTS WORKSPACE --- */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-gray-150 dark:border-zinc-800 p-6 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-zinc-800">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <i className="fas fa-history text-primary"></i>
                <span>Saved Cost Estimates &amp; Project Reports</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Click any saved estimate to inspect its itemized breakdown, share on WhatsApp, or recalculate.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search saved estimates..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
            {[
              { id: "all", label: "All Estimates" },
              { id: "structure", label: "Construction & BOQ" },
              { id: "finance", label: "Home Loan EMI" },
              { id: "interiors", label: "Interiors" },
              { id: "finishes", label: "Finishes (Tiles/Paint)" },
              { id: "systems", label: "Plumbing & Electrical" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  categoryFilter === cat.id
                    ? "bg-secondary text-white shadow-xs"
                    : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Projects List */}
          {loadingProjects ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredProjects.map((project) => {
                const meta = CALCULATOR_META[project.type] || {
                  label: project.type,
                  icon: "fas fa-calculator",
                  color: "bg-gray-50 text-gray-600 border-gray-200",
                  category: "other",
                };

                const costNum = Number(project.data?.totalCost || 0);

                return (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className="p-4 rounded-xl border border-gray-150 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-850 hover:bg-white dark:hover:bg-zinc-800 hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border text-sm shrink-0 ${meta.color}`}>
                            <i className={meta.icon}></i>
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100 group-hover:text-primary transition truncate">
                              {project.name}
                            </h3>
                            <div className="flex items-center gap-2 text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5">
                              <span className="font-medium text-slate-600 dark:text-zinc-400">{meta.label}</span>
                              <span>•</span>
                              <span>
                                {new Date(project.date).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleDelete(e, project.id)}
                          className="w-7 h-7 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition flex items-center justify-center shrink-0"
                          title="Delete estimate"
                        >
                          <i className="fas fa-trash-alt text-xs"></i>
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-850 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Estimated Total</span>
                        <span className="text-base font-extrabold text-slate-900 dark:text-zinc-100">
                          {project.type?.startsWith("usa-")
                            ? `$${costNum.toLocaleString()}`
                            : project.type === "dubai-property"
                            ? `AED ${costNum.toLocaleString()}`
                            : formatIndianCurrency(costNum)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-primary font-bold text-xs group-hover:underline">
                        <span>Inspect Breakdown</span>
                        <i className="fas fa-arrow-right text-[10px]"></i>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl bg-gray-50/40 dark:bg-zinc-900/40 space-y-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-400 flex items-center justify-center mx-auto text-xl">
                <i className="fas fa-clipboard-list"></i>
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">No saved estimates found</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                {searchQuery || categoryFilter !== "all"
                  ? "No estimates match your search or filter criteria. Try clearing filters."
                  : "You haven't saved any calculations yet. Visit our homepage tools to create and save your first project."}
              </p>
              <Link
                href="/#tools"
                className="inline-block mt-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition no-underline cursor-pointer"
              >
                + Start a New Calculation on Home Page
              </Link>
            </div>
          )}
        </div>

        {/* --- PROJECT INSPECTION MODAL --- */}
        {selectedProject && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 animate-scale-in">
              <div className="flex items-start justify-between pb-4 border-b border-gray-100 dark:border-zinc-800">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                    {CALCULATOR_META[selectedProject.type]?.label || selectedProject.type}
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-zinc-100 mt-2">
                    {selectedProject.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Saved on {new Date(selectedProject.date).toLocaleDateString("en-IN", { dateStyle: "long" })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-500 flex items-center justify-center cursor-pointer"
                >
                  <i className="fas fa-times text-xs"></i>
                </button>
              </div>

              {/* Cost Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-secondary to-slate-900 text-white flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-gray-300 font-medium">Estimated Project Budget</div>
                  <div className="text-2xl font-black text-primary mt-0.5">
                    {selectedProject.type?.startsWith("usa-")
                      ? `$${(selectedProject.data?.totalCost || 0).toLocaleString()}`
                      : selectedProject.type === "dubai-property"
                      ? `AED ${(selectedProject.data?.totalCost || 0).toLocaleString()}`
                      : formatIndianCurrency(selectedProject.data?.totalCost)}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg text-primary">
                  <i className="fas fa-calculator"></i>
                </div>
              </div>

              {/* Data Items Preview */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                  Saved Parameters &amp; Specifications:
                </h4>
                <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-3 border border-gray-100 dark:border-zinc-800 space-y-2 text-xs">
                  {Object.entries(selectedProject.data || {}).map(([key, val]) => {
                    if (key === "totalCost" || typeof val === "object") return null;
                    return (
                      <div key={key} className="flex items-center justify-between py-1 border-b border-gray-100 dark:border-zinc-700/50 last:border-none">
                        <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                        <span className="font-bold text-slate-800 dark:text-zinc-200">{String(val)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, selectedProject.id)}
                  className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition cursor-pointer"
                >
                  <i className="fas fa-trash-alt mr-1.5"></i> Delete
                </button>

                <div className="flex items-center gap-2">
                  <WhatsAppShareButton
                    title={`Project Estimate: ${selectedProject.name}`}
                    total={
                      selectedProject.type?.startsWith("usa-")
                        ? `$${(selectedProject.data?.totalCost || 0).toLocaleString()}`
                        : selectedProject.type === "dubai-property"
                        ? `AED ${(selectedProject.data?.totalCost || 0).toLocaleString()}`
                        : formatIndianCurrency(selectedProject.data?.totalCost)
                    }
                    details={Object.entries(selectedProject.data || {})
                      .filter(([k, v]) => k !== "totalCost" && typeof v !== "object")
                      .slice(0, 4)
                      .map(([k, v]) => ({ label: k.replace(/([A-Z])/g, " $1"), value: String(v) }))}
                    variant="compact"
                    buttonText="Share"
                  />
                  <button
                    type="button"
                    onClick={() => handleOpenProjectInCalculator(selectedProject)}
                    className="px-4 sm:px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <i className="fas fa-external-link-alt"></i>
                    <span>Open in Calculator</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
