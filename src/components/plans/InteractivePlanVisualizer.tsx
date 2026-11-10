"use client";
// src/components/plans/InteractivePlanVisualizer.tsx
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

export interface PlanStage {
  id: string;
  stageNumber: number;
  name: string;
  shortName: string;
  icon: string;
  imageSrc: string;
  badge: string;
  subtitle: string;
  description: string;
  keyFeatures: string[];
  specs: { label: string; value: string }[];
}

const PLAN_STAGES: PlanStage[] = [
  {
    id: "stage-walls",
    stageNumber: 1,
    name: "Structural Walls",
    shortName: "Walls",
    icon: "fa-border-all",
    imageSrc: "/images/interactive-plan/01_walls-1.webp",
    badge: "Stage 01 • Structural Linework",
    subtitle: "Load-bearing exterior masonry and interior spatial partitions",
    description:
      "Core 9-inch exterior structural perimeter walls and 4.5-inch acoustic interior partition walls, establishing room boundaries and directional solar cross-ventilation corridors.",
    keyFeatures: [
      "9\" Exterior Brick Masonry Perimeter",
      "4.5\" Internal Room Partitions",
      "Directional Solar Alignment Zoning",
      "Load-Bearing Column Grid Layout",
    ],
    specs: [
      { label: "Perimeter Wall", value: "9 Inches (230mm)" },
      { label: "Internal Partition", value: "4.5 Inches (115mm)" },
      { label: "Structure Type", value: "Framed RCC / Masonry" },
      { label: "Ceiling Height", value: "10'-6\" Clear Headroom" },
    ],
  },
  {
    id: "stage-openings",
    stageNumber: 2,
    name: "Doors & Windows",
    shortName: "Openings",
    icon: "fa-door-open",
    imageSrc: "/images/interactive-plan/02_openings-1.webp",
    badge: "Stage 02 • Openings & Fenestration",
    subtitle: "Main entrance, interior doors, and cross-ventilation windows",
    description:
      "Precise wall cutout fenestrations, grand entrance door opening, internal bedroom flush doors, wide sliding balcony openings, and optimal UPVC ventilation windows.",
    keyFeatures: [
      "Grand Main Entrance (3'-6\" × 7'-0\")",
      "Bedroom Flush Doors (3'-0\" × 7'-0\")",
      "3-Track UPVC Sliding Windows",
      "Toilet Lintel-Height Louvered Ventilators",
    ],
    specs: [
      { label: "Main Door", value: "Teakwood Frame (3.5' × 7')" },
      { label: "Window Type", value: "UPVC Double Glazed" },
      { label: "Balcony Access", value: "Sliding French Glazing" },
      { label: "Ventilation Ratio", value: "24% of Floor Area" },
    ],
  },
  {
    id: "stage-flooring",
    stageNumber: 3,
    name: "Flooring & Finishes",
    shortName: "Flooring",
    icon: "fa-layer-group",
    imageSrc: "/images/interactive-plan/03_flooring-1.webp",
    badge: "Stage 03 • Floor Finishes",
    subtitle: "Glazed vitrified tiles, wooden textures, and anti-skid surfaces",
    description:
      "High-gloss 800×1600mm vitrified tiles throughout living and dining areas, warm matte wooden plank tiles in bedrooms, and textured anti-skid R10 tiles in balconies and utility areas.",
    keyFeatures: [
      "4×2 ft Large Format Glazed Vitrified Tiles",
      "Warm Matte Bedroom Plank Finishes",
      "Anti-Skid R10 Rated Balcony Pavers",
      "Seamless Skirting & Threshold Joints",
    ],
    specs: [
      { label: "Living/Dining", value: "800×1600mm Vitrified" },
      { label: "Bedrooms", value: "Wooden Plank Ceramic" },
      { label: "Balcony/Utility", value: "R10 Anti-Skid Tiles" },
      { label: "Skirting", value: "100mm Matching Border" },
    ],
  },
  {
    id: "stage-furniture",
    stageNumber: 4,
    name: "Furniture & Layout",
    shortName: "Furniture",
    icon: "fa-couch",
    imageSrc: "/images/interactive-plan/04_furniture-1.webp",
    badge: "Stage 04 • Spatial Ergonomics",
    subtitle: "Living room seating, king-size beds, and circulation clearances",
    description:
      "Fully coordinated architectural block placement including 6-seater sofa arrangement, king beds with integrated side tables, wardrobe recesses, and 36-inch clear walkways.",
    keyFeatures: [
      "L-Shaped 6-Seater Living Room Sofa",
      "King Master Bed with Floating Nightstands",
      "Dedicated Study / Work-from-Home Desk",
      "36\" Minimum Pathway Circulation",
    ],
    specs: [
      { label: "Living Seating", value: "6-8 Persons Capacity" },
      { label: "Master Bed", value: "King Size (6' × 6.5')" },
      { label: "Wardrobe Depth", value: "24\" Full Recess" },
      { label: "Pathway Clear", value: "36\" (900mm) Standard" },
    ],
  },
  {
    id: "stage-kitchen",
    stageNumber: 5,
    name: "Kitchen & Dining",
    shortName: "Kitchen",
    icon: "fa-utensils",
    imageSrc: "/images/interactive-plan/05_kitchen-1.webp",
    badge: "Stage 05 • Culinary & Dining",
    subtitle: "Modern modular counter, appliance triangle, and dining suite",
    description:
      "Ergonomic kitchen layout following the golden work triangle (Hob, Sink, Refrigerator), granite preparation counter, tall pantry unit, and a dedicated 6-seater family dining space.",
    keyFeatures: [
      "Golden Work Triangle (Hob - Sink - Fridge)",
      "Granite Cooking Counter with Backsplash",
      "6-Seater Family Dining Table",
      "Dedicated Utility & Washing Yard Access",
    ],
    specs: [
      { label: "Counter Height", value: "34\" Ergonomic Granite" },
      { label: "Sink Unit", value: "Double Bowl Quartz / SS" },
      { label: "Dining Suite", value: "6-Seater Solid Wood" },
      { label: "Utility Connection", value: "Washing Machine Point" },
    ],
  },
  {
    id: "stage-bathroom",
    stageNumber: 6,
    name: "Bathrooms & Plumbing",
    shortName: "Bathrooms",
    icon: "fa-shower",
    imageSrc: "/images/interactive-plan/06_bathroom-1.webp",
    badge: "Stage 06 • Sanitary & MEP",
    subtitle: "Attached and common bathrooms with wet/dry zone separation",
    description:
      "Architecturally zoned bathrooms featuring glass shower enclosures, wall-hung EWCs with concealed pneumatic cisterns, wide vanity wash basins, and clean plumbing chases.",
    keyFeatures: [
      "Dry Zone / Wet Zone Shower Separation",
      "Wall-Hung Water Closets with Concealed Tanks",
      "Vanity Basin with Under-Counter Storage",
      "Dedicated Soil & Waste Plumbing Chases",
    ],
    specs: [
      { label: "Master Toilet", value: "Attached 8' × 5' Luxury" },
      { label: "Common Toilet", value: "Convenient 7' × 4.5'" },
      { label: "Glass Enclosure", value: "8mm Toughened Glass" },
      { label: "Fixtures", value: "Concealed Diverters" },
    ],
  },
  {
    id: "stage-full-plan",
    stageNumber: 7,
    name: "Complete Blueprint",
    shortName: "Full Blueprint",
    icon: "fa-drafting-compass",
    imageSrc: "/images/interactive-plan/08_full-plan-1.webp",
    badge: "Stage 07 • 2D Working Drawings",
    subtitle: "Full dimensions, room area tags, grid axes, and title block",
    description:
      "Professional 300 DPI architectural working drawing with exact center-line wall dimensions, room square footage annotations, setback guidelines, and technical legend.",
    keyFeatures: [
      "AutoCAD-Calibrated Wall Dimension Chains",
      "Live Room Area (Sq.Ft) Annotations",
      "Directional Compass & Solar Orientation",
      "Architectural Seal & Title Block Legend",
    ],
    specs: [
      { label: "Drawing Standard", value: "Working Blueprint (1:100)" },
      { label: "Annotation Unit", value: "Feet & Inches (Imperial)" },
      { label: "Resolution", value: "300 DPI Vector Linework" },
      { label: "Compliance", value: "Municipal Bylaw Clearances" },
    ],
  },
];

