"use client";
import React, { useState, useEffect } from "react";

const screenshots = [
  {
    src: "/promo/01.webp",
    title: "All-in-One Construction Platform",
    description: "Get construction calculators, materials BOQ, plans, and professional directory in one app."
  },
  {
    src: "/promo/02.webp",
    title: "Find Verified Professionals",
    description: "Connect with verified local engineers, architects, and designers directly on WhatsApp or Call."
  },
  {
    src: "/promo/03.webp",
    title: "Detailed Cost Estimates",
    description: "Estimate costs for foundation, structure, finishing, plumbing, electrical, and flooring."
  },
  {
    src: "/promo/04.webp",
    title: "Material Quantity BOQ",
    description: "Calculate concrete, steel, bricks, tiles, paint, and other materials with absolute accuracy."
  },
  {
    src: "/promo/05.webp",
    title: "Premium Architectural Plans",
    description: "Access curated floor plans, 2D/3D elevations, structural blueprints, and space designs."
  }
];

const features = [
  {
    icon: "fa-calculator",
    color: "amber",
    title: "Civil Construction Calculator",
    desc: "Calculate precise cement, sand, aggregate, steel, and water amounts for slabs, beams, columns, and foundations."
  },
  {
    icon: "fa-file-invoice-dollar",
    color: "blue",
    title: "Material BOQ Generator",
    desc: "Export comprehensive Bill of Quantities lists to share with suppliers, saving up to 10% on wastage."
  },
  {
    icon: "fa-drafting-compass",
    color: "emerald",
    title: "Modern House Plans",
    desc: "Discover a gallery of multi-size floor plans, elevations, and structural drawings tailored for Indian homes."
  },
  {
    icon: "fa-address-book",
    color: "purple",
    title: "Contact Professionals",
    desc: "Connect directly with local verified civil engineers, interior decorators, and builders. No hidden fees."
  },
  {
    icon: "fa-paint-roller",
    color: "pink",
    title: "Finishing Calculators",
    desc: "Dedicated estimators for painting, tiling, flooring, doors, windows, false ceiling, and woodwork."
  },
  {
    icon: "fa-plug",
    color: "orange",
    title: "Plumbing & Electrical",
    desc: "Map out estimated fixture counts, pipe lengths, wiring details, and structural point-loads."
  }
];

const colorMap: Record<string, { bg: string; text: string }> = {
  amber: { bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-600 dark:text-amber-400" },
  blue: { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-600 dark:text-blue-400" },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-600 dark:text-emerald-400" },
  purple: { bg: "bg-purple-50 dark:bg-purple-950/30", text: "text-purple-600 dark:text-purple-400" },
  pink: { bg: "bg-pink-50 dark:bg-pink-950/30", text: "text-pink-600 dark:text-pink-400" },
  orange: { bg: "bg-orange-50 dark:bg-orange-950/30", text: "text-orange-600 dark:text-orange-400" }
};

const AppPromoPage = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % screenshots.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isHovered]);

  const handleNext = () => {
    setActiveSlide((prev) => (prev + 1) % screenshots.length);
  };

  const handlePrev = () => {
    setActiveSlide((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  const playStoreLink = "https://play.google.com/store/apps/details?id=in.toolwebsite.twa";

  return (
    <div className="bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 text-gray-800 dark:text-zinc-200 min-h-screen py-10 transition-colors duration-200">
                  Need a quick repair or planning a major home build? 🏠 Or are you an architect, builder, contractor, plumber, electrician, carpenter, painter, or layman looking to grow your network? 🛠️ The HDE Directory is building a bridge to connect skilled professionals directly with the homeowners and contractors who need them. We are actively growing a network of trusted tradespeople—from everyday painters, carpenters, laymen, and plumbers to top-tier architects and builders. Whether you need reliable help in your area or want to put your business on the local map to connect with clients actively searching for your trade, we are making it easier than ever. Get listed early or find your next local pro today.
                </p>
              </div>

              {/* Link Directory Button */}
              <div className="pt-2">
                <a
                  href="/directory"
                  className="inline-flex items-center gap-2 bg-secondary hover:bg-black dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all no-underline shadow hover:scale-[1.02]"
                >
                  Get Listed / Find Local Pros Today <i className="fas fa-chevron-right text-xs"></i>
                </a>
              </div>

              {/* Specific Disclaimer */}
              <div className="p-4 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl text-xs flex gap-3 text-amber-850 dark:text-amber-400">
                <i className="fas fa-info-circle text-base shrink-0 mt-0.5"></i>
                <p className="leading-relaxed font-semibold">
                  <strong>Connection Bridge Disclaimer:</strong> We are trying to build a connection or bridge so that house owners can get work done, and at the same time professional services can be served on both ends. HDE does not employ, manage, or take liability for physical work executed by listed professionals.
                </p>
              </div>
            </div>
            
          </div>
        </section>

        <hr className="border-gray-100 dark:border-zinc-800/80 my-12" />

        {/* BOTTOM CALL TO ACTION CONTAINER */}
        <section className="my-16 bg-gradient-to-r from-secondary to-[#1c3563] dark:from-zinc-900 dark:to-zinc-800/80 text-white rounded-3xl py-12 px-8 md:py-16 md:px-16 shadow-xl relative overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute left-10 bottom-0 w-32 h-32 bg-secondary/35 rounded-full filter blur-2xl translate-y-1/2"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight !text-white" style={{ color: '#ffffff' }}>
                Ready to Simplify Your House Construction?
              </h2>
              <p className="text-gray-300 font-medium max-w-xl text-base sm:text-lg">
                Join thousands of Indian homeowners and builders who estimate smarter, save material costs, and connect with trusted professionals. Download HDE Construction App for free today!
              </p>
            </div>
            
            <div className="lg:col-span-4 flex flex-col gap-4 items-center justify-center">
              <a 
                href={playStoreLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 bg-primary text-white hover:bg-primary-hover px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-95 text-center no-underline"
              >
                <i className="fab fa-google-play text-2xl"></i>
                <div className="text-left">
                  <p className="text-[9px] uppercase font-bold text-white/70 leading-none m-0">Download Free</p>
                  <p className="text-base font-extrabold m-0 mt-0.5 leading-tight">Get App on Play Store</p>
                </div>
              </a>
              <span className="text-[10px] text-gray-400 font-bold uppercase">
                100% Free &bull; No credit card required
              </span>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default AppPromoPage;
