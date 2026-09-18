// src/components/real-estate/PropertyPhotoUploader.tsx
"use client";

import React, { useState, useRef } from "react";
import { compressToWebP, CompressedImageResult } from "@/utils/imageCompressor";

interface PhotoSlot {
  id: number;
  label: string;
  sublabel: string;
  result?: CompressedImageResult;
  uploadedUrl?: string;
  isProcessing?: boolean;
}

const DEFAULT_SLOTS: PhotoSlot[] = [
  { id: 1, label: "Photo 1", sublabel: "Cover / Main View" },
  { id: 2, label: "Photo 2", sublabel: "Inside or Outside" },
  { id: 3, label: "Photo 3", sublabel: "Inside or Outside" },
];

export default function PropertyPhotoUploader({
  onPhotosChange,
}: {
  onPhotosChange: (files: File[]) => void;
}) {
  const [slots, setSlots] = useState<PhotoSlot[]>(DEFAULT_SLOTS);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSlotId, setActiveSlotId] = useState<number | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activeSlotId === null) return;

    // Set slot processing state
    setSlots((prev) =>
      prev.map((s) => (s.id === activeSlotId ? { ...s, isProcessing: true } : s))
    );

    try {
      // Compress in browser: 800x600 px (4:3) WebP @ 72% quality
      const compressed = await compressToWebP(file, 800, 600, 0.72);

      const nextSlots = slots.map((s) =>
        s.id === activeSlotId
          ? { ...s, result: compressed, isProcessing: false }
          : s
      );
      setSlots(nextSlots);

      const readyFiles = nextSlots
        .map((s) => s.result?.file)
        .filter((f): f is File => Boolean(f));

      onPhotosChange(readyFiles);
    } catch (err) {
      console.error("Image compression error:", err);
      alert("Could not process image. Please try another photo.");
      setSlots((prev) =>
        prev.map((s) => (s.id === activeSlotId ? { ...s, isProcessing: false } : s))
      );
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePhoto = (id: number) => {
    const nextSlots = slots.map((s) =>
      s.id === id ? { ...s, result: undefined, uploadedUrl: undefined } : s
    );
    setSlots(nextSlots);

    const readyFiles = nextSlots
      .map((s) => s.result?.file)
      .filter((f): f is File => Boolean(f));

    onPhotosChange(readyFiles);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-extrabold text-secondary">Property Photos</h3>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
              Max 3 Photos
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Upload up to 3 photos of your property — inside, outside, room, hall, or building view.
          </p>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="hidden"
      />

      {/* 3 Slot Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {slots.map((slot, index) => (
          <div
            key={slot.id}
            className={`relative rounded-xl border-2 transition-all overflow-hidden flex flex-col items-center justify-center aspect-video ${
              slot.result
                ? "border-primary/40 bg-gray-50 shadow-xs"
                : "border-dashed border-gray-300 hover:border-primary/60 bg-slate-50/50 hover:bg-primary/5 cursor-pointer"
            }`}
            onClick={() => {
              if (!slot.result && !slot.isProcessing) {
                setActiveSlotId(slot.id);
                fileInputRef.current?.click();
              }
            }}
          >
            {slot.isProcessing ? (
              <div className="flex flex-col items-center gap-2 p-4 text-center">
                <i className="fas fa-circle-notch fa-spin text-2xl text-primary"></i>
                <span className="text-xs font-semibold text-gray-700">Preparing photo...</span>
              </div>
            ) : slot.result ? (
              <div className="w-full h-full relative group">
                <img
                  src={slot.result.previewUrl}
                  alt={`Photo ${slot.id}`}
                  className="w-full h-full object-cover"
                />

                {/* Slot Identifier */}
                <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-md">
                  Photo {index + 1}
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePhoto(slot.id);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-600/90 text-white rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-md"
                  title="Remove photo"
                >
                  <i className="fas fa-trash-alt text-xs"></i>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 p-5 text-center">
                <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg shadow-xs group-hover:scale-105 transition-transform">
                  <i className="fas fa-camera"></i>
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-gray-800 block">{slot.label}</span>
                  <span className="text-[10px] text-gray-400 block">{slot.sublabel}</span>
                </div>
                <span className="text-[11px] text-primary font-semibold mt-1">Tap to select</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Helpful Photo Guidelines Box */}
      <div className="mt-4 p-4 bg-blue-50/70 border border-blue-100 rounded-xl text-xs space-y-1.5 text-gray-700">
        <div className="flex items-center gap-2 font-bold text-[#4165af]">
          <i className="fas fa-lightbulb text-amber-500"></i>
          <span>Helpful Tips for Taking Property Photos:</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-[11px] text-gray-600 pl-1 leading-relaxed">
          <li><strong>Shoot in Daylight:</strong> Open curtains and turn on room lights so rooms look spacious and bright.</li>
          <li><strong>Horizontal / Wide Angle:</strong> Hold your smartphone horizontally (landscape) to capture more room or building area.</li>
          <li><strong>Capture Key Spaces:</strong> Take photos of whatever best showcases your property (e.g. main hall, bedroom, kitchen, exterior front view, or balcony road view).</li>
          <li>Clear and well-lit photos receive up to <strong>3x more calls and genuine tenant/buyer inquiries</strong>.</li>
        </ul>
      </div>
    </div>
  );
}
