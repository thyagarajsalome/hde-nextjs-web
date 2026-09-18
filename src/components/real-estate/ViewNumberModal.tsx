// src/components/real-estate/ViewNumberModal.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RealEstateProperty, BuyerTimeline } from "@/types/realEstate";

interface ViewNumberModalProps {
  property: RealEstateProperty;
  isOpen: boolean;
  onClose: () => void;
}

export default function ViewNumberModal({
  property,
  isOpen,
  onClose,
}: ViewNumberModalProps) {
  const [isDealer, setIsDealer] = useState<boolean>(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [timeline, setTimeline] = useState<BuyerTimeline>("within_3_months");
  const [homeLoan, setHomeLoan] = useState(false);
  const [siteVisit, setSiteVisit] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [errors, setErrors] = useState<{ name?: string; phone?: string; terms?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revealedData, setRevealedData] = useState<{
    sellerName: string;
    sellerPhone: string;
    whatsappUrl: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; phone?: string; terms?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Please enter your name";
    }

    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (
      !cleanPhone ||
      cleanPhone.length !== 10 ||
      !/^[6-9]\d{9}$/.test(cleanPhone) ||
      /^(\d)\1{9}$/.test(cleanPhone) ||
      cleanPhone === "1234567890"
    ) {
      newErrors.phone = "Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)";
    }

    if (!agreeTerms) {
      newErrors.terms = "You must agree to the Terms and Privacy Policy";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/real-estate/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: property.id,
          is_dealer: isDealer,
          buyer_name: name,
          buyer_phone: cleanPhone,
          purchase_timeline: timeline,
          interested_in_home_loan: homeLoan,
          interested_in_site_visits: siteVisit,
          agreed_to_terms: agreeTerms,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRevealedData({
          sellerName: data.sellerName || property.contact_name,
          sellerPhone: data.sellerPhone || property.contact_phone,
          whatsappUrl: data.whatsappUrl,
        });
      } else {
        alert(data.error || "Failed to submit details. Please try again.");
      }
    } catch (err) {
      console.error("Lead submission error:", err);
      // Fallback reveal in case of offline dev mode
      const sellerDigits = property.contact_phone.replace(/[^0-9]/g, "");
      setRevealedData({
        sellerName: property.contact_name,
        sellerPhone: property.contact_phone,
        whatsappUrl: `https://wa.me/91${sellerDigits}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold tracking-tight text-gray-900">
            Please share your details to view number
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors text-2xl font-light w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Revealed State */}
        {revealedData ? (
          <div className="p-8 text-center space-y-6 bg-white">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl shadow-sm">
              <i className="fas fa-check"></i>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Contact Unlocked
              </span>
              <h3 className="text-2xl font-black text-secondary mt-1">
                {revealedData.sellerName}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {property.poster_type === "owner" ? "Individual Owner" : "RERA Registered Agent"} &bull; {property.locality_name}
              </p>
            </div>

            <div className="bg-slate-50 border border-gray-200/80 rounded-2xl p-6 max-w-md mx-auto shadow-xs">
              <span className="text-xs font-semibold text-gray-500 block mb-1">Direct Phone Number</span>
              <a
                href={`tel:${revealedData.sellerPhone}`}
                className="text-2xl font-extrabold text-primary hover:underline block tracking-wider"
              >
                {revealedData.sellerPhone}
              </a>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={`tel:${revealedData.sellerPhone}`}
                className="w-full sm:w-auto px-6 py-3 bg-[#4165af] hover:bg-[#355393] text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-all shadow-md no-underline"
              >
                <i className="fas fa-phone-alt"></i>
                <span>Call Now</span>
              </a>
              {revealedData.whatsappUrl && (
                <a
                  href={revealedData.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition-all shadow-md no-underline"
                >
                  <i className="fab fa-whatsapp text-lg"></i>
                  <span>Chat on WhatsApp</span>
                </a>
              )}
            </div>

            <p className="text-xs text-gray-400">
              The owner has been notified of your interest. You can reach out directly.
            </p>
          </div>
        ) : (
          /* Form State (Matching Screenshot 2026-09-18 103844.png) */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* LEFT COLUMN: BASIC INFORMATION */}
              <div className="space-y-6">
                <span className="text-xs font-black uppercase tracking-wider text-gray-400 block border-b border-gray-100 pb-2">
                  Basic Information
                </span>

                {/* Are you a property dealer */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-2">
                    Are you a property dealer
                  </label>
                  <div className="flex items-center gap-6 text-sm">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-gray-700">
                      <input
                        type="radio"
                        name="dealer"
                        checked={isDealer === true}
                        onChange={() => setIsDealer(true)}
                        className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer text-gray-700">
                      <input
                        type="radio"
                        name="dealer"
                        checked={isDealer === false}
                        onChange={() => setIsDealer(false)}
                        className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50/60 ${
                      errors.name ? "border-red-500 ring-1 ring-red-200" : "border-gray-200"
                    } text-sm focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all`}
                  />
                  {errors.name && (
                    <span className="text-[11px] text-red-500 font-medium mt-1 block">
                      {errors.name}
                    </span>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 select-none">
                      <span>+91</span>
                      <span className="text-[10px] text-gray-400">IND</span>
                      <i className="fas fa-chevron-down text-[9px] text-gray-400 ml-0.5"></i>
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50/60 ${
                        errors.phone ? "border-red-500 ring-1 ring-red-200" : "border-gray-200"
                      } text-sm focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all`}
                    />
                  </div>
                  {errors.phone && (
                    <span className="text-[11px] text-red-500 font-semibold mt-1 block">
                      {errors.phone}
                    </span>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: OPTIONAL INFORMATION */}
              <div className="space-y-6">
                <span className="text-xs font-black uppercase tracking-wider text-gray-400 block border-b border-gray-100 pb-2">
                  Optional Information
                </span>

                {/* Timeline */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-2">
                    {property.intent === "rent"
                      ? "By when are you planning to move into this rental house?"
                      : "By when you are planning to buy the property?"}
                  </label>
                  <div className="flex flex-wrap gap-4 text-xs">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer text-gray-700">
                      <input
                        type="radio"
                        name="timeline"
                        value="within_3_months"
                        checked={timeline === "within_3_months"}
                        onChange={() => setTimeline("within_3_months")}
                        className="w-3.5 h-3.5 text-primary focus:ring-primary"
                      />
                      <span>{property.intent === "rent" ? "Immediately / 15 days" : "3 months"}</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer text-gray-700">
                      <input
                        type="radio"
                        name="timeline"
                        value="within_6_months"
                        checked={timeline === "within_6_months"}
                        onChange={() => setTimeline("within_6_months")}
                        className="w-3.5 h-3.5 text-primary focus:ring-primary"
                      />
                      <span>{property.intent === "rent" ? "Within 1 month" : "6 months"}</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer text-gray-700">
                      <input
                        type="radio"
                        name="timeline"
                        value="more_than_6_months"
                        checked={timeline === "more_than_6_months"}
                        onChange={() => setTimeline("more_than_6_months")}
                        className="w-3.5 h-3.5 text-primary focus:ring-primary"
                      />
                      <span>{property.intent === "rent" ? "More than 1 month" : "More than 6 months"}</span>
                    </label>
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3 text-xs pt-1">
                  {property.intent === "rent" ? (
                    <label className="flex items-start gap-2.5 cursor-pointer text-gray-700 bg-blue-50/70 p-2.5 rounded-xl border border-blue-100">
                      <input
                        type="checkbox"
                        checked={true}
                        readOnly
                        className="w-4 h-4 text-primary rounded-sm border-gray-300 focus:ring-primary mt-0.5"
                      />
                      <div>
                        <span className="font-bold text-primary block">
                          Looking for Rental House ({property.bhk || "Residential"})
                        </span>
                        <span className="text-[11px] text-gray-500 block">
                          Inquiring to rent {property.category === "flat" ? "an Apartment" : "a House"} in {property.locality_name}
                        </span>
                      </div>
                    </label>
                  ) : (
                    <label className="flex items-start gap-2 cursor-pointer text-gray-700">
                      <input
                        type="checkbox"
                        checked={homeLoan}
                        onChange={(e) => setHomeLoan(e.target.checked)}
                        className="w-4 h-4 text-primary rounded-sm border-gray-300 focus:ring-primary mt-0.5"
                      />
                      <span>I am interested in home loan</span>
                    </label>
                  )}

                  <label className="flex items-start gap-2 cursor-pointer text-gray-700">
                    <input
                      type="checkbox"
                      checked={siteVisit}
                      onChange={(e) => setSiteVisit(e.target.checked)}
                      className="w-4 h-4 text-primary rounded-sm border-gray-300 focus:ring-primary mt-0.5"
                    />
                    <span>
                      {property.intent === "rent"
                        ? "I am interested in house visit / inspection."
                        : "I am interested in site visits."}
                    </span>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer text-gray-600">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 text-primary rounded-sm border-gray-300 focus:ring-primary mt-0.5"
                    />
                    <span>
                      I agree to the{" "}
                      <Link href="/bangalore/terms" className="text-primary hover:underline font-semibold" target="_blank">
                        Terms &amp; Conditions
                      </Link>{" "}
                      and{" "}
                      <Link href="/bangalore/privacy" className="text-primary hover:underline font-semibold" target="_blank">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                  {errors.terms && (
                    <span className="text-[11px] text-red-500 block">{errors.terms}</span>
                  )}
                </div>

                {/* Submit CTA Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-6 bg-[#4165af] hover:bg-[#355393] text-white font-medium text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-circle-notch fa-spin text-sm"></i>
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>View Number</span>
                    )}
                  </button>
                </div>

              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
