"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { HeroService, HeroBanner } from "../../services/heroService";
import { useGSAPHeroParallax } from "../../hooks/useGSAP";
import { useRegion } from "../../context/RegionContext";

export default function Hero() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { region, setRegion, isReady } = useRegion();

  // Parallax effect for the container and content
  useGSAPHeroParallax("#home", ".hero-content");

  useEffect(() => {
    // Detect mobile screens dynamically for optimized asset loading
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const cached = localStorage.getItem("hde_hero_banners_cache");
        if (cached) {
          setBanners(JSON.parse(cached));
          setLoading(false);
        }
        const data = await HeroService.getBanners();
        setBanners(data);
        localStorage.setItem("hde_hero_banners_cache", JSON.stringify(data));
      } catch (err) {
        console.error("Failed to load hero images", err);
      } finally {
        setLoading(false);
      }
    };
    loadBanners();
  }, []);

  const scrollToTools = () => {
    const toolsSection = document.getElementById("tools");
    if (toolsSection) toolsSection.scrollIntoView({ behavior: "smooth" });
  };

  const getOptimizedImageUrl = (url: string) => {
    if (url.includes("supabase.co/storage/v1/object/public/")) {
      const separator = url.includes("?") ? "&" : "?";
      // Compress heavily for mobile screens to save bandwidth and load instantly
      const width = isMobile ? 600 : 1200;
      const quality = isMobile ? 70 : 80;
      return `${url}${separator}width=${width}&quality=${quality}`;
    }
    return url;
  };

  if (!isReady || loading || banners.length === 0) {
    return <div className="h-[30vh] lg:h-[65vh] bg-gray-200 animate-pulse"></div>;
  }

  // FIRST TIME VISIT: Country Selection Screen
  if (!region) {
    return (
      <section className="relative w-full h-[65vh] overflow-hidden flex flex-col items-center justify-center bg-secondary">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 opacity-40 scale-105"
            style={{
              backgroundImage: `url(${getOptimizedImageUrl(banners[0].image_url)})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        <div className="hero-content relative z-10 container mx-auto px-4 text-center max-w-4xl space-y-10">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
              Where are you building?
            </h1>
            <p className="text-gray-300 text-lg md:text-2xl font-medium max-w-2xl mx-auto">
              Select your region to view tailored construction calculators, materials, and cost estimates.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
              onClick={() => setRegion('IN')}
              className="flex items-center justify-center gap-4 bg-white/10 hover:bg-white text-white hover:text-secondary border-2 border-white/30 hover:border-white font-bold 
                         py-5 px-10 text-xl w-full sm:w-80 rounded-2xl shadow-2xl transform hover:-translate-y-2 transition-all duration-300 backdrop-blur-md group"
            >
              <span className="text-4xl">🇮🇳</span>
              <span className="group-hover:scale-105 transition-transform">India (INR)</span>
            </button>
            
            <button
              onClick={() => setRegion('US')}
              className="flex items-center justify-center gap-4 bg-white/10 hover:bg-white text-white hover:text-secondary border-2 border-white/30 hover:border-white font-bold 
                         py-5 px-10 text-xl w-full sm:w-80 rounded-2xl shadow-2xl transform hover:-translate-y-2 transition-all duration-300 backdrop-blur-md group"
            >
              <span className="text-4xl">🇺🇸</span>
              <span className="group-hover:scale-105 transition-transform">USA (USD)</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  // STANDARD HERO (If region is selected)
  const displayBanner = region === 'US' && banners.length > 1 ? banners[1] : banners[0];

  return (
    <section 
      id="home" 
      className="relative w-full h-[30vh] lg:h-[65vh] overflow-hidden flex items-center justify-center bg-secondary"
    >
      {/* Preload critical LCP image */}
      <link rel="preload" as="image" href={getOptimizedImageUrl(displayBanner.image_url)} />

      {/* Background Banner */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-100 scale-100"
          style={{
            backgroundImage: `url(${getOptimizedImageUrl(displayBanner.image_url)})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Slightly darker overlay on mobile to ensure button accessibility */}
          <div className={`absolute inset-0 ${isMobile ? "bg-black/35" : "bg-black/20"}`}></div>
        </div>
      </div>

      {/* Button Content - Centered and visible on all devices */}
      <div className="hero-content relative z-10 container mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={scrollToTools}
          className="inline-flex items-center justify-center gap-2 md:gap-3 bg-primary hover:bg-primary-hover text-white dark:text-zinc-950 font-bold 
                     py-3 px-8 text-base w-full sm:w-auto
                     md:py-4 md:px-10 md:text-lg 
                     rounded-full shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
        >
          Start Calculating
          <i className="fas fa-arrow-down text-sm"></i>
        </button>
        
        <Link
          href="/visualizer"
          className="inline-flex items-center justify-center gap-2 md:gap-3 bg-white/20 hover:bg-white/90 text-white hover:text-secondary border-2 border-white font-bold 
                     py-2.5 px-8 text-base w-full sm:w-auto
                     md:py-3.5 md:px-10 md:text-lg no-underline
                     rounded-full shadow-2xl transform hover:-translate-y-1 transition-all duration-300 backdrop-blur-md"
        >
          Try Paint Visualizer
          <i className="fas fa-paint-roller text-sm"></i>
        </Link>
      </div>
    </section>
  );
}