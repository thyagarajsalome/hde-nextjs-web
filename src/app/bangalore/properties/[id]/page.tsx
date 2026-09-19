// src/app/bangalore/properties/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { RealEstateProperty } from "@/types/realEstate";
import { RealEstateService } from "@/services/realEstateService";
import TransitDistancesWidget from "@/components/real-estate/TransitDistancesWidget";
import ViewNumberModal from "@/components/real-estate/ViewNumberModal";
import CrossSellBanner from "@/components/real-estate/CrossSellBanner";
import AdminModerationBar from "@/components/real-estate/AdminModerationBar";
import ReportListingModal from "@/components/real-estate/ReportListingModal";
import PropertyIntegrationsWidget from "@/components/real-estate/PropertyIntegrationsWidget";

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [property, setProperty] = useState<RealEstateProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const loadProp = async () => {
      setLoading(true);
      try {
        const data = await RealEstateService.getPropertyById(id);
        setProperty(data);
      } catch (err) {
        console.error("Error loading property detail:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProp();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-24 text-center">
        <i className="fas fa-circle-notch fa-spin text-4xl text-primary mb-3"></i>
        <p className="text-sm font-semibold text-gray-500">Loading property details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-24 text-center">
        <div className="max-w-md mx-auto bg-white rounded-2xl p-8 border border-gray-200 shadow-xs">
          <i className="fas fa-exclamation-circle text-4xl text-amber-500 mb-3"></i>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-xs text-gray-500 mb-6">
            This property may have been sold, rented out, or removed by the owner.
          </p>
          <Link
            href="/bangalore/properties"
            className="px-5 py-2.5 bg-primary text-white font-bold text-xs rounded-xl no-underline"
          >
            Explore Bangalore Properties
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (amount: number, intent: string) => {
    if (intent === "rent") return `₹${amount.toLocaleString("en-IN")} / month`;
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Crores`;
    return `₹${(amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 2)} Lakhs`;
  };

  const images = property.images && property.images.length > 0
    ? property.images
    : [];

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Admin Moderation Bar (Visible only to thyagaraja1983@gmail.com) */}
      <AdminModerationBar
        property={property}
        onStatusChange={(newStatus) => setProperty({ ...property, status: newStatus })}
      />

      {/* Breadcrumb & Navigation */}
      <div className="bg-white border-b border-gray-200/80 py-3">
        <div className="container mx-auto px-4 max-w-6xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-gray-500">
            <Link href="/" className="hover:text-primary no-underline">Home</Link>
            <span>/</span>
            <Link href="/bangalore/properties" className="hover:text-primary no-underline">Bangalore Real Estate</Link>
            <span>/</span>
            <span className="text-gray-900 font-semibold truncate max-w-xs">{property.locality_name}</span>
          </div>

          <Link
            href="/bangalore/properties"
            className="text-primary hover:underline font-bold flex items-center gap-1.5 no-underline"
          >
            <i className="fas fa-arrow-left text-[10px]"></i>
            <span>Back to search</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl pt-6">
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-[#4165af] text-white text-xs font-bold uppercase tracking-wider rounded-lg">
                {property.intent === "sale" ? "For Sale" : "For Rent"}
              </span>
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold capitalize rounded-lg">
                {property.category.replace("_", " ")}
              </span>
              {property.khata_type && (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg">
                  {property.khata_type}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-secondary tracking-tight">
              {property.title}
            </h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
              <i className="fas fa-location-dot text-primary"></i>
              <span>{property.locality_name}</span>
              {property.sub_locality && <span>&bull; {property.sub_locality}</span>}
              <span>&bull; Bangalore, Karnataka</span>
            </p>
          </div>

          {/* Pricing Box */}
          <div className="text-left md:text-right flex-shrink-0 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
            <span className="text-[11px] uppercase tracking-wider font-bold text-gray-400 block">
              {property.intent === "sale" ? "Total Price" : "Monthly Rent"}
            </span>
            <div className="text-3xl font-black text-secondary">
              {formatPrice(property.price, property.intent)}
            </div>
            {property.deposit_amount ? (
              <span className="text-xs text-gray-500 font-semibold block mt-0.5">
                Deposit: ₹{(property.deposit_amount / 100000).toFixed(1)} Lakhs
              </span>
            ) : property.maintenance_monthly ? (
              <span className="text-xs text-gray-500 font-semibold block mt-0.5">
                Maintenance: ₹{property.maintenance_monthly}/mo
              </span>
            ) : null}
          </div>
        </div>

        {/* Gallery & Quick Overview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Main Gallery (2 Columns) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 border border-gray-200/80 shadow-xs flex items-center justify-center">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[activePhotoIdx]}
                    alt={property.title}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {activePhotoIdx + 1} / {images.length} Photos
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 gap-2 p-8 text-center select-none">
                  <i className="fas fa-camera text-4xl text-gray-300"></i>
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    No Photos Uploaded Yet &bull; Photos Coming Soon
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Row (16:9) */}
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`relative w-24 aspect-video rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      idx === activePhotoIdx ? "border-primary scale-105 shadow-md" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Contact Card & Trust Badges (1 Column) */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  Listed By
                </span>
                <h3 className="text-xl font-bold text-secondary">
                  {property.contact_name}
                </h3>
                <div className="flex items-center gap-1.5 mt-1">
                  {property.poster_type === "owner" ? (
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium flex items-center gap-1">
                      <i className="fas fa-user-check text-[11px]"></i>
                      <span>Individual Owner</span>
                    </span>
                  ) : property.is_rera_verified ? (
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-1 border border-emerald-200">
                      <i className="fas fa-certificate text-emerald-600 text-[11px]"></i>
                      <span>
                        {property.poster_type === "builder" ? "K-RERA Verified Developer" : "K-RERA Verified Broker"}
                      </span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 text-xs font-medium flex items-center gap-1 border border-amber-200">
                      <i className="fas fa-clock text-amber-600 text-[11px]"></i>
                      <span>
                        {property.poster_type === "builder" ? "Developer (RERA Declared)" : "Broker (RERA Declared)"}
                      </span>
                    </span>
                  )}
                </div>

                {property.rera_id && (
                  <div className="text-[11px] text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-200 mt-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-700">RERA Registration:</span>
                      {property.is_rera_verified ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <i className="fas fa-check-circle"></i> Verified
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded">
                          Self-Declared
                        </span>
                      )}
                    </div>
                    <code className="text-primary font-mono font-medium block break-all">{property.rera_id}</code>
                    {property.agency_name && <span className="block text-gray-500">{property.agency_name}</span>}
                    <div className="pt-1.5 border-t border-gray-200 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">Government Portal:</span>
                      <a
                        href="https://rera.karnataka.gov.in/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 hover:underline"
                      >
                        Verify on K-RERA <i className="fas fa-external-link-alt text-[9px]"></i>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Masked Phone Box */}
              <div className="bg-slate-50 border border-dashed border-gray-300 rounded-xl p-4 text-center">
                <span className="text-xs text-gray-500 block mb-1">Phone Number</span>
                <span className="text-lg font-mono font-medium text-gray-400 tracking-wider">
                  +91 98••• •••••
                </span>
                <span className="text-[11px] text-gray-400 block mt-0.5">
                  Masked &amp; protected against spam bots
                </span>
              </div>

              {/* Primary Call to Action */}
              <button
                onClick={() => setModalOpen(true)}
                className="w-full py-3 px-6 bg-[#4165af] hover:bg-[#355393] text-white font-medium text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <i className="fas fa-phone-alt text-xs"></i>
                <span>View Contact Details</span>
              </button>

              <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                Instant access. We never sell your number to spam call centers.
              </p>

              {/* Safety & Report Button */}
              <button
                type="button"
                onClick={() => setReportModalOpen(true)}
                className="w-full text-center text-[11px] text-slate-400 hover:text-rose-600 pt-2 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <i className="fas fa-flag text-[10px]"></i>
                <span>Report inappropriate photos or fraudulent listing</span>
              </button>
            </div>

            {/* Quick Property Attributes Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm space-y-3 text-xs">
              <h4 className="font-extrabold text-secondary uppercase tracking-wider mb-2">
                Property Overview
              </h4>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Configuration</span>
                <span className="font-bold text-gray-800">{property.bhk}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Super Built-up Area</span>
                <span className="font-bold text-gray-800">{property.super_builtup_sqft ? `${property.super_builtup_sqft} sqft` : "—"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Plot / Site Area</span>
                <span className="font-bold text-gray-800">{property.plot_area_sqft ? `${property.plot_area_sqft} sqft` : "—"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Facing Orientation</span>
                <span className="font-bold text-gray-800">{property.facing || "—"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Furnishing</span>
                <span className="font-bold text-gray-800 capitalize">{property.furnishing?.replace("_", " ") || "Unfurnished"}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-500">Legal Title</span>
                <span className="font-bold text-emerald-700">{property.khata_type || "A Khata"}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Structured Transit & Landmark Distances */}
        <div className="mb-8">
          <TransitDistancesWidget connectivity={property.connectivity} compact={false} />
        </div>

        {/* Description & Features */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-xs mb-8">
          <h3 className="text-lg font-black text-secondary mb-3">About this Property</h3>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {property.description}
          </p>
        </div>

        {/* Real Estate Deep Integrations: Blueprints, Construction BOM & EMI */}
        <div className="mb-8">
          <PropertyIntegrationsWidget property={property} />
        </div>

        {/* RERA Intermediary Safe Harbor Disclaimer */}
        <div className="mt-8 p-5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500 leading-relaxed">
          <p>
            <strong>RERA &amp; Safe Harbor Intermediary Notice:</strong> Home Design English (HDE) is a real estate discovery platform and acts as an intermediary under Section 79 of the Information Technology Act. HDE does not verify title deeds, ownership documents, or physical land boundaries. Prospective purchasers and tenants are advised to independently verify K-RERA certifications, encumbrance certificates (EC), and municipal sanctions before issuing token advances.
          </p>
        </div>

      </div>

      {/* Lead Modal */}
      <ViewNumberModal
        property={property}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      {/* Report Modal */}
      <ReportListingModal
        property={property}
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />
    </div>
  );
}
