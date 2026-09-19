// src/components/real-estate/AdminModerationBar.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { RealEstateProperty } from "@/types/realEstate";
import { RealEstateService } from "@/services/realEstateService";
import { useUser } from "@/context/UserContext";

const ADMIN_EMAIL = "thyagaraja1983@gmail.com";

interface AdminModerationBarProps {
  property: RealEstateProperty;
  onStatusChange?: (newStatus: RealEstateProperty["status"]) => void;
}

export default function AdminModerationBar({
  property,
  onStatusChange,
}: AdminModerationBarProps) {
  const { user } = useUser();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(property.status);
  const [isReraVerified, setIsReraVerified] = useState(Boolean(property.is_rera_verified));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isAdmin = user && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  // Only render for admin thyagaraja1983@gmail.com
  if (!isAdmin) return null;

  const handleStatusUpdate = async (status: RealEstateProperty["status"]) => {
    try {
      setIsProcessing(true);
      setMessage(null);
      await RealEstateService.updateProperty(property.id, { status });
      setCurrentStatus(status);
      if (onStatusChange) onStatusChange(status);
      setMessage(`Status updated to: ${status.toUpperCase()}`);
    } catch (err: any) {
      alert("Failed to update status: " + (err.message || "Unknown error"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleRera = async () => {
    try {
      setIsProcessing(true);
      setMessage(null);
      const nextVal = !isReraVerified;
      await RealEstateService.updateProperty(property.id, { is_rera_verified: nextVal });
      setIsReraVerified(nextVal);
      setMessage(nextVal ? "RERA badge VERIFIED!" : "RERA badge revoked.");
    } catch (err: any) {
      alert("Failed to update RERA verification: " + (err.message || "Unknown error"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteListing = async () => {
    try {
      setIsProcessing(true);
      await RealEstateService.deleteProperty(property.id, property.images);
      alert("Listing and all Cloudflare R2 photos purged successfully.");
      router.push("/bangalore/properties");
    } catch (err: any) {
      alert("Failed to delete listing: " + (err.message || "Unknown error"));
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full bg-slate-900 text-white px-4 py-3 border-b-2 border-amber-500 shadow-lg text-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Left: Shield & Status Info */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5 font-bold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded border border-amber-500/40 text-xs">
            <i className="fas fa-shield-halved"></i>
            ADMIN SUPERPOWER
          </span>
          <span className="text-slate-300 text-xs">
            Listing ID: <code className="text-slate-100 bg-slate-800 px-1 py-0.5 rounded">{property.id.slice(0, 8)}...</code>
          </span>
          <span className="text-xs text-slate-300">
            Poster: <strong className="text-white">{property.contact_name}</strong> ({property.contact_phone})
          </span>
          <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
            currentStatus === 'active' ? 'bg-emerald-800/80 text-emerald-200' :
            currentStatus === 'rejected' ? 'bg-rose-800/80 text-rose-200' :
            'bg-slate-700 text-slate-300'
          }`}>
            Current: {currentStatus.toUpperCase()}
          </span>
          {message && <span className="text-xs text-emerald-400 font-medium">{message}</span>}
        </div>

        {/* Right: Moderation Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {currentStatus === "active" ? (
            <button
              onClick={() => handleStatusUpdate("rejected")}
              disabled={isProcessing}
              className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-medium px-3 py-1 rounded text-xs transition flex items-center gap-1.5"
              title="Immediately hide listing from public search"
            >
              <i className="fas fa-ban"></i>
              Take Down / Hide
            </button>
          ) : (
            <button
              onClick={() => handleStatusUpdate("active")}
              disabled={isProcessing}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium px-3 py-1 rounded text-xs transition flex items-center gap-1.5"
            >
              <i className="fas fa-check"></i>
              Approve / Make Active
            </button>
          )}

          {/* K-RERA Verification Actions for Admin */}
          {property.rera_id && (
            <div className="flex items-center gap-1.5 border-l border-slate-700 pl-2">
              <a
                href="https://rera.karnataka.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-medium px-2.5 py-1 rounded text-xs transition flex items-center gap-1 border border-amber-500/30"
                title={`Search ${property.rera_id} on official Karnataka RERA portal`}
              >
                <i className="fas fa-external-link-alt text-[10px]"></i>
                <span>Gov Portal ({property.rera_id.slice(0, 12)}...)</span>
              </a>

              <button
                onClick={handleToggleRera}
                disabled={isProcessing}
                className={`font-medium px-2.5 py-1 rounded text-xs transition flex items-center gap-1.5 ${
                  isReraVerified
                    ? "bg-emerald-700 hover:bg-emerald-800 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
                title={isReraVerified ? "Click to revoke verified badge" : "Click to award green verified checkmark"}
              >
                <i className={`fas ${isReraVerified ? "fa-check-double text-emerald-200" : "fa-certificate"}`}></i>
                <span>{isReraVerified ? "RERA Verified" : "Verify RERA"}</span>
              </button>
            </div>
          )}

          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              disabled={isProcessing}
              className="bg-rose-700 hover:bg-rose-800 disabled:opacity-50 text-white font-medium px-3 py-1 rounded text-xs transition flex items-center gap-1.5"
              title="Delete from Supabase DB and permanently wipe images from Cloudflare R2"
            >
              <i className="fas fa-trash"></i>
              Purge Listing & R2 Photos
            </button>
          ) : (
            <div className="flex items-center gap-1 bg-rose-950 p-1 rounded border border-rose-600">
              <span className="text-xs text-rose-200 px-1">Confirm purge?</span>
              <button
                onClick={handleDeleteListing}
                disabled={isProcessing}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-2 py-0.5 rounded text-xs"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-2 py-0.5 rounded text-xs"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
