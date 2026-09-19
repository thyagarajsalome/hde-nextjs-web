"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { HeroService, HeroBanner } from "../../services/heroService";
import { useGSAPHeroParallax } from "../../hooks/useGSAP";
import { useRegion } from "../../context/RegionContext";

export default function Hero({ initialBanners }: { initialBanners: any[] }) {
  const [banners, setBanners] = useState<HeroBanner[]>(initialBanners);
  const { region, setRegion, isReady } = useRegion();

  // Parallax effect for the container and content
  useGSAPHeroParallax("#home", ".hero-content");

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const cached = localStorage.getItem("hde_hero_banners_cache");
        if (cached) {
          setBanners(JSON.parse(cached));
        }
        const data = await HeroService.getBanners();
        setBanners(data);
        localStorage.setItem("hde_hero_banners_cache", JSON.stringify(data));
      } catch (err) {
        console.error("Failed to load hero images", err);
      }
    };
    loadBanners();
  }, []);

  if (!isReady || banners.length === 0) {
    return null;
  }

  // FIRST TIME VISIT: Country Selection Screen
  if (!region) {
    return (
      <section className="relative w-full h-[65vh] overflow-hidden flex flex-col items-center justify-center bg-secondary">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 opacity-40 scale-105">
            <Image 
              src={banners[0]?.image_url || "/images/hero/hero-india.webp"} 
              alt="Hero" 
              fill 
              priority 
              sizes="100vw"
              quality={75}
              className="object-cover" 
            />
          </div>
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

          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-6">
            <button
              onClick={() => setRegion('IN')}
              className="flex items-center justify-center gap-4 bg-white/10 hover:bg-white text-white hover:text-secondary border-2 border-white/30 hover:border-white font-bold 
                         py-5 px-8 text-xl w-full sm:w-64 rounded-2xl shadow-2xl transform hover:-translate-y-2 transition-all duration-300 backdrop-blur-md group"
            >
              <span className="text-4xl">🇮🇳</span>
              <span className="group-hover:scale-105 transition-transform">India (INR)</span>
            </button>
            
            <button
              onClick={() => setRegion('US')}
              className="flex items-center justify-center gap-4 bg-white/10 hover:bg-white text-white hover:text-secondary border-2 border-white/30 hover:border-white font-bold 
                         py-5 px-8 text-xl w-full sm:w-64 rounded-2xl shadow-2xl transform hover:-translate-y-2 transition-all duration-300 backdrop-blur-md group"
            >
              <span className="text-4xl">🇺🇸</span>
              <span className="group-hover:scale-105 transition-transform">USA (USD)</span>
            </button>

            <button
              onClick={() => setRegion('AE')}
              className="flex items-center justify-center gap-4 bg-white/10 hover:bg-white text-white hover:text-secondary border-2 border-white/30 hover:border-white font-bold 
                         py-5 px-8 text-xl w-full sm:w-64 rounded-2xl shadow-2xl transform hover:-translate-y-2 transition-all duration-300 backdrop-blur-md group"
            >
              <span className="text-4xl">🇦🇪</span>
              <span className="group-hover:scale-105 transition-transform">UAE (AED)</span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  // STANDARD HERO (If region is selected)
  const heroImageUrl =
    region === "AE"
      ? "/images/hero/hero-uae.webp"
      : region === "US"
      ? "/images/hero/hero-usa.webp"
      : "/images/hero/hero-india.webp";

  return (
    <section 
      id="home" 
      className="relative w-full h-[30vh] lg:h-[65vh] overflow-hidden flex items-center justify-center bg-secondary"
    >
      {/* Background Banner */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-100 scale-100">
          <Image 
            src={heroImageUrl} 
            alt={`Home Design English - ${region || "India"} Mode`} 
            fill 
            priority 
            sizes="100vw"
            quality={85}
            className="object-cover" 
          />
        </div>
      </div>
    </section>
  );
}