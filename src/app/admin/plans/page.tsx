"use client";

import React from "react";
import Link from "next/link";
import { AdminPlansManager } from "@/components/admin/AdminPlansManager";

export default function AdminHousePlansPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
          <Link href="/admin" className="hover:text-[#4165af]">
            Admin Portal
          </Link>
          <span>/</span>
          <span className="text-[#4165af] font-bold">House Plans &amp; Working Drawings</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-5">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-full">
              Cloudflare R2 + Supabase Storage
            </span>
            <h1 className="text-3xl font-black text-slate-900 dark:text-zinc-100 tracking-tight mt-1">
              Architectural House Plans &amp; Blueprints
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
              Upload vector working drawing PDFs to Cloudflare R2, generate watermarked previews, configure directional orientations, and manage trade budgets.
            </p>
          </div>
        </div>

        {/* Manager Component */}
        <AdminPlansManager />
      </div>
    </div>
  );
}
