// src/app/admin/real-estate/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { RealEstateProperty } from "@/types/realEstate";
import { RealEstateService } from "@/services/realEstateService";
import { useUser } from "@/context/UserContext";

const ADMIN_EMAIL = "thyagaraja1983@gmail.com";

export default function AdminRealEstatePage() {
  const { user, loading: authLoading, isDeveloper } = useUser();
  const [properties, setProperties] = useState<RealEstateProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dealClosedAdminProp, setDealClosedAdminProp] = useState<RealEstateProperty | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const isAdmin = Boolean(
    (user && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) ||
    isDeveloper
  );

  const fetchAllProps = async () => {
    setLoading(true);
    try {
      const data = await RealEstateService.getAllPropertiesForAdmin();
      setProperties(data);
    } catch (err) {
      console.error("Error fetching admin properties:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchAllProps();
    } else if (!authLoading && !isAdmin) {
      setLoading(false);
    }
  }, [user, authLoading, isAdmin]);

  const handleStatusChange = async (propId: string, newStatus: RealEstateProperty["status"]) => {
    try {
      setIsProcessing(true);
      await RealEstateService.updateProperty(propId, { status: newStatus });
      setProperties((prev) =>
        prev.map((p) => (p.id === propId ? { ...p, status: newStatus } : p))
      );
    } catch (err: any) {
      alert("Failed to update status: " + (err.message || "Unknown error"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePurgeListing = async () => {
    if (!deletingId) return;
    const target = properties.find((p) => p.id === deletingId);

    try {
      setIsProcessing(true);
      await RealEstateService.deleteProperty(deletingId, target?.images || []);
      setProperties((prev) => prev.filter((p) => p.id !== deletingId));
      setDeletingId(null);
      alert("Property and Cloudflare R2 photos purged permanently.");
    } catch (err: any) {
      alert("Failed to purge property: " + (err.message || "Unknown error"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmAdminDealClosed = async () => {
    if (!dealClosedAdminProp) return;

    try {
      setIsProcessing(true);
      await RealEstateService.deleteProperty(
        dealClosedAdminProp.id,
        dealClosedAdminProp.images || []
      );
      setProperties((prev) => prev.filter((p) => p.id !== dealClosedAdminProp.id));
      alert(`Deal Closed! All old data and photos for "${dealClosedAdminProp.title}" were purged.`);
      setDealClosedAdminProp(null);
    } catch (err: any) {
      alert("Failed to close deal: " + (err.message || "Unknown error"));
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || (loading && isAdmin)) {
    return (
      <div className="py-24 text-center">
        <i className="fas fa-circle-notch fa-spin text-3xl text-[#0f2042] mb-3"></i>
        <p className="text-sm font-bold text-slate-700">Loading master real estate registry...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="py-24 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center text-2xl mx-auto border border-rose-200">
            <i className="fas fa-lock"></i>
          </div>
          <h2 className="text-xl font-black text-[#0f2042]">Restricted Super-Admin Zone</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Access to this moderation control room is restricted strictly to <strong>{ADMIN_EMAIL}</strong>.
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 bg-[#0f2042] hover:bg-[#1a3360] text-white font-bold text-xs rounded-xl no-underline transition"
          >
            Return to HDE Home
          </Link>
        </div>
      </div>
    );
  }

  const filteredProperties = properties.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchTitle = p.title?.toLowerCase().includes(q);
      const matchLocality = p.locality_name?.toLowerCase().includes(q);
      const matchPoster = p.contact_name?.toLowerCase().includes(q);
      const matchPhone = p.contact_phone?.toLowerCase().includes(q);
      const matchRera = p.rera_id?.toLowerCase().includes(q);
      return matchTitle || matchLocality || matchPoster || matchPhone || matchRera;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Admin Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#0f2042] text-[#c5a059] flex items-center justify-center text-sm shadow-xs font-black">
              <i className="fas fa-building-user"></i>
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0f2042] tracking-tight">
              Real Estate Moderation Center
            </h1>
            <span className="bg-[#c5a059]/15 text-[#0f2042] border border-[#c5a059]/30 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ml-1">
              Superadmin
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Master control room for verified Bangalore listings. Audit seller identities, take down bad content, and purge R2 photos.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAllProps}
            className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
          >
            <i className="fas fa-sync-alt text-[10px] text-[#0f2042]"></i>
            <span>Refresh</span>
          </button>
          <Link
            href="/bangalore/properties"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-[#0f2042] hover:bg-[#1a3360] text-white rounded-xl text-xs font-bold no-underline transition shadow-2xs flex items-center gap-1.5"
          >
            <span>Public Marketplace</span>
            <i className="fas fa-arrow-up-right-from-square text-[10px] text-[#c5a059]"></i>
          </Link>
        </div>
      </div>

      {/* Quick Admin Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
          <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Total Listings</div>
          <div className="text-2xl font-black text-[#0f2042] mt-1">{properties.length}</div>
        </div>
        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
          <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Active Public</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {properties.filter((p) => p.status === "active").length}
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
          <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Moderated / Hidden</div>
          <div className="text-2xl font-black text-amber-800 mt-1">
            {properties.filter((p) => p.status === "rejected").length}
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
          <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Total Views Tracked</div>
          <div className="text-2xl font-black text-[#0f2042] mt-1">
            {properties.reduce((sum, p) => sum + (p.views_count || 0), 0)}
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2 relative">
          <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Title, Seller Name, Mobile Number, Locality, or RERA ID..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f2042] shadow-2xs"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0f2042] shadow-2xs"
          >
            <option value="all">All Statuses ({properties.length})</option>
            <option value="active">Active Only ({properties.filter((p) => p.status === "active").length})</option>
            <option value="rejected">Taken Down / Rejected ({properties.filter((p) => p.status === "rejected").length})</option>
            <option value="sold_or_rented">Sold or Rented ({properties.filter((p) => p.status === "sold_or_rented").length})</option>
          </select>
        </div>
      </div>

      {/* Properties Registry Table / Cards */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 space-y-2 shadow-xs">
          <i className="fas fa-folder-open text-3xl mb-1 text-slate-300"></i>
          <p className="text-sm font-bold text-slate-700">No properties match your current search.</p>
          <p className="text-xs text-slate-400">Try adjusting your search keyword or clearing the status filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProperties.map((prop) => (
            <div
              key={prop.id}
              className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-xl p-4 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs"
            >
              {/* Left: Thumbnail & Details */}
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className="relative w-24 h-16 rounded-lg bg-slate-100 shrink-0 overflow-hidden border border-slate-200">
                  {prop.images && prop.images[0] ? (
                    <Image
                      src={prop.images[0]}
                      alt={prop.title}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      No Photo
                    </div>
                  )}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      prop.status === "active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                      prop.status === "rejected" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                      "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}>
                      {prop.status.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">
                      For {prop.intent} • {prop.category} • {prop.bhk}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ID: {prop.id.slice(0, 8)}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#0f2042] truncate">{prop.title}</h3>

                  <div className="flex items-center gap-2.5 text-xs text-slate-600 flex-wrap">
                    <span><i className="fas fa-map-marker-alt text-[#c5a059] mr-1"></i>{prop.locality_name}</span>
                    <span>•</span>
                    <span className="text-[#0f2042] font-black">₹{Number(prop.price).toLocaleString("en-IN")}</span>
                    <span>•</span>
                    <span>Seller: <strong className="text-slate-800">{prop.contact_name}</strong> ({prop.contact_phone})</span>
                    {prop.rera_id && (
                      <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px] font-bold">
                        RERA: {prop.rera_id}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Master Control Actions */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <Link
                  href={`/bangalore/properties/${prop.id}`}
                  target="_blank"
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold no-underline transition flex items-center gap-1 shadow-2xs"
                >
                  <i className="fas fa-arrow-up-right-from-square text-[10px]"></i>
                  <span>Preview</span>
                </Link>

                {prop.status === "active" ? (
                  <button
                    onClick={() => handleStatusChange(prop.id, "rejected")}
                    disabled={isProcessing}
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Instantly unpublish and hide listing from public"
                  >
                    <i className="fas fa-ban text-[10px]"></i>
                    <span>Take Down</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange(prop.id, "active")}
                    disabled={isProcessing}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <i className="fas fa-check text-[10px]"></i>
                    <span>Approve</span>
                  </button>
                )}

                <button
                  onClick={() => setDealClosedAdminProp(prop)}
                  disabled={isProcessing}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                  title="Mark deal closed and purge old data"
                >
                  <i className="fas fa-handshake text-[10px]"></i>
                  <span>Deal Closed</span>
                </button>

                <button
                  onClick={() => setDeletingId(prop.id)}
                  disabled={isProcessing}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Purge permanently from DB & wipe images from Cloudflare R2"
                >
                  <i className="fas fa-trash-alt text-[10px]"></i>
                  <span>Purge &amp; Wipe R2</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-rose-200 text-center space-y-4 animate-scale-in">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto text-xl border border-rose-200">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3 className="text-base font-black text-[#0f2042]">Super-Admin Listing Purge</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              This action will permanently delete this listing from Supabase and delete every uploaded image file from the Cloudflare R2 bucket. This cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePurgeListing}
                disabled={isProcessing}
                className="px-4 py-2 text-xs bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-xs cursor-pointer"
              >
                {isProcessing ? "Purging..." : "Confirm Purge"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Deal Closed Alert Modal */}
      {dealClosedAdminProp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-emerald-200 text-center space-y-4 animate-scale-in">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-2xl border border-emerald-200">
              <i className="fas fa-handshake"></i>
            </div>

            <div>
              <h3 className="text-lg font-black text-[#0f2042]">
                {dealClosedAdminProp.intent === "sale"
                  ? "Deal Closed: Property Purchased / Sold"
                  : "Deal Closed: House Occupied for Rent"}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Listing: <strong className="text-slate-800">{dealClosedAdminProp.title}</strong>
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-left text-xs text-amber-900 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <i className="fas fa-triangle-exclamation"></i>
                <span>ALERT: EXPIRED TRANSACTION DATA</span>
              </div>
              <p className="leading-relaxed text-[11px] text-amber-800/90">
                Since this transaction is closed, keeping this record has no use and will be completely removed from the marketplace and all Cloudflare R2 photos purged.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDealClosedAdminProp(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAdminDealClosed}
                disabled={isProcessing}
                className="px-5 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-xs cursor-pointer"
              >
                {isProcessing ? "Closing & Purging..." : "Confirm Deal Closed & Purge Data"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
