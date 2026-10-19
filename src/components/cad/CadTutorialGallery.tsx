"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { CAD_TUTORIALS, CAD_TUTORIAL_CATEGORIES, CadTutorial } from "@/data/cadTutorials";
import { CadTutorialService } from "@/services/cadTutorialService";
import { useUser } from "@/context/UserContext";
import { useRegion } from "@/context/RegionContext";

const ADMIN_EMAIL = "thyagaraja1983@gmail.com";

export default function CadTutorialGallery() {
  const { user } = useUser();
  const { region } = useRegion();
  const isAdmin = Boolean(user && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());

  const [tutorials, setTutorials] = useState<CadTutorial[]>(CAD_TUTORIALS);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeVideo, setActiveVideo] = useState<CadTutorial>(CAD_TUTORIALS[0]);
  const theaterRef = useRef<HTMLDivElement>(null);

  // Load from service (Supabase + LocalStorage sync)
  const refreshTutorials = async () => {
    try {
      const data = await CadTutorialService.getTutorials();
      if (data && data.length > 0) {
        setTutorials(data);
        // If current active video not in new list, pick the first
        setActiveVideo((prev) => {
          const found = data.find((t) => t.id === prev.id);
          return found || data[0];
        });
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    refreshTutorials();

    const handleUpdate = () => {
      refreshTutorials();
    };

    window.addEventListener("hde_cad_tutorials_updated", handleUpdate);
    return () => {
      window.removeEventListener("hde_cad_tutorials_updated", handleUpdate);
    };
  }, []);

  // Filter tutorials by category & search query
  const filteredTutorials = useMemo(() => {
    return tutorials.filter((tutorial) => {
      const matchesCategory =
        selectedCategory === "all" || tutorial.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutorial.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutorial.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [tutorials, selectedCategory, searchQuery]);

  // Handle switching video and smooth scroll to theater player
  const handleSelectVideo = (tutorial: CadTutorial) => {
    setActiveVideo(tutorial);
    if (theaterRef.current) {
      theaterRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Previous & Next navigation
  const currentIndex = tutorials.findIndex((t) => t.id === activeVideo.id);
  const handlePrev = () => {
    const prevIdx = currentIndex > 0 ? currentIndex - 1 : tutorials.length - 1;
    handleSelectVideo(tutorials[prevIdx]);
  };
  const handleNext = () => {
    const nextIdx = currentIndex < tutorials.length - 1 ? currentIndex + 1 : 0;
    handleSelectVideo(tutorials[nextIdx]);
  };

  return (
    <section id="tutorials" className="space-y-8 scroll-mt-12" ref={theaterRef}>
      
      {/* SECTION HEADER */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold uppercase tracking-wider shadow-2xs">
            <i className="fab fa-youtube text-red-600 text-sm"></i>
            <span>Official 16:9 Widescreen CAD Masterclass</span>
          </div>
          {isAdmin && (
            <Link
              href="/admin/tutorials"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-900 border border-amber-300 text-xs font-black uppercase tracking-wider hover:bg-amber-500/25 transition no-underline shadow-2xs"
            >
              <i className="fas fa-gear text-amber-600 text-xs"></i>
              <span>Manage Videos (Admin CRUD)</span>
            </Link>
          )}
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Learn Every Tool in Full 16:9 Widescreen
        </h2>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
          Watch high-definition 16:9 tutorials for every architectural drafting tool in HDE Studio. See exact toolbar menus, point-and-click snapping, and contractor-ready 300 DPI exports.
        </p>
      </div>

      {/* 16:9 MAIN THEATER STAGE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Theater Viewport Window Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#0f2042] text-amber-300 font-bold text-xs uppercase tracking-wider">
                {activeVideo.categoryLabel}
              </span>
              <span className="text-xs text-slate-500 font-semibold hidden md:inline">
                Tool #{currentIndex + 1} of {CAD_TUTORIALS.length}
              </span>
            </div>
          </div>

          {/* Quick Prev / Next tool controls */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handlePrev}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              title="Previous Tutorial"
            >
              <i className="fas fa-chevron-left text-[10px]"></i>
              <span className="hidden sm:inline">Prev Tool</span>
            </button>
            <span className="text-xs font-mono font-bold text-slate-400 px-1">
              {currentIndex + 1} / {CAD_TUTORIALS.length}
            </span>
            <button
              onClick={handleNext}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              title="Next Tutorial"
            >
              <span className="hidden sm:inline">Next Tool</span>
              <i className="fas fa-chevron-right text-[10px]"></i>
            </button>
          </div>
        </div>

        {/* 16:9 FULLSCREEN-CAPABLE WIDESCREEN VIDEO PLAYER OR PROVISION PLACEHOLDER */}
        <div className={`relative aspect-video w-full rounded-2xl overflow-hidden flex items-center justify-center transition-colors ${
          activeVideo.youtubeId 
            ? "bg-slate-950 shadow-2xl border border-slate-800" 
            : "bg-[#FAF8F5] border-2 border-[#EAE3D2] shadow-sm"
        }`}>
          {activeVideo.youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
              title={activeVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0"
            ></iframe>
          ) : (
            <div className="text-center p-6 sm:p-10 space-y-3.5 max-w-lg">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center mx-auto text-[#b38e47] text-2xl shadow-xs">
                <i className="fas fa-video"></i>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100/70 border border-amber-300 px-2.5 py-0.5 rounded-full inline-block">
                  Masterclass Recording
                </span>
                <h4 className="text-slate-900 font-extrabold text-lg sm:text-xl tracking-tight">
                  Tutorial In Production
                </h4>
              </div>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                The video tutorial for &ldquo;<strong>{activeVideo.title}</strong>&rdquo; is currently being recorded and will be linked here shortly.
              </p>
              {isAdmin && (
                <div className="pt-2">
                  <Link
                    href="/admin/tutorials"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#b38e47] text-white font-black text-xs uppercase tracking-wider transition shadow-sm hover:shadow-md no-underline cursor-pointer"
                  >
                    <i className="fas fa-video"></i>
                    <span>+ Add / Manage Video in Admin Portal</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Active Tool Details & Conversion CTAs */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {activeVideo.title}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 flex items-center gap-1">
                  <i className="far fa-clock text-[10px]"></i> {activeVideo.duration} min
                </span>
                {activeVideo.badge && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    {activeVideo.badge}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium max-w-3xl">
                {activeVideo.description}
              </p>
            </div>

            {/* Direct Tool Practice CTA */}
            <div className="flex items-center gap-3 shrink-0">
              <a
                href="#download"
                className="px-5 py-3 rounded-xl bg-[#0f2042] hover:bg-[#1a3360] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 no-underline border border-[#0f2042] cursor-pointer"
              >
                <i className="fas fa-download text-[#c5a059]"></i>
                <span>Download HDE Studio</span>
              </a>
              <a
                href="#pricing"
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 no-underline cursor-pointer"
              >
                <i className="fas fa-crown text-amber-300"></i>
                <span>
                  Buy License ({region === "US" ? "$149" : region === "AE" ? "549 Dhs" : "Rs. 4,999"})
                </span>
              </a>
            </div>
          </div>

          {/* Key Tool Shortcuts & Takeaways */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Pro Drafting Tips Covered in this Tutorial:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {activeVideo.keyTakeaways.map((tip, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#fdfbf7] border border-[#c5a059]/30 text-xs font-semibold text-slate-800 flex items-center gap-2.5 shadow-2xs"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] shrink-0">
                    <i className="fas fa-check"></i>
                  </div>
                  <span className="leading-tight">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ALL TUTORIALS PLAYLIST & CATEGORY SELECTOR */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-5">
        
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary block">
              Interactive Tool Selector
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              Browse All 20 Tool Masterclass Videos
            </h3>
          </div>

          {/* Search Input */}
          <div className="relative shrink-0 w-full lg:w-72">
            <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools (walls, doors, dims)..."
              className="w-full pl-9 pr-8 py-2.5 rounded-xl text-xs border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 font-medium placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                <i className="fas fa-times-circle"></i>
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
          {CAD_TUTORIAL_CATEGORIES.map((cat) => {
            const count =
              cat.id === "all"
                ? CAD_TUTORIALS.length
                : CAD_TUTORIALS.filter((t) => t.category === cat.id).length;
            const isActive = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap border ${
                  isActive
                    ? "bg-[#0f2042] text-white border-[#0f2042] shadow-xs"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <i className={`fas ${cat.icon} text-xs ${isActive ? "text-[#c5a059]" : "text-slate-400"}`}></i>
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-200/80 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Playlist Video Grid (16:9 Thumbnail Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {filteredTutorials.map((tutorial) => {
            const isPlaying = activeVideo.id === tutorial.id;

            return (
              <div
                key={tutorial.id}
                onClick={() => handleSelectVideo(tutorial)}
                className={`group rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer ${
                  isPlaying
                    ? "border-primary bg-primary/5 ring-2 ring-primary/30 shadow-md scale-[1.02]"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                }`}
              >
                {/* 16:9 Thumbnail with Play Badge */}
                <div className="relative aspect-video bg-slate-900 overflow-hidden flex items-center justify-center">
                  <img
                    src={`https://img.youtube.com/vi/${tutorial.youtubeId}/hqdefault.jpg`}
                    alt={tutorial.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-95 group-hover:scale-105 transition-all duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>

                  {/* Play Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                        isPlaying
                          ? "bg-emerald-500 text-white animate-pulse"
                          : "bg-red-600 group-hover:bg-red-500 text-white"
                      }`}
                    >
                      <i className={`fas ${isPlaying ? "fa-volume-high" : "fa-play"} text-xs ml-0.5`}></i>
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-xs text-white text-[10px] font-mono font-bold">
                    {tutorial.duration}
                  </div>

                  {/* Category Pill */}
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded bg-[#0f2042]/90 text-amber-300 text-[9px] font-bold uppercase tracking-wider">
                      {tutorial.categoryLabel}
                    </span>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h4
                      className={`font-bold text-xs leading-snug line-clamp-2 ${
                        isPlaying ? "text-primary font-black" : "text-slate-900 group-hover:text-primary"
                      }`}
                    >
                      {tutorial.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {tutorial.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold">
                    <span className={isPlaying ? "text-emerald-700" : "text-slate-400"}>
                      {isPlaying ? "▶ Now Playing Above" : "Click to Play in 16:9"}
                    </span>
                    <i className="fas fa-arrow-up text-[9px] text-slate-400 group-hover:-translate-y-0.5 transition-transform"></i>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty Search Result */}
        {filteredTutorials.length === 0 && (
          <div className="text-center py-8 text-xs text-slate-500">
            No tutorial matching &ldquo;{searchQuery}&rdquo;. Try searching for &quot;walls&quot; or &quot;dimensions&quot;.
          </div>
        )}
      </div>

    </section>
  );
}
