"use client";

import React from 'react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';

export const ADMIN_EMAIL = 'thyagaraja1983@gmail.com';

export default function AdminGalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();

  // Show verifying state while checking Supabase auth session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl mx-auto">
            <i className="fas fa-shield-alt fa-spin"></i>
          </div>
          <p className="text-sm font-bold text-gray-800 dark:text-zinc-200">Verifying Admin Access...</p>
          <p className="text-xs text-gray-400">Restricted administrative portal</p>
        </div>
      </div>
    );
  }

  // Strict email whitelist verification
  const isAdmin = Boolean(user && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4 py-12">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-2xl mx-auto shadow-xs">
            <i className="fas fa-lock"></i>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full">
              Restricted Area
            </span>
            <h1 className="text-2xl font-black text-secondary dark:text-zinc-100">
              Private Admin Access Only
            </h1>
            <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
              Uploading photos, modifying pricing engines, and publishing designs is strictly reserved for the primary administrator account (<strong>{ADMIN_EMAIL}</strong>).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200/60 dark:border-zinc-700/50 text-xs text-left space-y-1.5">
            <div className="flex items-center justify-between text-gray-500 dark:text-zinc-400">
              <span>Required Role:</span>
              <span className="font-bold text-gray-800 dark:text-zinc-200">Platform Superadmin</span>
            </div>
            <div className="flex items-center justify-between text-gray-500 dark:text-zinc-400">
              <span>Current Status:</span>
              <span className="font-bold text-rose-500">
                {user ? `Signed in as ${user.email} (Unauthorized)` : 'Not signed in'}
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            {!user ? (
              <Link
                href="/signin?redirect=/admin/gallery"
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white dark:text-zinc-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 no-underline cursor-pointer"
              >
                <i className="fas fa-sign-in-alt"></i>
                <span>Sign In as Admin</span>
              </Link>
            ) : (
              <Link
                href="/signin"
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white dark:text-zinc-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 no-underline cursor-pointer"
              >
                <i className="fas fa-user-switch"></i>
                <span>Switch to Admin Account</span>
              </Link>
            )}

            <Link
              href="/gallery/kitchen-designs"
              className="w-full py-3 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 font-bold text-xs hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 no-underline cursor-pointer"
            >
              <i className="fas fa-arrow-left"></i>
              <span>Return to Public Gallery</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated as thyagaraja1983@gmail.com
  return <>{children}</>;
}
