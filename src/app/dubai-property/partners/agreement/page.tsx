import React, { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import PrintAgreementButton from "./PrintButton";

export const metadata: Metadata = {
  title: "Partner Referral Agreement | Home Design English (HDE)",
  description: "Official introductory referral agreement and terms of partnership between Home Design English and licensed Dubai RERA real estate brokers.",
};

export default function PartnerAgreementPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] dark:bg-zinc-950 py-8 sm:py-12 px-4 sm:px-6 print:bg-white print:p-0 print:m-0">
      <div className="max-w-4xl mx-auto print:max-w-none print:w-full">
        {/* Breadcrumb Header - Hidden on Print */}
        <div className="mb-5 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 print:hidden">
          <div className="flex items-center gap-2">
            <Link href="/dubai-property" className="hover:text-primary transition">Dubai Property</Link>
            <span>/</span>
            <Link href="/dubai-property/partners" className="hover:text-primary transition">Partner Network</Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-zinc-100 font-semibold">Referral Agreement</span>
          </div>

          <Suspense fallback={null}>
            <PrintAgreementButton variant="secondary" />
          </Suspense>
        </div>

        {/* Main Document Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200/90 dark:border-zinc-800 p-6 sm:p-10 mb-8 relative overflow-hidden print:shadow-none print:border-none print:p-4 print:rounded-none">
          {/* Top Brand Gradient Accent - Hidden on Print */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0f2042] via-[#c5a059] to-[#0f2042] print:hidden"></div>

          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-200/80 dark:border-zinc-800">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-zinc-800 p-1.5 border border-[#c5a059]/30 flex items-center justify-center shrink-0 print:border-slate-300">
                <img src="/bg-logo.png" alt="HDE Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#c5a059]">Official Broker Agreement</span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#0f2042] dark:text-zinc-100 tracking-tight">
                  HDE Partner Referral Agreement
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Standard 25% Co-Brokerage Client Introduction Terms • Ref: HDE-UAE-RERA-2026
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto print:hidden">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                <i className="fas fa-lock text-xs"></i> 256-Bit SSL
              </span>
              <Suspense fallback={null}>
                <PrintAgreementButton />
              </Suspense>
            </div>
          </div>

          {/* Quick Summary Strip (Compact) */}
          <div className="grid grid-cols-3 gap-3 mb-6 print:gap-2">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700 text-center sm:text-left print:border-slate-300 print:bg-slate-50">
              <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Cost to Broker</span>
              <p className="text-sm sm:text-base font-extrabold text-[#0f2042] dark:text-zinc-100">Zero Upfront</p>
              <p className="text-[10px] text-slate-500">No monthly or listing fees</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700 text-center sm:text-left print:border-slate-300 print:bg-slate-50">
              <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Referral Share</span>
              <p className="text-sm sm:text-base font-extrabold text-[#c5a059]">25% Commission</p>
              <p className="text-[10px] text-slate-500">Only upon closed deal</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700 text-center sm:text-left print:border-slate-300 print:bg-slate-50">
              <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">Unclosed Inquiries</span>
              <p className="text-sm sm:text-base font-extrabold text-slate-700 dark:text-zinc-300">0% Liability</p>
              <p className="text-[10px] text-slate-500">No fee if client does not buy</p>
            </div>
          </div>

          {/* Legal Text - Tightened Paragraphs Without Excessive Gap */}
          <div className="text-xs sm:text-[13px] text-slate-700 dark:text-zinc-300 space-y-4 leading-relaxed print:text-black print:text-xs">
            {/* Preamble Box */}
            <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-amber-950 dark:text-amber-200 text-xs leading-relaxed print:border-slate-300 print:bg-transparent">
              <strong>Preamble &amp; Platform Status:</strong> Home Design English (homedesignenglish.com, &quot;HDE&quot; or &quot;Platform&quot;) operates as an independent digital property technology, cost estimation, and lead referral platform. HDE is <strong>not partnered with, endorsed by, or affiliated with the Government of Dubai, the Dubai Land Department (DLD), or the Real Estate Regulatory Agency (RERA) in any manner whatsoever</strong>. This Agreement governs the digital client introduction between HDE and licensed real estate brokerages.
            </div>

            {/* Section 1 */}
            <section className="break-inside-avoid">
              <h3 className="text-sm font-bold text-[#0f2042] dark:text-zinc-100 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <span className="text-[#c5a059]">1.</span> Scope of Introductory Referral Services
              </h3>
              <p className="text-slate-600 dark:text-zinc-400">
                1.1. HDE generates qualified international inquiries for Dubai real estate from active property buyers and investors across India, the United Kingdom, Europe, North America, and the GCC.<br />
                1.2. HDE agrees to route matching client inquiries to the registered Broker or Brokerage Agency (&quot;Partner&quot;) based on the Partner’s selected Dubai focus communities and property specialties.<br />
                1.3. HDE operates on a <strong>pure performance model</strong>. There are zero onboarding charges, zero monthly platform retainers, and zero fees for receiving client introductions.
              </p>
            </section>

            {/* Section 2 */}
            <section className="break-inside-avoid">
              <h3 className="text-sm font-bold text-[#0f2042] dark:text-zinc-100 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <span className="text-[#c5a059]">2.</span> Referral Commission &amp; Disbursement Terms
              </h3>
              <p className="text-slate-600 dark:text-zinc-400">
                2.1. In consideration for the digital introduction, the Partner agrees to disburse an introductory referral fee of <strong>twenty-five percent (25%)</strong> of the total net brokerage commission earned and collected by the Partner Agency on any closed transaction involving an HDE-introduced client.<br />
                2.2. The referral fee is due and payable within <strong>fourteen (14) business days</strong> following actual receipt and clearance of the brokerage commission from the developer, seller, or conveyancing trustee.<br />
                2.3. <strong>No Sale, No Fee:</strong> If an introduced client does not complete a transaction, or if the sale is cancelled without commission realization, the Partner owes zero fees or damages to HDE.
              </p>
            </section>

            {/* Section 3 */}
            <section className="break-inside-avoid">
              <h3 className="text-sm font-bold text-[#0f2042] dark:text-zinc-100 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <span className="text-[#c5a059]">3.</span> Platform Trust, Security &amp; Data Safeguards
              </h3>
              <div className="space-y-1.5 text-slate-600 dark:text-zinc-400">
                <p>
                  <strong>3.1. 256-Bit SSL/TLS Encryption:</strong> All information transmitted through HDE is encrypted in transit using certified 256-bit SSL/TLS digital protocols, preventing unauthorized interception of personal or business contact details.
                </p>
                <p>
                  <strong>3.2. Google &amp; Enterprise Cloud Standards:</strong> The platform is engineered on secure enterprise cloud infrastructure conforming to strict Google Safe Browsing, HTTPS security protocols, and international data transmission benchmarks.
                </p>
                <p>
                  <strong>3.3. Database Row-Level Security (RLS):</strong> Sensitive broker records, including Dubai Land Department license numbers (BRN/ORN), private telephone numbers, and client assignments are safeguarded behind database-enforced Row-Level Security accessible exclusively by authorized platform administrators.
                </p>
                <p>
                  <strong>3.4. Fair-Use Public Directory Verification:</strong> To protect buyers from fraudulent representation, HDE review staff manually cross-reference submitted broker credentials against official, publicly available Dubai Land Department directories under fair-use information policies. HDE stores <strong>verified information only</strong> in its systems.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="break-inside-avoid">
              <h3 className="text-sm font-bold text-[#0f2042] dark:text-zinc-100 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <span className="text-[#c5a059]">4.</span> Division of Regulatory Responsibilities
              </h3>
              <p className="text-slate-600 dark:text-zinc-400">
                4.1. <strong>Exclusive Brokerage Prerogative:</strong> All statutory real estate activities in the UAE—including property viewings, Form A/B/F generation, title deed verification, sale-and-purchase agreements, escrow deposits, and AML/KYC compliance—are the sole regulatory responsibility of the licensed Partner Agency.<br />
                4.2. HDE is an introductory technology portal and does not act as an escrow agent, legal advisor, or conveyancing trustee.
              </p>
            </section>

            {/* Section 5 */}
            <section className="break-inside-avoid">
              <h3 className="text-sm font-bold text-[#0f2042] dark:text-zinc-100 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <span className="text-[#c5a059]">5.</span> Non-Circumvention &amp; Data Privacy
              </h3>
              <p className="text-slate-600 dark:text-zinc-400">
                5.1. The Partner agrees in good faith not to circumvent HDE by transferring introduced clients to unverified third parties for the purpose of avoiding the introductory referral fee.<br />
                5.2. Both parties agree to handle client personal information with strict confidentiality in accordance with international data protection standards and the UAE Federal Personal Data Protection Law (Federal Decree-Law No. 45 of 2021).
              </p>
            </section>

            {/* Section 6 */}
            <section className="break-inside-avoid">
              <h3 className="text-sm font-bold text-[#0f2042] dark:text-zinc-100 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <span className="text-[#c5a059]">6.</span> Electronic Consent &amp; Legal Assent
              </h3>
              <p className="text-slate-600 dark:text-zinc-400">
                Pursuant to UAE Federal Decree-Law No. 46 of 2021 on Electronic Transactions and Trust Services, checking the digital consent box on the HDE Partner Application form constitutes valid, legally recognized mutual assent to these referral terms.
              </p>
            </section>

            {/* Official Electronic Execution / Signature Record Block (Included in Print) */}
            <div className="mt-8 pt-5 border-t-2 border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50/80 dark:bg-zinc-800/40 p-4 sm:p-5 rounded-xl break-inside-avoid print:bg-transparent print:border-slate-400">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0f2042] dark:text-zinc-100 flex items-center gap-1.5">
                  <i className="fas fa-file-signature text-[#c5a059]"></i>
                  <span>Digital Execution &amp; Acceptance Record</span>
                </h4>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  Electronic Assent Valid
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="border-t border-slate-200 dark:border-zinc-700 pt-2 print:border-slate-300">
                  <p className="font-bold text-slate-800 dark:text-zinc-200">Platform Operator:</p>
                  <p className="text-slate-600 dark:text-zinc-400">Home Design English (HDE)</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Technology &amp; Client Introduction Portal</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Signed Electronically by HDE Administration</p>
                </div>
                <div className="border-t border-slate-200 dark:border-zinc-700 pt-2 print:border-slate-300">
                  <p className="font-bold text-slate-800 dark:text-zinc-200">Registered Partner Broker:</p>
                  <p className="text-slate-600 dark:text-zinc-400">DLD / RERA Licensee (BRN / ORN on File)</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Status: Verified Electronic Partner Application</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Signed Electronically upon Form Submission</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs - Hidden on Print */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                href="/dubai-property/partners#register-form"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0f2042] hover:bg-[#1a3360] text-white font-bold px-6 py-3 rounded-xl transition text-xs shadow-xs border border-[#c5a059]/40 cursor-pointer"
              >
                <i className="fas fa-arrow-left text-[#c5a059]"></i>
                <span>Return to Application Form</span>
              </Link>

              <Suspense fallback={null}>
                <PrintAgreementButton variant="secondary" />
              </Suspense>
            </div>

            <a
              href="mailto:hdeadmin@gmail.com?subject=Inquiry%20Regarding%20HDE%20Partner%20Referral%20Agreement"
              className="text-xs text-slate-500 dark:text-zinc-400 hover:text-primary transition inline-flex items-center gap-1.5"
            >
              <i className="fas fa-envelope text-[#c5a059]"></i>
              <span>Questions? Contact HDE Admin</span>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
