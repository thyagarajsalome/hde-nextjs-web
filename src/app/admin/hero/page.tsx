"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/config/supabaseClient";
import { useToast } from "@/context/ToastContext";
import { HeroBanner, HeroService } from "@/services/heroService";

export default function AdminHeroManagerPage() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("Modern Architecture");
  const [subtitle, setSubtitle] = useState("HDE Premium Planning");
  const [directUrl, setDirectUrl] = useState("");
  const [useUrlMode, setUseUrlMode] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const loadBanners = async () => {
    try {
      setLoading(true);
      const data = await HeroService.getBanners();
      setBanners(data);
      if (typeof window !== "undefined") {
        localStorage.setItem("hde_hero_banners_cache", JSON.stringify(data));
      }
    } catch (err) {
      console.error("Error loading hero banners:", err);
      showToast("Failed to load hero slides from database", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const objectUrl = URL.createObjectURL(selected);
      setPreviewUrl(objectUrl);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalImageUrl = "";

    setUploading(true);
    try {
      if (useUrlMode) {
        if (!directUrl.trim()) {
          showToast("Please enter a valid image URL", "error");
          setUploading(false);
          return;
        }
        finalImageUrl = directUrl.trim();
      } else {
        if (!file) {
          showToast("Please select an image file to upload", "error");
          setUploading(false);
          return;
        }

        // 1. Generate unique file name
        const fileExt = file.name.split(".").pop();
        const fileName = `hero-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `public/${fileName}`;

        // 2. Upload to Supabase Storage
        const { error: storageError } = await supabase.storage
          .from("hero-banners")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (storageError) {
          throw new Error(`Storage upload error: ${storageError.message}`);
        }

        // 3. Get Public URL
        const { data: urlData } = supabase.storage
          .from("hero-banners")
          .getPublicUrl(filePath);

        finalImageUrl = urlData.publicUrl;
      }

      // 4. Save record to Database table `hero_banners`
      const { error: dbError } = await supabase.from("hero_banners").insert({
        image_url: finalImageUrl,
        title: title.trim() || "Modern Architecture",
        subtitle: subtitle.trim() || "HDE Premium Planning",
        order_index: banners.length,
      });

      if (dbError) throw dbError;

      // Invalidate cache so homepage re-renders fresh slides
      if (typeof window !== "undefined") {
        localStorage.removeItem("hde_hero_banners_cache");
      }

      showToast("Hero banner slide published successfully!", "success");

      // Reset form
      setFile(null);
      setPreviewUrl(null);
      setDirectUrl("");
      setTitle("Modern Architecture");
      setSubtitle("HDE Premium Planning");
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Refresh banners list
      await loadBanners();
    } catch (err: any) {
      console.error("Hero upload failed:", err);
      showToast(err.message || "Failed to publish hero slide", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (banner: HeroBanner) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this hero slide from the homepage?"
    );
    if (!isConfirmed) return;

    try {
      // 1. Try to delete from storage if hosted on Supabase hero-banners bucket
      if (banner.image_url?.includes("/hero-banners/")) {
        const parts = banner.image_url.split("/hero-banners/");
        if (parts.length > 1) {
          const filePath = parts[1];
          await supabase.storage.from("hero-banners").remove([filePath]);
        }
      }

      // 2. Delete from database
      const { error: dbError } = await supabase
        .from("hero_banners")
        .delete()
        .eq("id", banner.id);

      if (dbError) throw dbError;

      // Invalidate cache
      if (typeof window !== "undefined") {
        localStorage.removeItem("hde_hero_banners_cache");
      }

      showToast("Hero slide removed successfully", "success");
      await loadBanners();
    } catch (err: any) {
      console.error("Failed to delete banner:", err);
      showToast(err.message || "Failed to delete slide", "error");
    }
  };

  return (
    <div className="space-y-7 max-w-6xl mx-auto">
      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#0f2042] text-[#c5a059] flex items-center justify-center text-sm shadow-xs font-black">
                <i className="fas fa-images"></i>
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0f2042] tracking-tight">
                Homepage Hero Banners Manager
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              Add, preview, and manage full-width architectural background images displayed in the top hero slider on the Home Design English homepage.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition no-underline shadow-2xs"
            >
              <i className="fas fa-arrow-up-right-from-square text-[11px] text-[#0f2042]"></i>
              <span>View Live Homepage</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Upload Form on Left, Active Slides on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload New Hero Slide Form (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <i className="fas fa-cloud-arrow-up text-[#c5a059] text-base"></i>
              <h2 className="text-base font-black text-[#0f2042]">Upload New Hero Slide</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setUseUrlMode(!useUrlMode);
                setFile(null);
                setPreviewUrl(null);
              }}
              className="text-[11px] font-bold text-[#0f2042] hover:underline cursor-pointer"
            >
              {useUrlMode ? "Switch to File Upload" : "Paste URL Instead"}
            </button>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            {!useUrlMode ? (
              /* File Upload Zone */
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Select High-Res Hero Image (1920×800 or 16:9 recommended)
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-[#0f2042] rounded-xl p-6 text-center cursor-pointer transition bg-slate-50/60 hover:bg-slate-50 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-[#0f2042] flex items-center justify-center text-xl mx-auto mb-2 group-hover:scale-105 transition-transform">
                    <i className="fas fa-image text-[#c5a059]"></i>
                  </div>
                  {file ? (
                    <div>
                      <p className="text-xs font-bold text-[#0f2042] truncate max-w-xs mx-auto">
                        {file.name}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to publish
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-slate-700">
                        Click to browse or drop hero image here
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Supports WebP, JPG, or PNG (up to 10 MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Direct URL Input */
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Direct Hero Image URL (Cloudflare R2 or CDN)
                </label>
                <input
                  type="url"
                  placeholder="https://pub-....r2.dev/hero-banner-modern.webp"
                  value={directUrl}
                  onChange={(e) => {
                    setDirectUrl(e.target.value);
                    setPreviewUrl(e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0f2042]"
                />
              </div>
            )}

            {/* Live Preview If Available */}
            {previewUrl && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Slide Preview
                </span>
                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-2xs">
                  <img
                    src={previewUrl}
                    alt="Hero Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 p-3 flex flex-col justify-end text-white">
                    <p className="text-xs font-black leading-tight drop-shadow-sm">{title}</p>
                    <p className="text-[10px] text-slate-200 drop-shadow-sm">{subtitle}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Slide Title */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Overlay Title (Headline)
              </label>
              <input
                type="text"
                placeholder="e.g. Modern Luxury Villa Architecture"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0f2042]"
              />
            </div>

            {/* Slide Subtitle */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Overlay Subtitle (Description)
              </label>
              <input
                type="text"
                placeholder="e.g. Turnkey Construction & Working CAD Blueprints"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0f2042]"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading || (!file && !directUrl.trim())}
              className="w-full py-3 rounded-xl bg-[#0f2042] hover:bg-[#1a3360] text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <i className={`fas ${uploading ? "fa-spinner fa-spin" : "fa-cloud-arrow-up"} text-[#c5a059]`}></i>
              <span>{uploading ? "Uploading & Publishing..." : "Publish Hero Slide"}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Active Hero Slides List (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <i className="fas fa-layer-group text-[#c5a059] text-base"></i>
              <h2 className="text-base font-black text-[#0f2042]">
                Active Homepage Slides ({banners.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={loadBanners}
              className="text-[11px] font-bold text-slate-500 hover:text-[#0f2042] flex items-center gap-1 cursor-pointer"
              title="Refresh banner list"
            >
              <i className={`fas fa-rotate ${loading ? "fa-spin" : ""}`}></i>
              <span>Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <i className="fas fa-spinner fa-spin text-2xl text-[#c5a059] mb-2"></i>
              <p className="text-xs font-semibold">Loading hero slides...</p>
            </div>
          ) : banners.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <i className="fas fa-images text-3xl text-slate-300"></i>
              <p className="text-xs font-bold text-slate-600">No custom hero slides published yet</p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Upload your first hero image on the left to display it as the primary banner on the homepage.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {banners.map((banner, index) => (
                <div
                  key={banner.id}
                  className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs group flex flex-col justify-between"
                >
                  <div className="relative aspect-video bg-slate-900 overflow-hidden">
                    <img
                      src={banner.image_url}
                      alt={banner.title || "Hero Slide"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Order index pill */}
                    <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-white/20">
                      Slide #{index + 1}
                    </div>

                    {/* Delete action overlay button */}
                    <button
                      type="button"
                      onClick={() => handleDelete(banner)}
                      className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs opacity-90 hover:opacity-100 hover:scale-110 transition shadow-md cursor-pointer"
                      title="Delete this hero slide"
                    >
                      <i className="fas fa-trash-alt text-[10px]"></i>
                    </button>

                    {/* Overlay info */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-white">
                      <p className="text-xs font-black truncate">{banner.title}</p>
                      <p className="text-[10px] text-slate-300 truncate">{banner.subtitle}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-mono text-[10px] truncate max-w-[180px]">
                      {banner.image_url.split("/").pop()}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(banner)}
                      className="text-rose-600 hover:text-rose-700 font-bold text-xs cursor-pointer flex items-center gap-1"
                    >
                      <i className="fas fa-trash-alt text-[10px]"></i>
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
