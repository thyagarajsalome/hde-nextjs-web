// src/components/real-estate/PropertyOwnerActions.tsx
"use client";

import React, { useState, useEffect } from "react";
import { RealEstateProperty } from "@/types/realEstate";
import { RealEstateService } from "@/services/realEstateService";
import { useUser } from "@/context/UserContext";

interface PropertyOwnerActionsProps {
  property: RealEstateProperty;
  layout?: "card" | "detail";
  onDeleted?: (propertyId: string) => void;
  onUpdated?: (updated: RealEstateProperty) => void;
}

export default function PropertyOwnerActions({
  property,
  layout = "card",
  onDeleted,
  onUpdated,
}: PropertyOwnerActionsProps) {
  const { user } = useUser();
  const isAdmin = Boolean(user && user.email?.toLowerCase() === "thyagaraja1983@gmail.com");

  const [isOwner, setIsOwner] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [dealModalOpen, setDealModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Form states for Edit
  const [editPrice, setEditPrice] = useState<number | "">(property.price);
  const [editPhone, setEditPhone] = useState(property.contact_phone || "");
  const [editTitle, setEditTitle] = useState(property.title || "");
  const [editDesc, setEditDesc] = useState(property.description || "");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    // Security Guard: Strictly require user to be signed in
    if (!user) {
      setIsOwner(false);
      return;
    }

    // Strictly check if logged-in user is the property owner or platform admin
    const isPropertyOwner = Boolean(property.user_id && user.id === property.user_id);
    if (isPropertyOwner || isAdmin) {
      setIsOwner(true);
    } else {
      setIsOwner(false);
    }
  }, [user, isAdmin, property.id, property.user_id]);

  if (!mounted || !isOwner) {
    return null;
  }

  // Remove local storage reference if deleted
  const removeFromLocalStorage = (id: string) => {
    if (typeof window !== "undefined") {
      try {
        const localIds: string[] = JSON.parse(
          localStorage.getItem("hde_my_property_ids") || "[]"
        );
        const updated = localIds.filter((item) => item !== id);
        localStorage.setItem("hde_my_property_ids", JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
    }
  };

  // 1. Confirm Deal Closed & Remove from Database
  const handleDealClosed = async () => {
    setIsSubmitting(true);
    try {
      await RealEstateService.deleteProperty(property.id, property.images || []);
      removeFromLocalStorage(property.id);
      setDealModalOpen(false);
      setToastMessage("Deal Closed Successfully! Listing removed from database.");
      setTimeout(() => {
        onDeleted?.(property.id);
      }, 1000);
    } catch (err: any) {
      alert("Failed to close deal: " + (err.message || "Unknown error"));
      setIsSubmitting(false);
    }
  };

  // 2. Confirm Permanent Deletion from Database
  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await RealEstateService.deleteProperty(property.id, property.images || []);
      removeFromLocalStorage(property.id);
      setDeleteModalOpen(false);
      setToastMessage("Listing permanently deleted from database.");
      setTimeout(() => {
        onDeleted?.(property.id);
      }, 1000);
    } catch (err: any) {
      alert("Failed to delete listing: " + (err.message || "Unknown error"));
      setIsSubmitting(false);
    }
  };

  // 3. Save Edits to Database
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPrice || Number(editPrice) <= 0) {
      alert("Please enter a valid price/rent amount.");
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await RealEstateService.updateProperty(property.id, {
        price: Number(editPrice),
        contact_phone: editPhone,
        title: editTitle,
        description: editDesc,
      });

      setEditModalOpen(false);
      setToastMessage("Property details updated successfully!");
      setTimeout(() => setToastMessage(null), 3000);

      onUpdated?.({
        ...property,
        price: Number(editPrice),
        contact_phone: editPhone,
        title: editTitle,
        description: editDesc,
        ...updated,
      });
    } catch (err: any) {
      alert("Failed to save changes: " + (err.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <i className="fas fa-circle-check text-emerald-400 text-base"></i>
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Render Owner Bar based on layout */}
      {layout === "card" ? (
        <div className="bg-amber-50/90 border-t border-b border-amber-200/80 px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-amber-900">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Your Listing</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setEditModalOpen(true)}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-lg border border-slate-300 shadow-2xs flex items-center gap-1 cursor-pointer transition-colors"
              title="Edit Rent/Price & Details"
            >
              <i className="fas fa-edit text-blue-600 text-[10px]"></i>
              <span>Edit</span>
            </button>

            <button
              onClick={() => setDealModalOpen(true)}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer transition-colors"
              title="Mark Deal Completed & Remove Listing"
            >
              <i className="fas fa-handshake text-[10px]"></i>
              <span>Deal Done?</span>
            </button>

            <button
              onClick={() => setDeleteModalOpen(true)}
              className="px-2 py-1 bg-white hover:bg-rose-50 text-rose-600 font-bold rounded-lg border border-rose-200 shadow-2xs flex items-center gap-1 cursor-pointer transition-colors"
              title="Delete Listing from Database"
            >
              <i className="fas fa-trash-can text-[10px]"></i>
            </button>
          </div>
        </div>
      ) : (
        /* Detail Page Top Banner */
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-transparent border border-amber-300/80 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
              <i className="fas fa-user-shield text-base"></i>
            </div>
            <div>
              <span className="text-xs font-black text-amber-900 uppercase tracking-wider block">
                Owner Controls &bull; {property.intent === "rent" ? "Rental Home" : "Property for Sale"}
              </span>
              <p className="text-xs text-gray-600 mt-0.5">
                You have owner access to update price, edit details, or remove this listing once the deal is successful.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setEditModalOpen(true)}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fas fa-pen-to-square text-blue-600"></i>
              <span>Edit Details</span>
            </button>

            <button
              onClick={() => setDealModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fas fa-circle-check"></i>
              <span>Deal Successful (Remove)</span>
            </button>

            <button
              onClick={() => setDeleteModalOpen(true)}
              className="px-3.5 py-2 bg-white hover:bg-rose-50 text-rose-600 font-bold text-xs rounded-xl border border-rose-200 shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fas fa-trash-can"></i>
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL 1: DEAL SUCCESSFUL / CLOSED ── */}
      {dealModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 text-center animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mx-auto mb-4 border border-emerald-100 shadow-inner">
              🤝
            </div>

            <h3 className="text-lg font-black text-gray-900 mb-2">
              Mark Deal as Successful?
            </h3>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
              Congratulations! Has this {property.intent === "rent" ? "house been rented out" : "property been sold"}?
              <br /><br />
              Clicking <strong>&quot;Yes, Deal Completed&quot;</strong> will <strong>permanently remove this listing and all photos from the database</strong> so you stop receiving phone calls and the marketplace remains fresh.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDealModalOpen(false)}
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                No, Keep Active
              </button>

              <button
                type="button"
                onClick={handleDealClosed}
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <i className="fas fa-circle-notch fa-spin"></i>
                ) : (
                  <i className="fas fa-check"></i>
                )}
                <span>Yes, Deal Completed</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: DELETE CONFIRMATION ── */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 text-center animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl mx-auto mb-4 border border-rose-100 shadow-inner">
              <i className="fas fa-trash-can"></i>
            </div>

            <h3 className="text-lg font-black text-gray-900 mb-2">
              Remove Listing from Database?
            </h3>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
              Are you sure you want to permanently delete <strong>&quot;{property.title}&quot;</strong>? This will remove all property specifications and photos from our database immediately.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <i className="fas fa-circle-notch fa-spin"></i>
                ) : (
                  <i className="fas fa-trash-can"></i>
                )}
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: QUICK EDIT ── */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 my-8 text-left animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <div>
                <h3 className="text-base font-black text-gray-900">Edit Property Details</h3>
                <p className="text-xs text-gray-500">Update rent/price, contact info, or description</p>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {property.intent === "rent" ? "Monthly Rent (₹ / month)" : "Total Price (₹)"}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value ? Number(e.target.value) : "")}
                    placeholder={property.intent === "rent" ? "e.g. 20000" : "e.g. 8500000"}
                    required
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl font-bold text-sm focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Contact Phone Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Listing Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. 2bhk house in Yelahanka"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Describe your property, parking, water supply, power backup, etc."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  disabled={isSubmitting}
                  className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2.5 px-5 bg-[#4165af] hover:bg-[#355393] text-white font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <i className="fas fa-circle-notch fa-spin"></i>
                  ) : (
                    <i className="fas fa-save"></i>
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
