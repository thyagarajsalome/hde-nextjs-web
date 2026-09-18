// src/app/bangalore/terms/page.tsx
import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Property Listing Terms & Conditions | HDE Bangalore Real Estate",
  description: "Terms and conditions for property listings, seller verifications, and buyer inquiry rules on Home Design English (HDE).",
};

export default function BangaloreTermsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] py-12">
      <div className="container mx-auto px-4 max-w-4xl bg-white rounded-2xl p-8 sm:p-12 border border-gray-200/80 shadow-xs">
        <div className="mb-8 border-b border-gray-100 pb-6">
          <Link href="/bangalore/properties" className="text-primary hover:underline text-xs font-bold flex items-center gap-1.5 mb-2 no-underline">
            <i className="fas fa-arrow-left text-[10px]"></i>
            <span>Back to Bangalore Properties</span>
          </Link>
          <h1 className="text-3xl font-black text-secondary tracking-tight">
            Property Listing Terms &amp; Conditions
          </h1>
          <p className="text-xs text-gray-400 mt-1">Last Updated: September 2026 &bull; Bangalore, Karnataka</p>
        </div>

        <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">1. Scope of the Platform</h2>
            <p>
              Home Design English (&ldquo;HDE&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;) operates an online real estate discovery marketplace connecting property sellers, landlords, prospective purchasers, and tenants within Bangalore and Karnataka. HDE acts solely as an advertising and discovery technology intermediary under Section 79 of the Information Technology Act, 2000.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">2. Accuracy of Listing Information</h2>
            <p>
              By posting any plot, site, flat, apartment, villa, or independent house on HDE, the lister certifies that:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-xs sm:text-sm">
              <li>They are the lawful registered owner of the property, or a duly authorized representative or licensed broker.</li>
              <li>All pricing (sale price, rent, security deposit), built-up area, Khata classification (A Khata vs B Khata), and transit distances are accurate and truthful.</li>
              <li>Stolen, copyrighted, or stock internet photographs are strictly prohibited. All photos must depict the actual physical property.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">3. Karnataka RERA (K-RERA) Compliance for Dealers</h2>
            <p>
              In accordance with Sections 9 and 10 of the Real Estate (Regulation and Development) Act, 2016, any individual or entity operating as a real estate agent, dealer, or consultant must provide their valid Karnataka RERA Registration Number. HDE reserves the right to suspend any commercial dealer listing that fails to provide verified RERA credentials.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">4. Anti-Spam &amp; Phone Number Masking</h2>
            <p>
              To protect property owners from telemarketing abuse and bot scrapers, contact phone numbers are encrypted and masked. Prospective buyers must verify their contact details before unlocking a seller&apos;s phone number. Users may not scrape, harvest, or aggregate contact numbers for unauthorized marketing.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">5. Termination &amp; Takedown</h2>
            <p>
              HDE reserves the unreserved right to edit, suspend, or delete any listing that violates municipal laws, receives verified community fraud complaints, or attempts duplicate bumping.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
