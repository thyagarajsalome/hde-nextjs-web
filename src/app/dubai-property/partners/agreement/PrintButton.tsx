"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface PrintButtonProps {
  className?: string;
  variant?: "primary" | "secondary";
}

export default function PrintAgreementButton({ 
  className = "",
  variant = "primary" 
}: PrintButtonProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    // If URL has ?print=true or ?autoPrint=1, automatically trigger print dialog
    if (searchParams.get("print") === "true" || searchParams.get("autoPrint") === "1") {
      const timer = setTimeout(() => {
        window.print();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handlePrint = () => {
    window.print();
  };

  if (variant === "secondary") {
    return (
      <button
        type="button"
        onClick={handlePrint}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-zinc-700 shadow-2xs transition cursor-pointer print:hidden ${className}`}
        title="Print or Save Agreement as PDF"
      >
        <i className="fas fa-print text-[#0f2042] dark:text-[#c5a059]"></i>
        <span>Print / Save PDF</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handlePrint}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0f2042] hover:bg-[#1a3360] text-white text-xs font-bold shadow-xs border border-[#c5a059]/40 hover:scale-[1.02] transition cursor-pointer print:hidden ${className}`}
      title="Print or Save Agreement as PDF"
    >
      <i className="fas fa-print text-[#c5a059]"></i>
      <span>Print Agreement (PDF)</span>
    </button>
  );
}
