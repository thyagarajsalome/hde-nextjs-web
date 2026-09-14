import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact Us | Home Design English',
  description: 'Get in touch with the Home Design English (HDE) team for technical support, feedback, partnership opportunities, and construction calculator queries.',
  alternates: {
    canonical: '/contact',
  },
};

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 min-h-[70vh] text-slate-800 dark:text-zinc-200">
      <div className="mb-10 text-center md:text-left border-b border-gray-200 dark:border-zinc-800 pb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f2042] dark:text-zinc-100 tracking-tight mb-3">
          Contact Home Design English (HDE)
        </h1>
        <p className="text-base text-gray-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
          Have a question about our construction cost calculators, architectural floor plans, or professional directory? Our engineering and support team is here to assist you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-sm">
          <h2 className="text-xl font-bold text-[#0f2042] dark:text-zinc-100 mb-4 flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-[#c5a059] flex items-center justify-center text-sm">
              <i className="fas fa-envelope"></i>
            </span>
            <span>Direct Support Email</span>
          </h2>
          <p className="text-sm text-gray-600 dark:text-zinc-400 mb-6 leading-relaxed">
            For technical issues, bug reports, subscription inquiries, or feedback regarding calculation algorithms:
          </p>
          <div className="space-y-3 text-sm">
            <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-gray-100 dark:border-zinc-700/60">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Support & Operations</span>
              <a href="mailto:hdeadmin@gmail.com" className="font-bold text-primary hover:underline text-base">
                hdeadmin@gmail.com
              </a>
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              ⚡ Typical response time: 24 to 48 business hours (Monday to Friday, 9:00 AM – 6:00 PM IST).
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-sm">
          <h2 className="text-xl font-bold text-[#0f2042] dark:text-zinc-100 mb-4 flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center text-sm">
              <i className="fas fa-handshake"></i>
            </span>
            <span>Partnerships &amp; Listings</span>
          </h2>
          <p className="text-sm text-gray-600 dark:text-zinc-400 mb-6 leading-relaxed">
            Are you a licensed civil engineer, architect, interior decorator, or material vendor interested in joining our verified network?
          </p>
          <div className="space-y-3 text-sm">
            <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-gray-100 dark:border-zinc-700/60">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Contractor Directory</span>
              <Link href="/register-pro" className="font-bold text-primary hover:underline">
                Register as a Verified Professional &rarr;
              </Link>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-gray-100 dark:border-zinc-700/60">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Explore Directory</span>
              <Link href="/directory" className="font-bold text-slate-700 dark:text-zinc-300 hover:text-primary">
                Browse Listed Building Experts &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-slate-50 dark:bg-zinc-900/60 border border-gray-200/80 dark:border-zinc-800 rounded-3xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-[#0f2042] dark:text-zinc-100 mb-6">
          Frequently Asked Support Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-150 dark:border-zinc-800">
            <h3 className="font-bold text-[#0f2042] dark:text-zinc-100 mb-2">How do I update or download a high-res floor plan?</h3>
            <p className="text-gray-600 dark:text-zinc-400 leading-relaxed text-xs sm:text-sm">
              Pro members can download full architectural blueprint PDFs directly from the <Link href="/plans" className="text-primary underline font-medium">House Plans Gallery</Link> with 2-page structural and financial BOQ breakdowns.
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-150 dark:border-zinc-800">
            <h3 className="font-bold text-[#0f2042] dark:text-zinc-100 mb-2">Are calculations updated for current 2026 material rates?</h3>
            <p className="text-gray-600 dark:text-zinc-400 leading-relaxed text-xs sm:text-sm">
              Yes, our civil engineering database tracks regional material costs (cement bags, TATA Tiscon steel rebar per kg, sand, and aggregates) across major metro zones regularly.
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-150 dark:border-zinc-800">
            <h3 className="font-bold text-[#0f2042] dark:text-zinc-100 mb-2">Can I request a custom floor plan layout?</h3>
            <p className="text-gray-600 dark:text-zinc-400 leading-relaxed text-xs sm:text-sm">
              You can connect with registered architects and draftsmen through our <Link href="/directory" className="text-primary underline font-medium">Professional Directory</Link> to commission bespoke municipal sanction drawings.
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-150 dark:border-zinc-800">
            <h3 className="font-bold text-[#0f2042] dark:text-zinc-100 mb-2">Where can I check Dubai buying cost calculations?</h3>
            <p className="text-gray-600 dark:text-zinc-400 leading-relaxed text-xs sm:text-sm">
              Visit our dedicated <Link href="/dubai-property/calculator" className="text-primary underline font-medium">Dubai Property Buying Calculator</Link> to estimate DLD 4% fees, trustee fees, mortgage charges, and service fees.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}