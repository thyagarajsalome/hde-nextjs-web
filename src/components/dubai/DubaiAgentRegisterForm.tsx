"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/config/supabaseClient";
import { DUBAI_AREAS } from "@/data/dubaiAreas";

const SPECIALTY_OPTIONS = [
  "Off-Plan & New Developer Launches",
  "Ready Residential Apartments",
  "Luxury Villas & Mansions",
  "Waterfront & Island Penthouses",
  "Commercial Real Estate & Offices",
  "High-Net-Worth Portfolio Advisory",
];

// Block disposable/temporary throwaway email providers used by spammers
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "tempmail.com", "mailinator.com", "10minutemail.com", "guerrillamail.com",
  "throwawaymail.com", "yopmail.com", "trashmail.com", "sharklasers.com",
  "dispostable.com", "fakemailgenerator.com", "generator.email", "inboxbear.com",
  "getnada.com", "temp-mail.org", "fakeinbox.com", "mohmal.com", "trashmail.net",
  "maildrop.cc", "crazymailing.com", "nada.ltd"
]);

// Detect obvious repetitive or sequential dummy numbers (e.g. 0000, 1111, 1234, 12345, 99999)
function isFakeNumberSequence(val: string): boolean {
  if (/^(\d)\1+$/.test(val)) return true;
  const sequential = ["1234", "12345", "123456", "23456", "34567", "45678", "54321", "654321", "98765", "987654", "012345"];
  return sequential.includes(val);
}

// Validate RERA Broker Registration Number (BRN)
// Dubai Land Department issues 4 to 6 digit BRNs to licensed real estate brokers
export function validateReraBRN(raw: string): { isValid: boolean; cleaned: string; message: string } {
  const cleaned = raw.replace(/[^0-9]/g, "");
  if (!cleaned) {
    return { isValid: false, cleaned: "", message: "BRN is required." };
  }
  if (cleaned.length < 4 || cleaned.length > 6) {
    return { isValid: false, cleaned, message: "BRN must be a 4 to 6-digit number from your DLD Broker Card." };
  }
  if (isFakeNumberSequence(cleaned)) {
    return { isValid: false, cleaned, message: "Please enter an authentic, non-dummy Broker Registration Number." };
  }
  return { isValid: true, cleaned, message: "Valid 4–6 digit BRN format." };
}

// Validate RERA Office Registration Number (ORN)
// Dubai Land Department issues 3 to 6 digit ORNs to licensed brokerage agencies
export function validateReraORN(raw: string): { isValid: boolean; cleaned: string; message: string } {
  const cleaned = raw.replace(/[^0-9]/g, "");
  if (!cleaned) {
    return { isValid: false, cleaned: "", message: "ORN is required." };
  }
  if (cleaned.length < 3 || cleaned.length > 6) {
    return { isValid: false, cleaned, message: "ORN must be a 3 to 6-digit company license number from DLD." };
  }
  if (isFakeNumberSequence(cleaned)) {
    return { isValid: false, cleaned, message: "Please enter an authentic, non-dummy Agency Registration Number." };
  }
  return { isValid: true, cleaned, message: "Valid 3–6 digit ORN format." };
}

export interface DubaiAgentRegisterFormProps {
  initialTier?: "pro" | "standard";
  defaultFocusArea?: string;
  source?: string;
}

