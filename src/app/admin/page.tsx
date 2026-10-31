import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HDE Administration Portal | Home Design English',
  description: 'Administrative management center for HDE galleries, real estate, and system health.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPortalHubPage() {
  const sections = [
    {
      title: 'Architectural Plans & Blueprints (UPLOAD PDF PLANS HERE)',
      description: '★ OFFICIAL PLACE TO UPLOAD PDF PLANS. Upload high-res vector working drawing PDFs to Cloudflare R2, set ₹499/₹999 prices, auto-calculate room dimensions, and sell downloadable house designs.',
      href: '/admin/plans',
      icon: 'fa-file-pdf',
      badge: '★ Upload PDF Plans Here',
      accent: 'border-blue-600/50 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20',
      links: [
        { label: '📄 Upload & Manage PDF Plans (CRUD)', href: '/admin/plans' },
        { label: '🛒 View Public Drawing Store', href: '/plans/store' },
      ],
    },
    {
      title: 'Photo Inspiration Galleries (9:16 Vertical Images Only)',
      description: 'Upload 9:16 vertical mobile photos and reels for Modular Kitchens and Bathroom Galleries (for interior design inspiration, NOT for floor plans or PDFs).',
      href: '/admin/gallery',
      icon: 'fa-images',
      badge: '9:16 Vertical Photos',
      accent: 'border-slate-300/60 bg-slate-500/5 text-slate-700',
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
      badge: 'Real Estate',
      accent: 'border-emerald-500/40 bg-emerald-500/5 text-emerald-700',
      links: [
        { label: 'Live Marketplace', href: '/bangalore/properties' },
        { label: 'Referral Board', href: '/bangalore/referrals' },
      ],
    },
    {
      title: 'System & Database Health',
      description: 'Audit live Supabase database connectivity, Cloudflare R2 bucket storage, and environment configuration.',
      href: '/admin/health',
      icon: 'fa-heart-pulse',
      badge: 'Diagnostics',
      accent: 'border-purple-500/40 bg-purple-500/5 text-purple-700',
      links: [
        { label: 'System Health Check', href: '/admin/health' },
      ],
    },
    {
      title: 'CAD Video Tutorials Manager',
      description: 'Add, edit, delete, and reorder 16:9 widescreen YouTube tutorials for all 20 drafting tools in HDE Studio CAD.',
      href: '/admin/tutorials',
      icon: 'fa-film',
      badge: 'Video Masterclass',
      accent: 'border-red-500/40 bg-red-500/5 text-red-600',
      links: [
        { label: 'Manage Video Tutorials (CRUD)', href: '/admin/tutorials' },
        { label: 'View Live Gallery', href: '/download#tutorials' },
      ],
    },
    {
      title: 'Desktop CAD License Telemetry',
      description: 'Live monitor for HDE Studio activations, device bindings, and real-time failure alerts across all users.',
      href: '/admin/health#desktop-licenses',
      icon: 'fa-key',
      badge: 'Licensing',
      accent: 'border-amber-500/40 bg-amber-500/5 text-amber-700',
      links: [
        { label: 'Live Telemetry & Alerts', href: '/admin/health#desktop-licenses' },
      ],
    },
    {
      title: 'Marketing & Brevo Email Audience',
      description: 'Export all registered platform users as a Brevo-ready CSV contact list for marketing and promotional email campaigns.',
      href: 'https://ncontvjtfhsabphxfuhb.supabase.co/functions/v1/export-users?format=csv',
      icon: 'fa-envelope-open-text',
      badge: 'Brevo Sync',
      accent: 'border-emerald-500/40 bg-emerald-500/5 text-emerald-700',
      links: [
        { label: '📥 Download Brevo CSV Contacts', href: 'https://ncontvjtfhsabphxfuhb.supabase.co/functions/v1/export-users?format=csv' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Breadcrumb Header */}
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold mb-2">
            <Link href="/" className="hover:text-[#4165af]">Home</Link>
            <span>/</span>
            <span className="text-[#4165af] font-bold">Admin Portal</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-blue-50 text-[#4165af] flex items-center justify-center text-lg border border-blue-100">
                  <i className="fas fa-shield-halved"></i>
                </span>
                <span>HDE Platform Administration</span>
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Central control panel for content galleries, real estate management, and platform diagnostics.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs no-underline"
            >
              <i className="fas fa-arrow-left text-[10px]"></i>
              <span>Back to Website</span>
            </Link>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((sec) => (
            <div
              key={sec.title}
              className={`p-6 rounded-2xl border-2 transition-all flex flex-col justify-between ${sec.accent}`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-xs flex items-center justify-center text-xl text-[#4165af] border border-gray-100">
                    <i className={`fas ${sec.icon}`}></i>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white shadow-2xs border border-gray-100 uppercase tracking-wider">
                    {sec.badge}
                  </span>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">{sec.title}</h2>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{sec.description}</p>
                </div>

                {sec.links && (
                  <div className="pt-2 border-t border-gray-200/50 flex flex-wrap gap-1.5 text-[11px] font-semibold">
                    {sec.links.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        className="px-2 py-1 rounded bg-white/80 hover:bg-white text-slate-700 transition border border-gray-200/60 no-underline"
                      >
                        {link.label} &rarr;
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-6">
                <Link
                  href={sec.href}
                  className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#4165af] hover:bg-[#325291] text-white font-bold text-xs shadow-md transition-all no-underline"
                >
                  <span>Open {sec.badge}</span>
                  <i className="fas fa-arrow-right text-[10px]"></i>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
