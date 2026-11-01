"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { supabase } from "@/config/supabaseClient";

export const ADMIN_EMAIL = "thyagaraja1983@gmail.com";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard Hub", icon: "fa-gauge-high" },
  { href: "/admin/plans", label: "PDF Blueprints & Store", icon: "fa-file-pdf", highlight: true },
  { href: "/admin/gallery/kitchen", label: "Modular Kitchen Gallery", icon: "fa-kitchen-set" },
  { href: "/admin/gallery/bathroom", label: "Bathroom Designs", icon: "fa-bath" },
  { href: "/admin/real-estate", label: "Real Estate & Leads", icon: "fa-building-user" },
  { href: "/admin/tutorials", label: "CAD Tutorials Masterclass", icon: "fa-film" },
  { href: "/admin/health", label: "Diagnostics & Health", icon: "fa-heart-pulse" },
];

export default function GlobalAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isDeveloper, signOut } = useUser();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Show verifying state while checking Supabase auth session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl mx-auto border border-amber-500/20">
            <i className="fas fa-shield-halved fa-spin"></i>
          </div>
          <p className="text-sm font-bold text-slate-200">Verifying Admin Access...</p>
          <p className="text-xs text-slate-500">Restricted HDE Administrative Portal</p>
        </div>
      </div>
    );
  }

  // Strict email whitelist verification or Developer Access
  const isAdmin = Boolean(
    (user && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) ||
    isDeveloper
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-2xl mx-auto border border-rose-500/20">
            <i className="fas fa-lock"></i>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full inline-block">
              Restricted Security Zone
            </span>
            <h1 className="text-2xl font-black text-white">
              Private Admin Access Only
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Administrative functions, database telemetry, photo uploads, and CAD masterclass management are strictly restricted to <strong>{ADMIN_EMAIL}</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-left space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span>Required Role:</span>
              <span className="font-bold text-amber-400">Platform Superadmin</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Current Session:</span>
              <span className="font-bold text-rose-400">
                {user ? `${user.email} (Unauthorized)` : "Not signed in"}
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            {!user ? (
              <Link
                href="/signin?redirect=/admin"
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 no-underline cursor-pointer"
              >
                <i className="fas fa-right-to-bracket"></i>
                <span>Sign In as Admin</span>
              </Link>
            ) : (
              <Link
                href="/signin"
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 no-underline cursor-pointer"
              >
                <i className="fas fa-user-lock"></i>
                <span>Switch to Admin Account</span>
              </Link>
            )}

            <Link
              href="/"
              className="w-full py-3 rounded-xl border border-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-800/60 transition-all flex items-center justify-center gap-2 no-underline cursor-pointer"
            >
              <i className="fas fa-arrow-left"></i>
              <span>Return to HDE Public Site</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Redundancy Feature: 1-Click Complete Database Backup Export
  const handleExportFullBackup = async () => {
    setIsExporting(true);
    try {
      const [plansRes, propsRes, tutsRes] = await Promise.all([
        supabase.from('house_plans').select('*'),
        supabase.from('real_estate_properties').select('*'),
        supabase.from('cad_tutorials').select('*'),
      ]);

      const backup = {
        meta: {
          platform: 'Home Design English (HDE)',
          version: '2.3.0',
          exportedAt: new Date().toISOString(),
          exportedBy: user?.email || ADMIN_EMAIL,
          counts: {
            house_plans: plansRes.data?.length || 0,
            real_estate_properties: propsRes.data?.length || 0,
            cad_tutorials: tutsRes.data?.length || 0,
          },
        },
        data: {
          house_plans: plansRes.data || [],
          real_estate_properties: propsRes.data || [],
          cad_tutorials: tutsRes.data || [],
        },
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hde_database_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Backup export notice: ' + (err.message || 'Failed'));
    } finally {
      setIsExporting(false);
    }
  };

  // Authenticated strictly as thyagaraja1983@gmail.com
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col lg:flex-row">
      {/* Mobile Header Bar */}
      <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-sm border border-amber-500/20">
            <i className="fas fa-shield-halved"></i>
          </div>
          <div>
            <span className="font-black text-sm text-white tracking-tight">HDE Command Center</span>
            <span className="block text-[10px] text-emerald-400 font-bold">● Superadmin Active</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
        >
          <i className={`fas ${sidebarOpen ? 'fa-xmark' : 'fa-bars'} text-base`}></i>
        </button>
      </div>

      {/* Unified Persistent Admin Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-slate-950 border-r border-slate-800 flex flex-col justify-between z-50 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Brand & Security Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black text-base shadow-md">
                <i className="fas fa-shield-halved"></i>
              </div>
              <div>
                <span className="font-black text-sm text-white tracking-tight block">HDE Command Center</span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  Developer Platform
                </span>
              </div>
            </div>

            {/* Admin identity badge */}
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-[11px] space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span>Account:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Verified
                </span>
              </div>
              <div className="font-mono text-slate-200 truncate text-[10px] font-semibold" title={user?.email || ADMIN_EMAIL}>
                {user?.email || ADMIN_EMAIL}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-3">
              Admin Modules
            </span>
            <nav className="space-y-1 pt-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all no-underline ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <i className={`fas ${item.icon} text-sm ${isActive ? 'text-slate-950' : 'text-slate-400'}`}></i>
                      <span>{item.label}</span>
                    </div>
                    {item.highlight && !isActive && (
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-black border border-blue-500/30">
                        PDF
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Redundancy & Disaster Recovery Box */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-black text-amber-400">
              <i className="fas fa-database text-xs"></i>
              <span>Data Redundancy</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Instant offline JSON snapshot of all database tables (plans, properties, tutorials).
            </p>
            <button
              type="button"
              onClick={handleExportFullBackup}
              disabled={isExporting}
              className="w-full py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <i className={`fas ${isExporting ? 'fa-spinner fa-spin' : 'fa-download'} text-amber-400`}></i>
              <span>{isExporting ? 'Generating...' : 'Export Backup (JSON)'}</span>
            </button>
          </div>

          {/* Cloudflare Storage Links */}
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-3">
              Cloudflare R2 Storage
            </span>
            <div className="space-y-1 pt-1 text-[11px] font-semibold">
              <a
                href="https://dash.cloudflare.com/aecd4a2eaf3342cb721dfd1717a810a2/r2/default/buckets/hde-gallery/objects?prefix=house-plans%2Fpdf-plans%2F"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition no-underline"
              >
                <span className="flex items-center gap-2">
                  <i className="fas fa-folder-open text-rose-400 text-xs"></i>
                  <span>pdf-plans/</span>
                </span>
                <i className="fas fa-arrow-up-right-from-square text-[10px] text-slate-600"></i>
              </a>

              <a
                href="https://dash.cloudflare.com/aecd4a2eaf3342cb721dfd1717a810a2/r2/default/buckets/hde-gallery/objects?prefix=house-plans%2Fvertical-images%2F"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition no-underline"
              >
                <span className="flex items-center gap-2">
                  <i className="fas fa-folder-open text-amber-400 text-xs"></i>
                  <span>vertical-images/</span>
                </span>
                <i className="fas fa-arrow-up-right-from-square text-[10px] text-slate-600"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2 bg-slate-950/80">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-900 transition no-underline"
          >
            <i className="fas fa-globe text-xs"></i>
            <span>View Public Site</span>
          </Link>
          <button
            type="button"
            onClick={() => signOut && signOut()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition text-left cursor-pointer"
          >
            <i className="fas fa-right-from-bracket text-xs"></i>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] text-slate-900">
        {/* Top Operational Status Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/admin" className="hover:text-blue-600">
              Admin
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-bold capitalize">
              {pathname === '/admin' ? 'Dashboard Overview' : pathname.replace('/admin/', '').replace(/\//g, ' > ')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Service Health Pills */}
            <div className="hidden sm:flex items-center gap-2 text-[11px] font-bold">
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                DB: Supabase
              </span>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                R2: Cloudflare
              </span>
            </div>

            {/* Quick Backup Action */}
            <button
              type="button"
              onClick={handleExportFullBackup}
              disabled={isExporting}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0f2042] hover:bg-blue-900 text-white shadow-2xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Download instant full JSON database backup"
            >
              <i className={`fas ${isExporting ? 'fa-spinner fa-spin' : 'fa-download'} text-amber-400 text-[11px]`}></i>
              <span className="hidden sm:inline">Backup DB</span>
            </button>
          </div>
        </header>

        {/* Sub-page Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
