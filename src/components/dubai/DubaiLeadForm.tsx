"use client";

import React, { useState } from "react";
import Link from "next/link";
import { supabase } from "@/config/supabaseClient";
import { DUBAI_AREAS } from "@/data/dubaiAreas";

interface DubaiLeadFormProps {
  source?: string;
  initialArea?: string;
}

const INTEREST_OPTIONS = [
  { value: "Investment", label: "Investment & High ROI (5-9% Yield)" },
  { value: "Golden Visa", label: "Golden Visa Property (AED 2M+ / ~$544K)" },
  { value: "Off-Plan", label: "Off-Plan / New Developer Launches" },
  { value: "Ready to Move", label: "Ready to Move-in Home" },
  { value: "Luxury Waterfront", label: "Luxury Villas & Waterfront Penthouses" },
  { value: "Just Browsing", label: "Just Browsing / Market Research" },
];

const RECOMMENDED_AREAS_BY_INTEREST: Record<string, string[]> = {
  "Investment": ["Business Bay", "Jumeirah Village Circle", "Dubai Marina", "Dubai Creek Harbour"],
  "Golden Visa": ["Downtown Dubai", "Palm Jumeirah", "Dubai Hills Estate", "Mohammed Bin Rashid City"],
  "Off-Plan": ["Dubai Creek Harbour", "Dubai South", "Jumeirah Village Circle", "Business Bay"],
  "Ready to Move": ["Dubai Marina", "Downtown Dubai", "Arabian Ranches", "Jumeirah Lake Towers"],
  "Luxury Waterfront": ["Palm Jumeirah", "Dubai Marina", "Jumeirah Beach Residence", "Dubai Creek Harbour"],
  "Just Browsing": ["Dubai Marina", "Downtown Dubai", "Business Bay", "Jumeirah Village Circle"],
};

