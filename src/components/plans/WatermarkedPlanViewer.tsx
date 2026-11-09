"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';

export interface PlanPreviewSheet {
  title?: string;
  url: string;
}

interface WatermarkedPlanViewerProps {
  imageUrl: string;
  pdfUrl?: string;
  previewPages?: Array<PlanPreviewSheet | string>;
  title: string;
  isUnlocked: boolean;
  priceInr?: number;
  onUnlockClick?: () => void;
  className?: string;
}

export const WatermarkedPlanViewer: React.FC<WatermarkedPlanViewerProps> = ({
  imageUrl,
  pdfUrl,
  previewPages,
  title,
  isUnlocked,
  priceInr = 499,
  onUnlockClick,
  className = "",
}) => {
  const [currentSheetIndex, setCurrentSheetIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isHovered, setIsHovered] = useState(false);

  // Helper to normalize URLs to Cloudflare R2
  const normalizeUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("/")) return url;
    if (url.startsWith("house-plans/") || url.startsWith("pdf-plans/")) {
      return `https://pub-b20d9352722b43219ceb523a3a0c89d5.r2.dev/${url.replace(/^\/+/, '')}`;
    }
    return `https://pub-b20d9352722b43219ceb523a3a0c89d5.r2.dev/pdf-plans/${url.replace(/^\/+/, '')}`;
  };

  // Compile full list of sheets (supports 1 to N arbitrary sheets)
  const sheets = useMemo(() => {
    if (previewPages && Array.isArray(previewPages) && previewPages.length > 0) {
      return previewPages.map((page, idx) => {
        if (typeof page === 'string') {
          return {
            title: `Sheet ${idx + 1}`,
            url: normalizeUrl(page),
          };
        }
        return {
          title: page.title || `Sheet ${idx + 1}`,
          url: normalizeUrl(page.url),
        };
      });
    }
    return [{ title: 'Architectural Blueprint', url: normalizeUrl(imageUrl) }];
  }, [previewPages, imageUrl]);

  const totalSheets = sheets.length;
  const activeSheet = sheets[Math.min(currentSheetIndex, totalSheets - 1)] || sheets[0];

  // Reset zoom on sheet change
  useEffect(() => {
    setZoomLevel(1);
  }, [currentSheetIndex]);

  // Keyboard navigation (Left / Right Arrow)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (totalSheets <= 1) return;
      if (e.key === 'ArrowRight') {
        setCurrentSheetIndex((prev) => (prev < totalSheets - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSheetIndex((prev) => (prev > 0 ? prev - 1 : totalSheets - 1));
      }
    },
    [totalSheets]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const normalizedPdfUrl = normalizeUrl(pdfUrl);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isUnlocked) {
      if (onUnlockClick) onUnlockClick();
      return;
    }

    const downloadTarget = normalizedPdfUrl || activeSheet.url;
    if (downloadTarget) {
      const link = document.createElement('a');
      link.href = downloadTarget;
      link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-complete-blueprint-pack.pdf`;
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
        
        {/* Left: Status Badge & Dynamic Sheet Counter */}
        <div className="pointer-events-auto flex items-center gap-1.5 flex-wrap">
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

          {/* Multi-Page Indicator Pill */}
          {totalSheets > 1 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#0f2042]/90 text-amber-300 border border-[#c5a059]/40 shadow-xs backdrop-blur-xs">
              <i className="fas fa-copy text-[9px] text-amber-400"></i>
              <span>Sheet {currentSheetIndex + 1} of {totalSheets}</span>
            </span>
          )}
        </div>

        {/* Minimal Zoom Controls */}
        <div className="pointer-events-auto flex items-center gap-1 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xs rounded-lg p-0.5 border border-slate-200 dark:border-zinc-700 shadow-xs">
          <button
            type="button"
            onClick={() => setZoomLevel((prev) => Math.max(1, prev - 0.25))}
            disabled={zoomLevel <= 1}
            className="w-6 h-6 flex items-center justify-center text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 rounded transition text-[10px] cursor-pointer"
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
            className="w-6 h-6 flex items-center justify-center text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 rounded transition text-[10px] cursor-pointer"
            title="Zoom In"
          >
            <i className="fas fa-plus"></i>
          </button>
        </div>
      </div>

      {/* Sheet Selection Tab Strip (When Multiple Sheets Exist) */}
      {totalSheets > 1 && (
        <div className="pt-10 pb-1.5 px-3 bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0 mr-1 hidden sm:inline">
              Sheets:
            </span>
            {sheets.map((sheet, idx) => {
              const isActive = idx === currentSheetIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSheetIndex(idx)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-[#0f2042] text-[#c5a059] shadow-xs"
                      : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200/70 border border-slate-200/80 dark:border-zinc-700"
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-black ${
                    isActive ? "bg-[#c5a059] text-[#0f2042]" : "bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300"
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="truncate max-w-[120px] sm:max-w-none">{sheet.title}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1 shrink-0 text-slate-400 text-xs">
            <button
              type="button"
              onClick={() => setCurrentSheetIndex((prev) => (prev > 0 ? prev - 1 : totalSheets - 1))}
              className="w-6 h-6 rounded flex items-center justify-center hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition cursor-pointer"
              title="Previous Sheet"
            >
              <i className="fas fa-chevron-left text-[10px]"></i>
            </button>
            <button
              type="button"
              onClick={() => setCurrentSheetIndex((prev) => (prev < totalSheets - 1 ? prev + 1 : 0))}
              className="w-6 h-6 rounded flex items-center justify-center hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition cursor-pointer"
              title="Next Sheet"
            >
              <i className="fas fa-chevron-right text-[10px]"></i>
            </button>
          </div>
        </div>
      )}

      {/* Main Blueprint Viewport - Crisp White Surface */}
      <div
        className={`relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[64vh] overflow-auto flex items-center justify-center bg-white dark:bg-zinc-950 p-2 sm:p-4 ${
          totalSheets <= 1 ? "pt-10" : ""
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Floating Left/Right Arrows on Canvas (When Multiple Sheets Exist) */}
        {totalSheets > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSheetIndex((prev) => (prev > 0 ? prev - 1 : totalSheets - 1));
              }}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900/60 hover:bg-slate-900/85 text-white flex items-center justify-center backdrop-blur-xs shadow-md transition-transform hover:scale-110 cursor-pointer"
              title="Previous Sheet (Left Arrow)"
            >
              <i className="fas fa-chevron-left text-xs"></i>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSheetIndex((prev) => (prev < totalSheets - 1 ? prev + 1 : 0));
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900/60 hover:bg-slate-900/85 text-white flex items-center justify-center backdrop-blur-xs shadow-md transition-transform hover:scale-110 cursor-pointer"
              title="Next Sheet (Right Arrow)"
            >
              <i className="fas fa-chevron-right text-xs"></i>
            </button>
          </>
        )}

        <div
          className="relative transition-transform duration-200 ease-out flex items-center justify-center max-w-full max-h-full"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          {/* Active Sheet Image or PDF embed */}
          {activeSheet.url?.toLowerCase().endsWith('.pdf') ? (
            <iframe
              src={`${activeSheet.url}#toolbar=0&navpanes=0`}
              title={activeSheet.title}
              className="w-[85vw] max-w-[700px] h-[480px] rounded border border-slate-200 dark:border-zinc-800 bg-white shadow-xs"
            />
          ) : (
            <img
              src={activeSheet.url}
              alt={`${title} - ${activeSheet.title}`}
              className="max-h-[480px] w-auto max-w-full object-contain rounded bg-white shadow-xs pointer-events-none"
              style={{ imageRendering: '-webkit-optimize-contrast' }}
              loading="eager"
              draggable={false}
            />
          )}

          {/* Clean Neutral Watermark Over Active Sheet */}
          {!isUnlocked && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden flex flex-col justify-around opacity-30 select-none z-10">
              {/* Row 1 */}
              <div className="transform -rotate-25 whitespace-nowrap text-[11px] sm:text-xs font-black tracking-[0.2em] text-slate-500 dark:text-slate-400 flex gap-6">
                <span>HOME DESIGN ENGLISH</span>
                <span>• ARCHITECTURAL PREVIEW •</span>
                <span>DO NOT DISTRIBUTE</span>
              </div>
              {/* Row 2 */}
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
          <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate max-w-xs flex items-center gap-1.5">
            <span>{title}</span>
            {totalSheets > 1 && (
              <span className="text-[10px] text-amber-800 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-800 shrink-0">
                {activeSheet.title} ({currentSheetIndex + 1}/{totalSheets})
              </span>
            )}
          </p>
          <span className="text-[10px] text-slate-500 dark:text-zinc-400 block sm:inline">
            {totalSheets > 1
              ? `Complete ${totalSheets}-Sheet Vector PDF Architectural Set`
              : 'High-Res Vector PDF Working Drawing'}
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
              <span>Download Full PDF ({totalSheets > 1 ? `${totalSheets} Sheets` : 'PDF'})</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onUnlockClick}
              className="w-full sm:w-auto px-4 py-1.5 rounded-lg font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <i className="fas fa-lock-open text-[11px]"></i>
              <span>
                Unlock Vector PDF ({totalSheets > 1 ? `${totalSheets} Sheets • ` : ''}₹{priceInr})
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
