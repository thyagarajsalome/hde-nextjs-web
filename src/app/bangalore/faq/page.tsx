// src/app/bangalore/faq/page.tsx
import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Bangalore Real Estate FAQs | HDE Property Guide",
  description: "Comprehensive answers to Bangalore real estate questions: A Khata vs B Khata, K-RERA agent verification, posting free listings, and transit connectivity.",
};

export default function BangaloreFaqPage() {
  const faqs = [
    {
      q: "How does HDE protect me from broker telemarketing spam?",
      a: "Unlike traditional property classifieds that broadcast phone numbers across telemarketing syndicates, HDE protects seller numbers behind high-intent lead verification. Numbers are unmasked only for verified buyers who declare genuine purchase timelines."
    },
    {
      q: "What is the difference between A Khata and B Khata in Bangalore?",
      a: "A Khata is issued by BBMP for properties adhering to all town planning bylaws and layout sanctions; banks readily approve home loans on A Khata properties. B Khata is simply a municipal property tax register for unregularized revenue layouts. While B Khata sites can be bought and sold, nationalized bank home loans are typically restricted."
    },
    {
      q: "Why do you require K-RERA numbers for real estate agents?",
      a: "Under the Real Estate (Regulation and Development) Act (RERA), commercial brokers in Karnataka are legally required to hold an active K-RERA registration. Verifying this number filters out fraudulent fly-by-night operators and builds deep trust with buyers."
    },
    {
      q: "How does the client-side photo compression work?",
      a: "When you select photos from your smartphone, your browser automatically resizes them to 800x600 px (4:3) and converts them into ultra-compact WebP format (<60 KB). This conserves mobile bandwidth and ensures pages load instantly across Bangalore."
    },
    {
      q: "Are transit distances guaranteed accurate?",
      a: "Transit distances to Kempegowda International Airport, Metro stops, and tech corridors are approximate road distances. We recommend conducting physical site visits during peak office commute hours to gauge real-time traffic."
    },
    {
      q: "Can I get home loan assistance through HDE?",
      a: "Yes! When you unlock an owner's contact details, simply tick 'I am interested in home loan' to receive competitive financing offers from leading Indian banks (HDFC, SBI, ICICI, Axis)."
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-gray-200/80 shadow-xs mb-8">
          <Link href="/bangalore/properties" className="text-primary hover:underline text-xs font-bold flex items-center gap-1.5 mb-3 no-underline">
            <i className="fas fa-arrow-left text-[10px]"></i>
            <span>Back to Bangalore Properties</span>
          </Link>
          <h1 className="text-3xl font-black text-secondary tracking-tight">
            Bangalore Real Estate Frequently Asked Questions
          </h1>
          <p className="text-xs text-gray-500 mt-2">
            Everything you need to know about buying, selling, and renting properties in Bangalore.
          </p>

          <div className="mt-8 space-y-4">
            {faqs.map((item, idx) => (
              <details key={idx} className="group p-5 rounded-xl border border-gray-200 bg-gray-50/50 open:bg-white open:ring-1 open:ring-primary/20 transition-all">
                <summary className="font-bold text-gray-800 text-sm sm:text-base cursor-pointer list-none flex justify-between items-center">
                  <span>{item.q}</span>
                  <span className="text-primary group-open:rotate-180 transition-transform">
                    <i className="fas fa-chevron-down text-xs"></i>
                  </span>
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {item.a}
                </p>
              </details>
            ))}
          </div>

          <div className="mt-10 p-6 bg-primary/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-secondary">Ready to sell or rent your property?</h3>
              <p className="text-xs text-gray-600 mt-0.5">Post in under 3 minutes with zero telemarketing spam.</p>
            </div>
            <Link
              href="/bangalore/post-property"
              className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-extrabold text-xs rounded-xl no-underline transition-all text-center flex-shrink-0"
            >
              Post Property Free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
