import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import DubaiAgentRegisterForm from '@/components/dubai/DubaiAgentRegisterForm';
import { ALL_PARTNER_SEO_PAGES, AREA_PARTNER_SLUGS, B2B_GUIDE_SLUGS } from '@/data/dubaiPartnerSeoData';

export const metadata: Metadata = {
  title: 'RERA Broker Partner Network | HDE Dubai Real Estate Referral Program',
  description: 'Join the Home Design English (HDE) Dubai RERA Partner Network. Receive pre-qualified buyer and investor leads from India, UK, and worldwide with zero upfront fees.',
  keywords: 'dubai real estate broker partner, rera agent network, dubai property leads, dubai co-brokerage referral, dubai broker referral agreement',
  alternates: {
    canonical: 'https://www.homedesignenglish.com/dubai-property/partners',
  },
  openGraph: {
    title: 'RERA Broker Partner Network | HDE Dubai Property',
    description: 'Receive verified buyer inquiries from India, UK, and worldwide. Zero upfront costs. Performance-based referral program.',
    url: 'https://www.homedesignenglish.com/dubai-property/partners',
    siteName: 'Home Design English',
    type: 'website',
  },
};

const agentFaqs = [
  {
    question: "How does the HDE Partner Network work for Dubai brokers?",
    answer: "HDE attracts high-intent international buyers and investors researching Dubai property. When a prospect requests assistance specifying their preferred community and budget, our platform routes the inquiry directly to verified, RERA-certified partner brokers specializing in that area."
  },
  {
    question: "What is the difference between the Standard and Pro Partner tiers?",
    answer: "Standard Partner is 100% free with zero upfront cost, allowing coverage of up to 3 communities with a standard 30-minute dispatch window. Pro Partner (AED 199 / Year) is designed for top-performing brokers who require immediate competitive advantage: it delivers sub-60-second instant VIP WhatsApp lead dispatch, full coverage across all 15+ Dubai communities, maximum 2-broker exclusivity per inquiry, priority DLD license audit (< 2 hours), and a 'Verified Pro Broker' Gold Seal. Both tiers operate on our fair 25% performance-based co-brokerage referral upon successful closing."
  },
  {
    question: "How are buyer inquiries qualified?",
    answer: "Every lead specifies their exact property goal (Investment, Prime Residential, Off-Plan, Ready to Move), their preferred Dubai community (from our 15 featured areas), estimated budget, and provides verified phone/WhatsApp contact information with regulatory consent."
  },
  {
    question: "What are the eligibility requirements to join?",
    answer: "Brokers must hold an active Broker Registration Number (BRN) issued by RERA and be affiliated with an actively registered Dubai real estate brokerage holding a valid Office Registration Number (ORN) with the Dubai Land Department."
  },
  {
    question: "How quickly are leads dispatched?",
    answer: "Approved partner brokers receive instant notifications via WhatsApp and Email as soon as a matching inquiry is submitted for their selected communities."
  },
  {
    question: "Is HDE affiliated with or partnered with the Dubai Government or RERA?",
    answer: "No. Home Design English (HDE) is strictly an independent real estate technology, calculator, and lead referral platform. We are not partnered with or affiliated with the Dubai Government, Dubai Land Department (DLD), or RERA in any way whatsoever. Our internal team manually verifies all submitted broker numbers (BRN) and agency licenses (ORN) against already publicly available official registers under standard fair-use information policies, ensuring our database contains verified, authentic information only."
  }
];

