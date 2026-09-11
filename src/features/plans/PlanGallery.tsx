"use client";
// src/features/plans/PlanGallery.tsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../config/supabaseClient";
import { useUser } from "../../context/UserContext";
import { useToast } from "../../context/ToastContext";
import { Button } from "../../components/ui/Button";
import { PlanUploader } from "./PlanUploader";
import { getHousePlanEstimate, getHousePlanTradeBreakdown } from "../../utils/calculatorEngines";

const PLANS_PER_PAGE = 24;

interface HousePlan {
  id: string;
  title: string;
  area_sqft: number;
  facing: string;
  file_url: string;
  dimensions: string;
  floors: string;
  bedrooms: number;
  bathrooms: number;
  parking: string;
  description: string;
  youtube_url?: string;
  kitchen_info?: string;
  living_hall_info?: string;
}

const VERIFIED_FALLBACK_PLANS: HousePlan[] = [
  {
    id: "fb-1",
    title: "1200 Sqft 3 BHK Duplex House Plan (30×40)",
    dimensions: "30x40",
    area_sqft: 1200,
    facing: "East",
    floors: "G+1",
    bedrooms: 3,
    bathrooms: 3,
    parking: "1 Car",
    description: "Architectural 30x40 duplex house plan. Ground floor features spacious living hall, modern kitchen, dining space, and 1 guest bedroom. First floor has 2 master bedrooms with en-suite baths and private balcony.",
    file_url: "full-plans/1775572207976-plan.webp",
    kitchen_info: "1 Modular",
    living_hall_info: "1 Large",
  },
  {
    id: "fb-2",
    title: "1200 Sqft 2 BHK Modern Single Floor Plan (30×40)",
    dimensions: "30x40",
    area_sqft: 1200,
    facing: "East",
    floors: "Ground Floor",
    bedrooms: 2,
    bathrooms: 2,
    parking: "1 Car + Bike",
    description: "Optimal single-floor 30x40 layout with front covered car porch, open concept living and dining, dedicated home office space, and rear utility yard.",
    file_url: "full-plans/1775572207976-plan.webp",
    kitchen_info: "1 Semi-modular",
    living_hall_info: "1",
  },
  {
    id: "fb-3",
    title: "1500 Sqft 3 BHK Luxury Duplex Layout (30×50)",
    dimensions: "30x50",
    area_sqft: 1500,
    facing: "South",
    floors: "G+1",
    bedrooms: 3,
    bathrooms: 3,
    parking: "1 SUV",
    description: "Spacious 30x50 duplex with double-height ceiling over living hall, large modular kitchen with pantry, master suite with walk-in closet, and terrace garden.",
    file_url: "full-plans/1775658424321-plan.webp",
    kitchen_info: "1 + Pantry",
    living_hall_info: "1 Double Height",
  },
  {
    id: "fb-4",
    title: "1000 Sqft Compact Townhouse Floor Plan (25×40)",
    dimensions: "25x40",
    area_sqft: 1000,
    facing: "North",
    floors: "G+1",
    bedrooms: 2,
    bathrooms: 2,
    parking: "1 Car",
    description: "Smart space-saving 25x40 floor plan with excellent cross-ventilation, open kitchen, two well-proportioned bedrooms, and upper family lounge.",
    file_url: "full-plans/1775623303178-plan.webp",
    kitchen_info: "1",
    living_hall_info: "1",
  },
  {
    id: "fb-5",
    title: "600 Sqft 2 BHK Small Plot House Plan (20×30)",
    dimensions: "20x30",
    area_sqft: 600,
    facing: "East",
    floors: "G+1",
    bedrooms: 2,
    bathrooms: 2,
    parking: "Two-Wheeler",
    description: "Highly efficient 20x30 duplex plan for urban plots. Ground floor living room and kitchen, first floor with 2 cozy bedrooms and central light shaft.",
    file_url: "full-plans/1775572207976-plan.webp",
    kitchen_info: "1 Compact",
    living_hall_info: "1",
  },
  {
    id: "fb-6",
    title: "2400 Sqft 4 BHK Luxury Villa Blueprint (40×60)",
    dimensions: "40x60",
    area_sqft: 2400,
    facing: "East",
    floors: "G+1",
    bedrooms: 4,
    bathrooms: 4,
    parking: "2 Cars",
    description: "Premium 40x60 bungalow layout with twin car garage, grand foyer, formal dining room, private home theater, and landscaped lawn courtyard.",
    file_url: "full-plans/1775658424321-plan.webp",
    kitchen_info: "1 Island Kitchen",
    living_hall_info: "1 Grand Hall",
  },
  {
    id: "fb-7",
    title: "800 Sqft 2 BHK Linear House Plan (20×40)",
    dimensions: "20x40",
    area_sqft: 800,
    facing: "North",
    floors: "G+1",
    bedrooms: 2,
    bathrooms: 2,
    parking: "1 Car",
    description: "Linear 20x40 architectural layout with central light cut-out, separate kitchen and utility, ground floor bedroom, and upper master bedroom.",
    file_url: "full-plans/1775623303178-plan.webp",
    kitchen_info: "1",
    living_hall_info: "1",
  },
  {
    id: "fb-8",
    title: "1800 Sqft 3 BHK Duplex with Dual Parking (30×60)",
    dimensions: "30x60",
    area_sqft: 1800,
    facing: "East",
    floors: "G+1",
    bedrooms: 3,
    bathrooms: 3,
    parking: "2 Cars",
    description: "Depth-oriented 30x60 duplex with dual SUV parking, expansive front veranda, large open kitchen, study room, and rear private garden.",
    file_url: "full-plans/1775572207976-plan.webp",
    kitchen_info: "1 + Store",
    living_hall_info: "1",
  }
];

