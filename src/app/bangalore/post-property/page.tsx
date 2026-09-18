// src/app/bangalore/post-property/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ListingIntent,
  PropertyCategory,
  BhkType,
  FacingDirection,
  PosterRole,
  FurnishingStatus,
} from "@/types/realEstate";
import {
  BANGALORE_LOCALITIES,
  PROPERTY_CATEGORIES,
  BHK_OPTIONS,
  KHATA_TYPES,
} from "@/data/bangaloreLocalities";
import PropertyPhotoUploader from "@/components/real-estate/PropertyPhotoUploader";
import { RealEstateService } from "@/services/realEstateService";
import { useUser } from "@/context/UserContext";

export default function PostPropertyPage() {
  const router = useRouter();
  const { user } = useUser();

  // Step state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  // Form Fields
  const [intent, setIntent] = useState<ListingIntent>("sale");
  const [category, setCategory] = useState<PropertyCategory>("flat");
  const [bhk, setBhk] = useState<BhkType>("2BHK");
  const [localityId, setLocalityId] = useState(BANGALORE_LOCALITIES[0].id);
  const [subLocality, setSubLocality] = useState("");

  const [sqft, setSqft] = useState<number | "">("");
  const [price, setPrice] = useState<number | "">("");
  const [facing, setFacing] = useState<FacingDirection>("East");
  const [khataType, setKhataType] = useState("A Khata");

  // Rental Specific Fields
  const [depositAmount, setDepositAmount] = useState<number | "">("");
  const [maintenanceMonthly, setMaintenanceMonthly] = useState<number | "">("");
  const [furnishing, setFurnishing] = useState<FurnishingStatus>("semi_furnished");
  const [availableFrom, setAvailableFrom] = useState("");

  // Transit Distances
  const [airportKm, setAirportKm] = useState<number | "">("");
  const [metroName, setMetroName] = useState("");
  const [metroKm, setMetroKm] = useState<number | "">("");
  const [railwayName, setRailwayName] = useState("");
  const [railwayKm, setRailwayKm] = useState<number | "">("");
  const [mallName, setMallName] = useState("");
  const [mallKm, setMallKm] = useState<number | "">("");
  const [techParkName, setTechParkName] = useState("");
  const [techParkKm, setTechParkKm] = useState<number | "">("");

  // Description & Photos
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);

  // Contact & RERA
  const [posterType, setPosterType] = useState<PosterRole>("owner");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactWhatsapp, setContactWhatsapp] = useState("");
  const [reraId, setReraId] = useState("");
  const [agencyName, setAgencyName] = useState("");

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedLocality =
    BANGALORE_LOCALITIES.find((l) => l.id === localityId) || BANGALORE_LOCALITIES[0];

  const formatPricePreview = (val: number | "") => {
    if (!val || val <= 0) return "";
    if (intent === "rent") return `₹${Number(val).toLocaleString("en-IN")} / month`;
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Crores`;
    return `₹${(val / 100000).toFixed(val % 100000 === 0 ? 0 : 2)} Lakhs`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = "Property title is required";
    if (!price || price <= 0) newErrors.price = "Valid price in Rupees is required";
    if (!contactName.trim()) newErrors.contactName = "Contact name is required";
    const cleanContactPhone = contactPhone.replace(/[^0-9]/g, "");
    if (
      !cleanContactPhone ||
      cleanContactPhone.length !== 10 ||
      !/^[6-9]\d{9}$/.test(cleanContactPhone) ||
      /^(\d)\1{9}$/.test(cleanContactPhone) ||
      cleanContactPhone === "1234567890"
    ) {
      newErrors.contactPhone = "Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9";
    }
    if (posterType === "agent" && !reraId.trim()) {
      newErrors.reraId = "Karnataka RERA registration number is required for agents";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      // 1. Upload photos to Cloudflare R2 via secure API route
      const uploadedImageUrls: string[] = [];

      for (let i = 0; i < photos.length; i++) {
        const file = photos[i];
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("slotIndex", String(i));

          const res = await fetch("/api/real-estate/upload", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          if (res.ok && data.publicUrl) {
            uploadedImageUrls.push(data.publicUrl);
          } else {
            console.error("Photo upload failed for slot", i, data.error);
            throw new Error(data.error || `Failed to upload photo ${i + 1}`);
          }
        } catch (imgErr: any) {
          console.error("Upload error for photo", i, imgErr);
          throw new Error(`Photo upload failed: ${imgErr.message || "Server error"}`);
        }
      }

      // 2. Insert property via RealEstateService
      await RealEstateService.createProperty({
        user_id: user?.id,
        intent,
        category,
        bhk: category === "plot" ? "NA_PLOT" : bhk,
        city: "Bangalore",
        locality_name: selectedLocality.name,
        sub_locality: subLocality || undefined,
        super_builtup_sqft: category !== "plot" && sqft ? Number(sqft) : undefined,
        plot_area_sqft: category === "plot" && sqft ? Number(sqft) : undefined,
        price: Number(price),
        deposit_amount: intent === "rent" && depositAmount ? Number(depositAmount) : undefined,
        maintenance_monthly: maintenanceMonthly ? Number(maintenanceMonthly) : undefined,
        furnishing: intent === "rent" ? furnishing : undefined,
        available_from: intent === "rent" && availableFrom ? availableFrom : undefined,
        facing,
        khata_type: intent === "sale" ? khataType : undefined,
        title,
        description: description || `${bhk} ${category} for ${intent} in ${selectedLocality.name}, Bangalore.`,
        images: uploadedImageUrls,
        connectivity: {
          airport_km: airportKm ? Number(airportKm) : undefined,
          metro_bus_stop_name: metroName || undefined,
          metro_bus_km: metroKm ? Number(metroKm) : undefined,
          railway_station_name: railwayName || undefined,
          railway_km: railwayKm ? Number(railwayKm) : undefined,
          famous_mall_name: mallName || undefined,
          mall_km: mallKm ? Number(mallKm) : undefined,
          tech_park_name: techParkName || undefined,
          tech_park_km: techParkKm ? Number(techParkKm) : undefined,
        },
        poster_type: posterType,
        contact_name: contactName,
        contact_phone: contactPhone,
        contact_whatsapp: contactWhatsapp || contactPhone,
        rera_id: reraId || undefined,
        agency_name: agencyName || undefined,
        is_rera_verified: Boolean(reraId),
        status: "active",
      });

      setSuccessMessage(true);
      setTimeout(() => {
        router.push("/bangalore/properties");
      }, 2000);
    } catch (err: any) {
      console.error("Submission failed:", err);
      alert(err?.message || "Could not publish listing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Top Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-2">
            <i className="fas fa-bolt"></i>
            <span>Bangalore Fast Listing</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-secondary tracking-tight">
            Post Property Free
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mt-1">
            Publish your plot, flat, or villa in under 3 minutes. Zero spam calls.
          </p>
        </div>

        {successMessage ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-emerald-200 shadow-md animate-fadeIn">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl mb-4">
              <i className="fas fa-check"></i>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">
              Property Published Successfully!
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              Your listing is now live on the Bangalore Real Estate Marketplace. Redirecting...
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/bangalore/my-properties"
                className="w-full sm:w-auto px-6 py-3 bg-[#4165af] hover:bg-[#355393] text-white font-bold text-xs rounded-xl no-underline transition shadow-sm"
              >
                Manage My Properties
              </Link>
              <Link
                href="/bangalore/properties"
                className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl no-underline transition"
              >
                View in Marketplace
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* CARD 1: BASIC CATEGORY & INTENT */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
              <h3 className="text-base font-black text-secondary border-b border-gray-100 pb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">1</span>
                <span>Basic Property Info</span>
              </h3>

              {/* Intent */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">
                  Listing Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  <button
                    type="button"
                    onClick={() => setIntent("sale")}
                    className={`py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      intent === "sale"
                        ? "bg-[#4165af] text-white shadow-xs"
                        : "bg-gray-50 text-gray-600 border border-gray-200"
                    }`}
                  >
                    Sell Property
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIntent("rent");
                      if (category === "plot") setCategory("flat");
                    }}
                    className={`py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      intent === "rent"
                        ? "bg-[#4165af] text-white shadow-xs"
                        : "bg-gray-50 text-gray-600 border border-gray-200"
                    }`}
                  >
                    Rent Out Property
                  </button>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">
                  Property Category <span className="text-red-500">*</span>
                </label>
                <div className={`grid gap-3 ${intent === "rent" ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-4"}`}>
                  {PROPERTY_CATEGORIES.filter((cat) => intent === "sale" || cat.id !== "plot").map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id as PropertyCategory)}
                      className={`p-3 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        category === cat.id
                          ? "border-2 border-primary bg-primary/5 text-primary"
                          : "border border-gray-200 bg-gray-50/50 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <i className={`${cat.icon} text-base`}></i>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* BHK (if not plot) */}
              {category !== "plot" && (
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-2">
                    Configuration (BHK) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {BHK_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setBhk(opt as BhkType)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          bhk === opt
                            ? "bg-primary text-white shadow-xs"
                            : "bg-gray-50 text-gray-700 border border-gray-200"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Bangalore Locality */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">
                    Bangalore Locality <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={localityId}
                    onChange={(e) => setLocalityId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-primary"
                  >
                    {BANGALORE_LOCALITIES.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.zone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">
                    Landmark / Sub-locality
                  </label>
                  <input
                    type="text"
                    value={subLocality}
                    onChange={(e) => setSubLocality(e.target.value)}
                    placeholder="e.g. Near Nexus Mall, Sector 2"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* CARD 2: PRICING & SPECS (Tailored for Rent vs Sale) */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
              <h3 className="text-base font-black text-secondary border-b border-gray-100 pb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">2</span>
                <span>{intent === "rent" ? "Rental Terms & Specifications" : "Pricing & Property Specifications"}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Price: Rent or Sale */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">
                    {intent === "sale" ? "Expected Sale Price (in Rupees)" : "Monthly Rent (₹ / month)"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
                    placeholder={intent === "sale" ? "e.g. 7500000" : "e.g. 25000"}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      errors.price ? "border-red-500" : "border-gray-200"
                    } text-sm focus:outline-none focus:border-primary`}
                  />
                  {price && (
                    <span className="text-xs font-extrabold text-primary mt-1 block">
                      Preview: {formatPricePreview(price)}
                    </span>
                  )}
                  {errors.price && (
                    <span className="text-[11px] text-red-500 block mt-1">{errors.price}</span>
                  )}
                </div>

                {/* Rental Deposit or Sale Khata */}
                {intent === "rent" ? (
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1.5">
                      Security Deposit Amount (in Rupees)
                    </label>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value ? Number(e.target.value) : "")}
                      placeholder="e.g. 150000 (usually 5 to 10 months rent)"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1.5">
                      Khata Type (Bangalore Title)
                    </label>
                    <select
                      value={khataType}
                      onChange={(e) => setKhataType(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-primary"
                    >
                      {KHATA_TYPES.map((k) => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Rental Maintenance or Sq Ft */}
                {intent === "rent" && (
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1.5">
                      Monthly Society Maintenance (₹)
                    </label>
                    <input
                      type="number"
                      value={maintenanceMonthly}
                      onChange={(e) => setMaintenanceMonthly(e.target.value ? Number(e.target.value) : "")}
                      placeholder="e.g. 2500 (leave empty if included in rent)"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                )}

                {/* Furnishing Status (Crucial for Rent) */}
                {intent === "rent" && (
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1.5">
                      Furnishing Status
                    </label>
                    <select
                      value={furnishing}
                      onChange={(e) => setFurnishing(e.target.value as FurnishingStatus)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-primary"
                    >
                      <option value="semi_furnished">Semi-Furnished (Wardrobes, Kitchen, Fans)</option>
                      <option value="fully_furnished">Fully-Furnished (Sofa, TV, Bed, Fridge, AC)</option>
                      <option value="unfurnished">Unfurnished (Bare Shell)</option>
                    </select>
                  </div>
                )}

                {/* Built-up Area */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">
                    {category === "plot" ? "Plot Area (in Sq.Ft)" : "Super Built-up Area (in Sq.Ft)"}
                  </label>
                  <input
                    type="number"
                    value={sqft}
                    onChange={(e) => setSqft(e.target.value ? Number(e.target.value) : "")}
                    placeholder="e.g. 1200"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Facing Orientation */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">
                    Facing Orientation
                  </label>
                  <select
                    value={facing}
                    onChange={(e) => setFacing(e.target.value as FacingDirection)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-primary"
                  >
                    <option value="East">East Facing</option>
                    <option value="North">North Facing</option>
                    <option value="North-East">North-East Facing</option>
                    <option value="West">West Facing</option>
                    <option value="South">South Facing</option>
                  </select>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">
                  Property Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    intent === "rent"
                      ? "e.g. Spacious 2 BHK Semi-Furnished Apartment for Rent in Whitefield"
                      : "e.g. 1500 Sq.Ft A-Khata 3 BHK Apartment for Sale in HSR Layout"
                  }
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    errors.title ? "border-red-500" : "border-gray-200"
                  } text-sm focus:outline-none focus:border-primary`}
                />
                {errors.title && (
                  <span className="text-[11px] text-red-500 block mt-1">{errors.title}</span>
                )}
              </div>
            </div>

            {/* CARD 3: TRANSIT & KEY DISTANCES */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-base font-black text-secondary flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">3</span>
                  <span>Transit &amp; Landmark Distances</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Bangalore buyers check travel times first. Fill in distances to boost inquiries.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Airport */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    ✈️ Kempegowda Airport Distance (km)
                  </label>
                  <input
                    type="number"
                    value={airportKm}
                    onChange={(e) => setAirportKm(e.target.value ? Number(e.target.value) : "")}
                    placeholder="e.g. 36"
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Metro */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      🚇 Nearest Metro / Bus Stop
                    </label>
                    <input
                      type="text"
                      value={metroName}
                      onChange={(e) => setMetroName(e.target.value)}
                      placeholder="e.g. Kadugodi Metro"
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="w-24">
                    <label className="text-xs font-bold text-gray-700 block mb-1">km</label>
                    <input
                      type="number"
                      step="0.1"
                      value={metroKm}
                      onChange={(e) => setMetroKm(e.target.value ? Number(e.target.value) : "")}
                      placeholder="1.2"
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Railway Station */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      🚆 Railway Station
                    </label>
                    <input
                      type="text"
                      value={railwayName}
                      onChange={(e) => setRailwayName(e.target.value)}
                      placeholder="e.g. KR Puram Station"
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="w-24">
                    <label className="text-xs font-bold text-gray-700 block mb-1">km</label>
                    <input
                      type="number"
                      step="0.1"
                      value={railwayKm}
                      onChange={(e) => setRailwayKm(e.target.value ? Number(e.target.value) : "")}
                      placeholder="5.0"
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Tech Park */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      💼 Major Tech Park
                    </label>
                    <input
                      type="text"
                      value={techParkName}
                      onChange={(e) => setTechParkName(e.target.value)}
                      placeholder="e.g. ITPL / Manyata"
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="w-24">
                    <label className="text-xs font-bold text-gray-700 block mb-1">km</label>
                    <input
                      type="number"
                      step="0.1"
                      value={techParkKm}
                      onChange={(e) => setTechParkKm(e.target.value ? Number(e.target.value) : "")}
                      placeholder="2.5"
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 4: PHOTO UPLOADER (Max 3, WebP Auto-Compressed) */}
            <PropertyPhotoUploader onPhotosChange={setPhotos} />

            {/* CARD 5: CONTACT & RERA DETAILS */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
              <h3 className="text-base font-black text-secondary border-b border-gray-100 pb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">4</span>
                <span>Contact &amp; Verification</span>
              </h3>

              {/* Poster Role */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">
                  Who are you?
                </label>
                <div className="flex items-center gap-6 text-xs sm:text-sm">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      checked={posterType === "owner"}
                      onChange={() => setPosterType("owner")}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="font-semibold text-gray-800">Property Owner</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      checked={posterType === "agent"}
                      onChange={() => setPosterType("agent")}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="font-semibold text-gray-800">Property Dealer / Broker</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      checked={posterType === "builder"}
                      onChange={() => setPosterType("builder")}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="font-semibold text-gray-800">Builder / Developer</span>
                  </label>
                </div>
              </div>

              {/* Conditional RERA Fields for Dealers */}
              {posterType === "agent" && (
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <i className="fas fa-certificate text-primary"></i>
                    <span>Karnataka RERA Registration (Required for Brokers)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-gray-700 block mb-1">
                        K-RERA Agent Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={reraId}
                        onChange={(e) => setReraId(e.target.value)}
                        placeholder="e.g. PRM/KA/RERA/1251/..."
                        className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary"
                      />
                      {errors.reraId && (
                        <span className="text-[11px] text-red-500 block mt-1">{errors.reraId}</span>
                      )}
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-700 block mb-1">
                        Agency / Firm Name
                      </label>
                      <input
                        type="text"
                        value={agencyName}
                        onChange={(e) => setAgencyName(e.target.value)}
                        placeholder="e.g. Bangalore Prime Realty"
                        className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Full Name"
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      errors.contactName ? "border-red-500" : "border-gray-200"
                    } text-sm focus:outline-none focus:border-primary`}
                  />
                  {errors.contactName && (
                    <span className="text-[11px] text-red-500 block mt-1">{errors.contactName}</span>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">
                    10-Digit Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-600">
                      +91
                    </div>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="9886012345"
                      maxLength={10}
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        errors.contactPhone ? "border-red-500" : "border-gray-200"
                      } text-sm focus:outline-none focus:border-primary`}
                    />
                  </div>
                  {errors.contactPhone && (
                    <span className="text-[11px] text-red-500 block mt-1">{errors.contactPhone}</span>
                  )}
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="text-center pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-12 py-4 bg-primary hover:bg-primary-hover text-white font-extrabold text-base rounded-2xl transition-all shadow-xl hover:scale-102 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fas fa-circle-notch fa-spin"></i>
                    <span>Optimizing &amp; Publishing...</span>
                  </span>
                ) : (
                  <span>Publish Property Listing Free</span>
                )}
              </button>
              <p className="text-[11px] text-gray-400 mt-2">
                By publishing, you agree to our <Link href="/bangalore/terms" className="underline">Listing Terms</Link> and <Link href="/bangalore/disclaimer" className="underline">RERA Disclaimers</Link>.
              </p>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}
