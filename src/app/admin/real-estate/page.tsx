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
  const { user, loading: authLoading } = useUser();
  const [properties, setProperties] = useState<RealEstateProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dealClosedAdminProp, setDealClosedAdminProp] = useState<RealEstateProperty | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const isAdmin = Boolean(user && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());

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
      <div className="min-h-screen bg-slate-900 text-white py-24 text-center">
        <i className="fas fa-circle-notch fa-spin text-4xl text-amber-500 mb-3"></i>
        <p className="text-sm font-semibold text-slate-400">Loading master real estate registry...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 text-white py-24 px-4 text-center">
        <div className="max-w-md mx-auto bg-slate-800 p-8 rounded-2xl border border-rose-500/50 shadow-xl">
          <i className="fas fa-lock text-4xl text-rose-500 mb-3"></i>
          <h2 className="text-xl font-bold text-white mb-2">Restricted Super-Admin Zone</h2>
          <p className="text-xs text-slate-400 mb-6">
            Access to this moderation control room is restricted strictly to <code>{ADMIN_EMAIL}</code>.
          </p>
          <Link
            href="/"
            className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs rounded-xl no-underline transition"
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
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Admin Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-black px-2.5 py-1 rounded-md flex items-center gap-1.5">
                <i className="fas fa-shield-halved"></i>
                SUPER-ADMIN
              </span>
              <h1 className="text-2xl font-black text-white">Real Estate Moderation Center</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Master control for Bangalore listings. Audit seller identities, take down bad content, and purge R2 photos.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAllProps}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <i className="fas fa-sync-alt text-[10px]"></i>
              Refresh Data
            </button>
            <Link
              href="/bangalore/properties"
              className="px-3.5 py-2 bg-[#4165af] hover:bg-[#345290] text-white rounded-xl text-xs font-semibold no-underline transition"
            >
              Public Marketplace
            </Link>
          </div>
        </div>

        {/* Quick Admin Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xs">
            <div className="text-[11px] text-slate-400 font-medium">Total Listings</div>
            <div className="text-2xl font-black text-white mt-1">{properties.length}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xs">
            <div className="text-[11px] text-slate-400 font-medium">Active Public</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {properties.filter((p) => p.status === "active").length}
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xs">
            <div className="text-[11px] text-slate-400 font-medium">Moderated / Hidden</div>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {properties.filter((p) => p.status === "rejected").length}
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xs">
            <div className="text-[11px] text-slate-400 font-medium">Total Views Tracked</div>
            <div className="text-2xl font-black text-blue-400 mt-1">
              {properties.reduce((sum, p) => sum + (p.views_count || 0), 0)}
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Title, Seller Name, Mobile Number, Locality, or RERA ID..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            <i className="fas fa-folder-open text-4xl mb-2 text-slate-600"></i>
            <p className="text-sm font-semibold">No properties match your current search.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProperties.map((prop) => (
              <div
                key={prop.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="relative w-24 h-16 rounded-lg bg-slate-800 shrink-0 overflow-hidden">
                    {prop.images && prop.images[0] ? (
                      <Image
                        src={prop.images[0]}
                        alt={prop.title}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
                        No Photo
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        prop.status === "active" ? "bg-emerald-950 text-emerald-300 border border-emerald-800" :
                        prop.status === "rejected" ? "bg-rose-950 text-rose-300 border border-rose-800" :
                        "bg-slate-800 text-slate-400"
                      }`}>
                        {prop.status.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase">
                        For {prop.intent} • {prop.category} • {prop.bhk}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        ID: {prop.id.slice(0, 8)}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white truncate">{prop.title}</h3>

                    <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                      <span><i className="fas fa-map-marker-alt text-[#4165af] mr-1"></i>{prop.locality_name}</span>
                      <span>•</span>
                      <span className="text-white font-semibold">₹{Number(prop.price).toLocaleString("en-IN")}</span>
                      <span>•</span>
                      <span>Seller: <strong className="text-slate-200">{prop.contact_name}</strong> ({prop.contact_phone})</span>
                      {prop.rera_id && (
                        <span className="text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900 text-[10px]">
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
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold no-underline transition flex items-center gap-1"
                  >
                    <i className="fas fa-external-link-alt text-[10px]"></i>
                    <span>Preview</span>
                  </Link>

                  {prop.status === "active" ? (
                    <button
                      onClick={() => handleStatusChange(prop.id, "rejected")}
                      disabled={isProcessing}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                      title="Instantly unpublish and hide listing from public"
                    >
                      <i className="fas fa-ban text-[10px]"></i>
                      <span>Take Down</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(prop.id, "active")}
                      disabled={isProcessing}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                    >
                      <i className="fas fa-check text-[10px]"></i>
                      <span>Approve</span>
                    </button>
                  )}

                  <button
                    onClick={() => setDealClosedAdminProp(prop)}
                    disabled={isProcessing}
                    className="px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                    title="Mark deal closed and purge old data"
                  >
                    <i className="fas fa-handshake text-[10px]"></i>
                    <span>Deal Closed</span>
                  </button>

                  <button
                    onClick={() => setDeletingId(prop.id)}
                    disabled={isProcessing}
                    className="px-3 py-1.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/60 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                    title="Purge permanently from DB & wipe images from Cloudflare R2"
                  >
                    <i className="fas fa-trash-alt text-[10px]"></i>
                    <span>Purge & Wipe R2</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-rose-500/50 text-center space-y-4">
            <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto text-xl">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3 className="text-base font-bold text-white">Super-Admin Listing Purge</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              This action will permanently delete this listing from Supabase and delete every uploaded image file from the Cloudflare R2 bucket. This cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePurgeListing}
                disabled={isProcessing}
                className="px-4 py-2 text-xs bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl transition"
              >
                {isProcessing ? "Purging..." : "Confirm Purge"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Deal Closed Alert Modal */}
      {dealClosedAdminProp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-emerald-500/50 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto text-2xl">
              <i className="fas fa-handshake"></i>
            </div>

            <div>
              <h3 className="text-lg font-black text-white">
                {dealClosedAdminProp.intent === "sale"
                  ? "Deal Closed: Property Purchased / Sold"
                  : "Deal Closed: House Occupied for Rent"}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Listing: <strong className="text-slate-200">{dealClosedAdminProp.title}</strong>
              </p>
            </div>

            <div className="bg-amber-950/60 border border-amber-500/40 rounded-xl p-3.5 text-left text-xs text-amber-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <i className="fas fa-triangle-exclamation"></i>
                <span>ALERT: EXPIRED TRANSACTION DATA</span>
              </div>
              <p className="leading-relaxed text-[11px] text-amber-200/90">
                Since this transaction is closed, keeping this record has no use and will be completely removed from the marketplace and all Cloudflare R2 photos purged.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDealClosedAdminProp(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAdminDealClosed}
                disabled={isProcessing}
                className="px-5 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl transition"
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