const getYouTubeID = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const HoverZoomImage = ({ src, alt, onClick, isLocked }: { src: string, alt: string, onClick: () => void, isLocked: boolean }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setPosition({ x, y });
  };

  return (
    <div 
      className="relative aspect-[3/4] bg-gray-100 dark:bg-zinc-800 group cursor-pointer overflow-hidden w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      onClick={onClick}
    >
      <img src={src} alt={alt} className={`w-full h-full object-cover transition-opacity duration-150 ${isHovered ? 'opacity-0' : 'opacity-100'}`} />
      <div 
        className={`absolute inset-0 transition-opacity duration-150 pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        style={{ backgroundImage: `url(${src})`, backgroundPosition: `${position.x}% ${position.y}%`, backgroundSize: '250%', backgroundRepeat: 'no-repeat' }}
      />
      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
         <div className="bg-black/50 text-white rounded-full w-12 h-12 flex items-center justify-center backdrop-blur-sm drop-shadow-md">
            <i className={`fas ${isLocked ? 'fa-lock' : 'fa-download'} text-xl`}></i>
         </div>
      </div>
    </div>
  );
};

export const PlanGallery: React.FC = () => {
  const [dbPlans, setDbPlans] = useState<HousePlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [facingFilter, setFacingFilter] = useState("all");
  const [areaFilter, setAreaFilter] = useState("all");
  const [dimensionFilter, setDimensionFilter] = useState("all");
  const [bhkFilter, setBhkFilter] = useState("all");
  
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  
  const [selectedPlan, setSelectedPlan] = useState<HousePlan | null>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<HousePlan>>({});
  const [isUpdating, setIsUpdating] = useState(false);

  const { user, hasPaid, planTier, role } = useUser();
  const { showToast } = useToast();
  const navigate = useRouter();

  // Track any fallback plans that the admin has deleted locally
  const [deletedFbIds, setDeletedFbIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        return JSON.parse(localStorage.getItem("deleted_fb_plans") || "[]");
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Read URL params on mount if present (e.g. /plans?area=1200&facing=East)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const facing = params.get("facing");
      const area = params.get("area");
      const dim = params.get("dim") || params.get("dimensions");
      const bhk = params.get("bhk");
      const q = params.get("q") || params.get("search");

      if (facing) setFacingFilter(facing);
      if (area) setAreaFilter(area);
      if (dim) setDimensionFilter(dim);
      if (bhk) setBhkFilter(bhk);
      if (q) setSearchQuery(q);
    }
  }, []);

  const fetchPlans = useCallback(async (pageNum: number) => {
    setLoading(true);
    const from = pageNum * PLANS_PER_PAGE;
    const to = from + PLANS_PER_PAGE - 1;

    try {
      const { data, error } = await supabase
        .from('house_plans')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      if (data) {
        if (data.length < PLANS_PER_PAGE) setHasMore(false);
        setDbPlans(prev => pageNum === 0 ? data : [...prev, ...data]);
      }
    } catch (err: any) {
      console.warn("Error fetching plans:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPlans(0); }, [fetchPlans]);

  useEffect(() => {
    setIsEditing(false);
    if (selectedPlan) {
      setEditData(selectedPlan);
    }
  }, [selectedPlan]);

  const handleDelete = async (plan: HousePlan) => {
    if (!window.confirm(`⚠️ Delete "${plan.title}" entirely?`)) return;
    try {
      // If it's a fallback plan, remove it and save to deleted list
      if (plan.id.startsWith("fb-")) {
        setDeletedFbIds(prev => {
          const next = [...prev, plan.id];
          try { localStorage.setItem("deleted_fb_plans", JSON.stringify(next)); } catch (e) {}
          return next;
        });
        setDbPlans(prev => prev.filter(p => p.id !== plan.id));
        if (selectedPlan?.id === plan.id) setSelectedPlan(null);
        showToast("Plan deleted.", "success");
        return;
      }

      const { data, error: dbError } = await supabase
        .from('house_plans')
        .delete()
        .eq('id', plan.id)
        .select();

      if (dbError) throw dbError;
      if (!data || data.length === 0) throw new Error("Deletion blocked by Database RLS Policy.");

      const getRelativePath = (url: string) => url.includes('/house-plans/') ? url.split('/house-plans/')[1].replace(/^\/+/, '') : url;
      try {
        await supabase.storage.from('house-plans').remove([getRelativePath(plan.file_url)]);
      } catch (storageErr) {
        console.warn("Storage removal warning:", storageErr);
      }
      
      setDbPlans(prev => prev.filter(p => p.id !== plan.id));
      if (selectedPlan?.id === plan.id) setSelectedPlan(null);
      showToast("Plan deleted.", "success");
    } catch (err: any) { 
      showToast("Failed to delete plan: " + err.message, "error"); 
    }
  };

  const handleUpdatePlan = async () => {
    if (!selectedPlan) return;
    setIsUpdating(true);
    try {
      const payload = {
        title: editData.title,
        area_sqft: editData.area_sqft,
        facing: editData.facing,
        dimensions: editData.dimensions,
        bedrooms: editData.bedrooms,
        bathrooms: editData.bathrooms,
        floors: editData.floors,
        parking: editData.parking,
        description: editData.description,
        youtube_url: editData.youtube_url,
        kitchen_info: editData.kitchen_info,
        living_hall_info: editData.living_hall_info,
      };

      const { error } = await supabase
        .from('house_plans')
        .update(payload)
        .eq('id', selectedPlan.id);

      if (error) throw error;
      
      setDbPlans(prev => prev.map(p => p.id === selectedPlan.id ? { ...p, ...payload } as HousePlan : p));
      setSelectedPlan(prev => prev ? { ...prev, ...payload } as HousePlan : null);
      setIsEditing(false);
      showToast("Plan updated successfully!", "success");
    } catch (err: any) {
      showToast("Update failed: " + err.message, "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownload = async (plan: HousePlan) => {
    if (isLockedForUser) {
      navigate.push("/upgrade");
      return;
    }

    setDownloadingId(plan.id);
    setDownloadProgress(20);

    const interval = setInterval(() => {
      setDownloadProgress(prev => (prev < 90 ? prev + 15 : prev));
    }, 200);

    try {
      let downloadUrl = plan.file_url;
      if (!downloadUrl.startsWith("http")) {
        const cleanPath = plan.file_url.replace(/^\/+/, "");
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ncontvjtfhsabphxfuhb.supabase.co";
        downloadUrl = `${supabaseUrl}/storage/v1/object/public/house-plans/${cleanPath}`;
      }

      const res = await fetch(downloadUrl);
      if (!res.ok) throw new Error("Could not download blueprint file.");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${plan.title.replace(/[^a-zA-Z0-9]/g, "_")}.webp`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      clearInterval(interval);
      setDownloadProgress(100);
      showToast("High-resolution blueprint downloaded!", "success");

      setTimeout(() => {
        URL.revokeObjectURL(url);
        setDownloadingId(null);
        setDownloadProgress(0);
      }, 600);
    } catch (err: any) {
      clearInterval(interval);
      showToast("Download failed.", "error");
      setDownloadingId(null);
      setDownloadProgress(0);
    }
  };

  const getImageUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const cleanPath = path.replace(/^\/+/, "");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ncontvjtfhsabphxfuhb.supabase.co";
    return `${supabaseUrl}/storage/v1/object/public/house-plans/${cleanPath}`;
  };

  // Combine DB plans with verified fallbacks, avoiding duplicate IDs
  const combinedPlans = useMemo(() => {
    // If database has real plans, use ONLY the database plans to eliminate duplicate cards!
    if (dbPlans.length > 0) {
      return dbPlans;
    }
    // Only if database has 0 plans (or network fails), display fallbacks (excluding any deleted ones)
    return VERIFIED_FALLBACK_PLANS.filter(fb => !deletedFbIds.includes(fb.id));
  }, [dbPlans, deletedFbIds]);

  // Client-Side Multi-Filter Logic
  const filteredPlans = useMemo(() => {
    return combinedPlans.filter((plan) => {
      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          plan.title?.toLowerCase().includes(q) ||
          plan.dimensions?.toLowerCase().includes(q) ||
          plan.facing?.toLowerCase().includes(q) ||
          plan.description?.toLowerCase().includes(q) ||
          plan.area_sqft?.toString().includes(q) ||
          `${plan.bedrooms} bhk`.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // 2. Facing Filter
      if (facingFilter !== "all") {
        if (!plan.facing || !plan.facing.toLowerCase().includes(facingFilter.toLowerCase())) {
          return false;
        }
      }

      // 3. Area Filter
      if (areaFilter !== "all") {
        const area = plan.area_sqft || 0;
        if (areaFilter === "600" && (area < 500 || area > 700)) return false;
        if (areaFilter === "800" && (area < 701 || area > 900)) return false;
        if (areaFilter === "1000" && (area < 901 || area > 1100)) return false;
        if (areaFilter === "1200" && (area < 1101 || area > 1350)) return false;
        if (areaFilter === "1500" && (area < 1351 || area > 1650)) return false;
        if (areaFilter === "1800" && (area < 1651 || area > 2000)) return false;
        if (areaFilter === "2400" && (area < 2001 || area > 2800)) return false;
        if ((areaFilter === "3200+" || areaFilter === "3200" || areaFilter === "4000+") && area <= 2800) return false;
      }

      // 4. Dimension Filter
      if (dimensionFilter !== "all") {
        const cleanTarget = dimensionFilter.toLowerCase().replace(/[^0-9x]/g, "");
        const cleanDim = (plan.dimensions || "").toLowerCase().replace(/[^0-9x]/g, "");
        if (!cleanDim.includes(cleanTarget)) return false;
      }

      // 5. BHK Filter
      if (bhkFilter !== "all") {
        if (bhkFilter === "4+") {
          if ((plan.bedrooms || 0) < 4) return false;
        } else {
          if (plan.bedrooms !== parseInt(bhkFilter, 10)) return false;
        }
      }

      return true;
    });
  }, [combinedPlans, searchQuery, facingFilter, areaFilter, dimensionFilter, bhkFilter]);

  const hasActiveFilters = 
    searchQuery.trim() !== "" || 
    facingFilter !== "all" || 
    areaFilter !== "all" || 
    dimensionFilter !== "all" || 
    bhkFilter !== "all";

  const resetFilters = () => {
    setSearchQuery("");
    setFacingFilter("all");
    setAreaFilter("all");
    setDimensionFilter("all");
    setBhkFilter("all");
  };

  const setSpecificFilter = (area: string, facing: string, dim: string = "all") => {
    setAreaFilter(area);
    setFacingFilter(facing);
    setDimensionFilter(dim);
    setSearchQuery("");
  };

  const currentTier = planTier || (hasPaid ? 'pro' : 'free');
  const isLockedForUser = currentTier === 'free' && role !== 'admin';

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in relative max-w-7xl">
      <div className="mb-6">
        <a href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-bold bg-white dark:bg-zinc-900 px-5 py-2.5 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 hover:shadow-md w-fit text-sm">
          <i className="fas fa-arrow-left"></i> Back to Calculator
        </a>
      </div>

      {role === 'admin' && <PlanUploader onUploadSuccess={() => fetchPlans(0)} />}

      {/* Modern Interactive Search & Filter System */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-7 shadow-sm border border-gray-200/80 dark:border-zinc-800 mb-8 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-zinc-800 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <i className="fas fa-sliders text-primary text-base"></i>
              <span>Filter Architectural Plans</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
              Filter blueprints by exact plot size, entrance facing, dimensions, and BHK.
            </p>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200/60 dark:border-red-800/40 px-3.5 py-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40 transition w-fit"
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
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. 1200 sqft, 30x40, East, Duplex..."
                className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-xl outline-none focus:border-primary focus:bg-white dark:focus:bg-zinc-800 transition text-slate-900 dark:text-zinc-100"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
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
              onChange={(e) => setAreaFilter(e.target.value)}
              className="w-full py-2.5 px-3 text-xs sm:text-sm bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-xl outline-none focus:border-primary focus:bg-white dark:focus:bg-zinc-800 transition font-medium text-slate-800 dark:text-zinc-200"
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
              onChange={(e) => setFacingFilter(e.target.value)}
              className="w-full py-2.5 px-3 text-xs sm:text-sm bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-xl outline-none focus:border-primary focus:bg-white dark:focus:bg-zinc-800 transition font-medium text-slate-800 dark:text-zinc-200"
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
              onChange={(e) => setBhkFilter(e.target.value)}
              className="w-full py-2.5 px-3 text-xs sm:text-sm bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-xl outline-none focus:border-primary focus:bg-white dark:focus:bg-zinc-800 transition font-medium text-slate-800 dark:text-zinc-200"
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
              onClick={resetFilters}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition border ${
                !hasActiveFilters
                  ? "bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent shadow-sm"
                  : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:border-gray-300"
              }`}
            >
              ⭐ All Plans
            </button>

            {/* 1200 Sqft East Facing - Specific User Request */}
            <button
              onClick={() => setSpecificFilter("1200", "East", "30x40")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition border ${
                areaFilter === "1200" && facingFilter === "East"
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-300/60 hover:bg-emerald-600 hover:text-white"
              }`}
            >
              🎯 1200 sqft East Facing
            </button>

            <button
              onClick={() => setSpecificFilter("600", "all", "20x30")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition border ${
                areaFilter === "600"
                  ? "bg-primary text-white border-primary"
                  : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:bg-gray-200"
              }`}
            >
              📐 20×30 (600 sqft)
            </button>

            <button
              onClick={() => setSpecificFilter("1200", "all", "30x40")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition border ${
                areaFilter === "1200" && facingFilter === "all"
                  ? "bg-primary text-white border-primary"
                  : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:bg-gray-200"
              }`}
            >
              📐 30×40 (1200 sqft)
            </button>

            <button
              onClick={() => setSpecificFilter("1500", "all", "30x50")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition border ${
                areaFilter === "1500"
                  ? "bg-primary text-white border-primary"
                  : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:bg-gray-200"
              }`}
            >
              📐 30×50 (1500 sqft)
            </button>

            <button
              onClick={() => setSpecificFilter("2400", "all", "40x60")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition border ${
                areaFilter === "2400"
                  ? "bg-primary text-white border-primary"
                  : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:bg-gray-200"
              }`}
            >
              📐 40×60 (2400 sqft)
            </button>

            <button
              onClick={() => { setFacingFilter("East"); setAreaFilter("all"); setDimensionFilter("all"); }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition border ${
                facingFilter === "East" && areaFilter === "all"
                  ? "bg-amber-600 text-white border-amber-600"
                  : "bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200/60 hover:bg-amber-600 hover:text-white"
              }`}
            >
              🌅 East Facing Only
            </button>

            <button
              onClick={() => { setFacingFilter("North"); setAreaFilter("all"); setDimensionFilter("all"); }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition border ${
                facingFilter === "North" && areaFilter === "all"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 border-blue-200/60 hover:bg-blue-600 hover:text-white"
              }`}
            >
              🧭 North Facing Only
            </button>

            <button
              onClick={() => { setBhkFilter("3"); setAreaFilter("all"); setFacingFilter("all"); setDimensionFilter("all"); }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition border ${
                bhkFilter === "3" && areaFilter === "all" && facingFilter === "all"
                  ? "bg-primary text-white border-primary"
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
            Showing <strong className="text-slate-900 dark:text-zinc-100 font-bold">{filteredPlans.length}</strong> {filteredPlans.length === 1 ? "architectural plan" : "architectural plans"}
            {hasActiveFilters && (
              <span> matching active filters</span>
            )}
          </p>
          {hasActiveFilters && (
            <span className="text-[11px] text-primary font-bold">
              Filters Active
            </span>
          )}
        </div>
      </div>

      {/* Architectural Concept Disclaimer Banner */}
      <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-2xl p-4 sm:p-5 mb-8 flex items-start gap-3.5 shadow-xs">
        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
          <i className="fas fa-compass-drafting text-sm"></i>
        </div>
        <div className="space-y-1 text-xs leading-relaxed text-amber-900/90 dark:text-amber-200/90">
          <p className="font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <span>Architectural Concept &amp; Sanction Disclaimer</span>
          </p>
          <p className="text-gray-600 dark:text-zinc-300">
            All floor plans and architectural designs provided on this platform serve as <strong>conceptual design ideas</strong>. Users must consult licensed professional architects, structural engineers, and local authorities for official structural drawings and statutory building sanction approvals. You may start using these plans as an initial concept and feel free to modify them; however, try to incorporate the recommended room dimensions, structural setbacks, and ventilation guidelines as much as possible where practical for your site.
          </p>
        </div>
      </div>

      {/* Grid of Filtered Plans */}
      {filteredPlans.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredPlans.map((plan) => {
            const videoId = getYouTubeID(plan.youtube_url || "");
            return (
              <div key={plan.id} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 border border-gray-100 dark:border-zinc-800 overflow-hidden flex flex-col relative transition-all duration-300">
                {videoId && (
                 <button 
                    onClick={(e) => { e.stopPropagation(); setActiveVideo(videoId); }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"
                    title="Watch Video Tour"
                  >
                    <i className="fas fa-play text-[10px] ml-0.5"></i>
                  </button>
                )}

                {role === 'admin' && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(plan); }} 
                    className="absolute top-2 right-2 z-20 bg-red-500/90 hover:bg-red-600 text-white w-8 h-8 rounded-lg flex items-center justify-center shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    title="Delete Plan"
                  >
                    <i className="fas fa-trash-alt text-sm"></i>
                  </button>
                )}

                <HoverZoomImage src={getImageUrl(plan.file_url)} alt={plan.title} onClick={() => handleDownload(plan)} isLocked={isLockedForUser} />
                
                <div className="p-4 flex flex-col gap-3 bg-white dark:bg-zinc-900 flex-grow">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-zinc-100 text-sm truncate mb-2" title={plan.title}>{plan.title}</h3>
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md border border-gray-200 dark:border-zinc-700">{plan.dimensions || `${plan.area_sqft} sqft`}</span>
                      <span className="text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">{plan.facing} Facing</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 text-[10px] text-gray-500 dark:text-zinc-400 border-t border-gray-100 dark:border-zinc-800 pt-3 px-1">
                    <div className="flex justify-between items-center">
                      <span title="Bedrooms" className="flex items-center gap-1"><i className="fas fa-bed text-gray-400"></i>{plan.bedrooms} BHK</span>
                      <span title="Bathrooms" className="flex items-center gap-1"><i className="fas fa-bath text-gray-400"></i>{plan.bathrooms} Bath</span>
                      <span title="Living Hall" className="flex items-center gap-1"><i className="fas fa-couch text-gray-400"></i>{plan.living_hall_info || '1 Hall'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span title="Kitchen" className="flex items-center gap-1"><i className="fas fa-kitchen-set text-gray-400"></i>{plan.kitchen_info || '1 Kitchen'}</span>
                      <span title="Floors" className="flex items-center gap-1"><i className="fas fa-layer-group text-gray-400"></i>{plan.floors}</span>
                      <span title="Car Parking" className="flex items-center gap-1"><i className="fas fa-car text-gray-400"></i>{plan.parking?.split(' ')[0] || '1 Car'}</span>
                    </div>
                  </div>

                  {/* Estimated Construction Budget & Live Calculator Connection */}
                  {(() => {
                    const est = getHousePlanEstimate(plan.area_sqft, plan.floors, plan.dimensions);
                    return (
                      <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/70 rounded-xl px-2.5 py-2 flex items-center justify-between gap-2 shadow-2xs">
                        <div className="min-w-0">
                          <span className="text-[9px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider block truncate">
                            Est. Construction
                          </span>
                          <span className="text-xs font-black text-slate-900 dark:text-zinc-100 tracking-tight">
                            ₹{est.minLakhs} – ₹{est.maxLakhs} L
                          </span>
                        </div>
                        <a
                          href={`/?calc=construction&area=${est.builtUpAreaSqft}#tools`}
                          title={`Estimate custom construction cost for ${est.builtUpAreaSqft} sqft built-up area`}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-slate-800 dark:text-zinc-100 border border-slate-300 dark:border-zinc-600 rounded-lg text-[10px] font-bold flex items-center gap-1 transition shadow-2xs shrink-0 no-underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <i className="fas fa-calculator text-[9px] text-gray-500 dark:text-zinc-400"></i>
                          <span>Calc</span>
                        </a>
                      </div>
                    );
                  })()}
                  
                  <div className="grid grid-cols-2 gap-2 mt-auto pt-2">
                    <button onClick={() => setSelectedPlan(plan)} className="w-full py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition-colors">
                      <i className="fas fa-eye mr-1"></i> Specs
                    </button>
                    {downloadingId === plan.id ? (
                      <div className="w-full flex items-center bg-gray-100 dark:bg-zinc-800 rounded-xl px-2"><div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-1.5"><div className="bg-primary h-1.5 rounded-full" style={{ width: `${downloadProgress}%` }}></div></div></div>
                    ) : (
                      <button 
                        onClick={() => handleDownload(plan)}
                        className={`w-full py-2 text-xs font-bold rounded-xl shadow-sm transition-colors ${!isLockedForUser ? "bg-primary text-white dark:text-zinc-950 hover:bg-primary-hover" : "bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700"}`}
                      >
                        <i className={`mr-1 ${!isLockedForUser ? "fas fa-download" : "fas fa-lock"}`}></i> {!isLockedForUser ? "DL" : "Pro"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-10 sm:p-14 text-center border border-gray-100 dark:border-zinc-800 shadow-sm max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mx-auto text-2xl">
            <i className="fas fa-drafting-compass"></i>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
            No Blueprints Found Matching This Filter
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
            We couldn't find an architectural plan with the exact combination of criteria selected. Try broadening your facing or area filter.
          </p>
          <div className="pt-2">
            <Button onClick={resetFilters} variant="primary" className="px-6 py-2.5 text-xs font-bold shadow-md">
              <i className="fas fa-rotate-left mr-2"></i> Reset All Filters
            </Button>
          </div>
        </div>
      )}

      {activeVideo && (
        <div className="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setActiveVideo(null)}>
          <div className="relative w-full max-w-[420px] aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10" onClick={e => e.stopPropagation()}>
            <button onClick={() => setActiveVideo(null)} className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors">
              <i className="fas fa-times"></i>
            </button>
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1&rel=0`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      {hasMore && dbPlans.length > 0 && !hasActiveFilters && (
        <div className="mt-12 flex justify-center">
          <Button onClick={() => { setPage(page + 1); fetchPlans(page + 1); }} variant="secondary" isLoading={loading} disabled={loading} className="px-8 py-3 shadow-md hover:shadow-lg">
            {loading ? "Loading..." : "Load More Plans"}
          </Button>
        </div>
      )}

      {selectedPlan && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => { if(!isEditing) setSelectedPlan(null) }}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl border border-gray-100 dark:border-zinc-800" onClick={e => e.stopPropagation()}>
            <div className="md:w-1/2 bg-gray-100 dark:bg-zinc-800 relative h-64 md:h-auto overflow-hidden flex-shrink-0">
               <img src={getImageUrl(selectedPlan.file_url)} className="w-full h-full object-contain" alt={selectedPlan.title} />
               {isLockedForUser && (
                 <div className="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none overflow-hidden">
                    <div className="absolute inset-0 flex flex-wrap content-center justify-center gap-10 opacity-20 transform -rotate-12 scale-150">
                      {Array.from({ length: 30 }).map((_, i) => (
                        <span key={i} className="text-black dark:text-white font-black text-5xl select-none">HDE</span>
                      ))}
                    </div>
                    <div className="relative z-10 w-20 h-20 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm shadow-xl border border-white/10">
                      <i className="fas fa-lock text-white text-3xl drop-shadow-lg"></i>
                    </div>
                 </div>
               )}
            </div>

            <div className="md:w-1/2 p-6 md:p-8 flex flex-col h-[50vh] md:h-auto overflow-y-auto relative">
              <div className="flex justify-between items-start mb-4">
                {isEditing ? (
                  <input type="text" value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} className="text-2xl font-bold text-gray-800 dark:text-zinc-100 pr-4 w-full border-b-2 border-primary outline-none focus:bg-gray-50 dark:focus:bg-zinc-800" />
                ) : (
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-zinc-100 pr-4">{selectedPlan.title}</h2>
                )}
                <button onClick={() => { setSelectedPlan(null); setIsEditing(false); }} className="text-gray-400 hover:text-gray-800 dark:hover:text-zinc-200 text-3xl leading-none transition-colors">&times;</button>
              </div>

              {isEditing && (
                <div className="mb-6">
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">YouTube Shorts Link</label>
                  <div className="relative">
                    <i className="fab fa-youtube absolute left-3 top-2.5 text-red-600"></i>
                    <input 
                      type="text" 
                      placeholder="Paste Shorts URL here..." 
                      value={editData.youtube_url || ""} 
                      onChange={e => setEditData({...editData, youtube_url: e.target.value})} 
                      className="w-full pl-10 p-2 text-xs border rounded-lg outline-none focus:border-primary dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100" 
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-6">
                {isEditing ? (
                  <>
                    <input type="number" value={editData.area_sqft} onChange={e => setEditData({...editData, area_sqft: parseInt(e.target.value)||0})} className="w-20 border rounded px-2 py-1 text-xs font-bold text-primary outline-none bg-gray-50 dark:bg-zinc-800" />
                    <input type="text" value={editData.facing} onChange={e => setEditData({...editData, facing: e.target.value})} className="w-20 border rounded px-2 py-1 text-xs font-bold text-gray-700 dark:text-zinc-300 outline-none bg-gray-50 dark:bg-zinc-800" />
                  </>
                ) : (
                  <>
                    <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-xs font-bold border border-primary/20"><i className="fas fa-ruler-combined mr-1"></i> {selectedPlan.area_sqft} Sq.Ft</span>
                    <span className="bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 dark:border-zinc-700"><i className="fas fa-compass mr-1"></i> Facing: {selectedPlan.facing}</span>
                    <span className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 px-3 py-1.5 rounded-lg text-xs font-bold border border-amber-200/60"><i className="fas fa-vector-square mr-1"></i> {selectedPlan.dimensions}</span>
                  </>
                )}
              </div>

              <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-2 mb-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Key Specifications</h4>
                {role === 'admin' && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleDelete(selectedPlan)} 
                      className="text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Delete Plan"
                    >
                      <i className="fas fa-trash-alt text-xs"></i>
                      <span>Delete</span>
                    </button>
                    <button onClick={() => { if (isEditing) handleUpdatePlan(); else setIsEditing(true); }} disabled={isUpdating} className="text-xs font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-colors cursor-pointer">
                      {isUpdating ? "Saving..." : isEditing ? "Save" : "Edit"}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center border border-blue-100 dark:border-blue-900/40"><i className="fas fa-bed"></i></div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Bedrooms</p>
                    {isEditing ? <input type="number" value={editData.bedrooms} onChange={e=>setEditData({...editData, bedrooms: parseInt(e.target.value)||0})} className="w-16 border rounded text-sm dark:bg-zinc-800" /> : <p className="font-bold text-gray-800 dark:text-zinc-200">{selectedPlan.bedrooms} BHK</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-500 flex items-center justify-center border border-cyan-100 dark:border-cyan-900/40"><i className="fas fa-bath"></i></div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Bathrooms</p>
                    {isEditing ? <input type="number" value={editData.bathrooms} onChange={e=>setEditData({...editData, bathrooms: parseInt(e.target.value)||0})} className="w-16 border rounded text-sm dark:bg-zinc-800" /> : <p className="font-bold text-gray-800 dark:text-zinc-200">{selectedPlan.bathrooms}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-500 flex items-center justify-center border border-purple-100 dark:border-purple-900/40"><i className="fas fa-layer-group"></i></div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Floors</p>
                    {isEditing ? <input type="text" value={editData.floors} onChange={e=>setEditData({...editData, floors: e.target.value})} className="w-16 border rounded text-sm dark:bg-zinc-800" /> : <p className="font-bold text-gray-800 dark:text-zinc-200">{selectedPlan.floors}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950/40 text-green-500 flex items-center justify-center border border-green-100 dark:border-green-900/40"><i className="fas fa-car"></i></div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Parking</p>
                    {isEditing ? <input type="text" value={editData.parking} onChange={e=>setEditData({...editData, parking: e.target.value})} className="w-24 border rounded text-sm dark:bg-zinc-800" /> : <p className="font-bold text-gray-800 dark:text-zinc-200">{selectedPlan.parking}</p>}
                  </div>
                </div>
                 <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 flex items-center justify-center border border-zinc-100 dark:border-zinc-700"><i className="fas fa-kitchen-set"></i></div>
                  <div>
                    <p className="text-[10px] text-gray-500 dark:text-zinc-500 font-bold uppercase">Kitchen</p>
                    {isEditing ? <input type="text" value={editData.kitchen_info} onChange={e=>setEditData({...editData, kitchen_info: e.target.value})} className="w-24 border rounded text-sm dark:bg-zinc-800" /> : <p className="font-bold text-gray-800 dark:text-zinc-200">{selectedPlan.kitchen_info || '1'}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-500 flex items-center justify-center border border-pink-100 dark:border-pink-900/40"><i className="fas fa-couch"></i></div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Living Hall</p>
                    {isEditing ? <input type="text" value={editData.living_hall_info} onChange={e=>setEditData({...editData, living_hall_info: e.target.value})} className="w-24 border rounded text-sm dark:bg-zinc-800" /> : <p className="font-bold text-gray-800 dark:text-zinc-200">{selectedPlan.living_hall_info || '1'}</p>}
                  </div>
                </div>
              </div>

              {/* Estimated Construction Budget & Home Loan Section */}
              {!isEditing && (() => {
                const modalEst = getHousePlanEstimate(selectedPlan.area_sqft, selectedPlan.floors, selectedPlan.dimensions);
                return (
                  <div className="bg-white dark:bg-zinc-900 border border-amber-200/60 dark:border-amber-900/30 rounded-2xl p-4 sm:p-5 mb-6 text-slate-800 dark:text-zinc-100 shadow-sm">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-zinc-800 pb-3 mb-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-xl bg-[#0f2042]/5 dark:bg-[#c5a059]/15 text-[#0f2042] dark:text-[#c5a059] flex items-center justify-center text-xs font-bold border border-[#0f2042]/10 dark:border-[#c5a059]/20">
                          <i className="fas fa-calculator"></i>
                        </span>
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider text-[#0f2042] dark:text-zinc-100">
                            Estimated Construction Budget
                          </h4>
                          <span className="text-[10px] text-gray-500 dark:text-zinc-400">
                            Built-up: ~{modalEst.builtUpAreaSqft.toLocaleString('en-IN')} sq ft ({selectedPlan.floors || 'G+1'})
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-[#0f2042] dark:text-[#c5a059] bg-[#c5a059]/10 dark:bg-[#c5a059]/15 px-3 py-1 rounded-full border border-[#c5a059]/30 shrink-0">
                        ₹{modalEst.minLakhs} – ₹{modalEst.maxLakhs} L
                      </span>
                    </div>

                    {/* 3 Quality Tiers Grid */}
                    <div className="grid grid-cols-3 gap-2 text-center mb-3.5">
                      <div className="bg-slate-50/70 dark:bg-zinc-800/60 rounded-xl p-2.5 border border-gray-200/80 dark:border-zinc-700/80">
                        <span className="text-[10px] text-gray-500 dark:text-zinc-400 font-semibold block mb-0.5">Basic (₹1,650)</span>
                        <strong className="text-xs font-black text-slate-700 dark:text-zinc-200">₹{(modalEst.basicCost / 100000).toFixed(1)} L</strong>
                      </div>
                      <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-xl p-2.5 border-2 border-[#c5a059] shadow-2xs relative">
                        <span className="text-[10px] text-[#0f2042] dark:text-amber-200 font-bold block mb-0.5">Standard (₹2,200)</span>
                        <strong className="text-xs font-black text-[#0f2042] dark:text-white">₹{(modalEst.standardCost / 100000).toFixed(1)} L</strong>
                      </div>
                      <div className="bg-slate-50/70 dark:bg-zinc-800/60 rounded-xl p-2.5 border border-gray-200/80 dark:border-zinc-700/80">
                        <span className="text-[10px] text-gray-500 dark:text-zinc-400 font-semibold block mb-0.5">Premium (₹3,000)</span>
                        <strong className="text-xs font-black text-slate-700 dark:text-zinc-200">₹{(modalEst.premiumCost / 100000).toFixed(1)} L</strong>
                      </div>
                    </div>

                    {/* Estimated Loan EMI */}
                    <div className="bg-slate-50/70 dark:bg-zinc-800/60 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-[11px] mb-3.5 border border-gray-200/80 dark:border-zinc-700/80">
                      <span className="text-gray-600 dark:text-zinc-400 flex items-center gap-1.5 font-medium">
                        <i className="fas fa-university text-[#c5a059]"></i>
                        <span>Est. Home Loan EMI (80% loan, 20 yrs):</span>
                      </span>
                      <span className="font-black text-[#0f2042] dark:text-[#c5a059]">
                        ₹{modalEst.monthlyEmi.toLocaleString('en-IN')}/mo
                      </span>
                    </div>

                    {/* Quick Action Links */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <a
                        href={`/?calc=construction&area=${modalEst.builtUpAreaSqft}#tools`}
                        className="py-2.5 px-3 rounded-xl bg-[#0f2042] hover:bg-[#1a3466] text-white font-bold text-center transition flex items-center justify-center gap-1.5 no-underline shadow-xs"
                      >
                        <i className="fas fa-hammer text-[#c5a059]"></i>
                        <span>Custom Construction Calc</span>
                      </a>
                      <a
                        href={`/?calc=india-emi&amount=${Math.round(modalEst.standardCost * 0.8)}#tools`}
                        className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[#0f2042] dark:text-zinc-200 font-bold text-center transition flex items-center justify-center gap-1.5 no-underline border border-gray-300 dark:border-zinc-700 shadow-2xs"
                      >
                        <i className="fas fa-percent text-[#c5a059]"></i>
                        <span>Check Loan EMI</span>
                      </a>
                    </div>

                    {/* Trade-by-Trade Cost Breakdown Section */}
                    {(() => {
                      const tradeData = getHousePlanTradeBreakdown(
                        selectedPlan.area_sqft,
                        selectedPlan.floors,
                        selectedPlan.bedrooms,
                        selectedPlan.bathrooms,
                        selectedPlan.dimensions
                      );

                      return (
                        <div className="mt-4 pt-3.5 border-t border-gray-100 dark:border-zinc-800">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-black uppercase tracking-wider text-[#0f2042] dark:text-zinc-100 flex items-center gap-1.5">
                              <i className="fas fa-layer-group text-[#c5a059]"></i>
                              <span>Trade-by-Trade Cost Breakdown</span>
                            </span>
                            <span className="text-xs font-black text-[#0f2042] dark:text-[#c5a059] bg-amber-50 dark:bg-amber-950/30 px-2.5 py-0.5 rounded-md border border-amber-200/80 dark:border-amber-900/40">
                              Turnkey: ~₹{tradeData.totalTurnkeyCostLakhs} L
                            </span>
                          </div>

                          <p className="text-[11px] text-gray-500 dark:text-zinc-400 mb-2.5 leading-relaxed">
                            Itemized trade estimates for {selectedPlan.bedrooms} BHK, {selectedPlan.bathrooms} Bathrooms, and ~{tradeData.carpetAreaSqft.toLocaleString('en-IN')} sq.ft interior space:
                          </p>

                          <div className="space-y-1.5">
                            {tradeData.tradeList.map((trade) => (
                              <div
                                key={trade.id}
                                className="bg-slate-50/50 hover:bg-slate-50 dark:bg-zinc-800/40 dark:hover:bg-zinc-800/70 rounded-xl p-2.5 border border-gray-200/70 dark:border-zinc-700/70 transition flex items-center justify-between gap-2.5 text-xs"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-7 h-7 rounded-lg bg-[#0f2042]/5 dark:bg-zinc-700 text-[#0f2042] dark:text-[#c5a059] flex items-center justify-center text-xs shrink-0">
                                    <i className={trade.icon}></i>
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <h5 className="text-xs font-bold text-slate-800 dark:text-zinc-100 truncate">
                                        {trade.name}
                                      </h5>
                                      <span className="text-[10px] text-gray-400 font-medium">
                                        ({trade.pctOfTotal}%)
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 dark:text-zinc-400 truncate">
                                      {trade.specs}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-xs font-black text-[#0f2042] dark:text-zinc-100">
                                    {trade.costFormatted}
                                  </span>
                                  <a
                                    href={`/?calc=${trade.calcType}&area=${tradeData.builtUpAreaSqft}#tools`}
                                    title={`Open ${trade.name} Calculator`}
                                    className="px-2 py-1 bg-white hover:bg-amber-50 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-[#0f2042] dark:text-zinc-200 rounded-md text-[10px] font-bold flex items-center gap-1 transition no-underline border border-gray-200 dark:border-zinc-600 hover:border-[#c5a059]/40 shadow-2xs"
                                    onClick={() => {
                                      if (typeof window !== "undefined") {
                                        window.localStorage.setItem("hde_shared_area", String(tradeData.carpetAreaSqft));
                                      }
                                    }}
                                  >
                                    <span>Calc</span>
                                    <i className="fas fa-arrow-right text-[8px] text-[#c5a059]"></i>
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Cost Estimation Disclaimer Notice */}
                    <div className="mt-3.5 pt-2.5 border-t border-gray-100 dark:border-zinc-800 flex items-start gap-2 text-[10px] text-gray-500 dark:text-zinc-400 leading-relaxed bg-slate-50/70 dark:bg-zinc-800/40 p-2.5 rounded-xl border border-gray-200/60 dark:border-zinc-700/60">
                      <i className="fas fa-info-circle text-[#c5a059] mt-0.5 shrink-0 text-[11px]"></i>
                      <p>
                        <strong>Disclaimer:</strong> Costs provided are approximate estimates for budget guidance only. Individual trade items and overall project totals may vary depending on local market fluctuations, actual material specifications, and current labour rates in your city.
                      </p>
                    </div>

                    {modalEst.seoSlug && (
                      <div className="mt-3 pt-2 border-t border-gray-100 dark:border-zinc-800 text-center">
                        <Link
                          href={`/plans/${modalEst.seoSlug}`}
                          className="text-[11px] font-bold text-[#0f2042] dark:text-[#c5a059] hover:underline transition inline-flex items-center gap-1"
                        >
                          <span>Read complete {selectedPlan.dimensions} Architectural Bylaws &amp; Layout Guide</span>
                          <i className="fas fa-arrow-right text-[9px] text-[#c5a059]"></i>
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })()}

              {(selectedPlan.description || isEditing) && (
                <>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-zinc-800 pb-2 mb-3">Detailed Description</h4>
                  {isEditing ? (
                    <textarea 
                      value={editData.description} 
                      onChange={e => setEditData({...editData, description: e.target.value})}
                      className="w-full h-24 border border-primary rounded p-2 text-sm text-gray-600 dark:text-zinc-300 mb-6 resize-none outline-none bg-gray-50 dark:bg-zinc-800"
                    />
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap mb-6 flex-grow">{selectedPlan.description}</p>
                  )}
                </>
              )}

              <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-xl p-3.5 mb-6">
                <div className="flex gap-2.5">
                  <i className="fas fa-info-circle text-amber-600 dark:text-amber-400 text-xs mt-0.5 shrink-0"></i>
                  <p className="text-[10px] leading-relaxed text-amber-900 dark:text-amber-200">
                    <strong className="uppercase">Architectural Concept Disclaimer:</strong> All floor plans serve as <strong>conceptual design ideas</strong>. Users must consult licensed professional architects, structural engineers, and local authorities for official structural drawings and statutory sanction approvals. You may start using this plan as an initial concept and feel free to modify it; however, try to incorporate the recommended dimensions and ventilation standards as much as possible where practical for your site.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 mt-auto">
                <Button 
                  onClick={() => { handleDownload(selectedPlan!); setSelectedPlan(null); }} 
                  className="w-full py-4 text-sm shadow-md" 
                  icon={!isLockedForUser ? "fas fa-download" : "fas fa-lock"} 
                  disabled={isEditing}
                >
                  {!isLockedForUser ? "Download High-Res Blueprint" : "Unlock to Download Plan"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanGallery;
