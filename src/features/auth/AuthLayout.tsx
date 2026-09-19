// src/features/auth/AuthLayout.tsx
import React from "react";
import Link from "next/link";

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Single official small HDE logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex justify-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2 group no-underline">
          <img 
            src="/bg-logo.png" 
            alt="HDE Logo" 
            className="w-10 h-10 object-contain transition-transform group-hover:scale-105" 
          />
          <div className="flex flex-col justify-center text-left">
            <span className="text-primary font-black text-xl leading-none tracking-tight">
              HDE
            </span>
            <span className="text-[10px] font-semibold text-gray-500 dark:text-zinc-400 tracking-tight leading-none mt-0.5 whitespace-nowrap">
              Home Design &amp; Real Estate
            </span>
          </div>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-zinc-900 py-8 px-5 sm:px-10 shadow-md sm:rounded-2xl border border-gray-100 dark:border-zinc-800">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;