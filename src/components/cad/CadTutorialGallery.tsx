"use client";

import React, { useState, useMemo } from "react";
import { CAD_TUTORIALS, CAD_TUTORIAL_CATEGORIES, CadTutorial } from "@/data/cadTutorials";

export default function CadTutorialGallery() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeVideo, setActiveVideo] = useState<CadTutorial | null>(null);

  // Filter tutorials by category & search query
  const filteredTutorials = useMemo(() => {
    return CAD_TUTORIALS.filter((tutorial) => {
      const matchesCategory =
        selectedCategory === "all" || tutorial.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutorial.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutorial.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <section id="tutorials" className="space-y-8 scroll-mt-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold uppercase tracking-wider shadow-2xs">
          <i className="fab fa-youtube text-red-600 text-sm"></i>
          <span>Official 2–5 Minute Video Masterclass</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Learn Every Tool in HDE Studio CAD
        </h2>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
          Step-by-step video tutorials for each drafting tool. Master point-and-click walls, automated corner welding, modular furniture blocks, and 300 DPI vector PDF exports.
        </p>
      </div>

      {/* Controls: Category Filter Tabs & Search */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Category Tabs */}
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

          {/* Search Input */}
          <div className="relative shrink-0 w-full lg:w-72">
            <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools (walls, doors, dims)..."
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 font-medium placeholder-slate-400"
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

        {/* Status info bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-800">{filteredTutorials.length}</strong> of {CAD_TUTORIALS.length} video tutorials
          </span>
          <span className="hidden sm:inline text-[11px] text-slate-400 font-medium">
            💡 Click any card to watch full video with tool shortcuts
          </span>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTutorials.map((tutorial) => {
          return (
            <div
              key={tutorial.id}
              onClick={() => setActiveVideo(tutorial)}
              className="group bg-white rounded-2xl border border-slate-200 hover:border-primary/50 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video bg-slate-900 overflow-hidden flex items-center justify-center">
                {/* Real YouTube HQ Thumbnail */}
                <img
                  src={`https://img.youtube.com/vi/${tutorial.youtubeId}/hqdefault.jpg`}
                  alt={tutorial.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-95 group-hover:scale-105 transition-all duration-300"
                  onError={(e) => {
                    // Fallback to stylized blueprint gradient if ID isn't live
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30"></div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-red-600 group-hover:bg-red-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
                    <i className="fas fa-play text-sm ml-0.5"></i>
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-xs text-white text-[11px] font-mono font-bold flex items-center gap-1">
                  <i className="far fa-clock text-[9px] text-slate-300"></i>
                  <span>{tutorial.duration}</span>
                </div>

                {/* Badge Top Left */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-[#0f2042]/90 backdrop-blur-xs text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-white/10">
                    {tutorial.categoryLabel}
                  </span>
                  {tutorial.badge && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-600/90 text-white text-[10px] font-black uppercase tracking-wider">
                      {tutorial.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs shrink-0 mt-0.5">
                      <i className={`fas ${tutorial.icon}`}></i>
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-primary transition-colors leading-snug">
                      {tutorial.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {tutorial.description}
                  </p>
                </div>

                {/* Key Takeaways */}
                <div className="pt-3 border-t border-slate-100 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    What You&apos;ll Learn:
                  </span>
                  <ul className="space-y-1 text-[11px] text-slate-600">
                    {tutorial.keyTakeaways.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <i className="fas fa-check text-emerald-500 text-[10px] shrink-0"></i>
                        <span className="truncate">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action button */}
                <div className="pt-3">
                  <button
                    type="button"
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-[#0f2042] text-slate-800 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-2 border border-slate-200 hover:border-[#0f2042] cursor-pointer"
                  >
                    <i className="fas fa-circle-play text-red-500 group-hover:text-red-400 text-xs"></i>
                    <span>Watch Tutorial ({tutorial.duration})</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTutorials.length === 0 && (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-lg">
            <i className="fas fa-search"></i>
          </div>
          <h4 className="font-bold text-slate-800">No tutorial matching &ldquo;{searchQuery}&rdquo;</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try searching for &quot;walls&quot;, &quot;doors&quot;, &quot;dimensions&quot;, &quot;kitchen&quot;, or &quot;export&quot;.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}
            className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs shadow-xs hover:bg-primary/90 transition"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Bottom Conversion Banner */}
      <div className="bg-gradient-to-r from-[#fdfbf7] via-[#faf6ee] to-[#f4ecdb] border-2 border-[#c5a059]/40 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2 text-center md:text-left">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#8c6b2d] bg-[#c5a059]/20 border border-[#c5a059]/40 px-3 py-1 rounded-full">
            <i className="fas fa-cube text-[#c5a059]"></i> Free Hands-On Learning
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-[#0f2042]">
            Ready to Practice What You Learned?
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 max-w-xl leading-relaxed font-medium">
            Download the free standalone desktop installer and begin floor planning in 5 minutes. No subscription or credit card needed.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          <a
            href="#download"
            className="px-6 py-3.5 rounded-xl bg-[#0f2042] hover:bg-[#1a3360] text-white font-bold text-xs sm:text-sm shadow-md transition-all text-center no-underline flex items-center justify-center gap-2 cursor-pointer border border-[#0f2042]"
          >
            <i className="fas fa-download text-[#c5a059]"></i>
            <span>Download CAD Studio Free</span>
          </a>
          <a
            href="#pricing"
            className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all text-center no-underline flex items-center justify-center gap-2 cursor-pointer"
          >
            <i className="fas fa-crown text-amber-300"></i>
            <span>Get Lifetime License ($299)</span>
          </a>
        </div>
      </div>

      {/* VIDEO POPUP MODAL */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80">
              <div className="flex items-center gap-2.5 pr-4 truncate">
                <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center text-xs shrink-0">
                  <i className="fab fa-youtube"></i>
                </div>
                <div className="truncate">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {activeVideo.categoryLabel} • {activeVideo.duration}
                  </span>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                    {activeVideo.title}
                  </h4>
                </div>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="w-9 h-9 rounded-full bg-white hover:bg-slate-200 border border-slate-200 text-slate-600 flex items-center justify-center transition-all cursor-pointer shrink-0"
              >
                <i className="fas fa-times text-sm"></i>
              </button>
            </div>

            {/* Modal Video Player (Responsive 16:9) */}
            <div className="relative aspect-video bg-black w-full shrink-0">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              ></iframe>
            </div>

            {/* Modal Info & CTA Bar */}
            <div className="p-4 sm:p-6 bg-white overflow-y-auto space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h4 className="font-extrabold text-base text-slate-900">
                    {activeVideo.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    {activeVideo.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href="#download"
                    onClick={() => setActiveVideo(null)}
                    className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs shadow-xs hover:bg-primary/90 transition no-underline flex items-center gap-1.5"
                  >
                    <i className="fas fa-download"></i>
                    <span>Download Free</span>
                  </a>
                  <a
                    href="#pricing"
                    onClick={() => setActiveVideo(null)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs hover:bg-emerald-700 transition no-underline flex items-center gap-1.5"
                  >
                    <i className="fas fa-crown text-amber-300"></i>
                    <span>Buy Lifetime</span>
                  </a>
                </div>
              </div>

              {/* Key Takeaways In Modal */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Key Tool Concepts Covered:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {activeVideo.keyTakeaways.map((tip, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-2"
                    >
                      <i className="fas fa-check-circle text-emerald-600 shrink-0"></i>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
