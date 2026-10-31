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
      className={`relative rounded-xl overflow-hidden bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 select-none shadow-sm ${className}`}
      onContextMenu={(e) => {
        if (!isUnlocked) e.preventDefault();
      }}
    >
      {/* Sleek Floating Top Controls Bar */}
      <div className="absolute top-2 left-2 right-2 z-30 flex items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto">
          {isUnlocked ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60 shadow-xs backdrop-blur-xs">
              <i className="fas fa-check-circle text-[9px]"></i>
              Pristine Unlocked
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/90 text-slate-700 border border-slate-200/90 dark:bg-zinc-900/90 dark:text-zinc-300 dark:border-zinc-700 shadow-xs backdrop-blur-xs">
              <i className="fas fa-shield-halved text-[9px] text-slate-500"></i>
              Protected Preview
            </span>
          )}
        </div>

        {/* Minimal Zoom Controls */}
        <div className="pointer-events-auto flex items-center gap-1 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xs rounded-lg p-0.5 border border-slate-200 dark:border-zinc-700 shadow-xs">
          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.max(1, prev - 0.25))}
            disabled={zoomLevel <= 1}
            className="w-6 h-6 flex items-center justify-center text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 rounded transition text-[10px]"
            title="Zoom Out"
          >
            <i className="fas fa-minus"></i>
          </button>
          <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-zinc-200 px-1 min-w-[32px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.min(2.5, prev + 0.25))}
            disabled={zoomLevel >= 2.5}
            className="w-6 h-6 flex items-center justify-center text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 rounded transition text-[10px]"
            title="Zoom In"
          >
            <i className="fas fa-plus"></i>
          </button>
        </div>
      </div>

      {/* Main Blueprint Viewport - Crisp White / Light Drafting Surface */}
      <div
        className="relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[56vh] sm:max-h-[62vh] overflow-auto flex items-center justify-center bg-slate-50/70 dark:bg-zinc-950 p-2 sm:p-4"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="relative transition-transform duration-200 ease-out flex items-center justify-center max-w-full max-h-full"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          {/* Blueprint Image or PDF embed */}
          {normalizedImageUrl?.toLowerCase().endsWith('.pdf') ? (
            <iframe
              src={`${normalizedImageUrl}#toolbar=0&navpanes=0`}
              title={title}
              className="w-[85vw] max-w-[700px] h-[480px] rounded border border-slate-200 dark:border-zinc-800 bg-white shadow-xs"
            />
          ) : (
            <img
              src={normalizedImageUrl}
              alt={title}
              className="max-h-[480px] w-auto max-w-full object-contain rounded bg-white shadow-xs pointer-events-none"
              style={{ imageRendering: '-webkit-optimize-contrast' }}
              loading="lazy"
              draggable={false}
            />
          )}

          {/* Clean Subtle Neutral Watermark (NO Yellow — Professional Crisp Drafting Style) */}
          {!isUnlocked && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden flex flex-col justify-around opacity-30 select-none z-10">
              {/* Row 1 */}
              <div className="transform -rotate-25 whitespace-nowrap text-[11px] sm:text-xs font-black tracking-[0.2em] text-slate-500 dark:text-slate-400 flex gap-6">
                <span>HOME DESIGN ENGLISH</span>
                <span>• ARCHITECTURAL PREVIEW •</span>
                <span>DO NOT DISTRIBUTE</span>
              </div>
              {/* Row 2 (Subtle Neutral Center - Clean Gray, NO Yellow) */}
              <div className="transform -rotate-25 whitespace-nowrap text-xs sm:text-sm font-black tracking-[0.25em] text-slate-600 dark:text-slate-300 flex gap-8">
                <span>★ PREVIEW ONLY — LICENSED ARCHITECTURAL SPECIFICATION ★</span>
              </div>
              {/* Row 3 */}
              <div className="transform -rotate-25 whitespace-nowrap text-[11px] sm:text-xs font-black tracking-[0.2em] text-slate-500 dark:text-slate-400 flex gap-6">
                <span>WWW.HOMEDESIGNENGLISH.COM</span>
                <span>• BLUEPRINT WORKING DRAWING •</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sleek, Compact & Responsive Bottom Bar */}
      <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="text-left w-full sm:w-auto min-w-0">
          <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate max-w-xs">
            {title}
          </p>
          <span className="text-[10px] text-slate-500 dark:text-zinc-400 block sm:inline">
            High-Res Vector PDF Working Drawing
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
          {isUnlocked ? (
            <button
              type="button"
              onClick={handleDownload}
              className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <i className="fas fa-download text-[11px]"></i>
              <span>Download PDF</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onUnlockClick}
              className="w-full sm:w-auto px-4 py-1.5 rounded-lg font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <i className="fas fa-lock-open text-[11px]"></i>
              <span>Unlock Vector PDF (₹{priceInr})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
