"use client";
// src/features/dashboard/Dashboard.tsx
import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "../../context/UserContext";
import { ProjectService } from "../../services/projectService";
import { useToast } from "../../context/ToastContext";
import { useRegion } from "../../context/RegionContext";
import { HeroManager } from "./HeroManager";
import WhatsAppShareButton from "../../components/ui/WhatsAppShareButton";

interface CalculatorMeta {
  label: string;
  icon: string;
  color: string;
  category: string;
}

const CALCULATOR_META: Record<string, CalculatorMeta> = {
  // India Calculators
  construction:   { label: "House Construction",   icon: "fas fa-home",         color: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200", category: "structure" },
  "india-emi":    { label: "Home Loan EMI",        icon: "fas fa-university",   color: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200", category: "finance" },
  materials:      { label: "Materials BOQ",        icon: "fas fa-cubes",        color: "bg-stone-50 dark:bg-stone-900/40 text-stone-600 dark:text-stone-400 border-stone-200", category: "structure" },
  interior:       { label: "Interior Design",      icon: "fas fa-couch",        color: "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200", category: "interiors" },
  "doors-windows":{ label: "Doors & Windows",     icon: "fas fa-door-open",    color: "bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 border-sky-200", category: "finishes" },
  flooring:       { label: "Flooring",             icon: "fas fa-layer-group",  color: "bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 border-teal-200", category: "finishes" },
  painting:       { label: "House Painting",       icon: "fas fa-paint-roller", color: "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-200", category: "finishes" },
  plumbing:       { label: "Plumbing",             icon: "fas fa-bath",         color: "bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 border-cyan-200", category: "systems" },
  electrical:     { label: "Electrical",           icon: "fas fa-bolt",         color: "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 border-yellow-200", category: "systems" },
  
  // USA Calculators
  "usa-framing":  { label: "Framing & Lumber",     icon: "fas fa-ruler-combined",color: "bg-amber-50 text-amber-600 border-amber-200", category: "structure" },
  "usa-roofing":  { label: "Roofing & Shingles",   icon: "fas fa-warehouse",   color: "bg-blue-50 text-blue-600 border-blue-200", category: "structure" },
  "usa-accent-wall":{ label: "Accent Wall",        icon: "fas fa-border-all",  color: "bg-indigo-50 text-indigo-600 border-indigo-200", category: "interiors" },
  "usa-rent-vs-buy":{ label: "Rent vs Buy",        icon: "fas fa-balance-scale",color: "bg-green-50 text-green-600 border-green-200", category: "finance" },
  "usa-property-tax":{ label: "Property Tax",      icon: "fas fa-file-invoice-dollar", color: "bg-red-50 text-red-600 border-red-200", category: "finance" },
  "usa-salary-calculator":{ label: "Salary Needed", icon: "fas fa-money-bill-wave", color: "bg-emerald-50 text-emerald-600 border-emerald-200", category: "finance" },
  "usa-remodel-roi":{ label: "Remodel ROI",        icon: "fas fa-chart-line",   color: "bg-violet-50 text-violet-600 border-violet-200", category: "finance" },
  "usa-swimming-pool":{ label: "Swimming Pool",    icon: "fas fa-swimming-pool",color: "bg-sky-50 text-sky-600 border-sky-200", category: "luxury" },
  "usa-pickleball-court":{ label: "Pickleball Court", icon: "fas fa-table-tennis", color: "bg-orange-50 text-orange-600 border-orange-200", category: "luxury" },
  "usa-outdoor-kitchen":{ label: "Outdoor Kitchen", icon: "fas fa-fire-burner", color: "bg-rose-50 text-rose-600 border-rose-200", category: "luxury" },
  "usa-kitchen-remodel":{ label: "Kitchen Remodel", icon: "fas fa-utensils", color: "bg-amber-50 text-amber-600 border-amber-200", category: "interiors" },
  "usa-home-addition":{ label: "Home Addition",    icon: "fas fa-house-user", color: "bg-indigo-50 text-indigo-600 border-indigo-200", category: "structure" },
  "usa-garden-bed":{ label: "Garden Bed",          icon: "fas fa-leaf", color: "bg-teal-50 text-teal-600 border-teal-200", category: "finishes" },
  "usa-flooring": { label: "USA Flooring",         icon: "fas fa-layer-group", color: "bg-teal-50 text-teal-600 border-teal-200", category: "finishes" },
  "usa-plumbing": { label: "USA Plumbing",         icon: "fas fa-bath", color: "bg-cyan-50 text-cyan-600 border-cyan-200", category: "systems" },
  "usa-electrical":{ label: "USA Electrical",      icon: "fas fa-bolt", color: "bg-yellow-50 text-yellow-600 border-yellow-200", category: "systems" },
  "usa-interior-design":{ label: "USA Interiors",  icon: "fas fa-couch", color: "bg-rose-50 text-rose-600 border-rose-200", category: "interiors" },

  // UAE / Dubai
  "dubai-property": { label: "Dubai Property",     icon: "fas fa-city", color: "bg-amber-50 text-amber-600 border-amber-200", category: "finance" },
};

interface QuickTool {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  badge?: string | null;
  route?: string;
  color: string;
  textColor: string;
  bgColor: string;
}

const INDIA_QUICK_TOOLS: QuickTool[] = [
  {
    id: "construction",
    name: "House Construction",
    subtitle: "Complete BOQ & materials",
    icon: "fas fa-home",
    badge: "Most Popular",
    color: "from-[#c5a059] to-[#b38e47]",
    textColor: "text-[#0f2042] dark:text-[#c5a059]",
    bgColor: "bg-[#c5a059]/10 border-[#c5a059]/30",
  },
  {
    id: "india-emi",
    name: "Home Loan EMI",
    subtitle: "SBI, HDFC, ICICI rates",
    icon: "fas fa-university",
    badge: "Free",
    color: "from-emerald-500 to-emerald-600",
    textColor: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200",
  },
  {
    id: "materials",
    name: "Material Quantity",
    subtitle: "Cement, steel, sand bags",
    icon: "fas fa-cubes",
    badge: "Essential",
    color: "from-stone-500 to-stone-600",
    textColor: "text-stone-600",
    bgColor: "bg-stone-50 dark:bg-stone-900/30 border-stone-200",
  },
  {
    id: "interior",
    name: "Interior Design",
    subtitle: "1BHK, 2BHK, 3BHK, Villa",
    icon: "fas fa-couch",
    badge: "Pro",
    color: "from-rose-500 to-rose-600",
    textColor: "text-rose-600",
    bgColor: "bg-rose-50 dark:bg-rose-950/20 border-rose-200",
  },
  {
    id: "flooring",
    name: "Flooring Cost",
    subtitle: "Vitrified tiles & marble",
    icon: "fas fa-layer-group",
    badge: null,
    color: "from-teal-500 to-teal-600",
    textColor: "text-teal-600",
    bgColor: "bg-teal-50 dark:bg-teal-950/20 border-teal-200",
  },
  {
    id: "painting",
    name: "House Painting",
    subtitle: "Interior, exterior & primer",
    icon: "fas fa-paint-roller",
    badge: null,
    color: "from-purple-500 to-purple-600",
    textColor: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/20 border-purple-200",
  },
  {
    id: "doors-windows",
    name: "Doors & Windows",
    subtitle: "Teak, UPVC, aluminum",
    icon: "fas fa-door-open",
    badge: "Pro",
    color: "from-sky-500 to-sky-600",
    textColor: "text-sky-600",
    bgColor: "bg-sky-50 dark:bg-sky-950/20 border-sky-200",
  },
  {
    id: "plumbing",
    name: "Plumbing & Piping",
    subtitle: "Bathrooms, CPVC fixtures",
    icon: "fas fa-bath",
    badge: "Pro",
    color: "from-cyan-500 to-cyan-600",
    textColor: "text-cyan-600",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200",
  },
  {
    id: "electrical",
    name: "Electrical Wiring",
    subtitle: "Switches, DB, points",
    icon: "fas fa-bolt",
    badge: "Pro",
    color: "from-[#c5a059] to-[#916d28]",
    textColor: "text-[#0f2042] dark:text-[#c5a059]",
    bgColor: "bg-[#c5a059]/10 border-[#c5a059]/30",
  },
  {
    id: "land-converter",
    name: "Land Unit Converter",
    subtitle: "Gunta, Cent, Bigha to SqFt",
    icon: "fas fa-vector-square",
    badge: "New",
    route: "/land-converter",
    color: "from-indigo-500 to-indigo-600",
    textColor: "text-indigo-600",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200",
  },
  {
    id: "plans",
    name: "House Plans & CAD",
    subtitle: "Vetted 2D/3D elevations",
    icon: "fas fa-drafting-compass",
    badge: "Popular",
    route: "/plans",
    color: "from-blue-500 to-blue-600",
    textColor: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/20 border-blue-200",
  },
];

const USA_QUICK_TOOLS: QuickTool[] = [
  {
    id: "usa-rent-vs-buy",
    name: "Rent vs. Buy",
    subtitle: "5-year equity vs PITI costs",
    icon: "fas fa-balance-scale",
    badge: "Essential",
    color: "from-green-500 to-green-600",
    textColor: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950/20 border-green-200",
  },
  {
    id: "usa-property-tax",
    name: "Property Tax",
    subtitle: "County tax & escrow rates",
    icon: "fas fa-file-invoice-dollar",
    badge: "Popular",
    color: "from-red-500 to-red-600",
    textColor: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-950/20 border-red-200",
  },
  {
    id: "usa-salary-calculator",
    name: "Salary Needed to Buy",
    subtitle: "28/36 DTI income math",
    icon: "fas fa-money-bill-wave",
    badge: "Finance",
    color: "from-emerald-500 to-emerald-600",
    textColor: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200",
  },
  {
    id: "usa-kitchen-remodel",
    name: "Kitchen Remodel",
    subtitle: "Cabinets, counters, labor",
    icon: "fas fa-utensils",
    badge: "Top ROI",
    color: "from-[#c5a059] to-[#b38e47]",
    textColor: "text-[#0f2042] dark:text-[#c5a059]",
    bgColor: "bg-[#c5a059]/10 border-[#c5a059]/30",
  },
  {
    id: "usa-home-addition",
    name: "Home Addition",
    subtitle: "Master suite & bump-outs",
    icon: "fas fa-house-user",
    badge: null,
    color: "from-indigo-500 to-indigo-600",
    textColor: "text-indigo-600",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200",
  },
  {
    id: "usa-framing",
    name: "Framing & Lumber",
    subtitle: "Studs, joists, drywall",
    icon: "fas fa-ruler-combined",
    badge: "Trade",
    color: "from-stone-500 to-stone-600",
    textColor: "text-stone-600",
    bgColor: "bg-stone-50 dark:bg-stone-900/30 border-stone-200",
  },
  {
    id: "usa-roofing",
    name: "Roofing & Shingles",
    subtitle: "Asphalt, metal & tile",
    icon: "fas fa-warehouse",
    badge: null,
    color: "from-blue-500 to-blue-600",
    textColor: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/20 border-blue-200",
  },
  {
    id: "usa-swimming-pool",
    name: "Swimming Pool",
    subtitle: "Gunite, fiberglass, coping",
    icon: "fas fa-swimming-pool",
    badge: "Luxury",
    color: "from-sky-500 to-sky-600",
    textColor: "text-sky-600",
    bgColor: "bg-sky-50 dark:bg-sky-950/20 border-sky-200",
  },
  {
    id: "usa-pickleball-court",
    name: "Pickleball Court",
    subtitle: "Post-tension concrete & mesh",
    icon: "fas fa-table-tennis",
    badge: "Trending",
    color: "from-orange-500 to-orange-600",
    textColor: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-950/20 border-orange-200",
  },
  {
    id: "usa-outdoor-kitchen",
    name: "Outdoor Kitchen",
    subtitle: "Masonry, grill & appliances",
    icon: "fas fa-fire-burner",
    badge: "Luxury",
    color: "from-rose-500 to-rose-600",
    textColor: "text-rose-600",
    bgColor: "bg-rose-50 dark:bg-rose-950/20 border-rose-200",
  },
  {
    id: "permits",
    name: "Permit & Code Portals",
    subtitle: "City zoning regulations",
    icon: "fas fa-clipboard-check",
    badge: "Guides",
    route: "/permits",
    color: "from-purple-500 to-purple-600",
    textColor: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/20 border-purple-200",
  },
  {
    id: "usa-garden-bed",
    name: "Raised Garden Bed",
    subtitle: "Cedar & soil cubic yards",
    icon: "fas fa-leaf",
    badge: null,
    color: "from-teal-500 to-teal-600",
    textColor: "text-teal-600",
    bgColor: "bg-teal-50 dark:bg-teal-950/20 border-teal-200",
  },
];

const UAE_QUICK_TOOLS: QuickTool[] = [
  {
    id: "dubai-calc",
    name: "Dubai Buying Cost Calc",
    subtitle: "DLD 4%, Trustee, Mortgage fee",
    icon: "fas fa-calculator",
    badge: "Essential",
    route: "/dubai-property/calculator",
    color: "from-[#0f2042] to-[#1a3360]",
    textColor: "text-[#0f2042] dark:text-[#c5a059]",
    bgColor: "bg-[#c5a059]/10 border-[#c5a059]/30",
  },
  {
    id: "dubai-hub",
    name: "Investment Advisor",
    subtitle: "Zero tax & freehold rules",
    icon: "fas fa-city",
    badge: "Advisor",
    route: "/dubai-property",
    color: "from-blue-500 to-blue-600",
    textColor: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/20 border-blue-200",
  },
  {
    id: "dubai-partners",
    name: "RERA Partner Network",
    subtitle: "Broker co-brokerage & leads",
    icon: "fas fa-handshake",
    badge: "Brokers",
    route: "/dubai-property/partners",
    color: "from-slate-600 to-slate-700",
    textColor: "text-slate-700 dark:text-slate-300",
    bgColor: "bg-slate-50 dark:bg-slate-900/30 border-slate-200",
  },
  {
    id: "dubai-areas",
    name: "15+ Freehold Area Guides",
    subtitle: "Prices, ROI & lifestyle",
    icon: "fas fa-map-marked-alt",
    badge: "Intelligence",
    route: "/dubai-property#areas",
    color: "from-emerald-500 to-emerald-600",
    textColor: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200",
  },
  {
    id: "dubai-marina",
    name: "Dubai Marina Guide",
    subtitle: "Waterfront luxury & rental yields",
    icon: "fas fa-water",
    badge: "Top Yield",
    route: "/dubai-property/areas/dubai-marina",
    color: "from-cyan-500 to-cyan-600",
    textColor: "text-cyan-600",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200",
  },
  {
    id: "dubai-downtown",
    name: "Downtown Dubai",
    subtitle: "Burj Khalifa prime district",
    icon: "fas fa-gem",
    badge: "Prime",
    route: "/dubai-property/areas/downtown-dubai",
    color: "from-purple-500 to-purple-600",
    textColor: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/20 border-purple-200",
  },
  {
    id: "dubai-jvc",
    name: "JVC Community",
    subtitle: "Affordable high rental yield",
    icon: "fas fa-home",
    badge: "Best Value",
    route: "/dubai-property/areas/jumeirah-village-circle",
    color: "from-teal-500 to-teal-600",
    textColor: "text-teal-600",
    bgColor: "bg-teal-50 dark:bg-teal-950/20 border-teal-200",
  },
  {
    id: "dubai-business-bay",
    name: "Business Bay",
    subtitle: "Commercial & corporate living",
    icon: "fas fa-briefcase",
    badge: "Hot Hub",
    route: "/dubai-property/areas/business-bay",
    color: "from-indigo-500 to-indigo-600",
    textColor: "text-indigo-600",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200",
  },
  {
    id: "dubai-hills",
    name: "Dubai Hills Estate",
    subtitle: "Golf course & family luxury",
    icon: "fas fa-tree",
    badge: "Green",
    route: "/dubai-property/areas/dubai-hills-estate",
    color: "from-stone-500 to-stone-600",
    textColor: "text-stone-600",
    bgColor: "bg-stone-50 dark:bg-stone-900/30 border-stone-200",
  },
];

export default function Dashboard() {
  const { user, hasPaid, role, credits, planTier, loading } = useUser();
  const { region, setRegion } = useRegion();
  const { showToast } = useToast();
  const router = useRouter();

  const [projects, setProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const isIndiaMode = region === "IN" || !region;

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
    if (user) fetchProjects();
  }, [user]);

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

  // Active country mode (defaults to IN if null)
  const activeCountryMode: "IN" | "US" | "AE" = region === "US" ? "US" : region === "AE" ? "AE" : "IN";

  // Format currency based on region or project type
  const formatCurrencyByRegion = (amount: number, targetCountry?: "IN" | "US" | "AE") => {
    const c = targetCountry || activeCountryMode;
    if (!amount || isNaN(amount)) return "—";
    if (c === "US") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(amount);
    }
    if (c === "AE") {
      return `AED ${amount.toLocaleString("en-AE", { maximumFractionDigits: 0 })}`;
    }
    return formatIndianCurrency(amount);
  };

  // Launch a calculator directly and enforce country mode
  const launchCalculator = (calcId: string, targetCountry: "IN" | "US" | "AE" = "IN", route?: string) => {
    setRegion(targetCountry);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("hde_region", targetCountry);
    }
    if (route) {
      router.push(route);
      return;
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem("hde_active_calc", calcId);
    }
    router.push(`/#tools`);
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
    } catch (error) {
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
            className="block w-full py-3.5 bg-primary hover:bg-primary-hover text-white dark:text-zinc-950 rounded-xl font-bold shadow-md transition"
          >
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-zinc-950 py-8">
      <div className="container mx-auto px-4 max-w-7xl space-y-8 animate-fade-in">
        {/* Top Header & Context Bar */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-0.5 rounded-full border border-emerald-200/60">
                  {isIndiaMode ? "🇮🇳 India Builder Workspace" : `${region} Workspace`}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                  Tier: {planTier.toUpperCase()}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
                Project Dashboard &amp; Estimator Hub
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
                Manage saved BOQ estimates, monitor project budgets, and launch specialized Indian construction tools.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Region quick switch pill */}
              <div className="flex items-center bg-gray-100 dark:bg-zinc-800 rounded-xl p-1 text-xs font-bold">
                <button
                  onClick={() => setRegion("IN")}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    isIndiaMode ? "bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  🇮🇳 India
                </button>
                <button
                  onClick={() => setRegion("US")}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    region === "US" ? "bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  🇺🇸 USA
                </button>
                <button
                  onClick={() => setRegion("AE")}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    region === "AE" ? "bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  🇦🇪 UAE
                </button>
              </div>

              <Link
                href="/admin/health"
                className="px-3.5 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
                title="View Real-Time Platform Health & Diagnostics"
              >
                <i className="fas fa-heartbeat text-emerald-500 animate-pulse"></i>
                <span className="hidden sm:inline">Platform Health</span>
              </Link>

              <Link
                href="/upgrade"
                className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <i className="fas fa-plus-circle"></i>
                <span>Add Credits / Upgrade</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {/* Credits */}
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

            {/* Total Saved Projects */}
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

            {/* Total Portfolio Value */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
              <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-zinc-400 mb-1">
                <span>Total Portfolio Value</span>
                <i className="fas fa-chart-pie text-emerald-500"></i>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 truncate">
                {activeCountryMode === "US"
                  ? `$${portfolioStats.totalCostSum.toLocaleString()}`
                  : activeCountryMode === "AE"
                  ? `AED ${portfolioStats.totalCostSum.toLocaleString()}`
                  : portfolioStats.totalCostSum >= 100000
                  ? `₹${(portfolioStats.totalCostSum / 100000).toFixed(1)} L`
                  : `₹${portfolioStats.totalCostSum.toLocaleString("en-IN")}`}
              </div>
              <div className="text-[10px] text-gray-400 mt-1 truncate">
                Across {portfolioStats.totalCount} calculations
              </div>
            </div>

            {/* Account Status */}
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
            <div className="mt-5 p-4 rounded-xl bg-red-50 border border-red-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-red-900 text-xs">
              <div className="flex items-center gap-3">
                <i className="fas fa-exclamation-triangle text-red-600 text-base shrink-0"></i>
                <div>
                  <strong>You have 0 credits remaining.</strong> Saving custom estimates and generating detailed PDF bills requires active credits.
                </div>
              </div>
              <Link
                href="/upgrade"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg whitespace-nowrap shadow-sm transition"
              >
                Buy Credits (From ₹199)
              </Link>
            </div>
          )}
        </div>

        {/* --- USEFUL PLATFORM & ADMIN HUBS --- */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center justify-center text-sm">
                <i className="fas fa-toolbox"></i>
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-zinc-100 text-sm sm:text-base">
                  Platform Hubs &amp; Management Utilities
                </h3>
                <p className="text-gray-500 dark:text-zinc-400 text-xs">
                  Direct access to system monitoring, developer tools, and regional content hubs.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200/50 self-start sm:self-auto flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Admin &amp; Dev Tools
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* 1. Platform Health & Diagnostics */}
            <Link
              href="/admin/health"
              className="group p-3.5 rounded-xl border border-emerald-200/70 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/10 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition flex items-start gap-3 shadow-2xs"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition">
                <i className="fas fa-heartbeat text-base"></i>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-xs sm:text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                    Platform Health &amp; Diagnostics
                  </h4>
                  <i className="fas fa-arrow-right text-[10px] text-gray-400 group-hover:text-emerald-600 transition"></i>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 line-clamp-2 mt-0.5">
                  Live Supabase status, calculation math smoke-tests, and server health.
                </p>
              </div>
            </Link>

            {/* 2. Developer SEO URL Matrix */}
            <Link
              href="/dev-links"
              className="group p-3.5 rounded-xl border border-blue-200/70 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/10 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition flex items-start gap-3 shadow-2xs"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition">
                <i className="fas fa-sitemap text-base"></i>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-xs sm:text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                    Developer SEO URL Matrix
                  </h4>
                  <i className="fas fa-arrow-right text-[10px] text-gray-400 group-hover:text-blue-600 transition"></i>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 line-clamp-2 mt-0.5">
                  Access 769+ programmatic city routes, state hubs, and bulk URL exporter.
                </p>
              </div>
            </Link>

            {/* 3. House Plans Architectural Gallery */}
            <Link
              href="/plans"
              className="group p-3.5 rounded-xl border border-[#c5a059]/30 dark:border-[#c5a059]/20 bg-[#c5a059]/5 dark:bg-[#c5a059]/10 hover:bg-[#c5a059]/10 dark:hover:bg-[#c5a059]/20 transition flex items-start gap-3 shadow-2xs"
            >
              <div className="w-9 h-9 rounded-xl bg-[#c5a059]/15 text-[#0f2042] dark:text-[#c5a059] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition">
                <i className="fas fa-compass-drafting text-base"></i>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-xs sm:text-sm group-hover:text-[#0f2042] dark:group-hover:text-[#c5a059] transition">
                    House Plans Gallery
                  </h4>
                  <i className="fas fa-arrow-right text-[10px] text-gray-400 group-hover:text-[#c5a059] transition"></i>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 line-clamp-2 mt-0.5">
                  30x40, 20x30, 30x50 architectural layouts, filters, and design ideas.
                </p>
              </div>
            </Link>

            {/* 4. Dubai Property Advisor */}
            <Link
              href="/dubai-property"
              className="group p-3.5 rounded-xl border border-purple-200/70 dark:border-purple-900/40 bg-purple-50/40 dark:bg-purple-950/10 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition flex items-start gap-3 shadow-2xs"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition">
                <i className="fas fa-city text-base"></i>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-xs sm:text-sm group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                    Dubai Property Advisor
                  </h4>
                  <i className="fas fa-arrow-right text-[10px] text-gray-400 group-hover:text-purple-600 transition"></i>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 line-clamp-2 mt-0.5">
                  15+ Dubai area guides, buying cost calculator, and investment portal.
                </p>
              </div>
            </Link>

            {/* 5. Land Area Converter */}
            <Link
              href="/land-converter"
              className="group p-3.5 rounded-xl border border-teal-200/70 dark:border-teal-900/40 bg-teal-50/40 dark:bg-teal-950/10 hover:bg-teal-50 dark:hover:bg-teal-950/30 transition flex items-start gap-3 shadow-2xs"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition">
                <i className="fas fa-vector-square text-base"></i>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-xs sm:text-sm group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                    Land Unit Converter
                  </h4>
                  <i className="fas fa-arrow-right text-[10px] text-gray-400 group-hover:text-teal-600 transition"></i>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 line-clamp-2 mt-0.5">
                  Convert Gunta, Bigha, Cent, Acres, and Square Meters to Sq Ft.
                </p>
              </div>
            </Link>

            {/* 6. SEO Blog & Editorial Guides */}
            <Link
              href="/blog"
              className="group p-3.5 rounded-xl border border-rose-200/70 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/10 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition flex items-start gap-3 shadow-2xs"
            >
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition">
                <i className="fas fa-newspaper text-base"></i>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-xs sm:text-sm group-hover:text-rose-600 dark:group-hover:text-rose-400 transition">
                    SEO Blog &amp; Guides
                  </h4>
                  <i className="fas fa-arrow-right text-[10px] text-gray-400 group-hover:text-rose-600 transition"></i>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 line-clamp-2 mt-0.5">
                  Published 2026 home construction, interest rate, and remodeling pillar posts.
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* --- REGIONAL QUICK LAUNCHPAD --- */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  {activeCountryMode === "IN" ? "🇮🇳 India Mode" : activeCountryMode === "US" ? "🇺🇸 USA Mode" : "🇦🇪 UAE Mode"}
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <i className="fas fa-bolt text-primary"></i>
                  <span>
                    {activeCountryMode === "IN"
                      ? "India Construction & Property Calculators"
                      : activeCountryMode === "US"
                      ? "USA Home & Real Estate Calculators"
                      : "UAE & Dubai Property Intelligence"}
                  </span>
                </h2>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                {activeCountryMode === "IN"
                  ? "Select an Indian construction BOQ, home loan EMI, interior, or land measurement tool."
                  : activeCountryMode === "US"
                  ? "Select a US framing, roofing, rent vs buy, property tax, or luxury remodel tool."
                  : "Calculate true Dubai property buying costs, browse 15+ freehold area guides, and evaluate ROI."}
              </p>
            </div>

            {/* Country Selector Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-zinc-800 rounded-xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setRegion("IN");
                  if (typeof window !== "undefined") localStorage.setItem("hde_region", "IN");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeCountryMode === "IN"
                    ? "bg-white dark:bg-zinc-900 text-primary shadow-sm"
                    : "text-gray-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>🇮🇳</span>
                <span>India</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRegion("US");
                  if (typeof window !== "undefined") localStorage.setItem("hde_region", "US");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeCountryMode === "US"
                    ? "bg-white dark:bg-zinc-900 text-primary shadow-sm"
                    : "text-gray-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>🇺🇸</span>
                <span>USA</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRegion("AE");
                  if (typeof window !== "undefined") localStorage.setItem("hde_region", "AE");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeCountryMode === "AE"
                    ? "bg-white dark:bg-zinc-900 text-primary shadow-sm"
                    : "text-gray-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>🇦🇪</span>
                <span>UAE / Dubai</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {(activeCountryMode === "US" ? USA_QUICK_TOOLS : activeCountryMode === "AE" ? UAE_QUICK_TOOLS : INDIA_QUICK_TOOLS).map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => launchCalculator(tool.id, activeCountryMode, tool.route)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-md bg-white dark:bg-zinc-900 ${tool.bgColor} flex flex-col justify-between cursor-pointer group`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.color} text-white flex items-center justify-center text-sm shadow-sm group-hover:scale-110 transition-transform`}>
                      <i className={tool.icon}></i>
                    </div>
                    {tool.badge && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/80 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 shadow-2xs">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm group-hover:text-primary transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5 leading-snug">
                    {tool.subtitle}
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-bold text-primary">
                  <span>{tool.route ? "Open Tool" : "Launch Calculator"}</span>
                  <i className="fas fa-arrow-right text-[10px] transform group-hover:translate-x-1 transition-transform"></i>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* --- SAVED ESTIMATES DIRECTORY --- */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-zinc-800">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <i className="fas fa-history text-primary"></i>
                <span>Saved Cost Estimates &amp; Plans</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Click any saved estimate to inspect its itemized breakdown, download PDF, or resume calculation.
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
                  ? "No projects match your search or filter. Try clearing filters."
                  : "You haven't saved any calculations yet. Launch any tool above to save your first estimate."}
              </p>
              <button
                type="button"
                onClick={() => launchCalculator(activeCountryMode === "US" ? "usa-framing" : "construction", activeCountryMode)}
                className="mt-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow transition cursor-pointer"
              >
                {activeCountryMode === "US" ? "Calculate US Framing Now" : activeCountryMode === "AE" ? "Open Dubai Cost Calculator" : "Calculate House Construction Now"}
              </button>
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
                  onClick={() => setSelectedProject(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer"
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

        {/* Admin Controls */}
        {role === "admin" && (
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <i className="fas fa-tools"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-zinc-100">Admin Controls</h3>
            </div>
            <HeroManager />
          </div>
        )}
      </div>
    </div>
  );
}
