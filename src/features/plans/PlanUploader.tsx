"use client";
// src/features/plans/PlanUploader.tsx
import React, { useState, useId } from "react";
import { supabase } from "../../config/supabaseClient";
import { useToast } from "../../context/ToastContext";

interface PlanUploaderProps {
  onUploadSuccess: () => void;
}

const PLOT_PRESETS = [
  { label: "30×40 (1200 sqft)", dim: "30x40", area: 1200, title: "Modern 30x40 Duplex House Plan" },
  { label: "30×50 (1500 sqft)", dim: "30x50", area: 1500, title: "Spacious 30x50 3BHK House Plan" },
  { label: "40×60 (2400 sqft)", dim: "40x60", area: 2400, title: "Luxury 40x60 4BHK Villa Plan" },
  { label: "20×30 (600 sqft)", dim: "20x30", area: 600, title: "Compact 20x30 2BHK House Plan" },
  { label: "30×60 (1800 sqft)", dim: "30x60", area: 1800, title: "Contemporary 30x60 3BHK Home Plan" },
  { label: "50×80 (4000 sqft)", dim: "50x80", area: 4000, title: "Grand 50x80 Luxury Mansion Plan" },
];

export const PlanUploader: React.FC<PlanUploaderProps> = ({ onUploadSuccess }) => {
  const fileInputId = useId();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form State
  const [title, setTitle] = useState("");
  const [area, setArea] = useState("");
  const [facing, setFacing] = useState("East");
  const [dimensions, setDimensions] = useState("");
  const [floors, setFloors] = useState("G+1");
  const [bedrooms, setBedrooms] = useState("3");
  const [bathrooms, setBathrooms] = useState("3");
  const [parking, setParking] = useState("1 Car");
  const [isVastuCompliant, setIsVastuCompliant] = useState(true);
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const [fullFile, setFullFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Handle file selection and preview
  const handleFileChange = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file (JPG, PNG, WEBP).", "error");
      return;
    }
    setFullFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const applyPreset = (preset: typeof PLOT_PRESETS[0]) => {
    setDimensions(preset.dim);
    setArea(preset.area.toString());
    if (!title) setTitle(preset.title);
  };

  const insertSpecTemplate = () => {
    const template = `• Living Hall: 16' × 14' with double height ceiling\n• Master Bedroom: 14' × 12' with attached bath & walk-in wardrobe\n• Kitchen: 10' × 10' modular layout in South-East (Agni corner)\n• Pooja Room: Dedicated in North-East (Ishanya)\n• Balcony & Sitout: Spacious road-facing terrace\n• Structural: RCC framed structure designed for Zone II earthquake compliance\n• Vastu: 100% Vastu Shastra compliant orientation`;
    setDescription(prev => prev ? `${prev}\n\n${template}` : template);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullFile || !title || !area) {
      showToast("Please enter title, area, and upload an architectural plan image.", "error");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    showToast("Uploading plan to Supabase Storage...", "info");

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => (prev < 85 ? prev + 12 : prev));
    }, 300);

    try {
      const timestamp = Date.now();
      const fullExt = fullFile.name.split('.').pop() || 'png';
      const cleanFileName = title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
      const fullPath = `full-plans/${timestamp}-${cleanFileName}.${fullExt}`;

      // 1. Upload File to Supabase Storage Bucket
      const { error: fullError } = await supabase.storage.from('house-plans').upload(fullPath, fullFile, {
        cacheControl: '3600',
        upsert: false
      });
      if (fullError) throw fullError;
      setUploadProgress(90);

      // Final formatted description
      const vastuTag = isVastuCompliant ? "[Vastu Compliant] " : "";
      const finalDescription = `${vastuTag}${description}`.trim();

      // 2. Insert record into house_plans table
      const { error: dbError } = await supabase.from('house_plans').insert({
        title,
        area_sqft: parseInt(area) || 0,
        facing,
        dimensions: dimensions || "Custom",
        floors,
        bedrooms: parseInt(bedrooms) || 0,
        bathrooms: parseInt(bathrooms) || 0,
        parking,
        description: finalDescription,
        file_url: fullPath,
        youtube_url: youtubeUrl.trim() || null
      });
      if (dbError) throw dbError;

      setUploadProgress(100);
      clearInterval(progressInterval);
      showToast("Plan published successfully to gallery!", "success");

      // Reset Form
      setTitle("");
      setArea("");
      setDimensions("");
      setDescription("");
      setYoutubeUrl("");
      setFullFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);

      setTimeout(() => {
        setUploadProgress(0);
        onUploadSuccess();
      }, 800);

    } catch (error: any) {
      clearInterval(progressInterval);
      showToast(`Upload failed: ${error.message}`, "error");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mb-10 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border-2 border-primary/40 overflow-hidden transition-all">
      {/* Top Banner & Collapse Bar */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-6 py-4 bg-gradient-to-r from-secondary via-slate-900 to-secondary text-white flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary text-slate-950 flex items-center justify-center font-bold text-sm shadow-sm">
            <i className="fas fa-shield-alt"></i>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white">Admin Plan Upload Portal</h2>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                Admin Active
              </span>
            </div>
            <p className="text-xs text-gray-400">Upload architectural floor plans, 3D layouts, and YouTube walkthroughs.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
          <span className="hidden sm:inline">{isOpen ? "Hide Upload Form" : "Open Upload Form"}</span>
          <div className={`w-8 h-8 rounded-full bg-white/10 flex items-center justify-center transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
            <i className="fas fa-chevron-down text-xs"></i>
          </div>
        </div>
      </div>

      {/* Expanded Form Content */}
      {isOpen && (
        <form onSubmit={handleUpload} className="p-6 md:p-8 space-y-6">
          {/* Quick Preset Chips */}
          <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                <i className="fas fa-magic text-primary"></i>
                <span>Quick Fill Indian Plot Presets:</span>
              </span>
              <span className="text-[10px] text-gray-400">Click to auto-populate dimensions &amp; area</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {PLOT_PRESETS.map((preset) => (
                <button
                  key={preset.dim}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="px-3 py-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:border-primary text-xs font-bold text-slate-700 dark:text-zinc-300 rounded-lg shadow-2xs hover:bg-primary/10 transition cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Core Plan Details */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">
                Plan Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Modern 30x40 3BHK East Facing Duplex"
                required
                disabled={isUploading}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800 text-sm font-semibold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">
                Total Area (sq. ft.) *
              </label>
              <input
                type="number"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g., 1200"
                required
                disabled={isUploading}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800 text-sm font-semibold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">
                Plot Dimensions
              </label>
              <input
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                placeholder="e.g., 30x40"
                disabled={isUploading}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800 text-sm font-semibold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
              />
            </div>
          </div>

          {/* Specifications Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">
                Plot Facing
              </label>
              <select
                value={facing}
                onChange={(e) => setFacing(e.target.value)}
                disabled={isUploading}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800 text-sm font-semibold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="East">East (Auspicious 🌅)</option>
                <option value="North">North (Kuber 🧭)</option>
                <option value="West">West 🌇</option>
                <option value="South">South ☀️</option>
                <option value="North-East">North-East (Ishanya)</option>
                <option value="North-West">North-West</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">
                Floors
              </label>
              <select
                value={floors}
                onChange={(e) => setFloors(e.target.value)}
                disabled={isUploading}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800 text-sm font-semibold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="Ground Only">Ground Floor (G)</option>
                <option value="G+1">G+1 (Duplex)</option>
                <option value="G+2">G+2 (Triplex)</option>
                <option value="G+3">G+3 (Apartment)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">
                Bedrooms (BHK)
              </label>
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                disabled={isUploading}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800 text-sm font-semibold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="1">1 BHK</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4 BHK</option>
                <option value="5">5+ BHK</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">
                Bathrooms
              </label>
              <select
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                disabled={isUploading}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800 text-sm font-semibold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="1">1 Bath</option>
                <option value="2">2 Baths</option>
                <option value="3">3 Baths</option>
                <option value="4">4 Baths</option>
                <option value="5">5+ Baths</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">
                Car Parking
              </label>
              <select
                value={parking}
                onChange={(e) => setParking(e.target.value)}
                disabled={isUploading}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800 text-sm font-semibold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="1 Car">1 Car Port</option>
                <option value="2 Cars">2 Cars Port</option>
                <option value="Bike Only">Bike Only</option>
                <option value="None">None</option>
              </select>
            </div>
          </div>

          {/* Vastu & YouTube Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Vastu Compliance Toggle */}
            <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 block">
                  Vastu Shastra Compliance
                </span>
                <span className="text-[10px] text-gray-400">
                  {isVastuCompliant ? "100% Vastu Certified" : "Custom Layout"}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVastuCompliant}
                  onChange={(e) => setIsVastuCompliant(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* YouTube Shorts / Video Link */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">
                YouTube Shorts / 3D Walkthrough Link
              </label>
              <div className="relative">
                <i className="fab fa-youtube absolute left-3.5 top-1/2 -translate-y-1/2 text-red-600 text-sm"></i>
                <input
                  type="text"
                  placeholder="https://youtube.com/shorts/... or https://youtu.be/..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  disabled={isUploading}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800 text-xs font-semibold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Description & Auto-Template */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                Detailed Room Specifications &amp; Architectural Features
              </label>
              <button
                type="button"
                onClick={insertSpecTemplate}
                className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <i className="fas fa-file-alt text-[10px]"></i>
                <span>Insert Standard Spec Template</span>
              </button>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isUploading}
              rows={4}
              placeholder="e.g., Ground floor includes large living hall (16x14), master bedroom with attached toilet, dining room, utility area and covered car porch..."
              className="w-full p-3.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white resize-y"
            />
          </div>

          {/* File Upload Dropzone with Live Preview */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
              isDragOver
                ? "border-primary bg-primary/10"
                : previewUrl
                ? "border-emerald-300 bg-emerald-50/20"
                : "border-gray-300 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800/40 hover:border-primary/60"
            }`}
          >
            {previewUrl ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <div className="relative w-36 h-36 rounded-xl overflow-hidden shadow-md border-2 border-white dark:border-zinc-700 shrink-0">
                  <img src={previewUrl} alt="Plan Preview" className="w-full h-full object-cover" />
                </div>
                <div className="text-center sm:text-left space-y-2">
                  <div className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 justify-center sm:justify-start">
                    <i className="fas fa-check-circle"></i> Image Selected
                  </div>
                  <div className="text-sm font-bold text-slate-800 dark:text-zinc-200 truncate max-w-xs">
                    {fullFile?.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {fullFile ? `${(fullFile.size / 1024 / 1024).toFixed(2)} MB` : ""}
                  </div>
                  <label htmlFor={fileInputId} className="inline-block px-3 py-1.5 bg-white dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 rounded-lg text-xs font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-50 cursor-pointer shadow-2xs">
                    Change Image
                  </label>
                  <input
                    id={fileInputId}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    disabled={isUploading}
                    className="hidden"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-xl">
                  <i className="fas fa-cloud-upload-alt"></i>
                </div>
                <div>
                  <label htmlFor={fileInputId} className="font-bold text-sm text-slate-800 dark:text-zinc-200 hover:text-primary cursor-pointer">
                    Click to select high-res plan image
                  </label>
                  <span className="text-xs text-gray-500 block mt-0.5">or drag and drop your image file here</span>
                  <input
                    id={fileInputId}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    required
                    disabled={isUploading}
                    className="hidden"
                  />
                </div>
                <p className="text-[11px] text-gray-400">Supports PNG, JPG, JPEG, WEBP (Max 15MB)</p>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {uploadProgress > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-gray-600">
                <span>Publishing to Gallery...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setTitle("");
                setArea("");
                setDescription("");
                setFullFile(null);
                setPreviewUrl(null);
              }}
              disabled={isUploading}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-50 transition cursor-pointer"
            >
              Clear Form
            </button>

            <button
              type="submit"
              disabled={isUploading || !fullFile || !title || !area}
              className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary-hover text-white dark:text-zinc-950 font-bold text-sm rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Uploading Plan...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-upload"></i>
                  <span>Publish Plan to Live Gallery</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};