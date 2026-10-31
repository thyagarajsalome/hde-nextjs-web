"use client";

import React, { useState } from 'react';

interface WatermarkedPlanViewerProps {
  imageUrl: string;
  pdfUrl?: string;
  title: string;
  isUnlocked: boolean;
  priceInr?: number;
  onUnlockClick?: () => void;
  className?: string;
}

export const WatermarkedPlanViewer: React.FC<WatermarkedPlanViewerProps> = ({
  imageUrl,
  pdfUrl,
  title,
  isUnlocked,
  priceInr = 499,
  onUnlockClick,
  className = "",
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isHovered, setIsHovered] = useState(false);

  // Normalize image URL to R2 if needed
  const normalizedImageUrl = imageUrl?.startsWith('http')
    ? imageUrl
    : `https://pub-b20d9352722b43219ceb523a3a0c89d5.r2.dev/house-plans/${imageUrl?.replace(/^\/+/, '')}`;

  const normalizedPdfUrl = pdfUrl
    ? (pdfUrl.startsWith('http') ? pdfUrl : `https://pub-b20d9352722b43219ceb523a3a0c89d5.r2.dev/house-plans/${pdfUrl.replace(/^\/+/, '')}`)
    : null;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isUnlocked) {
      if (onUnlockClick) onUnlockClick();
      return;
    }

    const downloadTarget = normalizedPdfUrl || normalizedImageUrl;
    if (downloadTarget) {
      const link = document.createElement('a');
      link.href = downloadTarget;
      link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-blueprint.pdf`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-700/60 select-none shadow-xl ${className}`}
      onContextMenu={(e) => {
        if (!isUnlocked) e.preventDefault();
      }}
    >
      {/* Top Status Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-2">
          {isUnlocked ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md">
              <i className="fas fa-check-circle text-[11px]"></i>
              Pristine Vector Unlocked
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md">
              <i className="fas fa-lock text-[11px]"></i>
              Protected Preview (HDE Watermark)
            </span>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md rounded-lg p-1 border border-white/10">
          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.max(1, prev - 0.25))}
            disabled={zoomLevel <= 1}
            className="w-7 h-7 flex items-center justify-center text-white/80 hover:text-white disabled:opacity-30 rounded hover:bg-white/10 transition text-xs"
            title="Zoom Out"
          >
            <i className="fas fa-search-minus"></i>
          </button>
          <span className="text-[11px] font-mono text-white/90 px-1 font-bold min-w-[36px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.min(2.5, prev + 0.25))}
            disabled={zoomLevel >= 2.5}
            className="w-7 h-7 flex items-center justify-center text-white/80 hover:text-white disabled:opacity-30 rounded hover:bg-white/10 transition text-xs"
            title="Zoom In"
          >
            <i className="fas fa-search-plus"></i>
          </button>
        </div>
      </div>

      {/* Main Blueprint Viewport */}
      <div
        className="relative w-full aspect-[4/3] sm:aspect-[16/11] overflow-auto flex items-center justify-center bg-zinc-950 p-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="relative transition-transform duration-200 ease-out flex items-center justify-center"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          {/* Blueprint Image or PDF embed */}
          {normalizedImageUrl?.toLowerCase().endsWith('.pdf') ? (
            <iframe
              src={`${normalizedImageUrl}#toolbar=0&navpanes=0`}
              title={title}
              className="w-[85vw] max-w-[750px] h-[540px] rounded shadow-2xl border-0 bg-white"
            />
          ) : (
            <img
              src={normalizedImageUrl}
              alt={title}
              className="max-h-[580px] w-auto object-contain rounded shadow-2xl pointer-events-none"
              loading="lazy"
              draggable={false}
            />
          )}

          {/* Semi-transparent Diagonal Watermark (Only active when NOT unlocked) */}
          {!isUnlocked && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden flex flex-col justify-around opacity-45 select-none z-10">
              {/* Row 1 */}
              <div className="transform -rotate-25 whitespace-nowrap text-[13px] sm:text-base font-black tracking-[0.25em] text-white/40 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] flex gap-8">
                <span>HOME DESIGN ENGLISH • PREVIEW BLUEPRINT</span>
                <span>• HDE ARCHITECTURAL STORE •</span>
                <span>DO NOT DISTRIBUTE •</span>
              </div>
              {/* Row 2 (Prominent Center) */}
              <div className="transform -rotate-25 whitespace-nowrap text-base sm:text-xl font-black tracking-[0.3em] text-amber-300/50 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] flex gap-10">
                <span>★ PREVIEW ONLY — LICENSED ARCHITECTURAL DRAWING ★</span>
                <span>★ UNREGISTERED SPECIFICATION ★</span>
              </div>
              {/* Row 3 */}
              <div className="transform -rotate-25 whitespace-nowrap text-[13px] sm:text-base font-black tracking-[0.25em] text-white/40 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] flex gap-8">
                <span>WWW.HOMEDESIGNENGLISH.COM • WORKING DRAWINGS PACK</span>
                <span>• ALL RIGHTS RESERVED •</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Drawer */}
      <div className="px-5 py-3.5 bg-slate-900/95 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-left w-full sm:w-auto">
          <p className="text-xs text-slate-400 font-medium truncate max-w-sm">
            {title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] font-bold text-slate-300">
              Format: High-Res 300 DPI Vector PDF + Detailed Floor Layout
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {isUnlocked ? (
            <button
              type="button"
              onClick={handleDownload}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <i className="fas fa-file-pdf text-sm"></i>
              Download Pristine Vector PDF
            </button>
          ) : (
            <button
              type="button"
              onClick={onUnlockClick}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-950/40 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <i className="fas fa-unlock-alt text-sm"></i>
              <span>Unlock Clean PDF (₹{priceInr})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
