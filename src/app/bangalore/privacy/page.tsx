// src/app/bangalore/privacy/page.tsx
import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Real Estate Buyer Lead Privacy Policy | HDE Bangalore",
  description: "Privacy policy for buyer inquiries, contact unlocks, and home loan lead sharing on Home Design English.",
};

export default function BangalorePrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] py-12">
      <div className="container mx-auto px-4 max-w-4xl bg-white rounded-2xl p-8 sm:p-12 border border-gray-200/80 shadow-xs">
        <div className="mb-8 border-b border-gray-100 pb-6">
          <Link href="/bangalore/properties" className="text-primary hover:underline text-xs font-bold flex items-center gap-1.5 mb-2 no-underline">
            <i className="fas fa-arrow-left text-[10px]"></i>
            <span>Back to Bangalore Properties</span>
          </Link>
          <h1 className="text-3xl font-black text-secondary tracking-tight">
            Real Estate Lead &amp; Inquiry Privacy Policy
          </h1>
          <p className="text-xs text-gray-400 mt-1">Data Protection &bull; Digital Personal Data Protection (DPDP) Act Compliance</p>
        </div>

        <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">1. What Information We Collect</h2>
            <p>
              When you submit the &ldquo;Please share your details to view number&rdquo; modal on any Bangalore property listing, we collect:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-xs sm:text-sm">
              <li>Your Full Name and 10-Digit Mobile Number.</li>
              <li>Your role classification (Individual Buyer/Tenant or Property Dealer).</li>
              <li>Your expected purchase timeline (within 3 months, 6 months, or long term).</li>
              <li>Your explicit consent flags regarding home loan interest and site visit coordination.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">2. How Your Contact Is Used</h2>
            <p>
              Your contact number is delivered strictly to the specific owner, agent, or builder of the property you chose to unlock so they can respond to your query.
            </p>
            <p className="mt-2">
              <strong>Zero Telemarketing Abuse:</strong> We never sell your number to indiscriminate spam syndicates or call centers. If you checked the &ldquo;I am interested in home loan&rdquo; box, your inquiry is securely shared with our licensed banking DSA partners to provide competitive loan quotes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">3. Storage &amp; Security</h2>
            <p>
              Lead records are encrypted at rest and transmitted using TLS 1.3 encryption. We implement IP hashing and rate limiting to prevent malicious harvesting of buyer data.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
