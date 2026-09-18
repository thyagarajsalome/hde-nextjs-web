// src/components/real-estate/PropertyCard.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RealEstateProperty } from "@/types/realEstate";
import ViewNumberModal from "./ViewNumberModal";
import TransitDistancesWidget from "./TransitDistancesWidget";

export default function PropertyCard({
  property,
}: {
  property: RealEstateProperty;
}) {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const formatPrice = (amount: number, intent: string) => {
    if (intent === "rent") {
      return `₹${amount.toLocaleString("en-IN")} / mo`;
    }
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 2)} Lakhs`;
  };

  const images = property.images && property.images.length > 0
    ? property.images
    : [];

  const currentImage = images[activePhotoIdx] || images[0];

  return (
    <>
      <div className="group bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between">
        <div>
          {/* Media Header (1-3 photos - strict 16:9 ratio) */}
          <div className="relative aspect-video w-full bg-slate-100 overflow-hidden select-none">
            {images.length > 0 ? (
              <img
                src={currentImage}
                alt={property.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-gray-400 gap-1.5 select-none">
                <i className="fas fa-camera text-2xl text-gray-300"></i>
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                  Photos Coming Soon
                </span>
              </div>
            )}

            {/* Photo navigation dots if > 1 photo */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full z-10">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActivePhotoIdx(idx);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === activePhotoIdx ? "bg-white w-4" : "bg-white/50 hover:bg-white/80"
                    }`}
                    aria-label={`View photo ${idx + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Badges on Top Bar */}
            <div className="absolute top-3 inset-x-3 flex items-start justify-between gap-2 z-10 pointer-events-none">
              <div className="flex flex-wrap items-center gap-1.5 max-w-[68%]">
                <span className="px-2 py-0.5 rounded-md bg-[#4165af]/95 backdrop-blur-md text-white text-[10px] font-medium uppercase tracking-wide whitespace-nowrap">
                  {property.intent === "sale" ? "For Sale" : "For Rent"}
                </span>

                {property.khata_type && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-medium whitespace-nowrap">
                    {property.khata_type}
                  </span>
                )}

                {property.is_featured && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-medium flex items-center gap-1 whitespace-nowrap">
                    <i className="fas fa-star text-[9px]"></i>
                    <span>Featured</span>
                  </span>
                )}
              </div>

              {/* Owner vs RERA Agent Badge */}
              <div className="shrink-0">
                {property.poster_type === "owner" ? (
                  <span className="px-2.5 py-0.5 rounded-md bg-white/95 backdrop-blur-md text-gray-800 text-[10px] font-medium shadow-xs flex items-center gap-1 whitespace-nowrap">
                    <i className="fas fa-user-check text-emerald-600 text-[10px]"></i>
                    <span>Individual Owner</span>
                  </span>
                ) : property.is_rera_verified ? (
                  <span className="px-2.5 py-0.5 rounded-md bg-white/95 backdrop-blur-md text-primary text-[10px] font-medium shadow-xs flex items-center gap-1 whitespace-nowrap">
                    <i className="fas fa-certificate text-primary text-[10px]"></i>
                    <span>K-RERA Verified</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-md bg-white/95 backdrop-blur-md text-gray-600 text-[10px] font-medium shadow-xs whitespace-nowrap">
                    Agent
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-4 sm:p-5">
            {/* Price and Core Specs */}
            <div className="flex items-baseline justify-between gap-2 mb-1.5">
              <span className="text-lg sm:text-xl font-semibold text-secondary tracking-tight">
                {formatPrice(property.price, property.intent)}
              </span>
              {property.bhk && property.bhk !== "NA_PLOT" && (
                <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium text-xs">
                  {property.bhk}
                </span>
              )}
            </div>

            {/* Title */}
            <Link
              href={`/bangalore/properties/${property.id}`}
              className="text-sm font-medium text-gray-800 group-hover:text-primary transition-colors line-clamp-2 mb-2 leading-snug no-underline"
            >
              {property.title}
            </Link>

            {/* Location */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
              <i className="fas fa-location-dot text-gray-400 text-[11px]"></i>
              <span className="font-medium text-gray-600">{property.locality_name}</span>
              {property.sub_locality && (
                <span className="text-gray-400 font-light truncate">&bull; {property.sub_locality}</span>
              )}
            </div>

            {/* Quick Specs Pills */}
            <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-gray-100 text-center text-xs">
              <div>
                <span className="text-[10px] uppercase font-normal text-gray-400 block tracking-wider">Area</span>
                <span className="font-medium text-gray-700 text-xs">
                  {property.super_builtup_sqft || property.plot_area_sqft || property.carpet_area_sqft || "—"} sqft
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-normal text-gray-400 block tracking-wider">Facing</span>
                <span className="font-medium text-gray-700 text-xs">
                  {property.facing || "—"}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-normal text-gray-400 block tracking-wider">Type</span>
                <span className="font-medium text-gray-700 text-xs capitalize">
                  {property.category.replace("_", " ")}
                </span>
              </div>
            </div>

            {/* Compact Transit Distances */}
            <TransitDistancesWidget connectivity={property.connectivity} compact={true} />
          </div>
        </div>

        {/* Card Footer / Action */}
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-2 flex items-center gap-2">
          <button
            onClick={() => setModalOpen(true)}
            className="flex-1 py-2.5 px-4 bg-[#4165af] hover:bg-[#355393] text-white font-medium text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <i className="fas fa-phone text-xs"></i>
            <span>View Number</span>
          </button>

          <Link
            href={`/bangalore/properties/${property.id}`}
            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-gray-700 font-medium text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center no-underline"
          >
            <span>Details</span>
            <i className="fas fa-arrow-right text-[10px] ml-1.5"></i>
          </Link>
        </div>
      </div>

      {/* Lead & Anti-Spam View Number Modal */}
      <ViewNumberModal
        property={property}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