export default function DubaiLeadForm({ 
  source = "Dubai Property Landing Page",
  initialArea
}: DubaiLeadFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    interest: "Investment",
    location: initialArea || "All Dubai / Open to Recommendations",
    budget: "",
    reraConsent: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAreaSelect = (areaName: string) => {
    setFormData(prev => ({ ...prev, location: areaName }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reraConsent) {
      setErrorMsg("Please agree to the RERA-certified professional contact consent to proceed.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const combinedInterest = formData.location && formData.location !== "All Dubai / Open to Recommendations"
        ? `${formData.interest} | Area: ${formData.location}`
        : formData.interest;

      const { error } = await supabase
        .from("dubai_leads")
        .insert([{ 
          name: formData.name.trim(), 
          email: formData.email.trim(), 
          phone: formData.phone.trim(),
          interest: combinedInterest,
          budget: formData.budget.trim(),
          source: source
        }]);

      if (error) {
        throw new Error(error.message);
      }

      setIsSuccess(true);
      setFormData({ 
        name: "", 
        email: "", 
        phone: "", 
        interest: "Investment", 
        location: initialArea || "All Dubai / Open to Recommendations",
        budget: "",
        reraConsent: false,
      });
    } catch {
      setErrorMsg("Something went wrong. Please try again or email us directly at hdeadmin@gmail.com.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-8 text-center shadow-xl">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
          <i className="fas fa-check"></i>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-2">Thank You!</h3>
        <p className="text-gray-600 dark:text-zinc-300 text-sm max-w-md mx-auto leading-relaxed">
          Your inquiry has been safely received. A verified, RERA-certified Dubai property specialist will reach out to you directly via WhatsApp or Email with tailored options.
        </p>
        <button 
          onClick={() => setIsSuccess(false)}
          className="mt-6 inline-flex items-center gap-2 text-primary dark:text-amber-400 font-semibold text-sm hover:underline"
        >
          <i className="fas fa-redo text-xs"></i>
          Submit another inquiry
        </button>
      </div>
    );
  }

  const recommendedAreas = RECOMMENDED_AREAS_BY_INTEREST[formData.interest] || [];

  return (
    <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 p-6 md:p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-3">
          <i className="fas fa-award"></i>
          <span>Verified RERA Partner Network</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-2">Connect with a Verified Dubai Expert</h3>
        <p className="text-sm text-gray-600 dark:text-zinc-400">
          Get unbiased guidance on property ROI, Golden Visa qualification, and top communities from licensed professionals.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
            <i className="fas fa-user text-primary text-xs"></i>
            <span>Full Name <span className="text-red-500">*</span></span>
          </label>
          <input 
            type="text" 
            name="name" 
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-sm font-medium"
            placeholder="e.g. Rahul Sharma / John Smith"
          />
        </div>
        
        {/* Email & Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
              <i className="fas fa-envelope text-primary text-xs"></i>
              <span>Email Address <span className="text-red-500">*</span></span>
            </label>
            <input 
              type="email" 
              name="email" 
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-sm font-medium"
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
              <i className="fab fa-whatsapp text-emerald-500 text-sm"></i>
              <span>Phone / WhatsApp <span className="text-red-500">*</span></span>
            </label>
            <input 
              type="tel" 
              name="phone" 
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-sm font-medium"
              placeholder="+971 50 000 0000"
            />
          </div>
        </div>

        {/* What are you looking for? */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
            <i className="fas fa-bullseye text-primary text-xs"></i>
            <span>What are you looking for? <span className="text-red-500">*</span></span>
          </label>
          <select 
            name="interest"
            value={formData.interest}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-sm font-medium cursor-pointer"
          >
            {INTEREST_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Preferred Location in Dubai (Connected with Explore Dubai Property Areas) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
              <i className="fas fa-map-marker-alt text-amber-500 text-xs"></i>
              <span>Preferred Dubai Area / Location</span>
            </label>
            <span className="text-[11px] text-gray-400 dark:text-zinc-500">
              15+ Areas Covered
            </span>
          </div>
          
          <select 
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-sm font-medium cursor-pointer"
          >
            <option value="All Dubai / Open to Recommendations">
              All Dubai / Open to Recommendations
            </option>
            <optgroup label="Popular Dubai Property Areas">
              {DUBAI_AREAS.map(area => (
                <option key={area.slug} value={area.name}>
                  {area.name} ({area.tagline})
                </option>
              ))}
            </optgroup>
            <option value="Other / Multiple Areas">Other / Multiple Areas</option>
          </select>

          {/* Smart Quick-Select Pills based on Selected Interest */}
          {recommendedAreas.length > 0 && (
            <div className="mt-2.5">
              <p className="text-[11px] font-semibold text-gray-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1">
                <i className="fas fa-sparkles text-amber-500 text-xs"></i>
                Popular for {formData.interest}:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {recommendedAreas.map(areaName => (
                  <button
                    key={areaName}
                    type="button"
                    onClick={() => handleAreaSelect(areaName)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition font-medium ${
                      formData.location === areaName
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700 hover:border-primary/60 hover:text-primary"
                    }`}
                  >
                    {areaName}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Budget */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
            <i className="fas fa-coins text-amber-500 text-xs"></i>
            <span>Estimated Budget (Optional)</span>
          </label>
          <input 
            type="text" 
            name="budget" 
            value={formData.budget}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-sm font-medium"
            placeholder="e.g. AED 1.5M - 2M (or ₹3.5 Cr / $400K)"
          />
        </div>

        {/* RERA Consent Checkbox */}
        <div className="pt-2">
          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-900/60 cursor-pointer hover:border-primary/50 transition-colors">
            <input 
              type="checkbox" 
              id="reraConsent" 
              name="reraConsent" 
              required
              checked={formData.reraConsent}
              onChange={(e) => setFormData(prev => ({ ...prev, reraConsent: e.target.checked }))}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-zinc-700 dark:bg-zinc-800 cursor-pointer accent-primary shrink-0"
            />
            <span className="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed select-none">
              <strong className="text-gray-900 dark:text-zinc-100 font-semibold block mb-0.5">
                <i className="fas fa-shield-alt text-emerald-600 dark:text-emerald-400 mr-1.5"></i>
                Verified RERA Regulatory Consent
              </strong>
              Yes, I confirm that my inquiry and contact details may be shared exclusively with RERA-certified real estate professionals and registered UAE developers to contact me regarding my property inquiry.
            </span>
          </label>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2">
            <i className="fas fa-exclamation-circle shrink-0"></i>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={isSubmitting || !formData.reraConsent}
          className="w-full mt-2 bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
        >
          {isSubmitting ? (
            <><i className="fas fa-spinner fa-spin"></i> Connecting to RERA Advisor...</>
          ) : (
            <><i className="fas fa-paper-plane"></i> Get Free Expert Consultation</>
          )}
        </button>
        
        {/* Compliance Footer Note */}
        <div className="flex flex-col items-center mt-4 space-y-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-full">
            <i className="fas fa-lock text-gray-500 dark:text-zinc-400 text-xs"></i>
            <span className="text-[11px] font-medium text-gray-600 dark:text-zinc-400">
              100% Free Consultation • No Spam • Strict Escrow Protection
            </span>
          </div>
          
          <p className="text-[11px] text-center text-gray-400 dark:text-zinc-500 max-w-sm leading-normal">
            By submitting, you agree to our <Link href="/privacy" className="text-primary dark:text-amber-400 hover:underline">privacy policy</Link>. We never sell your data to unauthorized third parties.
          </p>
        </div>
      </form>
    </div>
  );
}
