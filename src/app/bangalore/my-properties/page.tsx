// src/app/bangalore/my-properties/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { RealEstateProperty } from "@/types/realEstate";
import { RealEstateService } from "@/services/realEstateService";
import { useUser } from "@/context/UserContext";
import { compressToWebP } from "@/utils/imageCompressor";

export default function MyPropertiesPage() {
  const { user, loading: authLoading } = useUser();
  const [properties, setProperties] = useState<RealEstateProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "sold">("all");

  // Edit Modal State
  const [editingProp, setEditingProp] = useState<RealEstateProperty | null>(null);
  const [editPrice, setEditPrice] = useState<number | "">("");
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editImages, setEditImages] = useState<string[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Delete Confirm State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Deal Closed Modal State (Owner/Broker closed transaction)
  const [dealClosedProp, setDealClosedProp] = useState<RealEstateProperty | null>(null);
  const [isClosingDeal, setIsClosingDeal] = useState(false);
  const [closedDealSuccess, setClosedDealSuccess] = useState<string | null>(null);

  const fetchUserProperties = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await RealEstateService.getUserProperties(user.id);
      setProperties(data);
    } catch (err) {
      console.error("Failed to load user properties:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchUserProperties();
    }
  }, [user, authLoading]);

  // Status toggle handler
  const handleToggleStatus = async (prop: RealEstateProperty) => {
    const newStatus: RealEstateProperty["status"] =
      prop.status === "active" ? "sold_or_rented" : "active";
    try {
      await RealEstateService.updateProperty(prop.id, { status: newStatus });
      setProperties((prev) =>
        prev.map((p) => (p.id === prop.id ? { ...p, status: newStatus } : p))
      );
    } catch (err: any) {
      alert("Failed to update status: " + (err.message || "Unknown error"));
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (prop: RealEstateProperty) => {
    setEditingProp(prop);
    setEditPrice(prop.price);
    setEditTitle(prop.title);
    setEditDesc(prop.description);
    setEditPhone(prop.contact_phone);
    setEditImages(Array.isArray(prop.images) ? [...prop.images] : []);
  };

  // Remove photo from listing
  const handleRemovePhoto = (urlToRemove: string) => {
    setEditImages((prev) => prev.filter((url) => url !== urlToRemove));
  };

  // Upload new photo in edit mode
  const handleUploadNewPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (editImages.length >= 3) {
      alert("Maximum 3 photos allowed per property.");
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const compressed = await compressToWebP(file, 640, 360, 0.6);
      const formData = new FormData();
      formData.append("file", compressed.file);
      formData.append("slotIndex", String(editImages.length));
      if (editingProp?.id) {
        formData.append("propertyId", editingProp.id);
      }

      const res = await fetch("/api/real-estate/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.publicUrl) {
        setEditImages((prev) => [...prev, data.publicUrl]);
      } else {
        throw new Error(data.error || "Failed to upload photo");
      }
    } catch (err: any) {
      console.error("Photo upload error:", err);
      alert(err.message || "Failed to upload photo. Please try again.");
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = "";
    }
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProp || !editPrice) return;

    setIsSaving(true);
    try {
      const updated = await RealEstateService.updateProperty(editingProp.id, {
        price: Number(editPrice),
        title: editTitle,
        description: editDesc,
        contact_phone: editPhone,
        images: editImages,
      });

      setProperties((prev) =>
        prev.map((p) => (p.id === editingProp.id ? { ...p, ...updated } : p))
      );
      setEditingProp(null);
    } catch (err: any) {
      alert("Failed to save updates: " + (err.message || "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Property & Purge R2
  const handleDelete = async () => {
    if (!deletingId) return;
    const targetProp = properties.find((p) => p.id === deletingId);

    setIsDeleting(true);
    try {
      await RealEstateService.deleteProperty(
        deletingId,
        targetProp?.images || []
      );
      setProperties((prev) => prev.filter((p) => p.id !== deletingId));
      setDeletingId(null);
    } catch (err: any) {
      alert("Failed to delete property: " + (err.message || "Unknown error"));
    } finally {
      setIsDeleting(false);
    }
  };

  // Deal Closed & Data Removal Handler
  const handleConfirmDealClosed = async () => {
    if (!dealClosedProp) return;

    setIsClosingDeal(true);
    try {
      await RealEstateService.deleteProperty(
        dealClosedProp.id,
        dealClosedProp.images || []
      );
      setProperties((prev) => prev.filter((p) => p.id !== dealClosedProp.id));
      const closedType =
        dealClosedProp.intent === "sale"
          ? "Property Sold / Purchased"
          : "House Occupied for Rent";
      setClosedDealSuccess(
        `Deal Closed Successfully (${closedType})! Old data and photos have been removed to protect your privacy and keep the marketplace fresh.`
      );
      setDealClosedProp(null);
    } catch (err: any) {
      alert("Failed to close deal and remove listing: " + (err.message || "Unknown error"));
    } finally {
      setIsClosingDeal(false);
    }
  };

  const formatPrice = (amount: number, intent: string) => {
    if (intent === "rent") return `₹${amount.toLocaleString("en-IN")} / mo`;
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    return `₹${(amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 2)} L`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-24 text-center">
        <i className="fas fa-circle-notch fa-spin text-4xl text-[#4165af] mb-3"></i>
        <p className="text-sm font-semibold text-gray-500">Loading your listings...</p>
      </div>
    );
  }

  // Not logged in view
  if (!user) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-16 px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl p-8 border border-gray-200 shadow-sm text-center">
          <div className="w-14 h-14 bg-blue-50 text-[#4165af] rounded-2xl flex items-center justify-center mx-auto text-2xl mb-4">
            <i className="fas fa-user-lock"></i>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Account Sign-In Required</h2>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            Please log in or sign up to manage your posted properties, view buyer leads, and edit your listings.
          </p>
          <div className="flex flex-col gap-2.5">
            <Link
              href="/bangalore/post-property"
              className="w-full py-2.5 bg-[#4165af] hover:bg-[#345290] text-white font-semibold text-xs rounded-xl no-underline transition"
            >
              Post a Property Free
            </Link>
            <Link
              href="/bangalore/properties"
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl no-underline transition"
            >
              Browse Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredProperties = properties.filter((p) => {
    if (activeTab === "active") return p.status === "active";
    if (activeTab === "sold") return p.status === "sold_or_rented";
    return true;
  });

  const totalViews = properties.reduce((acc, p) => acc + (p.views_count || 0), 0);
  const totalInquiries = properties.reduce((acc, p) => acc + (p.inquiries_count || 0), 0);
  const activeCount = properties.filter((p) => p.status === "active").length;

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Deal Closed Celebration Alert */}
        {closedDealSuccess && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-xs animate-fade-in">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-emerald-200 text-emerald-800 rounded-full flex items-center justify-center shrink-0 text-sm">
                <i className="fas fa-handshake"></i>
              </div>
              <p className="leading-relaxed">{closedDealSuccess}</p>
            </div>
            <button
              onClick={() => setClosedDealSuccess(null)}
              className="text-emerald-700 hover:text-emerald-950 font-bold text-lg px-2 cursor-pointer"
            >
              &times;
            </button>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-gray-900">My Properties</h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#4165af]">
                Bangalore
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Logged in as <strong className="text-gray-700">{user.email}</strong> • Manage your listings, track views, and update prices.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href="/bangalore/post-property"
              className="px-4 py-2.5 bg-[#4165af] hover:bg-[#345290] text-white font-semibold text-xs rounded-xl no-underline transition flex items-center gap-1.5 shadow-xs"
            >
              <i className="fas fa-plus text-[10px]"></i>
              <span>Post New Property</span>
            </Link>
            <Link
              href="/bangalore/properties"
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl no-underline transition flex items-center gap-1.5"
            >
              <i className="fas fa-search text-[10px]"></i>
              <span>Marketplace</span>
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
            <div className="text-[11px] text-gray-500 font-medium">Total Listings</div>
            <div className="text-2xl font-black text-gray-900 mt-1">{properties.length}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
            <div className="text-[11px] text-gray-500 font-medium">Active Listings</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{activeCount}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
            <div className="text-[11px] text-gray-500 font-medium">Total Views</div>
            <div className="text-2xl font-black text-blue-600 mt-1">{totalViews}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
            <div className="text-[11px] text-gray-500 font-medium">Buyer Inquiries</div>
            <div className="text-2xl font-black text-indigo-600 mt-1">{totalInquiries}</div>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "all"
                ? "bg-[#4165af] text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            All Listings ({properties.length})
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "active"
                ? "bg-[#4165af] text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setActiveTab("sold")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "sold"
                ? "bg-[#4165af] text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Sold / Inactive ({properties.length - activeCount})
          </button>
        </div>

        {/* Listings List */}
        {filteredProperties.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200/80 shadow-xs space-y-4">
            <div className="w-16 h-16 bg-blue-50 text-[#4165af] rounded-full flex items-center justify-center mx-auto text-2xl">
              <i className="fas fa-home"></i>
            </div>
            <h3 className="text-base font-bold text-gray-900">No properties found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {activeTab === "all"
                ? "You haven't listed any properties yet. Post your flat, villa, or plot for free to reach active buyers."
                : `No listings with status: "${activeTab}".`}
            </p>
            <Link
              href="/bangalore/post-property"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#4165af] hover:bg-[#345290] text-white font-semibold text-xs rounded-xl no-underline transition shadow-xs"
            >
              <i className="fas fa-plus text-[10px]"></i>
              <span>Post Your First Property Free</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProperties.map((prop) => (
              <div
                key={prop.id}
                className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden flex flex-col justify-between hover:border-gray-300 transition"
              >
                <div>
                  {/* Image & Badges */}
                  <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                    {prop.images && prop.images[0] ? (
                      <Image
                        src={prop.images[0]}
                        alt={prop.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                        <i className="fas fa-image text-3xl mb-1.5 text-slate-300"></i>
                        <span className="text-xs font-medium">Photos Coming Soon</span>
                      </div>
                    )}

                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider text-white ${
                        prop.status === "active" ? "bg-emerald-600" :
                        prop.status === "rejected" ? "bg-rose-600" :
                        "bg-slate-600"
                      }`}>
                        {prop.status === "active" ? "Active" :
                         prop.status === "rejected" ? "Taken Down" : "Sold / Rented"}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-slate-900/80 text-white">
                        For {prop.intent}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 right-2.5 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-xs font-bold text-gray-900 shadow-xs">
                      {formatPrice(prop.price, prop.intent)}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{prop.title}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <i className="fas fa-map-marker-alt text-[11px] text-[#4165af]"></i>
                      <span>{prop.locality_name}</span>
                      {prop.sub_locality && <span>• {prop.sub_locality}</span>}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-gray-600 pt-1 border-t border-gray-100">
                      <span><strong>{prop.bhk}</strong></span>
                      <span>•</span>
                      <span>{prop.super_builtup_sqft || prop.plot_area_sqft || "—"} sqft</span>
                      <span>•</span>
                      <span>{prop.khata_type || "A Khata"}</span>
                    </div>

                    {/* Stats & Expiry Countdown */}
                    <div className="flex items-center gap-4 text-[11px] text-gray-400 pt-1">
                      <span><i className="fas fa-eye text-blue-500 mr-1"></i> {prop.views_count || 0} Views</span>
                      <span><i className="fas fa-envelope text-indigo-500 mr-1"></i> {prop.inquiries_count || 0} Leads</span>
                    </div>

                    {(() => {
                      const effectiveExpiry = prop.expires_at || (prop.created_at ? new Date(new Date(prop.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString() : null);
                      if (!effectiveExpiry) return null;
                      const isExpired = new Date(effectiveExpiry) <= new Date();
                      const daysLeft = Math.max(1, Math.ceil((new Date(effectiveExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

                      return (
                        <div className="text-[11px] text-amber-800 bg-amber-50/80 px-2.5 py-1.5 rounded-lg flex items-center justify-between border border-amber-200 mt-1">
                          <span>
                            <i className="far fa-clock mr-1 text-amber-600"></i>
                            {!isExpired
                              ? `Active for ${daysLeft} more days`
                              : "30-day period expired"}
                          </span>
                          {isExpired && (
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  const next30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
                                  await RealEstateService.updateProperty(prop.id, { expires_at: next30, status: "active" });
                                  setProperties((prev) =>
                                    prev.map((p) => (p.id === prop.id ? { ...p, expires_at: next30, status: "active" } : p))
                                  );
                                  alert("Listing renewed for 30 days for free!");
                                } catch (err: any) {
                                  alert("Failed to renew listing: " + err.message);
                                }
                              }}
                              className="text-[10px] font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer"
                            >
                              Renew 30 Days (Free)
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Card Action Buttons (CRUD) */}
                <div className="p-4 pt-0 border-t border-gray-100 mt-2 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Link
                      href={`/bangalore/properties/${prop.id}`}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 no-underline transition flex items-center gap-1"
                      title="View public page"
                    >
                      <i className="fas fa-external-link-alt text-[10px]"></i>
                      <span>View</span>
                    </Link>

                    <button
                      onClick={() => handleOpenEdit(prop)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-[#4165af] transition flex items-center gap-1 cursor-pointer"
                      title="Edit price, title, or phone"
                    >
                      <i className="fas fa-pen text-[10px]"></i>
                      <span>Edit</span>
                    </button>

                    {/* Deal Closed Button (Owner/Broker option) */}
                    <button
                      onClick={() => setDealClosedProp(prop)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition flex items-center gap-1 cursor-pointer shadow-2xs"
                      title={prop.intent === "sale" ? "Property Purchased / Sold" : "House Occupied for Rent"}
                    >
                      <i className="fas fa-handshake text-[10px]"></i>
                      <span>{prop.intent === "sale" ? "Deal Closed (Sold)" : "Deal Closed (Occupied)"}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setDeletingId(prop.id)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition flex items-center gap-1 cursor-pointer"
                    title="Permanently delete this property"
                  >
                    <i className="fas fa-trash text-[10px]"></i>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Edit Modal */}
      {editingProp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <i className="fas fa-pen text-[#4165af]"></i>
                <span>Edit Listing Details</span>
              </h3>
              <button
                onClick={() => setEditingProp(null)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Listing Title:
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4165af] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Price in Rupees (₹):
                  </label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value ? Number(e.target.value) : "")}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4165af] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Contact Mobile Number:
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4165af] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Description:
                </label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4165af] focus:outline-none"
                />
              </div>

              {/* Photo Management (Update / Delete Photos) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-gray-700">
                    Property Photos ({editImages.length} / 3):
                  </label>
                  <span className="text-[10px] text-gray-400">
                    Auto 16:9 WebP &lt;60 KB
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {editImages.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 border border-slate-200 group"
                    >
                      <Image
                        src={imgUrl}
                        alt={`Photo ${idx + 1}`}
                        fill
                        sizes="120px"
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(imgUrl)}
                        className="absolute top-1 right-1 w-6 h-6 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center text-[10px] shadow-sm transition cursor-pointer"
                        title="Delete this photo"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  ))}

                  {editImages.length < 3 && (
                    <label className="relative aspect-video rounded-lg border-2 border-dashed border-slate-300 hover:border-[#4165af] flex flex-col items-center justify-center text-slate-500 hover:text-[#4165af] cursor-pointer bg-slate-50 hover:bg-blue-50/50 transition">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/heic"
                        onChange={handleUploadNewPhoto}
                        disabled={isUploadingPhoto}
                        className="hidden"
                      />
                      {isUploadingPhoto ? (
                        <i className="fas fa-circle-notch fa-spin text-sm text-[#4165af]"></i>
                      ) : (
                        <>
                          <i className="fas fa-camera text-sm mb-1"></i>
                          <span className="text-[10px] font-semibold">+ Add Photo</span>
                        </>
                      )}
                    </label>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProp(null)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#4165af] hover:bg-[#345290] disabled:opacity-50 text-white font-semibold rounded-xl transition"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto text-xl">
              <i className="fas fa-trash-alt"></i>
            </div>
            <h3 className="text-base font-bold text-gray-900">Delete Property Listing?</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Are you sure? This will remove the listing from the marketplace and permanently purge all associated photos.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl transition"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deal Closed & Data Removal Alert Modal (Ramu / Broker Confirmation) */}
      {dealClosedProp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-emerald-500/40 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-xs">
              <i className="fas fa-handshake"></i>
            </div>

            <div>
              <h3 className="text-lg font-black text-gray-900">
                {dealClosedProp.intent === "sale"
                  ? "Property Purchased & Deal Closed?"
                  : "House Occupied & Deal Closed?"}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Listing: <strong className="text-gray-800">{dealClosedProp.title}</strong>
              </p>
            </div>

            {/* Critical Alert Notice Box */}
            <div className="bg-amber-50 border border-amber-200/90 rounded-xl p-4 text-left text-xs space-y-2">
              <div className="flex items-center gap-2 font-black text-amber-900">
                <i className="fas fa-triangle-exclamation text-amber-600 text-sm"></i>
                <span>IMPORTANT NOTICE ON CLOSED DEALS:</span>
              </div>
              <p className="leading-relaxed text-[11px] text-amber-900 font-medium">
                If the deal is closed, <strong>this old data has served its purpose and has NO USE on the platform</strong>.
              </p>
              <ul className="list-disc list-inside text-[11px] space-y-1 text-amber-800 font-medium">
                <li>Stops buyers and tenants from continuously calling your mobile number.</li>
                <li>Keeps the Bangalore marketplace 100% active with genuine, available homes.</li>
                <li>All old photos will be permanently purged and wiped from servers.</li>
              </ul>
            </div>

            <p className="text-xs font-semibold text-gray-700">
              Do you confirm the deal is closed and want to permanently remove this old data?
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDealClosedProp(null)}
                disabled={isClosingDeal}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
              >
                No, Keep Active
              </button>
              <button
                type="button"
                onClick={handleConfirmDealClosed}
                disabled={isClosingDeal}
                className="w-full sm:w-auto px-5 py-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <i className="fas fa-check"></i>
                <span>{isClosingDeal ? "Closing Deal..." : "YES, Deal Closed — Remove Old Data"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
