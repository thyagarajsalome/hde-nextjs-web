"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { KitchenDesign, CreateKitchenDesignInput, KitchenLayoutShape } from '@/types/gallery';
import { KitchenGalleryService } from '@/services/kitchenGalleryService';
import { compressAndCropTo916, CompressionResult } from '@/utils/imageCompressor';
import { estimateIndiaKitchenCost } from '@/utils/indiaCostEstimator';
import { supabase } from '@/config/supabaseClient';

const SHAPES: KitchenLayoutShape[] = ['L-Shape', 'U-Shape', 'Parallel', 'Straight', 'Island'];
const POPULAR_FINISHES = ['High-Gloss Acrylic', 'Matte Laminate', 'Glossy Laminate', 'PU Lacquer Satin', 'Membrane Finish', 'Wood Veneer'];
const POPULAR_COUNTERTOPS = ['Jet Black Granite', 'Engineered Quartz', 'Nano White Crystal', 'Corian Solid Surface', 'Black Pearl Polished'];

export default function AdminKitchenGalleryPage() {
  const [designs, setDesigns] = useState<KitchenDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterShape, setFilterShape] = useState<string>('All');
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Auto-Calculate Budget Helper State (Admin Engine)
  const [calcLength, setCalcLength] = useState<number>(10);
  const [calcWidth, setCalcWidth] = useState<number>(8);
  const [calcSqft, setCalcSqft] = useState<number>(80);
  const [calcTier, setCalcTier] = useState<'Economy' | 'Standard' | 'Premium' | 'Ultra Luxury'>('Standard');

  const handleAdminCalculateBudget = () => {
    const l = Number(calcLength) || 0;
    const w = Number(calcWidth) || 0;
    const sqft = Number(calcSqft) || (l > 0 && w > 0 ? l * w : 80);
    const res = estimateIndiaKitchenCost({
      lengthFt: l,
      widthFt: w,
      areaSqFt: sqft,
      layoutShape: layoutShape,
      qualityTier: calcTier
    });
    setMinCost(res.minCost);
    setMaxCost(res.maxCost);
    setRatePerUnit(res.ratePerUnit);
    if (l > 0 && w > 0) {
      setDimensions(`${l} ft × ${w} ft (${sqft} sq ft)`);
    } else {
      setDimensions(`${sqft} sq ft`);
    }
    showToast(`Calculated: ${res.formattedBudget} (${res.ratePerUnit})`);
  };

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [layoutShape, setLayoutShape] = useState<KitchenLayoutShape>('L-Shape');
  const [dimensions, setDimensions] = useState('10 ft × 8 ft (80 sq ft)');
  const [countertopLength, setCountertopLength] = useState<number>(18);
  const [cabinetFinish, setCabinetFinish] = useState('High-Gloss Acrylic');
  const [countertopMaterial, setCountertopMaterial] = useState('Jet Black Granite');
  const [featuresStr, setFeaturesStr] = useState('Hydraulic Lift-Up, Tandem Drawers, Profile LED, Loft Storage');
  const [minCost, setMinCost] = useState<number>(140000);
  const [maxCost, setMaxCost] = useState<number>(200000);
  const [ratePerUnit, setRatePerUnit] = useState('₹1,600 / sq ft');
  const [altText, setAltText] = useState('');
  const [keywordsStr, setKeywordsStr] = useState('l shape modular kitchen, acrylic kitchen, modern kitchen cost');
  const [imageUrl, setImageUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSizeKb, setFileSizeKb] = useState<number>(75);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Auto-Calculator Engine Fields (India Mode)
  const [autoLength, setAutoLength] = useState<number>(15);
  const [autoWidth, setAutoWidth] = useState<number>(12);
  const [autoSqft, setAutoSqft] = useState<number>(180);
  const [qualityTier, setQualityTier] = useState<'Economy' | 'Standard' | 'Premium' | 'Ultra Luxury'>('Premium');

  const applyAutoEstimate = (sqftVal?: number, lenVal?: number, widVal?: number, tierVal?: any, shapeVal?: any) => {
    const res = estimateIndiaKitchenCost({
      lengthFt: lenVal !== undefined ? lenVal : autoLength,
      widthFt: widVal !== undefined ? widVal : autoWidth,
      areaSqFt: sqftVal !== undefined ? sqftVal : autoSqft,
      layoutShape: shapeVal || layoutShape,
      qualityTier: tierVal || qualityTier,
      cabinetFinish,
      countertopMaterial,
    });

    setMinCost(res.minCost);
    setMaxCost(res.maxCost);
    setRatePerUnit(res.ratePerUnit);
    setDimensions(res.dimensionsStr);
    showToast(`Calculated: ${res.formattedBudget} (${res.ratePerUnit})`);
  };

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadDesigns = async () => {
    setLoading(true);
    try {
      const data = await KitchenGalleryService.getDesigns('All', false);
      setDesigns(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load designs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDesigns();
  }, []);

  // Auto-generate slug and alt text from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingId) {
      const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
      setAltText(`${val} - ${layoutShape} modular kitchen design`);
    }
  };

  // Helper for budget calculation (null/undefined/NaN safe)
  const formatCostLakhs = (min?: number | null, max?: number | null) => {
    const format = (num?: number | null) => {
      const val = Number(num);
      if (isNaN(val) || val <= 0) return '₹0';
      if (val >= 100000) return `₹${(val / 100000).toFixed(2).replace(/\.00$/, '')} Lakhs`;
      return `₹${val.toLocaleString('en-IN')}`;
    };
    return `${format(min)} - ${format(max)}`;
  };

  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionStats, setCompressionStats] = useState<{ original: number; compressed: number; saved: number } | null>(null);

  // Handle File Selection with Automatic 9:16 Crop and WebP Compression
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    setUploadProgress('Auto-cropping to 9:16 & compressing into WebP...');

    try {
      const result = await compressAndCropTo916(file);
      setSelectedFile(result.file);
      setFileName(result.file.name);
      setFileSizeKb(result.compressedSizeKb);
      setPreviewUrl(result.previewUrl);
      setCompressionStats({
        original: result.originalSizeKb,
        compressed: result.compressedSizeKb,
        saved: result.reductionPercentage,
      });
      showToast(`Optimized: ${result.originalSizeKb} KB → ${result.compressedSizeKb} KB (${result.reductionPercentage}% smaller)`);
    } catch (err: any) {
      console.warn('Browser auto-compression fallback:', err);
      setSelectedFile(file);
      setFileName(file.name);
      setFileSizeKb(Math.round(file.size / 1024));
      setPreviewUrl(URL.createObjectURL(file));
    } finally {
      setIsCompressing(false);
      setUploadProgress(null);
    }
  };

  // Upload to Cloudflare R2 with automatic Supabase Storage fallback
  const uploadToR2 = async (file: File): Promise<string> => {
    // 1. Try Cloudflare R2
    try {
      setUploadProgress('Requesting secure Cloudflare R2 upload URL...');
      const res = await fetch('/api/gallery/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          category: 'kitchen',
          contentType: file.type || 'image/webp'
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.uploadUrl) {
        setUploadProgress('Uploading directly to Cloudflare R2...');
        const uploadRes = await fetch(data.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type || 'image/webp' },
          body: file
        });

        if (uploadRes.ok) {
          setUploadProgress(null);
          return data.publicUrl;
        }
      }
    } catch (r2Err) {
      console.warn('R2 upload failed or not configured, using Supabase storage fallback...', r2Err);
    }

    // 2. Seamless Fallback: Supabase Storage
    setUploadProgress('Uploading image to cloud storage...');
    const cleanName = `${Date.now()}-${file.name.toLowerCase().replace(/[^a-z0-9.-]/g, '-')}`;
    const filePath = `kitchen/${cleanName}`;

    const { error: storageError } = await supabase.storage
      .from('hero-banners')
      .upload(filePath, file, { upsert: true });

    if (!storageError) {
      const { data: { publicUrl } } = supabase.storage.from('hero-banners').getPublicUrl(filePath);
      setUploadProgress(null);
      return publicUrl;
    }

    throw new Error(`Upload failed: ${storageError.message}. Make sure R2 environment variables are configured in Vercel or enter an Image URL directly.`);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setLayoutShape('L-Shape');
    setDimensions('10 ft × 8 ft (80 sq ft)');
    setCountertopLength(18);
    setCabinetFinish('High-Gloss Acrylic');
    setCountertopMaterial('Jet Black Granite');
    setFeaturesStr('Hydraulic Lift-Up, Tandem Drawers, Profile LED, Loft Storage');
    setMinCost(140000);
    setMaxCost(200000);
    setRatePerUnit('₹1,600 / sq ft');
    setAltText('');
    setKeywordsStr('l shape modular kitchen, acrylic kitchen, modern kitchen cost');
    setImageUrl('');
    setFileName('');
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsFeatured(false);
    setIsActive(true);
    setIsFormOpen(false);
    setUploadProgress(null);
  };

  const handleEdit = (design: KitchenDesign) => {
    setEditingId(design.id);
    setTitle(design.title);
    setSlug(design.slug);
    setLayoutShape(design.layout_shape);
    setDimensions(design.dimensions);
    setCountertopLength(design.countertop_length_ft || 18);
    setCabinetFinish(design.cabinet_finish);
    setCountertopMaterial(design.countertop_material);
    setFeaturesStr(design.features?.join(', ') || '');
    setMinCost(design.min_cost);
    setMaxCost(design.max_cost);
    setRatePerUnit(design.rate_per_unit || '₹1,600 / sq ft');
    setAltText(design.alt_text);
    setKeywordsStr(design.keywords?.join(', ') || '');
    setImageUrl(design.image_url);
    setFileName(design.file_name);
    setPreviewUrl(design.image_url);
    setIsFeatured(design.is_featured);
    setIsActive(design.is_active);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const { error } = await KitchenGalleryService.deleteDesign(id);
      if (error) throw new Error(error);
      showToast(`Deleted "${title}" successfully`);
      setDesigns(prev => prev.filter(d => d.id !== id));
    } catch (err: any) {
      showToast(err.message || 'Failed to delete design', 'error');
    }
  };

  const handleToggleActive = async (design: KitchenDesign) => {
    const updatedStatus = !design.is_active;
    try {
      const { error } = await KitchenGalleryService.updateDesign(design.id, { is_active: updatedStatus });
      if (error) throw new Error(error);
      setDesigns(prev => prev.map(d => d.id === design.id ? { ...d, is_active: updatedStatus } : d));
      showToast(`Design marked as ${updatedStatus ? 'Active' : 'Draft'}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return showToast('Title is required', 'error');
    if (!selectedFile && !imageUrl) return showToast('Please select an image or provide an image URL', 'error');

    setSubmitting(true);
    try {
      let finalImageUrl = imageUrl;

      // Handle R2 upload if a file was selected
      if (selectedFile) {
        try {
          finalImageUrl = await uploadToR2(selectedFile);
        } catch (uploadErr: any) {
          console.warn('R2 upload skipped or failed:', uploadErr);
          // Fallback: If R2 is not yet configured, allow temporary preview URL or prompt
          if (!imageUrl) {
            throw new Error(`Cloudflare R2 upload error: ${uploadErr.message}. Make sure R2 environment variables are configured in .env or provide an image URL.`);
          }
        }
      }

      const formattedBudget = formatCostLakhs(minCost, maxCost);
      const features = featuresStr.split(',').map(s => s.trim()).filter(Boolean);
      const keywords = keywordsStr.split(',').map(s => s.trim()).filter(Boolean);

      const payload: CreateKitchenDesignInput = {
        title,
        slug,
        meta_title: `${title} | Kitchen Design & Cost | HDE`,
        meta_description: `Explore this ${dimensions} ${layoutShape} modular kitchen in ${cabinetFinish} finish with ${countertopMaterial} countertop. Estimated cost: ${formattedBudget}.`,
        alt_text: altText || `${title} - ${layoutShape} modular kitchen design`,
        layout_shape: layoutShape,
        dimensions,
        countertop_length_ft: countertopLength,
        cabinet_finish: cabinetFinish,
        countertop_material: countertopMaterial,
        features,
        min_cost: minCost,
        max_cost: maxCost,
        formatted_budget: formattedBudget,
        rate_per_unit: ratePerUnit,
        image_url: finalImageUrl,
        file_name: fileName || `${slug}.webp`,
        aspect_ratio: '9:16',
        file_size_kb: fileSizeKb,
        keywords,
        is_featured: isFeatured,
        is_active: isActive,
        display_order: designs.length + 1
      };

      if (editingId) {
        const { error } = await KitchenGalleryService.updateDesign(editingId, payload);
        if (error) throw new Error(error);
        showToast('Kitchen design updated successfully!');
      } else {
        const { data, error } = await KitchenGalleryService.createDesign(payload);
        if (error) throw new Error(error);
        showToast('New kitchen design created and published successfully!');
      }

      resetForm();
      loadDesigns();
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
    }
  };

  const filteredDesigns = filterShape === 'All' 
    ? designs 
    : designs.filter(d => d.layout_shape === filterShape);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-bold text-white transition-all ${
            toastMessage.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}>
            <i className={`fas ${toastMessage.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} text-lg`}></i>
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Top Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 dark:border-zinc-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold mb-1">
              <Link href="/" className="hover:text-primary">Home</Link>
              <span>/</span>
              <span className="text-gray-400">Admin</span>
              <span>/</span>
              <span className="text-primary font-bold">Kitchen Gallery Manager</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-secondary dark:text-zinc-100 flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <i className="fas fa-kitchen-set"></i>
              </span>
              Kitchen Gallery Management (CRUD)
            </h1>
            <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
              Upload 9:16 mobile-friendly WebP photos, set shapes, dimensions, and approximate INR budget ranges.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/gallery/kitchen-designs"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 font-bold text-sm hover:bg-gray-50 transition-all shadow-sm"
            >
              <i className="fas fa-external-link-alt text-xs text-primary"></i> View Public Gallery
            </Link>
            <button
              onClick={() => {
                if (isFormOpen) resetForm();
                else setIsFormOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white dark:text-zinc-950 font-bold text-sm transition-all shadow-md"
            >
              <i className={`fas ${isFormOpen ? 'fa-times' : 'fa-plus'}`}></i>
              {isFormOpen ? 'Close Form' : 'Add Kitchen Design'}
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Designs</div>
            <div className="text-2xl font-black text-secondary dark:text-zinc-100 mt-1">{designs.length}</div>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Published</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{designs.filter(d => d.is_active).length}</div>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">L-Shape Layouts</div>
            <div className="text-2xl font-black text-amber-600 mt-1">{designs.filter(d => d.layout_shape === 'L-Shape').length}</div>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Storage Target</div>
            <div className="text-sm font-bold text-gray-800 dark:text-zinc-200 mt-2 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Cloudflare R2
            </div>
          </div>
        </div>

        {/* Create / Edit Form Drawer */}
        {isFormOpen && (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-2xl border-2 border-primary/30 p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-4">
              <h2 className="text-xl font-bold text-secondary dark:text-zinc-100 flex items-center gap-2">
                <i className="fas fa-edit text-primary"></i>
                {editingId ? 'Edit Kitchen Design' : 'Add New Kitchen Design'}
              </h2>
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-gray-400 hover:text-gray-600 font-bold"
              >
                Reset / Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: 9:16 Visual Dropzone */}
              <div className="lg:col-span-4 space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
                  Design Image (9:16 Aspect Ratio) <span className="text-rose-500">*</span>
                </label>

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative aspect-[9/16] w-full max-w-[280px] mx-auto rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${
                    previewUrl 
                      ? 'border-emerald-500 bg-zinc-950' 
                      : 'border-gray-300 dark:border-zinc-700 hover:border-primary bg-gray-50 dark:bg-zinc-800/30'
                  }`}
                >
                  {previewUrl ? (
                    <>
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-bold transition-opacity">
                        <i className="fas fa-camera text-2xl mb-2"></i>
                        Click to Replace Image
                      </div>
                      <div className="absolute top-3 left-3 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        9:16 Preview
                      </div>
                      {fileSizeKb > 0 && (
                        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          ~{fileSizeKb} KB
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center p-6 space-y-3">
                      <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl">
                        <i className="fas fa-cloud-arrow-up"></i>
                      </div>
                      <div>
                        <span className="text-sm font-bold text-gray-800 dark:text-zinc-200 block">Click to Upload .webp</span>
                        <span className="text-xs text-gray-500 block mt-1">Mobile vertical 9:16 format (720x1280 px ideal)</span>
                      </div>
                    </div>
                  )}

                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    accept="image/webp,image/jpeg,image/png"
                    className="hidden" 
                  />
                </div>

                {/* Direct Image URL input for fallback / remote CDN */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">
                    Or Direct Image CDN URL:
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      if (!selectedFile) setPreviewUrl(e.target.value);
                    }}
                    placeholder="https://cdn.homedesignenglish.com/gallery/kitchen/..."
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-mono"
                  />
                </div>
              </div>

              {/* Right Column: Specification & Pricing Inputs */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Title and Slug */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                      Design Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="e.g. Modern L-Shape Acrylic Kitchen with Breakfast Counter"
                      required
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-bold focus:border-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                      SEO Slug <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="modern-l-shape-acrylic-kitchen"
                      required
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-mono focus:border-primary outline-none"
                    />
                  </div>
                </div>

                {/* Auto-Calculate Budget Engine (India Mode) */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-primary/5 to-amber-500/10 border border-amber-500/30 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center text-xs">
                        <i className="fas fa-calculator"></i>
                      </span>
                      <div>
                        <p className="text-xs font-black text-amber-900 dark:text-amber-200">
                          ⚡ Auto-Calculate Budget from Sq.Ft (India Engine)
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-zinc-400">
                          Enter room dimensions or total sqft to auto-populate pricing &amp; budget in seconds.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => applyAutoEstimate()}
                      className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                    >
                      <i className="fas fa-bolt text-[10px]"></i>
                      <span>Calculate Budget</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">Length (ft)</label>
                      <input
                        type="number"
                        value={autoLength}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setAutoLength(val);
                          const newSqft = val * autoWidth;
                          setAutoSqft(newSqft);
                          applyAutoEstimate(newSqft, val, autoWidth);
                        }}
                        className="w-full p-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">Width (ft)</label>
                      <input
                        type="number"
                        value={autoWidth}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setAutoWidth(val);
                          const newSqft = autoLength * val;
                          setAutoSqft(newSqft);
                          applyAutoEstimate(newSqft, autoLength, val);
                        }}
                        className="w-full p-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">Total Area (sq ft)</label>
                      <input
                        type="number"
                        value={autoSqft}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setAutoSqft(val);
                          applyAutoEstimate(val);
                        }}
                        className="w-full p-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-black text-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">Quality Tier</label>
                      <select
                        value={qualityTier}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setQualityTier(val);
                          applyAutoEstimate(autoSqft, autoLength, autoWidth, val);
                        }}
                        className="w-full p-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-semibold"
                      >
                        <option value="Economy">Economy (Laminate)</option>
                        <option value="Standard">Standard (Marine Ply)</option>
                        <option value="Premium">Premium (Acrylic/Quartz)</option>
                        <option value="Ultra Luxury">Ultra Luxury (PU/Dekton)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Layout Shape & Dimensions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                      Layout Shape <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={layoutShape}
                      onChange={(e) => {
                        setLayoutShape(e.target.value as KitchenLayoutShape);
                        setAltText(`${title || 'Modern'} - ${e.target.value} modular kitchen design`);
                      }}
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-semibold focus:border-primary outline-none"
                    >
                      {SHAPES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                      Room Dimensions <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={dimensions}
                      onChange={(e) => setDimensions(e.target.value)}
                      placeholder="e.g. 10 ft × 8 ft (80 sq ft)"
                      required
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:border-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                      Countertop Length (ft)
                    </label>
                    <input
                      type="number"
                      value={countertopLength}
                      onChange={(e) => setCountertopLength(Number(e.target.value))}
                      placeholder="e.g. 18"
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:border-primary outline-none"
                    />
                  </div>
                </div>

                {/* Cabinet Finish & Countertop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                      Cabinet Finish <span className="text-rose-500">*</span>
                    </label>
                    <input
                      list="finishes"
                      value={cabinetFinish}
                      onChange={(e) => setCabinetFinish(e.target.value)}
                      placeholder="e.g. High-Gloss Acrylic"
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:border-primary outline-none"
                    />
                    <datalist id="finishes">
                      {POPULAR_FINISHES.map(f => <option key={f} value={f} />)}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                      Countertop Material <span className="text-rose-500">*</span>
                    </label>
                    <input
                      list="countertops"
                      value={countertopMaterial}
                      onChange={(e) => setCountertopMaterial(e.target.value)}
                      placeholder="e.g. Jet Black Granite"
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:border-primary outline-none"
                    />
                    <datalist id="countertops">
                      {POPULAR_COUNTERTOPS.map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                </div>

                {/* ⚡ Auto-Calculate Budget from Sq.Ft (India Engine) */}
                <div className="p-4 sm:p-5 rounded-3xl bg-[#fffcf5] dark:bg-amber-950/20 border border-[#fde68a] dark:border-amber-900/40 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/50 dark:border-amber-900/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center text-base shrink-0 shadow-xs">
                        <i className="fas fa-calculator"></i>
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 dark:text-zinc-100 text-sm sm:text-base flex items-center gap-1.5">
                          <span className="text-amber-500">⚡</span>
                          <span>Auto-Calculate Budget from Sq.Ft (India Engine)</span>
                        </h3>
                        <p className="text-gray-600 dark:text-zinc-400 text-xs">
                          Enter room dimensions or total sqft to auto-populate pricing &amp; budget in seconds.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAdminCalculateBudget}
                      className="px-5 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#b38e47] text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
                    >
                      <i className="fas fa-bolt"></i>
                      <span>Calculate Budget</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 dark:text-zinc-400 mb-1">Length (ft)</label>
                      <input
                        type="number"
                        min="4"
                        max="60"
                        value={calcLength}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setCalcLength(val);
                          if (val > 0 && calcWidth > 0) setCalcSqft(val * calcWidth);
                        }}
                        className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-bold text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 dark:text-zinc-400 mb-1">Width (ft)</label>
                      <input
                        type="number"
                        min="4"
                        max="40"
                        value={calcWidth}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setCalcWidth(val);
                          if (val > 0 && calcLength > 0) setCalcSqft(calcLength * val);
                        }}
                        className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-bold text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 dark:text-zinc-400 mb-1">Total Area (sq ft)</label>
                      <input
                        type="number"
                        min="20"
                        max="1500"
                        value={calcSqft}
                        onChange={(e) => setCalcSqft(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-zinc-900 text-sm font-black text-amber-700 dark:text-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 dark:text-zinc-400 mb-1">Quality Tier</label>
                      <select
                        value={calcTier}
                        onChange={(e) => setCalcTier(e.target.value as any)}
                        className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-bold text-gray-900 dark:text-white"
                      >
                        <option value="Economy">Economy (MDF / Particle Board)</option>
                        <option value="Standard">Standard (Marine Ply / MR Plywood)</option>
                        <option value="Premium">Premium (BWP Marine Ply + Acrylic)</option>
                        <option value="Ultra Luxury">Ultra Luxury (PU Lacquered / Glass)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Budget Range (INR) */}
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                      Approximate Cost Range (INR)
                    </span>
                    <span className="text-sm font-black text-amber-800 dark:text-amber-300 font-mono">
                      Preview: {formatCostLakhs(minCost, maxCost)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">Min Budget (₹)</label>
                      <input
                        type="number"
                        step="5000"
                        value={minCost}
                        onChange={(e) => setMinCost(Number(e.target.value))}
                        className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">Max Budget (₹)</label>
                      <input
                        type="number"
                        step="5000"
                        value={maxCost}
                        onChange={(e) => setMaxCost(Number(e.target.value))}
                        className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">Rate / Unit Tag</label>
                      <input
                        type="text"
                        value={ratePerUnit}
                        onChange={(e) => setRatePerUnit(e.target.value)}
                        placeholder="₹1,600 / sq ft"
                        className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Features & Keywords */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                      Key Hardware &amp; Features (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={featuresStr}
                      onChange={(e) => setFeaturesStr(e.target.value)}
                      placeholder="Tandem Drawers, Loft Storage, Profile LED"
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs focus:border-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                      Search Keywords (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={keywordsStr}
                      onChange={(e) => setKeywordsStr(e.target.value)}
                      placeholder="l shape kitchen, acrylic kitchen cost"
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs focus:border-primary outline-none"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-gray-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary"
                    />
                    <span>Active (Visible on public gallery)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-gray-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary"
                    />
                    <span>Featured Hero Design</span>
                  </label>
                </div>

              </div>
            </div>

            {/* Submission Progress & Submit Button */}
            <div className="border-t border-gray-200 dark:border-zinc-800 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              {uploadProgress ? (
                <div className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>{uploadProgress}</span>
                </div>
              ) : (
                <div className="text-xs text-gray-400">
                  Click save to upload to Cloudflare R2 and publish to the gallery catalog.
                </div>
              )}

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-3 rounded-xl border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 text-sm font-bold hover:bg-gray-100 transition-all flex-1 sm:flex-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white dark:text-zinc-950 text-sm font-bold shadow-lg transition-all flex-1 sm:flex-none flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting && <i className="fas fa-spinner fa-spin"></i>}
                  <span>{editingId ? 'Save Changes' : 'Publish Kitchen Design'}</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Shape Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-zinc-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mr-1">Filter Layout:</span>
            {['All', ...SHAPES].map((shape) => (
              <button
                key={shape}
                onClick={() => setFilterShape(shape)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterShape === shape
                    ? 'bg-secondary text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200'
                }`}
              >
                {shape}
              </button>
            ))}
          </div>

          <div className="text-xs text-gray-500 font-semibold">
            Showing <strong className="text-secondary dark:text-zinc-100">{filteredDesigns.length}</strong> designs
          </div>
        </div>

        {/* CRUD Management Table */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-20 text-center text-gray-400">
              <i className="fas fa-spinner fa-spin text-3xl mb-3 text-primary"></i>
              <p className="font-bold text-sm">Loading kitchen designs...</p>
            </div>
          ) : filteredDesigns.length === 0 ? (
            <div className="py-20 text-center text-gray-400 border-2 border-dashed border-gray-100 dark:border-zinc-800 rounded-2xl m-6">
              <i className="fas fa-kitchen-set text-4xl mb-3 opacity-30"></i>
              <p className="font-bold text-base text-gray-600 dark:text-zinc-400">No kitchen designs found</p>
              <p className="text-xs text-gray-400 mt-1">Click &quot;Add Kitchen Design&quot; above to upload your first design.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-zinc-950/60 border-b border-gray-200 dark:border-zinc-800 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Visual (9:16)</th>
                    <th className="py-3.5 px-4">Title &amp; Specifications</th>
                    <th className="py-3.5 px-4">Layout Shape</th>
                    <th className="py-3.5 px-4">Budget Range</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {filteredDesigns.map((design) => (
                    <tr key={design.id} className="hover:bg-gray-50/70 dark:hover:bg-zinc-800/30 transition-colors">
                      
                      {/* Thumbnail */}
                      <td className="py-3 px-4 w-24">
                        <div className="w-16 aspect-[9/16] rounded-lg overflow-hidden bg-zinc-900 border border-gray-200 dark:border-zinc-700 shadow-sm relative group">
                          <img 
                            src={design.image_url} 
                            alt={design.alt_text} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                          />
                        </div>
                      </td>

                      {/* Title and Specs */}
                      <td className="py-3 px-4 max-w-sm">
                        <div className="font-bold text-gray-900 dark:text-zinc-100 text-sm leading-tight">
                          {design.title}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5 truncate">
                          /{design.slug}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-gray-600 dark:text-zinc-400">
                          <span className="bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded font-medium">
                            {design.dimensions}
                          </span>
                          <span className="bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded font-medium">
                            {design.cabinet_finish}
                          </span>
                        </div>
                      </td>

                      {/* Shape Badge */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                          {design.layout_shape}
                        </span>
                      </td>

                      {/* Budget */}
                      <td className="py-3 px-4">
                        <div className="font-black text-secondary dark:text-zinc-100 text-sm">
                          {design.formatted_budget}
                        </div>
                        {design.rate_per_unit && (
                          <div className="text-[11px] text-gray-500 font-medium">
                            {design.rate_per_unit}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleActive(design)}
                          title="Click to toggle status"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                            design.is_active
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${design.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                          {design.is_active ? 'Active' : 'Draft'}
                        </button>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleEdit(design)}
                            title="Edit specifications"
                            className="p-2 rounded-lg bg-gray-100 dark:bg-zinc-800 hover:bg-primary/20 hover:text-primary text-gray-700 dark:text-zinc-300 text-xs font-bold transition-all"
                          >
                            <i className="fas fa-pencil-alt"></i>
                          </button>

                          <button
                            onClick={() => handleDelete(design.id, design.title)}
                            title="Delete design"
                            className="p-2 rounded-lg bg-gray-100 dark:bg-zinc-800 hover:bg-rose-500/20 hover:text-rose-600 text-gray-700 dark:text-zinc-300 text-xs font-bold transition-all"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
