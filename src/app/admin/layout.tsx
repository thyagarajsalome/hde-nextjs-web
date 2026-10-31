"use client";

import React from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";

export const ADMIN_EMAIL = "thyagaraja1983@gmail.com";

export default function GlobalAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isDeveloper } = useUser();

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

  // Authenticated strictly as thyagaraja1983@gmail.com
  return <>{children}</>;
}