const RENDER_3D = {
  id: "3d-render",
  name: "3D Elevation Render",
  icon: "fa-cube",
  imageSrc: "/images/interactive-plan/09_3d-render.webp",
  badge: "Stage 08 • Photorealistic 3D Exterior Elevation",
  subtitle: "Contemporary facade design with exterior lighting and materials",
  description:
    "Photorealistic 3D visualization illustrating the completed house exterior with warm travertine stone textures, dark charcoal aluminium louvers, landscaped entry, and architectural LED lighting.",
  keyFeatures: [
    "Modern Contemporary Indian Facade",
    "Warm Wood & Travertine Texture Panels",
    "Landscaped Entry Portico & Planters",
    "Concealed LED Exterior Accent Illumination",
  ],
  specs: [
    { label: "Exterior Style", value: "Contemporary Luxury" },
    { label: "Roofline", value: "Flat Roof with Parapet" },
    { label: "Exterior Paint", value: "Weatherproof Textured Acrylic" },
    { label: "Accent Material", value: "Composite Wood & Charcoal Metal" },
  ],
};

export default function InteractivePlanVisualizer() {
  const [activeStageIndex, setActiveStageIndex] = useState<number>(6); // Default: Full Blueprint
  const [is3DMode, setIs3DMode] = useState<boolean>(false);
  const [isPlayingTour, setIsPlayingTour] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showSpecsDrawer, setShowSpecsDrawer] = useState<boolean>(true);
  const [comparisonSliderPos, setComparisonSliderPos] = useState<number>(50);
  const [isComparisonMode, setIsComparisonMode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const activeStage = PLAN_STAGES[activeStageIndex];

  // Auto-Tour Sequence
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlayingTour) {
      timer = setInterval(() => {
        setActiveStageIndex((prev) => {
          if (prev < PLAN_STAGES.length - 1) {
            setIs3DMode(false);
            return prev + 1;
          } else {
            // After final 2D blueprint, show 3D render, then stop
            setIs3DMode(true);
            setIsPlayingTour(false);
            return prev;
          }
        });
      }, 1800);
    }
    return () => clearInterval(timer);
  }, [isPlayingTour]);

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.25, 0.75));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1 && !isComparisonMode) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Toggle stage on or off:
  // If user clicks an active stage, it steps back or turns off; if inactive, it activates that stage.
  const handleToggleStage = (idx: number) => {
    setIs3DMode(false);
    setIsComparisonMode(false);
    setIsPlayingTour(false);
    if (activeStageIndex === idx && idx > 0) {
      // Step down one level
      setActiveStageIndex(idx - 1);
    } else {
      setActiveStageIndex(idx);
    }
  };

  return (
    <section className="py-10 bg-gradient-to-b from-[#F5EFE6] via-[#FAF7F2] to-[#FFFDF9] border-b border-[#E8DFC8]">
      {/* Invisible Asset Preloader for instantaneous switching */}
      <div className="hidden" aria-hidden="true">
        {PLAN_STAGES.map((s) => (
          <img key={s.id} src={s.imageSrc} alt="" />
        ))}
        <img src={RENDER_3D.imageSrc} alt="" />
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-7 space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs font-bold uppercase tracking-wider">
            <i className="fas fa-layer-group text-amber-600"></i>
            <span>Interactive Floor Plan Studio &amp; 3D Visualizer</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0f2042] tracking-tight">
            Explore Architectural Layers in Real-Time
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
            Turn on and off structural walls, openings, flooring, furniture, kitchen, and bathroom plumbing in real-time — then inspect the finished house in photorealistic 3D.
          </p>
        </div>

        {/* Main Interactive Studio Canvas Container */}
        <div
          ref={containerRef}
          className={`relative rounded-3xl bg-white border border-[#E8DFC8] shadow-xl overflow-hidden transition-all duration-300 ${
            isFullscreen ? "fixed inset-0 z-50 rounded-none border-none" : ""
          }`}
        >
          {/* Top Control Bar: 2D vs 3D Mode Switcher + View Actions */}
          <div className="bg-[#0f2042] text-white px-3 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/60">
            
            {/* Left: Mode Switcher (2D Blueprint Studio vs 3D Render) */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-800/90 p-1 rounded-2xl border border-slate-700">
              <button
                onClick={() => {
                  setIs3DMode(false);
                  setIsComparisonMode(false);
                }}
                className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  !is3DMode && !isComparisonMode
                    ? "bg-[#c5a059] text-[#0f2042] shadow-md"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <i className="fas fa-drafting-compass"></i>
                <span>2D Blueprint Studio</span>
                <span className="hidden sm:inline-block bg-black/15 text-[10px] px-1.5 py-0.5 rounded-sm font-black">
                  7 LAYERS
                </span>
              </button>

              <button
                onClick={() => {
                  setIs3DMode(true);
                  setIsComparisonMode(false);
                }}
                className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  is3DMode && !isComparisonMode
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <i className="fas fa-cube text-amber-300"></i>
                <span>3D Exterior Render</span>
                <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 sm:px-2 py-0.5 rounded font-black uppercase tracking-wider">
                  FINAL 3D
                </span>
              </button>

              <button
                onClick={() => {
                  setIsComparisonMode(!isComparisonMode);
                  setIs3DMode(false);
                }}
                className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isComparisonMode
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
                title="Interactive 2D vs 3D Split Comparison Slider"
              >
                <i className="fas fa-columns text-emerald-400"></i>
                <span>2D / 3D Split</span>
              </button>
            </div>

            {/* Right: Viewport Controls (Zoom In, Zoom Out, Reset, Tour, Fullscreen) */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Tour Auto-Play Button */}
              {!is3DMode && !isComparisonMode && (
                <button
                  onClick={() => setIsPlayingTour(!isPlayingTour)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    isPlayingTour
                      ? "bg-amber-500 text-slate-950 border-amber-400 animate-pulse"
                      : "bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700 hover:text-white"
                  }`}
                  title="Auto-step through construction sequence"
                >
                  <i className={`fas ${isPlayingTour ? "fa-pause" : "fa-play"} text-[11px]`}></i>
                  <span className="hidden sm:inline">
                    {isPlayingTour ? "Pause Tour" : "Build Sequence"}
                  </span>
                </button>
              )}

              {/* Zoom & Canvas Actions */}
              <div className="flex items-center bg-slate-800/90 rounded-xl border border-slate-700 p-0.5">
                <button
                  onClick={handleZoomIn}
                  className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700/70 rounded-lg text-xs transition cursor-pointer"
                  title="Zoom In"
                >
                  <i className="fas fa-magnifying-glass-plus"></i>
                </button>
                <button
                  onClick={handleZoomOut}
                  className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700/70 rounded-lg text-xs transition cursor-pointer"
                  title="Zoom Out"
                >
                  <i className="fas fa-magnifying-glass-minus"></i>
                </button>
                <button
                  onClick={handleResetZoom}
                  className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700/70 rounded-lg text-xs transition cursor-pointer"
                  title="Reset Zoom to 100%"
                >
                  <i className="fas fa-arrows-rotate"></i>
                </button>
              </div>

              {/* Specs Drawer Toggle */}
              <button
                onClick={() => setShowSpecsDrawer(!showSpecsDrawer)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold border transition cursor-pointer ${
                  showSpecsDrawer
                    ? "bg-[#c5a059] text-[#0f2042] border-[#c5a059]"
                    : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
                }`}
                title="Toggle Architectural Specs Drawer"
              >
                <i className="fas fa-circle-info text-sm"></i>
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-xs transition cursor-pointer"
                title="Toggle Fullscreen"
              >
                <i className={`fas ${isFullscreen ? "fa-compress" : "fa-expand"}`}></i>
              </button>
            </div>
          </div>

          {/* Layer Selection Pill Navigation (Turn On/Off Layers) */}
          {!is3DMode && !isComparisonMode && (
            <div className="bg-[#FAF7F2] border-b border-[#E8DFC8] px-3 sm:px-4 py-2.5 overflow-x-auto scrollbar-thin flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 shrink-0 mr-1 flex items-center gap-1.5">
                <i className="fas fa-sliders text-amber-600 text-xs"></i>
                <span className="hidden sm:inline">Turn On / Off:</span>
                <span className="sm:hidden">Layers:</span>
              </span>

              {PLAN_STAGES.map((stage, idx) => {
                const isActive = activeStageIndex === idx;
                const isPassed = activeStageIndex >= idx;

                return (
                  <button
                    key={stage.id}
                    onClick={() => handleToggleStage(idx)}
                    className={`group shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer border ${
                      isActive
                        ? "bg-[#0f2042] text-white border-[#0f2042] shadow-sm"
                        : isPassed
                        ? "bg-white text-slate-700 border-[#E8DFC8] hover:border-amber-400 hover:text-[#0f2042]"
                        : "bg-slate-100/70 text-slate-400 border-slate-200 hover:text-slate-600"
                    }`}
                    title={`Click to turn ${isPassed ? "on/inspect" : "on"} ${stage.name}`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${
                        isActive
                          ? "bg-[#c5a059] text-[#0f2042]"
                          : isPassed
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200/80 text-slate-400"
                      }`}
                    >
                      {isPassed ? "✓" : stage.stageNumber}
                    </span>
                    <i
                      className={`fas ${stage.icon} text-[11px] ${
                        isActive ? "text-[#c5a059]" : "text-slate-500 group-hover:text-amber-600"
                      }`}
                    ></i>
                    <span className="whitespace-nowrap">{stage.shortName}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                        isPassed
                          ? isActive
                            ? "bg-emerald-500 text-white"
                            : "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {isPassed ? "ON" : "OFF"}
                    </span>
                  </button>
                );
              })}

              {/* Direct Jump to 3D Render Pill */}
              <button
                onClick={() => {
                  setIs3DMode(true);
                  setIsPlayingTour(false);
                }}
                className="shrink-0 ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-950 font-black text-xs transition cursor-pointer"
              >
                <i className="fas fa-cube text-amber-600"></i>
                <span>Final 3D Render</span>
                <i className="fas fa-arrow-right text-[10px] text-amber-600"></i>
              </button>
            </div>
          )}

          {/* Interactive Canvas Area */}
          <div className="relative flex flex-col lg:flex-row min-h-[460px] sm:min-h-[560px] lg:min-h-[640px] bg-[#0c1424]">
            
            {/* Main Visual Display Canvas */}
            <div
              className={`relative flex-1 flex items-center justify-center overflow-hidden select-none cursor-${
                zoomLevel > 1 ? "grab active:cursor-grabbing" : "default"
              }`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Background Architectural Grid Pattern */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(#c5a059 1px, transparent 1px), radial-gradient(#0f2042 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                  backgroundPosition: "0 0, 12px 12px",
                }}
              ></div>

              {/* MODE 1: Standard 2D Blueprint or 3D Render Display */}
              {!isComparisonMode && (
                <div
                  className="relative transition-transform duration-150 ease-out max-w-full max-h-full flex items-center justify-center p-2 sm:p-4"
                  style={{
                    transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
                  }}
                >
                  <img
                    src={is3DMode ? RENDER_3D.imageSrc : activeStage.imageSrc}
                    alt={is3DMode ? RENDER_3D.name : activeStage.name}
                    className="max-w-full max-h-[500px] sm:max-h-[600px] object-contain rounded-xl shadow-2xl transition-opacity duration-300 pointer-events-none"
                    loading="eager"
                  />
                </div>
              )}

              {/* MODE 2: Interactive 2D vs 3D Split Comparison Slider */}
              {isComparisonMode && (
                <div className="relative w-full h-[480px] sm:h-[580px] flex items-center justify-center overflow-hidden p-4">
                  {/* Underneath: 3D Render */}
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <img
                      src={RENDER_3D.imageSrc}
                      alt="3D Exterior Render"
                      className="max-w-full max-h-full object-contain rounded-xl"
                    />
                    <div className="absolute top-6 right-6 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
                      <i className="fas fa-cube mr-1.5"></i> 3D Render
                    </div>
                  </div>

                  {/* Top Layer: 2D Blueprint with clip-path based on slider position */}
                  <div
                    className="absolute inset-0 flex items-center justify-center p-4 overflow-hidden"
                    style={{
                      clipPath: `polygon(0 0, ${comparisonSliderPos}% 0, ${comparisonSliderPos}% 100%, 0 100%)`,
                    }}
                  >
                    <img
                      src={PLAN_STAGES[6].imageSrc}
                      alt="2D Blueprint"
                      className="max-w-full max-h-full object-contain rounded-xl"
                    />
                    <div className="absolute top-6 left-6 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider">
                      <i className="fas fa-drafting-compass mr-1.5"></i> 2D Blueprint
                    </div>
                  </div>

                  {/* Split Divider Line & Draggable Handle */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-amber-400 shadow-xl cursor-ew-resize flex items-center justify-center"
                    style={{ left: `${comparisonSliderPos}%` }}
                  >
                    <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg border-2 border-white text-xs font-black">
                      <i className="fas fa-arrows-left-right"></i>
                    </div>
                  </div>

                  {/* Range input overlay for smooth drag */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={comparisonSliderPos}
                    onChange={(e) => setComparisonSliderPos(Number(e.target.value))}
                    className="absolute inset-0 opacity-0 cursor-ew-resize z-20 w-full h-full"
                  />
                </div>
              )}

              {/* Floating Canvas Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                <span className="bg-slate-950/80 backdrop-blur-md border border-slate-700 text-white text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>{is3DMode ? RENDER_3D.badge : activeStage.badge}</span>
                </span>
                
                {zoomLevel > 1 && (
                  <span className="bg-[#c5a059] text-[#0f2042] text-[10px] font-black px-2.5 py-0.5 rounded-md self-start uppercase tracking-wider shadow">
                    Zoom: {Math.round(zoomLevel * 100)}% (Drag to Pan)
                  </span>
                )}
              </div>

              {/* Compass / Solar Orientation Floating Indicator */}
              <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-white p-2 rounded-xl shadow-lg flex items-center gap-2 pointer-events-none">
                <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-xs font-black">
                  N
                </div>
                <div className="hidden sm:block text-[10px] text-slate-300 leading-tight">
                  <span className="font-bold text-white block">Directional Solar</span>
                  <span>Cross-Ventilation</span>
                </div>
              </div>

              {/* Bottom Floating Quick Stage Stepper (When in 2D Mode) */}
              {!is3DMode && !isComparisonMode && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-950/85 backdrop-blur-md border border-slate-700/80 px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-3">
                  <button
                    onClick={() => setActiveStageIndex((i) => Math.max(i - 1, 0))}
                    disabled={activeStageIndex === 0}
                    className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-xs transition cursor-pointer"
                    title="Previous Stage"
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {PLAN_STAGES.map((s, idx) => (
                      <button
                        key={s.id}
                        onClick={() => setActiveStageIndex(idx)}
                        className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all cursor-pointer ${
                          activeStageIndex === idx
                            ? "bg-[#c5a059] scale-125"
                            : activeStageIndex > idx
                            ? "bg-slate-400"
                            : "bg-slate-700"
                        }`}
                        title={s.name}
                      />
                    ))}
                  </div>

                  <span className="text-[11px] sm:text-xs font-black text-slate-300 font-mono">
                    {activeStageIndex + 1} / {PLAN_STAGES.length}
                  </span>

                  <button
                    onClick={() => {
                      if (activeStageIndex < PLAN_STAGES.length - 1) {
                        setActiveStageIndex((i) => i + 1);
                      } else {
                        setIs3DMode(true);
                      }
                    }}
                    className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-xs transition cursor-pointer"
                    title={activeStageIndex < PLAN_STAGES.length - 1 ? "Next Stage" : "View in 3D"}
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </div>

            {/* Right Drawer: Contextual Architectural Specs & Highlights */}
            {showSpecsDrawer && (
              <div className="w-full lg:w-[360px] bg-white border-t lg:border-t-0 lg:border-l border-[#E8DFC8] p-5 sm:p-6 flex flex-col justify-between shrink-0 shadow-lg">
                <div className="space-y-4">
                  {/* Layer Header */}
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-100/70 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                        {is3DMode ? "Exterior Elevation" : `Stage 0${activeStage.stageNumber}`}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">
                        {is3DMode ? "Photoreal Render" : "2D Architectural Layer"}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-black text-[#0f2042] mt-1.5 flex items-center gap-2">
                      <i
                        className={`fas ${
                          is3DMode ? RENDER_3D.icon : activeStage.icon
                        } text-amber-600 text-base`}
                      ></i>
                      <span>{is3DMode ? RENDER_3D.name : activeStage.name}</span>
                    </h3>

                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {is3DMode ? RENDER_3D.subtitle : activeStage.subtitle}
                    </p>
                  </div>

                  {/* Architectural Description */}
                  <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFC8] text-xs text-slate-700 leading-relaxed">
                    {is3DMode ? RENDER_3D.description : activeStage.description}
                  </div>

                  {/* Key Highlights */}
                  <div>
                    <h4 className="text-xs font-bold text-[#0f2042] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <i className="fas fa-check-circle text-emerald-600 text-[11px]"></i>
                      <span>Layer Highlights &amp; Invariants:</span>
                    </h4>
                    <ul className="space-y-1.5">
                      {(is3DMode ? RENDER_3D.keyFeatures : activeStage.keyFeatures).map(
                        (feat, i) => (
                          <li
                            key={i}
                            className="text-xs text-slate-600 flex items-start gap-2 leading-tight"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 shrink-0"></span>
                            <span>{feat}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  {/* Technical Specifications Table */}
                  <div>
                    <h4 className="text-xs font-bold text-[#0f2042] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <i className="fas fa-ruler-combined text-amber-600 text-[11px]"></i>
                      <span>Technical Specs:</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {(is3DMode ? RENDER_3D.specs : activeStage.specs).map((spec, i) => (
                        <div
                          key={i}
                          className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col justify-center"
                        >
                          <span className="text-[10px] text-slate-500 font-medium">
                            {spec.label}
                          </span>
                          <span className="font-bold text-[#0f2042] mt-0.5 truncate">
                            {spec.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 mt-4 border-t border-[#E8DFC8] space-y-2">
                  {/* Download / Pro Action */}
                  <Link
                    href="/download"
                    className="w-full group flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0f2042] hover:bg-[#1a315e] text-white font-bold text-xs sm:text-sm shadow-md transition no-underline text-center"
                  >
                    <i className="fas fa-desktop text-amber-400 group-hover:scale-110 transition-transform"></i>
                    <span>Draft in HDE Studio CAD</span>
                    <i className="fas fa-arrow-right text-[11px] text-amber-400"></i>
                  </Link>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1">
                    <span className="flex items-center gap-1">
                      <i className="fas fa-shield-halved text-emerald-600"></i>
                      <span>100% Offline CAD</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="fas fa-file-pdf text-amber-600"></i>
                      <span>300 DPI Vector PDF</span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Interactive Feature Bar: Quick Layer Toggles & Stage Jumpers */}
          <div className="bg-[#FAF7F2] border-t border-[#E8DFC8] p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-xs font-bold text-[#0f2042] flex items-center gap-1.5 mr-2">
                <i className="fas fa-toggle-on text-amber-600"></i>
                <span>Quick Layer Jump:</span>
              </span>

              {PLAN_STAGES.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveStageIndex(idx);
                    setIs3DMode(false);
                    setIsComparisonMode(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                    !is3DMode && !isComparisonMode && activeStageIndex === idx
                      ? "bg-[#0f2042] text-white border-[#0f2042] shadow-xs"
                      : "bg-white text-slate-600 border-[#E8DFC8] hover:border-slate-400"
                  }`}
                >
                  {s.stageNumber}. {s.shortName}
                </button>
              ))}

              <button
                onClick={() => {
                  setIs3DMode(true);
                  setIsComparisonMode(false);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  is3DMode && !isComparisonMode
                    ? "bg-amber-500 text-slate-950 border-amber-600 shadow-sm"
                    : "bg-amber-100/60 text-amber-900 border-amber-300 hover:bg-amber-200"
                }`}
              >
                <i className="fas fa-cube mr-1 text-amber-700"></i>
                8. 3D Render
              </button>
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <i className="fas fa-compass text-amber-600"></i>
                <span>Directional Solar Alignment</span>
              </span>
              <span>•</span>
              <span className="font-semibold text-slate-700">
                100% Scaled &amp; Verified
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