export default function DubaiPartnersPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.homedesignenglish.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Dubai Property",
        "item": "https://www.homedesignenglish.com/dubai-property"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Partner Network",
        "item": "https://www.homedesignenglish.com/dubai-property/partners"
      }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": agentFaqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] dark:bg-zinc-950 pb-20">
      <Script id="breadcrumb-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* HDE Branded Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#fcfbf7] to-[#f6f8fb] dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-950 border-b border-[#c5a059]/20 dark:border-zinc-800 py-16 sm:py-20 px-6">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#c5a059]/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto text-center">
          {/* HDE Logo Brand Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white dark:bg-zinc-900 border border-[#c5a059]/40 shadow-xs mb-6">
            <img src="/bg-logo.png" alt="HDE Logo" className="w-6 h-6 object-contain" />
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#0f2042] dark:text-zinc-100">
              HDE <span className="text-[#c5a059]">|</span> Partner Network
            </span>
            <span className="h-3.5 w-px bg-slate-200 dark:bg-zinc-700"></span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              UAE Chapter
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#0f2042] dark:text-zinc-100 mb-5 tracking-tight">
            Connect with High-Intent <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c5a059] via-[#d4af37] to-[#b38e47]">
              Dubai Property Buyers
            </span>
          </h1>
          
          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Partner with HDE to receive verified buyer and investor inquiries from India, the UK, Europe, and the GCC. Zero upfront or monthly fees — performance-based 25% co-brokerage referral.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-3 text-xs sm:text-sm text-slate-700 dark:text-zinc-300">
            <span className="inline-flex items-center gap-2 bg-white dark:bg-zinc-800/80 px-4 py-2 rounded-xl border border-[#c5a059]/30 shadow-xs font-semibold">
              <i className="fas fa-check-circle text-[#c5a059]"></i> Zero Upfront / Monthly Cost
            </span>
            <span className="inline-flex items-center gap-2 bg-white dark:bg-zinc-800/80 px-4 py-2 rounded-xl border border-[#c5a059]/30 shadow-xs font-semibold">
              <i className="fab fa-whatsapp text-emerald-600"></i> Direct WhatsApp &amp; Email Leads
            </span>
            <span className="inline-flex items-center gap-2 bg-white dark:bg-zinc-800/80 px-4 py-2 rounded-xl border border-[#c5a059]/30 shadow-xs font-semibold">
              <i className="fas fa-handshake text-[#0f2042] dark:text-[#c5a059]"></i> 25% Referral Upon Deal Closing
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-14 px-6 max-w-5xl mx-auto">
        {/* 3 HDE Branded Feature Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200/80 hover:border-[#c5a059]/60 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0f2042] to-[#1a3360] text-[#c5a059] flex items-center justify-center text-lg mb-4 font-bold shadow-xs border border-[#c5a059]/20 group-hover:scale-105 transition-transform">
              <i className="fas fa-calculator"></i>
            </div>
            <h3 className="text-base font-bold text-[#0f2042] dark:text-zinc-100 mb-2">High Financial Intent</h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              Our users calculate DLD fees, mortgage down payments, and conversion rates before requesting a consultation, ensuring serious buyer interest.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200/80 hover:border-[#c5a059]/60 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0f2042] to-[#1a3360] text-[#c5a059] flex items-center justify-center text-lg mb-4 font-bold shadow-xs border border-[#c5a059]/20 group-hover:scale-105 transition-transform">
              <i className="fas fa-map-marked-alt"></i>
            </div>
            <h3 className="text-base font-bold text-[#0f2042] dark:text-zinc-100 mb-2">Community Matching</h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              You only receive leads for communities you actively cover — from Downtown Dubai and Marina to JVC and Palm Jumeirah.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200/80 hover:border-[#c5a059]/60 dark:border-zinc-800 shadow-xs hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0f2042] to-[#1a3360] text-[#c5a059] flex items-center justify-center text-lg mb-4 font-bold shadow-xs border border-[#c5a059]/20 group-hover:scale-105 transition-transform">
              <i className="fas fa-certificate"></i>
            </div>
            <h3 className="text-base font-bold text-[#0f2042] dark:text-zinc-100 mb-2">RERA Verified Network</h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              We exclusively partner with brokers holding valid RERA BRN and ORN credentials, maintaining the highest regulatory standards.
            </p>
          </div>
        </div>

        {/* Interactive Partner Tier Selection & Application Form */}
        <div id="register-form" className="scroll-mt-16">
          <DubaiAgentRegisterForm />
        </div>

        {/* FAQs */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h3 className="text-xl font-bold text-[#0f2042] dark:text-zinc-100 mb-6 text-center">
            Frequently Asked Questions for Brokers
          </h3>
          <div className="space-y-3">
            {agentFaqs.map((faq, i) => (
              <div key={i} className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
                <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-100 mb-1.5">{faq.question}</h4>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Community Specialist Desks & Strategy Guides Directory (SEO Hub-and-Spoke Architecture) */}
        <div className="mt-20 pt-12 border-t border-slate-200 dark:border-zinc-800">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-semibold text-[#c5a059] uppercase tracking-wider">Verified Broker Networks</span>
            <h3 className="mt-2 text-2xl font-extrabold text-[#0f2042] dark:text-zinc-100">
              Explore Community Specialist Desks
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
              Dedicated broker referral desks across all 15 premier freehold areas in Dubai.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {AREA_PARTNER_SLUGS.map((slug) => {
              const item = ALL_PARTNER_SEO_PAGES[slug];
              return (
                <Link
                  key={slug}
                  href={`/dubai-property/partners/${slug}`}
                  className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 hover:border-[#c5a059] dark:hover:border-[#c5a059] hover:shadow-xs transition-all group"
                >
                  <p className="text-xs font-bold text-[#0f2042] dark:text-zinc-100 group-hover:text-[#c5a059] transition-colors">
                    {item.areaName} Desk
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                    Yield: {item.stats[0]?.value}
                  </p>
                </Link>
              );
            })}
          </div>

          <div className="mt-12">
            <h4 className="text-base font-bold text-[#0f2042] dark:text-zinc-100 mb-4 text-center sm:text-left">
              B2B Broker Strategy & Co-Brokerage Guides
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {B2B_GUIDE_SLUGS.map((slug) => {
                const item = ALL_PARTNER_SEO_PAGES[slug];
                return (
                  <Link
                    key={slug}
                    href={`/dubai-property/partners/${slug}`}
                    className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 hover:border-[#c5a059] dark:hover:border-[#c5a059] hover:shadow-xs transition-all group"
                  >
                    <span className="text-[10px] font-bold text-[#c5a059] uppercase tracking-wider block mb-1">
                      Resource Guide
                    </span>
                    <p className="text-xs font-bold text-[#0f2042] dark:text-zinc-100 group-hover:text-[#c5a059] transition-colors line-clamp-2">
                      {item.headline}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Return link */}
        <div className="mt-14 text-center">
          <Link 
            href="/dubai-property" 
            className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-semibold text-xs tracking-wide transition"
          >
            <i className="fas fa-arrow-left text-[10px]"></i>
            <span>Return to Dubai Property Advisor</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
