// src/components/real-estate/ReportListingModal.tsx
"use client";

import React, { useState } from "react";
import { RealEstateProperty } from "@/types/realEstate";

interface ReportListingModalProps {
  property: RealEstateProperty;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_REASONS = [
  "Inappropriate, offensive, or adult photos",
  "Scam, fraudulent broker, or fake listing",
  "Property is already sold or rented out",
  "Incorrect price or misleading details",
  "Unauthorized use / copyright of my photos",
  "Duplicate listing",
];

export default function ReportListingModal({
  property,
  isOpen,
  onClose,
}: ReportListingModalProps) {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [contact, setContact] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await fetch("/api/real-estate/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          propertyTitle: property.title,
          reason: selectedReason,
          details,
          reporterContact: contact,
        }),
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit report:", err);
      alert("Could not submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        {submitted ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl">
              <i className="fas fa-check"></i>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Report Submitted</h3>
            <p className="text-sm text-slate-600">
              Thank you for keeping HDE safe. Our moderation team has been notified and will audit this listing promptly.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="mt-4 bg-[#4165af] hover:bg-[#345290] text-white font-semibold px-5 py-2 rounded-xl text-sm transition"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
                <i className="fas fa-flag"></i>
                <span>Report This Listing</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 text-lg p-1"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Help us maintain honest and legal listings for Bangalore buyers and tenants.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for reporting:
              </label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4165af]"
              >
                {REPORT_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Additional Details (Optional):
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Explain what is incorrect or inappropriate..."
                className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4165af]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Email or Mobile (Optional):
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="For moderation team follow-up"
                className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4165af]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-xl text-xs transition"
              >
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
