import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HDE Developer Admin Hub | Home Design English',
  description: 'Administrative management center for HDE galleries, real estate, and system health.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPortalHubPage() {
  const sections = [
    {
      title: 'Architectural Plans & Blueprints (Store Manager)',
      description: 'Official upload center for vector working drawing PDFs to Cloudflare R2, pricing tiers (₹499/₹999), and blueprint catalog management.',
      href: '/admin/plans',
      icon: 'fa-file-pdf',
      badge: '★ PDF Blueprints',
      accent: 'border-[#c5a059]/40 bg-gradient-to-br from-amber-50/40 via-white to-slate-50',
      iconColor: 'text-[#0f2042]',
      links: [
        { label: '📄 Upload & Manage PDF Plans (CRUD)', href: '/admin/plans' },
        { label: '🛒 View Public Drawing Store', href: '/plans/store' },
      ],
    },
    {
      title: 'Photo Inspiration Galleries (9:16 Vertical Photos)',
      description: 'Upload 9:16 vertical photos and reels for Modular Kitchens and Modern Bathrooms (interior design photo inspiration, not floor plans).',
      href: '/admin/gallery/kitchen',
      icon: 'fa-images',
      badge: 'Photo Galleries',
      accent: 'border-slate-200 bg-white',
      iconColor: 'text-[#0f2042]',
      links: [
        { label: 'Modular Kitchen Photos', href: '/admin/gallery/kitchen' },
        { label: 'Bathroom Photos', href: '/admin/gallery/bathroom' },
      ],
    },
    {
      title: 'Bangalore Real Estate Admin',
      description: 'Review and manage verified property listings, community scout leads, direct owner contacts, and deal closures.',
      href: '/admin/real-estate',
      icon: 'fa-building-user',
      badge: 'Real Estate & Leads',
      accent: 'border-emerald-200/80 bg-gradient-to-br from-emerald-50/30 via-white to-slate-50',
      iconColor: 'text-emerald-700',
      links: [
        { label: 'Live Marketplace', href: '/bangalore/properties' },
        { label: 'Referral Board', href: '/bangalore/referrals' },
      ],
    },
    {
      title: 'System & Database Health Diagnostics',
      description: 'Audit live Supabase database connectivity, Cloudflare R2 bucket storage, and environment configuration latency.',
      href: '/admin/health',
      icon: 'fa-heart-pulse',
      badge: 'System Diagnostics',
      accent: 'border-blue-200/80 bg-gradient-to-br from-blue-50/30 via-white to-slate-50',
      iconColor: 'text-blue-700',
      links: [
        { label: 'System Health Check', href: '/admin/health' },
      ],
    },
    {
      title: 'CAD Video Tutorials Masterclass',
      description: 'Add, edit, delete, and reorder 16:9 widescreen YouTube tutorials for all drafting tools in HDE Studio CAD.',
      href: '/admin/tutorials',
      icon: 'fa-film',
      badge: 'Video Masterclass',
      accent: 'border-rose-200/80 bg-gradient-to-br from-rose-50/30 via-white to-slate-50',
      iconColor: 'text-rose-600',
      links: [
        { label: 'Manage Video Tutorials (CRUD)', href: '/admin/tutorials' },
        { label: 'View Live Gallery', href: '/download#tutorials' },
      ],
    },
    {
      title: 'Marketing & Brevo Email Audience',
      description: 'Export all registered platform users as a Brevo-ready CSV contact list for marketing and promotional email campaigns.',
      href: 'https://ncontvjtfhsabphxfuhb.supabase.co/functions/v1/export-users?format=csv',
      icon: 'fa-envelope-open-text',
      badge: 'Brevo Audience Sync',
      accent: 'border-amber-200/80 bg-gradient-to-br from-amber-50/30 via-white to-slate-50',
      iconColor: 'text-[#0f2042]',
      links: [
        { label: '📥 Download Brevo CSV Contacts', href: 'https://ncontvjtfhsabphxfuhb.supabase.co/functions/v1/export-users?format=csv' },
      ],
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Overview Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#0f2042] text-[#c5a059] flex items-center justify-center text-sm shadow-xs font-black">
                <i className="fas fa-shield-halved"></i>
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0f2042] tracking-tight">
                Developer Command Center
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              Central unified administration hub for HDE. Manage PDF blueprint uploads, photo galleries, real estate leads, database backups, and health diagnostics.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="px-3 py-1.5 rounded-xl bg-[#c5a059]/15 text-[#0f2042] border border-[#c5a059]/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Superadmin Active
            </span>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sections.map((sec) => (
          <div
            key={sec.title}
            className={`p-6 rounded-2xl border shadow-xs transition-all flex flex-col justify-between ${sec.accent}`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className={`w-11 h-11 rounded-xl bg-white shadow-xs flex items-center justify-center text-lg ${sec.iconColor} border border-slate-200/70`}>
                  <i className={`fas ${sec.icon}`}></i>
                </div>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-white shadow-2xs border border-slate-200 text-[#0f2042] uppercase tracking-wider">
                  {sec.badge}
                </span>
              </div>

              <div>
                <h2 className="text-base font-bold text-[#0f2042] leading-snug">{sec.title}</h2>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{sec.description}</p>
              </div>

              {sec.links && (
                <div className="pt-3 border-t border-slate-200/60 flex flex-wrap gap-1.5 text-[11px] font-semibold">
                  {sec.links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 transition border border-slate-200/70 no-underline shadow-2xs"
                    >
                      {link.label} &rarr;
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-5">
              <Link
                href={sec.href}
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#0f2042] hover:bg-[#1a3360] text-white font-bold text-xs shadow-xs transition-all no-underline cursor-pointer"
              >
                <span>Open {sec.badge}</span>
                <i className="fas fa-arrow-right text-[10px] text-[#c5a059]"></i>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