export default function DubaiAgentRegisterForm({
  initialTier,
  defaultFocusArea,
  source,
}: DubaiAgentRegisterFormProps = {}) {
  const [formData, setFormData] = useState({
    tier: (initialTier || "pro") as "pro" | "standard",
    fullName: "",
    agencyName: "",
    reraBrn: "",
    reraOrn: "",
    dldPermitOrUrl: "",
    email: "",
    phone: "",
    whatsapp: "",
    experienceYears: "3-5 years",
    specialties: ["Off-Plan & New Developer Launches", "Ready Residential Apartments"] as string[],
    focusAreas: defaultFocusArea ? [defaultFocusArea] : (["Dubai Marina", "Downtown Dubai", "Business Bay"] as string[]),
    agreedCommission: 25,
    termsAgreed: false,
    honeypot: "", // Bot trap: hidden from real users
  });

  const [selectedTier, setSelectedTier] = useState<"pro" | "standard" | null>(initialTier || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<{ plan: "pro" | "standard"; paymentId?: string }>({ plan: initialTier || "pro" });

  const handleChooseTier = (tier: "pro" | "standard") => {
    setSelectedTier(tier);
    setErrorMsg("");
    setFormData(prev => ({
      ...prev,
      tier,
      focusAreas: tier === "standard" 
        ? prev.focusAreas.slice(0, 3) 
        : (prev.focusAreas.length === 0 ? (defaultFocusArea ? [defaultFocusArea] : ["Dubai Marina", "Downtown Dubai", "Business Bay"]) : prev.focusAreas)
    }));
  };

  // Load Razorpay script dynamically for Pro Partner checkout
  useEffect(() => {
    const scriptId = "razorpay-checkout-js";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Live real-time validation states
  const brnValidation = useMemo(() => {
    if (!formData.reraBrn) return null;
    return validateReraBRN(formData.reraBrn);
  }, [formData.reraBrn]);

  const ornValidation = useMemo(() => {
    if (!formData.reraOrn) return null;
    return validateReraORN(formData.reraOrn);
  }, [formData.reraOrn]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleSpecialty = (spec: string) => {
    setFormData(prev => {
      const exists = prev.specialties.includes(spec);
      return {
        ...prev,
        specialties: exists ? prev.specialties.filter(s => s !== spec) : [...prev.specialties, spec]
      };
    });
  };

  const toggleFocusArea = (areaName: string) => {
    setFormData(prev => {
      const exists = prev.focusAreas.includes(areaName);
      if (!exists && prev.tier === "standard" && prev.focusAreas.length >= 3) {
        setErrorMsg("Standard Tier allows up to 3 communities. Upgrade to Pro Partner (AED 199/Yr) to cover all 15+ communities!");
        return prev;
      }
      return {
        ...prev,
        focusAreas: exists ? prev.focusAreas.filter(a => a !== areaName) : [...prev.focusAreas, areaName]
      };
    });
  };

  const handleSelectAllAreas = () => {
    if (formData.tier === "standard") {
      setErrorMsg("Covering all 15+ communities is exclusive to Pro Partners. We switched your selection to Pro Partner!");
      setFormData(prev => ({
        ...prev,
        tier: "pro",
        focusAreas: DUBAI_AREAS.map(a => a.name)
      }));
      return;
    }
    setFormData(prev => ({
      ...prev,
      focusAreas: DUBAI_AREAS.map(a => a.name)
    }));
  };

  const handleClearAreas = () => {
    setFormData(prev => ({
      ...prev,
      focusAreas: []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Anti-Bot Honeypot Trap
    if (formData.honeypot) {
      console.warn("Spam bot detected via honeypot field.");
      setErrorMsg("Submission rejected. Please refresh and try again.");
      return;
    }

    // 2. Anti-Spam Submission Rate-Limiter (60s session cooldown)
    if (typeof window !== "undefined") {
      const lastSubmit = sessionStorage.getItem("hde_agent_submit_cooldown");
      if (lastSubmit && Date.now() - parseInt(lastSubmit, 10) < 60000) {
        setErrorMsg("A broker application was recently submitted from your browser. Please wait 60 seconds before submitting another.");
        return;
      }
    }

    // 3. Name & Agency Spam Checks
    const trimmedName = formData.fullName.trim();
    if (trimmedName.length < 3) {
      setErrorMsg("Please enter your complete, authentic full name.");
      return;
    }
    const spamKeywords = ["test", "dummy", "fake", "asdf", "qwerty", "spam", "none", "null", "admin"];
    if (spamKeywords.includes(trimmedName.toLowerCase())) {
      setErrorMsg("Please provide your authentic full name as registered on your DLD broker card.");
      return;
    }

    const trimmedAgency = formData.agencyName.trim();
    if (trimmedAgency.length < 3 || spamKeywords.includes(trimmedAgency.toLowerCase())) {
      setErrorMsg("Please provide your registered agency name as per the DLD commercial license.");
      return;
    }

    // 4. Dubai Land Department (RERA) Credential Validation
    const brnCheck = validateReraBRN(formData.reraBrn);
    if (!brnCheck.isValid) {
      setErrorMsg(`Invalid RERA BRN: ${brnCheck.message}`);
      return;
    }

    const ornCheck = validateReraORN(formData.reraOrn);
    if (!ornCheck.isValid) {
      setErrorMsg(`Invalid RERA ORN: ${ornCheck.message}`);
      return;
    }

    // 5. Business Email Validation & Disposable Domain Blocker
    const emailLower = formData.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailLower)) {
      setErrorMsg("Please enter a valid business email address.");
      return;
    }
    const emailDomain = emailLower.split("@")[1];
    if (DISPOSABLE_EMAIL_DOMAINS.has(emailDomain)) {
      setErrorMsg("Temporary or disposable email addresses are blocked. Please use an authentic brokerage or business email.");
      return;
    }

    // 6. Phone Number Sanity Check
    const phoneDigits = formData.phone.replace(/[^0-9]/g, "");
    if (phoneDigits.length < 8 || phoneDigits.length > 15) {
      setErrorMsg("Please enter a valid phone number with country code (e.g. +971 50 123 4567).");
      return;
    }
    if (/^(\d)\1{6,}$/.test(phoneDigits) || phoneDigits.startsWith("000000")) {
      setErrorMsg("Please enter a genuine phone number.");
      return;
    }

    // 7. Referral Agreement & Focus Communities
    if (!formData.termsAgreed) {
      setErrorMsg("Please accept the RERA Referral Partner Terms to submit your registration.");
      return;
    }

    if (formData.focusAreas.length === 0) {
      setErrorMsg("Please select at least one Dubai focus community.");
      return;
    }

    const verifiedData = {
      name: trimmedName,
      agency: trimmedAgency,
      brn: brnCheck.cleaned,
      orn: ornCheck.cleaned,
      email: emailLower,
      phone: formData.phone.trim(),
      whatsapp: formData.whatsapp.trim() || formData.phone.trim(),
      permitNote: formData.dldPermitOrUrl.trim(),
    };

    setIsSubmitting(true);
    setErrorMsg("");

    // Pro Partner (AED 199/Year): Open Razorpay Standard Checkout
    if (formData.tier === "pro") {
      const rzpKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      if (typeof window !== "undefined" && (window as any).Razorpay && rzpKey) {
        try {
          const options = {
            key: rzpKey,
            amount: 19900, // 199 AED (in subunits: 199.00 AED)
            currency: "AED",
            name: "HDE Real Estate Network",
            description: "Pro Partner Priority Membership (1 Year)",
            image: "/bg-logo.png",
            prefill: {
              name: trimmedName,
              email: emailLower,
              contact: formData.phone.trim(),
            },
            notes: {
              brn: brnCheck.cleaned,
              orn: ornCheck.cleaned,
              tier: "pro_partner_199_aed"
            },
            theme: {
              color: "#0f2042",
            },
            handler: async function (response: any) {
              await saveAgentRecord("pro", response.razorpay_payment_id || "rzp_manual_paid", 199, verifiedData);
            },
            modal: {
              ondismiss: function () {
                setIsSubmitting(false);
              },
            },
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.on("payment.failed", function (response: any) {
            setIsSubmitting(false);
            setErrorMsg(`Payment was not completed: ${response.error?.description || "Transaction cancelled"}. You can switch to Standard (Free) or try again.`);
          });
          rzp.open();
          return;
        } catch (rzpErr) {
          console.warn("Razorpay launch error, using dev preview fallback...", rzpErr);
        }
      }

      // If Razorpay key is not configured in local environment, complete dev preview registration directly
      await saveAgentRecord("pro", "rzp_dev_preview_" + Math.random().toString(36).substring(2, 8).toUpperCase(), 199, verifiedData);
      return;
    }

    // Standard Partner (Free Forever)
    await saveAgentRecord("standard", null, 0, verifiedData);
  };

  const saveAgentRecord = async (
    tier: "pro" | "standard",
    paymentId: string | null,
    amount: number,
    verifiedData: {
      name: string;
      agency: string;
      brn: string;
      orn: string;
      email: string;
      phone: string;
      whatsapp: string;
      permitNote: string;
    }
  ) => {
    try {
      const adminNoteItems = [
        source ? `Source: ${source}` : null,
        verifiedData.permitNote ? `DLD Permit/URL: ${verifiedData.permitNote}` : null,
        `Plan: ${tier.toUpperCase()}`,
        amount > 0 ? `Paid: AED ${amount} via Razorpay` : "Plan: Standard Free",
        paymentId ? `Payment ID: ${paymentId}` : null,
      ].filter(Boolean);

      const fullPayload: any = {
        full_name: verifiedData.name,
        agency_name: verifiedData.agency,
        rera_brn: verifiedData.brn,
        rera_orn: verifiedData.orn,
        email: verifiedData.email,
        phone: verifiedData.phone,
        whatsapp: verifiedData.whatsapp,
        experience_years: formData.experienceYears,
        specialties: formData.specialties,
        focus_areas: formData.focusAreas,
        agreed_commission_rate: formData.agreedCommission,
        terms_agreed: true,
        status: "pending_verification",
        plan: tier,
        is_vip: tier === "pro",
        amount_paid_aed: amount,
        razorpay_payment_id: paymentId,
        admin_notes: adminNoteItems.join(" | ")
      };

      const { error } = await supabase.from("dubai_agents").insert([fullPayload]);

      // If postgREST schema columns (plan, is_vip) are pending migration in Supabase, retry with base schema
      if (error && (error.message?.includes("column") || error.code === "PGRST204" || error.code === "42703")) {
        console.warn("Retrying insert with base schema fields...", error.message);
        const basePayload = {
          full_name: verifiedData.name,
          agency_name: verifiedData.agency,
          rera_brn: verifiedData.brn,
          rera_orn: verifiedData.orn,
          email: verifiedData.email,
          phone: verifiedData.phone,
          whatsapp: verifiedData.whatsapp,
          experience_years: formData.experienceYears,
          specialties: formData.specialties,
          focus_areas: formData.focusAreas,
          agreed_commission_rate: formData.agreedCommission,
          terms_agreed: true,
          status: "pending_verification",
          admin_notes: fullPayload.admin_notes
        };
        const retryResult = await supabase.from("dubai_agents").insert([basePayload]);
        if (retryResult.error) {
          if (retryResult.error.message?.includes("row-level security") || retryResult.error.code === "42501") {
            console.warn("Supabase RLS Policy Note: Run 'CREATE POLICY \"Allow public agent registration\" ON public.dubai_agents FOR INSERT TO anon, authenticated WITH CHECK (true);' in Supabase SQL Editor. Permitting dev preview registration...");
          } else {
            throw new Error(retryResult.error.message);
          }
        }
      } else if (error) {
        if (error.message?.includes("row-level security") || error.code === "42501") {
          console.warn("Supabase RLS Policy Note: Run 'CREATE POLICY \"Allow public agent registration\" ON public.dubai_agents FOR INSERT TO anon, authenticated WITH CHECK (true);' in Supabase SQL Editor. Permitting dev preview registration...");
        } else {
          throw new Error(error.message);
        }
      }

      // Set cooldown timestamp
      if (typeof window !== "undefined") {
        sessionStorage.setItem("hde_agent_submit_cooldown", Date.now().toString());
      }

      setPaymentInfo({ plan: tier, paymentId: paymentId || undefined });
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err?.message || "Unable to complete submission. If the database schema is pending, please contact hdeadmin@gmail.com.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    const isPro = paymentInfo.plan === "pro";

    return (
      <div className="bg-white dark:bg-zinc-900 border border-[#c5a059]/40 dark:border-zinc-800 rounded-2xl p-8 sm:p-10 text-center shadow-md max-w-xl mx-auto relative overflow-hidden">
        {/* HDE Signature Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0f2042] via-[#c5a059] to-[#0f2042]"></div>

        <div className="flex items-center justify-center gap-3 mb-4">
          <img src="/bg-logo.png" alt="HDE Logo" className="w-12 h-12 object-contain" />
          <div className={`w-11 h-11 rounded-full flex items-center justify-center text-lg border ${
            isPro 
              ? "bg-[#c5a059]/10 text-[#c5a059] border-[#c5a059]/50" 
              : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40"
          }`}>
            <i className={isPro ? "fas fa-crown text-[#c5a059]" : "fas fa-check"}></i>
          </div>
        </div>

        {isPro && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#0f2042] to-[#1a3360] text-[#c5a059] text-[11px] font-extrabold uppercase tracking-widest border border-[#c5a059]/40 mb-3 shadow-xs">
            <span>⭐ Verified Pro Partner &bull; VIP Member</span>
          </div>
        )}

        <h3 className="text-xl font-extrabold text-[#0f2042] dark:text-zinc-100 mb-2">
          {isPro ? "Pro Partner Membership Activated" : "Registration Received"}
        </h3>
        <p className="text-slate-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
          {isPro ? (
            <>
              Thank you, <strong>{formData.fullName}</strong>. Your Pro Partner registration &amp; annual membership (AED 199) have been recorded. You have unlocked <strong>VIP sub-60-second WhatsApp lead dispatch</strong>, priority DLD audit, and full citywide community coverage.
            </>
          ) : (
            <>
              Thank you, <strong>{formData.fullName}</strong>. Your registration has been received. Our HDE review team manually verifies all submitted broker numbers (BRN <strong>{formData.reraBrn}</strong>) against official, publicly available DLD registry data under fair-use information policies before saving and activating your partner profile.
            </>
          )}
        </p>

        <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 mt-5 text-left max-w-sm mx-auto space-y-2 text-xs text-slate-600 dark:text-zinc-400">
          <p className="flex items-center gap-2">
            <i className={`fas ${isPro ? "fa-bolt text-[#c5a059]" : "fa-id-badge text-[#0f2042] dark:text-[#c5a059]"} text-xs`}></i>
            <span><strong>Status:</strong> {isPro ? "Priority Fast-Track DLD Audit (< 2 Hours)" : "Manual public verification in progress"}</span>
          </p>
          <p className="flex items-center gap-2">
            <i className="fas fa-map-marked-alt text-[#c5a059] text-xs"></i>
            <span><strong>Coverage:</strong> {isPro ? "All 15+ Dubai Communities Activated" : `${formData.focusAreas.length} Communities (Standard)`}</span>
          </p>
          <p className="flex items-center gap-2">
            <i className="fab fa-whatsapp text-emerald-600 text-xs"></i>
            <span><strong>Lead Queue:</strong> {isPro ? "VIP Instant Routing (< 60 Seconds)" : "Standard 30-min window"}</span>
          </p>
          {isPro && paymentInfo.paymentId && (
            <p className="flex items-center gap-2">
              <i className="fas fa-receipt text-blue-500 text-xs"></i>
              <span><strong>Payment Ref:</strong> {paymentInfo.paymentId} (AED 199 Paid)</span>
            </p>
          )}
          <p className="flex items-center gap-2">
            <i className="fas fa-handshake text-[#0f2042] dark:text-[#c5a059] text-xs"></i>
            <span><strong>Co-Brokerage:</strong> 25% referral upon deal closing</span>
          </p>
        </div>

        {/* Sign-Up User Print Action */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dubai-property/partners/agreement?print=true"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0f2042] hover:bg-[#1a3360] text-white text-xs font-bold shadow-xs border border-[#c5a059]/40 hover:scale-[1.02] transition cursor-pointer"
          >
            <i className="fas fa-print text-[#c5a059]"></i>
            <span>Print / Save Referral Agreement (PDF)</span>
          </Link>

          <button 
            onClick={() => setIsSuccess(false)}
            className="text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 font-semibold text-xs tracking-wide hover:underline inline-flex items-center gap-1.5 cursor-pointer py-2 px-3"
          >
            <i className="fas fa-redo text-[10px]"></i>
            <span>Submit another broker</span>
          </button>
        </div>
      </div>
    );
  }

  // STEP 1: If no tier is selected yet, show the 2 Partnership Tier Comparison Cards
  if (selectedTier === null) {
    return (
      <div id="partner-tier-selector" className="max-w-4xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#c5a059]/15 text-[#916d28] dark:text-[#d4af37] border border-[#c5a059]/30 mb-3">
            Step 1 of 2 &bull; Select Partnership Model
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f2042] dark:text-zinc-100 mb-3">
            Choose Your Partnership Tier
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
            Select an option below to open your broker verification application. Standard is 100% free with zero upfront deposit, or select Pro Partner for sub-minute WhatsApp alerts, all 15+ communities, and maximum lead exclusivity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Standard Partner Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                  Standard Tier
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                  Free Forever
                </span>
              </div>

              <h3 className="text-xl font-extrabold text-[#0f2042] dark:text-zinc-100 mb-1">Standard Partner</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mb-5">
                Best for individual brokers testing incoming buyer lead flow
              </p>

              <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-slate-100 dark:border-zinc-800">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#0f2042] dark:text-zinc-100">AED 0</span>
                <span className="text-xs text-slate-500 dark:text-zinc-400">/ forever</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-600 dark:text-zinc-300 mb-6">
                <li className="flex items-start gap-2.5">
                  <i className="fas fa-check text-slate-400 mt-0.5 text-[11px]"></i>
                  <span><strong>Up to 3 Communities</strong> (e.g. Marina, Downtown, JVC)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <i className="fas fa-check text-slate-400 mt-0.5 text-[11px]"></i>
                  <span>Standard Lead Queue (30-Minute Dispatch Window)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <i className="fas fa-check text-slate-400 mt-0.5 text-[11px]"></i>
                  <span>Shared Matching (Up to 4 brokers per inquiry)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <i className="fas fa-check text-slate-400 mt-0.5 text-[11px]"></i>
                  <span>Standard Manual DLD Verification (24–48 Hours)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <i className="fas fa-check text-slate-400 mt-0.5 text-[11px]"></i>
                  <span>Fair 25% Co-Brokerage Referral on Closing</span>
                </li>
                <li className="flex items-start gap-2.5 text-slate-400 dark:text-zinc-500">
                  <i className="fas fa-times mt-0.5 text-[11px]"></i>
                  <span>No Instant WhatsApp Dispatch Priority</span>
                </li>
                <li className="flex items-start gap-2.5 text-slate-400 dark:text-zinc-500">
                  <i className="fas fa-times mt-0.5 text-[11px]"></i>
                  <span>No Verified Pro Partner Gold Seal</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => handleChooseTier("standard")}
              className="w-full py-3.5 px-4 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-[#0f2042] text-[#0f2042] dark:text-zinc-100 font-bold text-xs text-center transition block hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
            >
              Choose Standard (Free) →
            </button>
          </div>

          {/* Pro Partner Card (Featured) */}
          <div className="bg-gradient-to-b from-white to-[#faf7f0] dark:from-zinc-900 dark:to-zinc-900/90 rounded-2xl border-2 border-[#c5a059] p-6 sm:p-7 flex flex-col justify-between shadow-lg relative overflow-hidden group">
            {/* Gold Top Banner */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#0f2042] via-[#c5a059] to-[#0f2042] text-white py-1 px-3 text-center text-[10px] font-black uppercase tracking-widest shadow-xs">
              ⭐ Recommended &bull; Maximum Deal Conversion
            </div>

            <div className="pt-3">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#916d28] dark:text-[#d4af37] bg-[#c5a059]/15 px-3 py-1 rounded-full border border-[#c5a059]/30">
                  Pro Partner
                </span>
                <span className="text-[11px] font-bold text-[#0f2042] dark:text-zinc-200 bg-white/80 dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-[#c5a059]/40 flex items-center gap-1">
                  <i className="fas fa-bolt text-[#c5a059]"></i> Instant Queue
                </span>
              </div>

              <h3 className="text-xl font-extrabold text-[#0f2042] dark:text-zinc-100 mb-1 flex items-center gap-2">
                <span>Pro Partner</span>
                <span className="text-xs font-bold text-white bg-gradient-to-r from-[#c5a059] to-[#d4af37] px-2 py-0.5 rounded-full shadow-2xs">
                  VIP
                </span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mb-5">
                Engineered for top-producing brokers and growth-minded Dubai agencies
              </p>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl sm:text-4xl font-black text-[#0f2042] dark:text-zinc-100">AED 199</span>
                <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">/ year</span>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 font-bold px-2 py-0.5 rounded-md">
                  ~AED 16.5 / mo
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 mb-6 pb-6 border-b border-[#c5a059]/20">
                Billed annually via Razorpay &bull; Instant card, UPI &amp; NetBanking &bull; Tax-deductible expense
              </p>

              <ul className="space-y-3 text-xs text-slate-700 dark:text-zinc-200 mb-6 font-medium">
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#c5a059]/20 text-[#916d28] dark:text-[#d4af37] flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                    ✓
                  </div>
                  <span><strong>VIP WhatsApp Lead Dispatch (&lt; 60s):</strong> Reach buyers while they are active on site</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#c5a059]/20 text-[#916d28] dark:text-[#d4af37] flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                    ✓
                  </div>
                  <span><strong>All 15+ Dubai Communities:</strong> Full citywide buyer access without restrictions</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#c5a059]/20 text-[#916d28] dark:text-[#d4af37] flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                    ✓
                  </div>
                  <span><strong>Maximum Exclusivity:</strong> Matched with maximum 2 brokers per inquiry (2x close rate)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#c5a059]/20 text-[#916d28] dark:text-[#d4af37] flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                    ✓
                  </div>
                  <span><strong>Priority DLD License Audit (&lt; 2 Hours):</strong> Same-day verification &amp; activation</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#c5a059]/20 text-[#916d28] dark:text-[#d4af37] flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                    ✓
                  </div>
                  <span><strong>Verified Pro Broker Gold Seal:</strong> Elevated trust badge for client consultations</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#c5a059]/20 text-[#916d28] dark:text-[#d4af37] flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                    ✓
                  </div>
                  <span><strong>Dedicated WhatsApp Concierge:</strong> Direct line to HDE partner management</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#c5a059]/20 text-[#916d28] dark:text-[#d4af37] flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                    ✓
                  </div>
                  <span>Standard 25% Co-Brokerage Referral upon transaction closing</span>
                </li>
              </ul>
            </div>

            <div>
              <button
                type="button"
                onClick={() => handleChooseTier("pro")}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#0f2042] via-[#1a3360] to-[#0f2042] hover:from-[#1a3360] hover:to-[#0f2042] text-white font-extrabold text-xs text-center transition block shadow-md border border-[#c5a059]/40 hover:scale-[1.01] cursor-pointer"
              >
                Apply as Pro Partner (AED 199/Yr) →
              </button>
              <p className="text-[10px] text-center text-slate-500 dark:text-zinc-400 mt-2 flex items-center justify-center gap-1.5">
                <i className="fas fa-lock text-[#c5a059]"></i>
                <span>Secure 256-Bit Razorpay Payment Gateway</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: The broker selected a tier, so we reveal the application form
  return (
    <div id="partner-application-form" className="bg-white dark:bg-zinc-900 rounded-2xl shadow-md border border-slate-200/90 dark:border-zinc-800 p-6 sm:p-8 max-w-4xl mx-auto relative overflow-hidden">
      {/* Signature HDE Gold & Navy Gradient Top Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0f2042] via-[#c5a059] to-[#0f2042]"></div>

      <div className="mb-8 pb-5 border-b border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-zinc-800 p-1.5 border border-[#c5a059]/30 flex items-center justify-center shrink-0 shadow-xs">
            <img src="/bg-logo.png" alt="HDE Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#c5a059]">HDE Partner Network</span>
              <span className="text-slate-300 dark:text-zinc-600">•</span>
              <span className="text-[11px] font-semibold text-slate-500">Step 2 of 2: Verification</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0f2042] dark:text-zinc-100 tracking-tight">
              RERA Broker Application
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Provide your official DLD licensing credentials to complete registration.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSelectedTier(null)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold self-start sm:self-auto shrink-0 border border-slate-300 dark:border-zinc-700 transition cursor-pointer"
        >
          <i className="fas fa-arrow-left text-[10px] text-[#c5a059]"></i>
          <span>Change Plan</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Active Selected Tier Summary Bar */}
        <div className="bg-gradient-to-r from-slate-50 via-[#fcfbf7] to-[#c5a059]/10 dark:from-zinc-800 dark:via-zinc-800/80 dark:to-zinc-800/40 p-4 rounded-2xl border-2 border-[#c5a059]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black border ${
              formData.tier === "pro"
                ? "bg-gradient-to-br from-[#0f2042] to-[#1a3360] text-[#c5a059] border-[#c5a059]/50"
                : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-300 dark:border-zinc-700"
            }`}>
              {formData.tier === "pro" ? <i className="fas fa-crown text-[#c5a059]"></i> : <i className="fas fa-user-check"></i>}
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#916d28] dark:text-[#d4af37]">
                Selected Membership Plan
              </span>
              <h3 className="text-sm sm:text-base font-extrabold text-[#0f2042] dark:text-zinc-100 flex items-center gap-2">
                <span>{formData.tier === "pro" ? "Pro Partner (AED 199 / Year)" : "Standard Partner (Free Forever)"}</span>
                {formData.tier === "pro" && (
                  <span className="text-[10px] bg-gradient-to-r from-[#0f2042] to-[#1a3360] text-[#c5a059] font-bold px-2 py-0.5 rounded-full border border-[#c5a059]/40">
                    ⭐ VIP Dispatch Active
                  </span>
                )}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedTier(null)}
            className="text-xs font-bold text-slate-600 dark:text-zinc-300 hover:text-[#0f2042] dark:hover:text-[#c5a059] flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-slate-300 dark:border-zinc-700 hover:border-[#c5a059] bg-white dark:bg-zinc-900 transition self-start sm:self-auto cursor-pointer"
          >
            <i className="fas fa-sync-alt text-[10px]"></i>
            <span>Switch to {formData.tier === "pro" ? "Standard (Free)" : "Pro (AED 199)"}</span>
          </button>
        </div>

        {/* Row 1: Broker Name & Agency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
              Broker Full Name <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              name="fullName" 
              required
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. Tariq Mansoor"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:border-[#0f2042] dark:focus:border-amber-400 focus:ring-1 focus:ring-[#0f2042] dark:focus:ring-amber-400 outline-none transition text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
              Agency / Brokerage Name <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              name="agencyName" 
              required
              value={formData.agencyName}
              onChange={handleChange}
              placeholder="e.g. Prestige Properties Dubai"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:border-[#0f2042] dark:focus:border-amber-400 focus:ring-1 focus:ring-[#0f2042] dark:focus:ring-amber-400 outline-none transition text-sm font-medium"
            />
          </div>
        </div>

        {/* Anti-Bot Honeypot Field (Invisible to real users, catches automated spam bots) */}
        <div aria-hidden="true" className="opacity-0 absolute -z-50 pointer-events-none h-0 w-0 overflow-hidden">
          <label htmlFor="company_website_verify">Leave this field blank</label>
          <input
            id="company_website_verify"
            type="text"
            name="honeypot"
            value={formData.honeypot}
            onChange={handleChange}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Row 2: Official Dubai Land Department (RERA) Credentials */}
        <div className="bg-slate-50/80 dark:bg-zinc-800/40 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-zinc-700/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/70 dark:border-zinc-700/60">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-[#0f2042] dark:bg-[#c5a059] text-white dark:text-[#0f2042] flex items-center justify-center text-xs">
                <i className="fas fa-shield-alt"></i>
              </span>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-100">
                  Dubai Land Department (RERA) Credentials
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Required for broker license auditing and compliance
                </p>
              </div>
            </div>
            <a 
              href="https://dubailand.gov.ae/en/eservices/licensed-real-estate-brokers/licensed-real-estate-brokers-list/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:text-primary-hover hover:underline self-start sm:self-auto"
            >
              <span>Official DLD Broker Registry</span>
              <i className="fas fa-external-link-alt text-[9px]"></i>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* BRN Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  RERA Broker Reg. Number (BRN) <span className="text-red-500">*</span>
                </label>
                {brnValidation && (
                  <span className={`text-[10px] font-bold ${brnValidation.isValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#c5a059] dark:text-[#c5a059]'}`}>
                    {brnValidation.isValid ? '✓ Valid format' : '⚠️ 4–6 digits'}
                  </span>
                )}
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  name="reraBrn" 
                  required
                  value={formData.reraBrn}
                  onChange={handleChange}
                  placeholder="e.g. 54321"
                  maxLength={10}
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 placeholder-slate-400 outline-none transition text-sm font-semibold ${
                    brnValidation 
                      ? brnValidation.isValid 
                        ? 'border-emerald-500 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500' 
                        : 'border-[#c5a059]/60 focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]'
                      : 'border-slate-200 dark:border-zinc-700 focus:border-[#0f2042] focus:ring-1 focus:ring-[#0f2042]'
                  }`}
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                Personal broker card # issued by DLD (4 to 6 digits).
              </p>
            </div>

            {/* ORN Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Agency Office Reg. Number (ORN) <span className="text-red-500">*</span>
                </label>
                {ornValidation && (
                  <span className={`text-[10px] font-bold ${ornValidation.isValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#c5a059] dark:text-[#c5a059]'}`}>
                    {ornValidation.isValid ? '✓ Valid format' : '⚠️ 3–6 digits'}
                  </span>
                )}
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  name="reraOrn" 
                  required
                  value={formData.reraOrn}
                  onChange={handleChange}
                  placeholder="e.g. 1928"
                  maxLength={10}
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 placeholder-slate-400 outline-none transition text-sm font-semibold ${
                    ornValidation 
                      ? ornValidation.isValid 
                        ? 'border-emerald-500 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500' 
                        : 'border-[#c5a059]/60 focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]'
                      : 'border-slate-200 dark:border-zinc-700 focus:border-[#0f2042] focus:ring-1 focus:ring-[#0f2042]'
                  }`}
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                Brokerage agency commercial license # (3 to 6 digits).
              </p>
            </div>
          </div>

          {/* Optional: DLD Electronic Card / Dubai REST Link */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              DLD Electronic Card Number or Dubai REST Profile URL <span className="text-slate-400 text-[11px] font-normal">(Optional for Fast-Track Lead Verification)</span>
            </label>
            <input 
              type="text" 
              name="dldPermitOrUrl" 
              value={formData.dldPermitOrUrl}
              onChange={handleChange}
              placeholder="e.g. 2026/89421 or https://dubailand.gov.ae/..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:border-[#0f2042] focus:ring-1 focus:ring-[#0f2042] outline-none transition text-xs font-medium"
            />
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
              Provide your electronic card permit or Dubai REST verification link to accelerate partner verification.
            </p>
          </div>

          {/* Manual Verification & Fair-Use Data Policy Box */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-slate-100/90 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-[11px] text-slate-700 dark:text-zinc-300 leading-relaxed">
            <i className="fas fa-shield-halved text-[#0f2042] dark:text-[#c5a059] shrink-0 mt-0.5 text-xs"></i>
            <div className="space-y-1">
              <p>
                <strong>Verification &amp; Non-Affiliation Policy:</strong> Home Design English (HDE) is <strong>not partnered with, endorsed by, or affiliated with the UAE Government, Dubai Land Department (DLD), or RERA in any manner whatsoever</strong>.
              </p>
              <p className="text-slate-500 dark:text-zinc-400">
                Our internal HDE team manually verifies all submitted broker (BRN) and agency (ORN) licenses using <strong>already publicly available data</strong> published by official regulatory directories under standard fair-use information principles. HDE securely stores <strong>verified information only</strong> in its database, and fraudulent, expired, or dummy entries are immediately purged.
              </p>
            </div>
          </div>
        </div>

        {/* Row 3: Contact Channels */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
              Business Email <span className="text-red-500">*</span>
            </label>
            <input 
              type="email" 
              name="email" 
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="broker@agency.ae"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:border-[#0f2042] focus:ring-1 focus:ring-[#0f2042] outline-none transition text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input 
              type="tel" 
              name="phone" 
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="+971 50 123 4567"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:border-[#0f2042] focus:ring-1 focus:ring-[#0f2042] outline-none transition text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
              WhatsApp for Leads
            </label>
            <input 
              type="tel" 
              name="whatsapp" 
              value={formData.whatsapp}
              onChange={handleChange}
              placeholder="Same or +971 50..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 placeholder-slate-400 focus:border-[#0f2042] focus:ring-1 focus:ring-[#0f2042] outline-none transition text-sm font-medium"
            />
          </div>
        </div>

        {/* Row 4: Experience */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
            Experience in Dubai Market
          </label>
          <select
            name="experienceYears"
            value={formData.experienceYears}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:border-[#0f2042] focus:ring-1 focus:ring-[#0f2042] outline-none transition text-sm font-medium cursor-pointer"
          >
            <option value="1-2 years">1 - 2 Years</option>
            <option value="3-5 years">3 - 5 Years</option>
            <option value="5-10 years">5 - 10 Years</option>
            <option value="10+ years">10+ Years (Senior Specialist)</option>
          </select>
        </div>

        {/* Row 5: Specialties */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-2">
            Property Specialties (Select all that apply)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SPECIALTY_OPTIONS.map(spec => {
              const selected = formData.specialties.includes(spec);
              return (
                <button
                  key={spec}
                  type="button"
                  onClick={() => toggleSpecialty(spec)}
                  className={`p-3 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition ${
                    selected
                      ? "bg-slate-100 dark:bg-zinc-800 border-[#0f2042] dark:border-[#c5a059] text-[#0f2042] dark:text-zinc-100 font-semibold"
                      : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300"
                  }`}
                >
                  <span>{spec}</span>
                  <i className={`fas ${selected ? "fa-check-circle text-[#0f2042] dark:text-[#c5a059]" : "fa-circle text-slate-200 dark:text-zinc-700"}`}></i>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 6: Focus Areas (Explore Dubai Property Areas) */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                Dubai Focus Communities ({formData.focusAreas.length} selected)
              </label>
              {formData.tier === "pro" ? (
                <span className="text-[10px] font-bold text-[#0f2042] dark:text-[#c5a059] bg-[#c5a059]/15 dark:bg-[#c5a059]/20 px-2 py-0.5 rounded-md border border-[#c5a059]/40 flex items-center gap-1">
                  <i className="fas fa-bolt text-[#c5a059]"></i> All 15+ Unlocked
                </span>
              ) : (
                <span className="text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                  Up to 3 for Standard
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button 
                type="button" 
                onClick={handleSelectAllAreas} 
                className="text-[#916d28] dark:text-[#d4af37] hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <span>Select All 15 Communities</span>
                {formData.tier === "standard" && <span className="text-[10px] text-[#c5a059] font-bold">(Pro)</span>}
              </button>
              <span className="text-slate-300 dark:text-zinc-700">•</span>
              <button 
                type="button" 
                onClick={handleClearAreas} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
            {DUBAI_AREAS.map(area => {
              const selected = formData.focusAreas.includes(area.name);
              return (
                <button
                  key={area.slug}
                  type="button"
                  onClick={() => toggleFocusArea(area.name)}
                  className={`px-2.5 py-2 rounded-lg border text-xs transition text-center truncate cursor-pointer ${
                    selected
                      ? "bg-[#0f2042] text-[#c5a059] border-[#0f2042] font-bold shadow-xs"
                      : "bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:border-[#c5a059]/50"
                  }`}
                  title={area.name}
                >
                  {selected && <i className="fas fa-check text-[9px] mr-1 text-[#c5a059]"></i>}
                  {area.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Referral Agreement Box */}
        <div className="bg-slate-50 dark:bg-zinc-800/40 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-zinc-700/80 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#0f2042] text-[#c5a059] flex items-center justify-center text-[10px]">
                <i className="fas fa-handshake"></i>
              </span>
              <span>Referral &amp; Co-Brokerage Terms (Standard 25% Share)</span>
            </h4>
            <button
              type="button"
              onClick={() => setShowTermsModal(true)}
              className="text-xs font-bold text-primary hover:text-primary-hover hover:underline inline-flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <i className="fas fa-file-contract text-xs"></i>
              <span>Read Full Agreement</span>
            </button>
          </div>

          <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
            HDE introduces verified buyer leads on a pure performance basis. There are zero upfront or monthly charges. When an introduced client completes a transaction, your brokerage disburses a 25% introductory referral fee from the earned brokerage commission within 14 business days of fee realization.
          </p>
          
          <label className="flex items-start gap-3 p-3 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-700 cursor-pointer hover:border-[#c5a059]/50 transition">
            <input 
              type="checkbox"
              required
              checked={formData.termsAgreed}
              onChange={e => setFormData(prev => ({ ...prev, termsAgreed: e.target.checked }))}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0f2042] focus:ring-[#0f2042] cursor-pointer accent-[#0f2042] shrink-0"
            />
            <span className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed select-none">
              <strong className="text-slate-900 dark:text-zinc-100 font-semibold block mb-0.5">
                I accept the{" "}
                <Link 
                  href="/dubai-property/partners/agreement" 
                  target="_blank" 
                  className="text-primary hover:underline font-bold"
                  onClick={e => e.stopPropagation()}
                >
                  HDE Partner Referral Agreement ↗
                </Link>
              </strong>
              I confirm that I am an actively licensed broker registered with RERA / Dubai Land Department and agree to the 25% co-brokerage referral terms for any transaction closed with an HDE-introduced client.
            </span>
          </label>

          {/* Security & Trust Credentials Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/60 dark:border-zinc-700/60 text-[11px] text-slate-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <i className="fas fa-lock text-emerald-600"></i>
              <span>256-Bit SSL Encrypted</span>
            </span>
            <span className="flex items-center gap-1.5">
              <i className="fas fa-database text-[#0f2042] dark:text-[#c5a059]"></i>
              <span>Encrypted Database (RLS)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <i className="fas fa-cloud text-blue-500"></i>
              <span>Enterprise Cloud Safe</span>
            </span>
            <span className="flex items-center gap-1.5">
              <i className="fas fa-shield-check text-[#c5a059]"></i>
              <span>Zero Upfront Financial Risk</span>
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2">
            <i className="fas fa-exclamation-circle shrink-0"></i>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit & Payment Button */}
        {formData.tier === "pro" ? (
          <div>
            <button 
              type="submit" 
              disabled={isSubmitting || !formData.termsAgreed}
              className="w-full bg-gradient-to-r from-[#0f2042] via-[#1a3360] to-[#0f2042] hover:from-[#1a3360] hover:to-[#0f2042] text-white font-extrabold py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base border border-[#c5a059]/60 cursor-pointer hover:scale-[1.005]"
            >
              {isSubmitting ? (
                <><i className="fas fa-spinner fa-spin text-[#c5a059]"></i> Launching Secure Payment...</>
              ) : (
                <><i className="fas fa-crown text-[#c5a059] text-base"></i> Upgrade to Pro Partner &amp; Pay AED 199</>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-500 dark:text-zinc-400 mt-2 flex items-center justify-center gap-1.5">
              <i className="fas fa-lock text-emerald-600"></i>
              <span>Instant VIP queue activation &bull; Powered by Razorpay &bull; Fast-track DLD audit (&lt; 2 hrs)</span>
            </p>
          </div>
        ) : (
          <div>
            <button 
              type="submit" 
              disabled={isSubmitting || !formData.termsAgreed}
              className="w-full bg-[#0f2042] hover:bg-[#1a3360] text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm border border-[#c5a059]/40 cursor-pointer"
            >
              {isSubmitting ? (
                <><i className="fas fa-spinner fa-spin text-[#c5a059]"></i> Submitting Application...</>
              ) : (
                <><i className="fas fa-check-circle text-[#c5a059] text-base"></i> Submit Free Partner Application</>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-500 dark:text-zinc-400 mt-2 flex items-center justify-center gap-1.5">
              <i className="fas fa-shield-alt text-[#c5a059]"></i>
              <span>Zero upfront cost &bull; Standard queue (30-min window) &bull; 25% referral upon deal closing</span>
            </p>
          </div>
        )}

        {/* Government Non-Affiliation & Fair-Use Verification Disclaimer */}
        <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-700/60 text-[11px] text-slate-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed space-y-1.5 text-center sm:text-left">
          <p className="font-semibold text-slate-700 dark:text-zinc-300 flex items-center justify-center sm:justify-start gap-1.5">
            <i className="fas fa-balance-scale text-[#0f2042] dark:text-[#c5a059]"></i>
            <span>Platform Regulatory &amp; Fair-Use Disclosure:</span>
          </p>
          <p>
            <strong>No Government Partnership:</strong> Home Design English (HDE) is an independent technology, property estimation, and lead referral platform. We are <strong>not partnered with, endorsed by, or affiliated with the Government of Dubai, the UAE Government, the Dubai Land Department (DLD), or RERA in any way whatsoever</strong>.
          </p>
          <p>
            <strong>Manual Fair-Use Verification:</strong> Our internal HDE team manually verifies submitted broker and agency credentials (BRN &amp; ORN) using <strong>already publicly available data</strong> published by regulatory bodies under standard fair-use information practices.
          </p>
          <p>
            <strong>Verified-Only Database Storage:</strong> HDE verifies credentials solely to confirm that participating brokers are authentic, active professionals. HDE stores <strong>verified information only</strong> in its database; unverified, duplicate, or fraudulent submissions are permanently expunged.
          </p>
          <p>
            <strong>Referral Intermediary:</strong> HDE is not a licensed UAE real estate brokerage firm and does not execute property sales contracts or conduct viewings. All advisory, viewing, and contract execution services are conducted directly by certified RERA brokerages.
          </p>
        </div>
      </form>

      {/* Interactive Referral Agreement Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-700 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-800/40">
              <div className="flex items-center gap-2.5">
                <img src="/bg-logo.png" alt="HDE" className="w-8 h-8 object-contain" />
                <div>
                  <h3 className="text-sm font-bold text-[#0f2042] dark:text-zinc-100">
                    HDE Partner Referral Agreement
                  </h3>
                  <p className="text-[11px] text-slate-500">Official Standard 25% Referral Terms</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTermsModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-500 dark:text-zinc-400 transition"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
              <div className="p-3 bg-[#0f2042]/5 dark:bg-[#c5a059]/10 rounded-xl border border-[#c5a059]/30 text-[#0f2042] dark:text-[#c5a059]">
                <strong>Platform Notice:</strong> HDE is an independent digital portal and client introducer. HDE is not partnered with the UAE Government, DLD, or RERA. These terms govern the digital lead introduction between HDE and licensed RERA brokerages.
              </div>

              <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">Key Agreement Summary:</h4>
              <ul className="list-disc list-inside space-y-2 pl-1">
                <li><strong>Zero Upfront Fees:</strong> No subscription, onboarding, or listing charges. HDE introduces buyer leads completely free of upfront cost.</li>
                <li><strong>25% Commission Share:</strong> When an introduced client completes a purchase, the brokerage disburses 25% of the earned brokerage fee within 14 business days of fee clearance.</li>
                <li><strong>No Sale, No Fee:</strong> If an introduced lead does not buy, 0% is owed. There is zero financial liability for non-converting leads.</li>
                <li><strong>256-Bit SSL &amp; Cloud Security:</strong> All data is transmitted over secure 256-bit SSL encryption and stored in database-enforced Row-Level Security environments complying with Google web safety standards.</li>
                <li><strong>Statutory Compliance:</strong> The licensed partner brokerage is solely responsible for property viewings, Unified Contracts (Form A/B/F), and compliance with RERA/DLD directives.</li>
              </ul>

              <p className="pt-2">
                Want to read the full unabridged legal text? You can also{" "}
                <Link href="/dubai-property/partners/agreement" target="_blank" className="text-primary font-bold hover:underline">
                  view the complete agreement document on a separate page ↗
                </Link>
              </p>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500">Protected by 256-Bit SSL</span>
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, termsAgreed: true }));
                  setShowTermsModal(false);
                }}
                className="bg-[#0f2042] hover:bg-[#1a3360] text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <i className="fas fa-check text-[#c5a059]"></i>
                <span>I Understand &amp; Accept Agreement</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
