"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { BathroomDesign, CreateBathroomDesignInput, BathroomLayoutType } from '@/types/gallery';
import { bathroomGalleryService } from '@/services/bathroomGalleryService';
import { compressAndCropTo916 } from '@/utils/imageCompressor';
import { estimateIndiaBathroomCost } from '@/utils/indiaCostEstimator';
import { supabase } from '@/config/supabaseClient';

const LAYOUT_TYPES: BathroomLayoutType[] = [
  'Master Bathroom',
  'Wet & Dry Partition',
  'Compact 3-Fixture',
  'Powder Room',
  'Luxury Suite'
];

const POPULAR_TILES = [
  'Vitrified Matte (2x4 ft) + Accent Highlighter',
  'Statuario Gold High-Gloss Porcelain Slabs',
  'Terrazzo Anti-Skid Floor + Subway Wall Tiles',
  'Handmade Moroccan Patterned Tiles',
  'Grey Slate & Wood-Plank Ceramic Tiles'
];

const POPULAR_VANITIES = [
  'Wall-Hung Floating Vanity with Quartz Top',
  'Dual Basin Granite Counter with Marine Ply Cabinet',
  'Compact Corner PVC Vanity with Integrated Basin',
  'Reclaimed Teak Slab with Ceramic Vessel Bowl',
  'Solid Oak Vanity with Italian Marble Counter'
];

const POPULAR_BRANDS = [
  'Jaquar Concealed Diverter & Rain Shower',
  'Kohler Matte Black Thermostatic Diverter',
  'Grohe Single-Lever Basin Mixer & Handset',
  'Hansgrohe Multi-Jet Raindance Panel',
  'Hindware / Cera Italian Collection'
];

const POPULAR_PARTITIONS = [
  '10mm Toughened Frameless Glass Partition',
  'Black-Framed Grid Glass Enclosure with Sliding Door',
  'Fixed Compact Splash Guard (2.5 ft)',
  'Walk-in Open Shower with Extra-Clear Divider',
  'Dry Powder Room (No Shower Area)'
];

export default function AdminBathroomGalleryPage() {
  const [designs, setDesigns] = useState<BathroomDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('All');
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [layoutType, setLayoutType] = useState<BathroomLayoutType>('Wet & Dry Partition');
  const [dimensions, setDimensions] = useState('8 ft × 6 ft (48 sq ft)');
  const [tileConcept, setTileConcept] = useState('Vitrified Matte (2x4 ft) + Accent Highlighter');
  const [vanityType, setVanityType] = useState('Wall-Hung Floating Vanity with Quartz Top');
  const [fittingsBrand, setFittingsBrand] = useState('Jaquar Concealed Diverter & Rain Shower');
  const [partitionType, setPartitionType] = useState('10mm Toughened Frameless Glass Partition');
  const [featuresStr, setFeaturesStr] = useState('Toughened Glass Partition, LED Backlit Mirror, Wall-Hung WC, Shower Niche, Anti-Skid Tiles');
  const [minCost, setMinCost] = useState<number>(120000);
  const [maxCost, setMaxCost] = useState<number>(195000);
  const [ratePerUnit, setRatePerUnit] = useState('₹2,450 / sq ft');
  const [altText, setAltText] = useState('');
  const [keywordsStr, setKeywordsStr] = useState('bathroom design india, wet dry bathroom partition, modern bathroom cost, small bathroom tiles');
  const [imageUrl, setImageUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSizeKb, setFileSizeKb] = useState<number>(75);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Auto-Calculator Engine Fields (India Mode)
  const [autoLength, setAutoLength] = useState<number>(8);
  const [autoWidth, setAutoWidth] = useState<number>(7);
  const [autoSqft, setAutoSqft] = useState<number>(56);
  const [qualityTier, setQualityTier] = useState<'Standard' | 'Premium' | 'Luxury'>('Premium');

  const applyAutoEstimate = (sqftVal?: number, lenVal?: number, widVal?: number, tierVal?: any, layoutVal?: any) => {
    const res = estimateIndiaBathroomCost({
      lengthFt: lenVal !== undefined ? lenVal : autoLength,
      widthFt: widVal !== undefined ? widVal : autoWidth,
      areaSqFt: sqftVal !== undefined ? sqftVal : autoSqft,
      layoutType: layoutVal || layoutType,
      qualityTier: tierVal || qualityTier,
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
      const data = await bathroomGalleryService.getAllDesignsForAdmin();
      setDesigns(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load bathroom designs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDesigns();
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingId) {
      const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
      setAltText(`${val} - ${layoutType} bathroom design`);
    }
  };

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);

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
    }
  };

  const resetForm = () => {
    setTitle('');
    setSlug('');
    setLayoutType('Wet & Dry Partition');
    setDimensions('8 ft × 6 ft (48 sq ft)');
    setTileConcept('Vitrified Matte (2x4 ft) + Accent Highlighter');
    setVanityType('Wall-Hung Floating Vanity with Quartz Top');
    setFittingsBrand('Jaquar Concealed Diverter & Rain Shower');
    setPartitionType('10mm Toughened Frameless Glass Partition');
    setFeaturesStr('Toughened Glass Partition, LED Backlit Mirror, Wall-Hung WC, Shower Niche, Anti-Skid Tiles');
    setMinCost(85000);
    setMaxCost(140000);
    setRatePerUnit('₹1,800 / sq ft');
    setAltText('');
    setKeywordsStr('bathroom design india, wet dry bathroom partition, modern bathroom cost');
    setImageUrl('');
    setFileName('');
    setFileSizeKb(75);
    setIsFeatured(false);
    setIsActive(true);
    setSelectedFile(null);
    setPreviewUrl(null);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (design: BathroomDesign) => {
    setEditingId(design.id);
    setTitle(design.title || '');
    setSlug(design.slug || '');
    setLayoutType(design.layout_type || 'Wet & Dry Partition');
    setDimensions(design.dimensions || '8 ft × 6 ft (48 sq ft)');
    setTileConcept(design.tile_concept || '');
    setVanityType(design.vanity_type || '');
    setFittingsBrand(design.fittings_brand || '');
    setPartitionType(design.partition_type || '');
    setFeaturesStr(design.features?.join(', ') || '');
    setMinCost(Number(design.min_cost) || 85000);
    setMaxCost(Number(design.max_cost) || 140000);
    setRatePerUnit(design.rate_per_unit || '₹1,800 / sq ft');
    setAltText(design.alt_text || '');
    setKeywordsStr(design.keywords?.join(', ') || '');
    setImageUrl(design.image_url || '');
    setFileName(design.file_name || '');
    setFileSizeKb(design.file_size_kb || 75);
    setIsFeatured(Boolean(design.is_featured));
    setIsActive(design.is_active ?? true);
    setPreviewUrl(design.image_url || null);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dimensions.trim()) {
      showToast('Please provide a title and dimensions.', 'error');
      return;
    }

    let finalImageUrl = imageUrl;
    let finalFileName = fileName || `${slug}.webp`;

    if (selectedFile) {
      setUploadProgress('Requesting secure Cloudflare R2 upload URL...');
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        const res = await fetch('/api/gallery/upload-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            fileName: selectedFile.name,
            contentType: selectedFile.type || 'image/webp',
            fileSize: selectedFile.size,
            category: 'bathroom'
          })
        });

        const data = await res.json();
        if (!res.ok || !data.success || !data.uploadUrl) {
          throw new Error(data.error || 'Failed to get Cloudflare R2 upload URL');
        }

        setUploadProgress('Uploading 9:16 WebP directly to Cloudflare R2...');
        const uploadRes = await fetch(data.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': selectedFile.type || 'image/webp' },
          body: selectedFile
        });

        if (!uploadRes.ok) {
          throw new Error(`Cloudflare R2 rejected upload with HTTP status ${uploadRes.status}`);
        }

        finalImageUrl = data.publicUrl;
        finalFileName = selectedFile.name;
        setUploadProgress(null);
      } catch (r2Err: any) {
        setUploadProgress(null);
        showToast(r2Err.message || 'Cloudflare R2 upload failed', 'error');
        return;
      }
    }

    if (!finalImageUrl) {
      showToast('Please upload an image or provide an image URL.', 'error');
      return;
    }

    setSubmitting(true);
    const parsedFeatures = featuresStr.split(',').map(s => s.trim()).filter(Boolean);
    const parsedKeywords = keywordsStr.split(',').map(s => s.trim()).filter(Boolean);
    const calculatedBudget = formatCostLakhs(minCost, maxCost);

    const payload: CreateBathroomDesignInput = {
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      alt_text: altText || `${title} - ${layoutType} bathroom design`,
      layout_type: layoutType,
      dimensions,
      tile_concept: tileConcept,
      vanity_type: vanityType,
      fittings_brand: fittingsBrand,
      partition_type: partitionType,
      features: parsedFeatures,
      min_cost: minCost,
      max_cost: maxCost,
      formatted_budget: calculatedBudget,
      rate_per_unit: ratePerUnit,
      image_url: finalImageUrl,
      file_name: finalFileName,
      aspect_ratio: '9:16',
      file_size_kb: fileSizeKb,
      keywords: parsedKeywords,
      is_featured: isFeatured,
      is_active: isActive
    };

    if (editingId) {
      const res = await bathroomGalleryService.updateDesign(editingId, payload);
      if (res.success) {
        showToast('Bathroom design updated successfully!');
        resetForm();
        loadDesigns();
      } else {
        showToast(res.error || 'Update failed', 'error');
      }
    } else {
      const res = await bathroomGalleryService.createDesign(payload);
      if (res.success) {
        showToast('Bathroom design created successfully!');
        resetForm();
        loadDesigns();
      } else {
        showToast(res.error || 'Failed to save design', 'error');
      }
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    const ok = await bathroomGalleryService.deleteDesign(id);
    if (ok) {
      showToast('Design deleted successfully.');
      loadDesigns();
    } else {
      showToast('Failed to delete design.', 'error');
    }
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    const ok = await bathroomGalleryService.toggleActive(id, currentState);
    if (ok) {
      showToast(`Design marked as ${!currentState ? 'Active' : 'Inactive'}.`);
      loadDesigns();
    }
  };

  const filteredDesigns = filterType === 'All'
    ? designs
    : designs.filter(d => {
        if (filterType === 'Compact 3-Fixture') {
          return d.layout_type === 'Compact 3-Fixture' ||
            d.slug?.toLowerCase().includes('3-fixture') ||
            d.title?.toLowerCase().includes('3-fixture') ||
            (Array.isArray(d.keywords) && d.keywords.includes('Compact 3-Fixture'));
        }
        if (filterType === 'Wet & Dry Partition') {
          return d.layout_type === 'Wet & Dry Partition' &&
            !d.slug?.toLowerCase().includes('3-fixture') &&
            !d.title?.toLowerCase().includes('3-fixture') &&
            !(Array.isArray(d.keywords) && d.keywords.includes('Compact 3-Fixture'));
        }
        return d.layout_type === filterType;
      });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-white font-medium text-sm transition-all ${
            toastMessage.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'
          }`}>
            <div className="flex items-center gap-2">
              <i className={`fas ${toastMessage.type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}`}></i>
              <span>{toastMessage.text}</span>
            </div>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              <Link href="/admin" className="hover:text-primary">Admin</Link>
              <span>/</span>
              <Link href="/admin/gallery" className="hover:text-primary">Gallery</Link>
              <span>/</span>
              <span className="text-primary">Bathrooms</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-secondary dark:text-zinc-100 flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <i className="fas fa-bath"></i>
              </span>
              Modern Bathroom Gallery
            </h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
              Manage designs, Cloudflare R2 images, layouts, materials, and pricing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/gallery/bathroom-designs"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-primary text-gray-700 dark:text-zinc-300 font-bold text-sm transition-all shadow-sm"
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
              {isFormOpen ? 'Close Form' : 'Add Bathroom Design'}
            </button>
          </div>
        </div>

        {/* Create / Edit Form Drawer */}
        {isFormOpen && (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-2xl border-2 border-primary/30 p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-4">
              <h2 className="text-xl font-bold text-secondary dark:text-zinc-100 flex items-center gap-2">
                <i className="fas fa-edit text-primary"></i>
                {editingId ? 'Edit Bathroom Design' : 'Add New Bathroom Design'}
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
                    placeholder="https://pub-b20d9352722b43219ceb523a3a0c89d5.r2.dev/gallery/bathroom/..."
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
                      placeholder="e.g. Modern Wet & Dry Partition Bathroom with Fluted Vanity"
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
                      placeholder="modern-wet-dry-partition-bathroom"
                      required
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-mono focus:border-primary outline-none"
                    />
                  </div>
                </div>

                {/* Layout Type & Dimensions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                      Layout Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={layoutType}
                      onChange={(e) => {
                        setLayoutType(e.target.value as BathroomLayoutType);
                        setAltText(`${title || 'Modern'} - ${e.target.value} bathroom design`);
                      }}
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-semibold focus:border-primary outline-none"
                    >
                      {LAYOUT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
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
                      placeholder="e.g. 8 ft × 6 ft (48 sq ft)"
                      required
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:border-primary outline-none"
                    />
                  </div>
                </div>

                {/* Tile Concept & Vanity Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                      Tile Concept / Dado <span className="text-rose-500">*</span>
                    </label>
                    <input
                      list="tile-suggestions"
                      value={tileConcept}
                      onChange={(e) => setTileConcept(e.target.value)}
                      placeholder="e.g. Vitrified Matte (2x4 ft) + Accent Wall"
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:border-primary outline-none"
                    />
                    <datalist id="tile-suggestions">
                      {POPULAR_TILES.map(t => <option key={t} value={t} />)}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                      Vanity & Basin Style <span className="text-rose-500">*</span>
                    </label>
                    <input
                      list="vanity-suggestions"
                      value={vanityType}
                      onChange={(e) => setVanityType(e.target.value)}
                      placeholder="e.g. Wall-Hung Floating Vanity with Quartz Top"
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:border-primary outline-none"
                    />
                    <datalist id="vanity-suggestions">
                      {POPULAR_VANITIES.map(v => <option key={v} value={v} />)}
                    </datalist>
                  </div>
                </div>

                {/* CP Fittings & Shower Partition */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                      CP Fittings & Sanitaryware
                    </label>
                    <input
                      list="fittings-suggestions"
                      value={fittingsBrand}
                      onChange={(e) => setFittingsBrand(e.target.value)}
                      placeholder="e.g. Jaquar Concealed Diverter & Rain Shower"
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:border-primary outline-none"
                    />
                    <datalist id="fittings-suggestions">
                      {POPULAR_BRANDS.map(b => <option key={b} value={b} />)}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                      Shower Partition Type
                    </label>
                    <input
                      list="partition-suggestions"
                      value={partitionType}
                      onChange={(e) => setPartitionType(e.target.value)}
                      placeholder="e.g. 10mm Toughened Frameless Glass Partition"
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:border-primary outline-none"
                    />
                    <datalist id="partition-suggestions">
                      {POPULAR_PARTITIONS.map(p => <option key={p} value={p} />)}
                    </datalist>
                  </div>
                </div>

                {/* ⚡ Auto-Calculate Budget from Sq.Ft (India Engine) */}
                <div className="p-4 sm:p-5 rounded-3xl bg-[#fffcf5] dark:bg-amber-950/20 border border-[#fde68a] dark:border-amber-900/40 shadow-xs space-y-4">
                  <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-amber-200/50 dark:border-amber-900/30">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center text-xs shrink-0">
                        <i className="fas fa-calculator"></i>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-xs flex items-center gap-1.5">
                          <span className="text-amber-500">⚡</span>
                          <span>Auto-Calculate Budget from Sq.Ft</span>
                        </h3>
                        <p className="text-gray-500 dark:text-zinc-400 text-[10px] leading-tight">
                          Enter dimensions to auto-populate pricing.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => applyAutoEstimate(autoSqft, autoLength, autoWidth, qualityTier, layoutType)}
                      className="px-3 py-1.5 rounded-lg bg-[#c5a059] hover:bg-[#b38e47] text-white font-bold text-[11px] shadow-xs transition flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer"
                    >
                      <i className="fas fa-bolt text-[10px]"></i>
                      Calculate
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 dark:text-zinc-400 mb-1">Length (ft)</label>
                      <input
                        type="number"
                        min="3"
                        max="30"
                        value={autoLength}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setAutoLength(val);
                          if (val > 0 && autoWidth > 0) setAutoSqft(val * autoWidth);
                        }}
                        className="w-full p-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-bold text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 dark:text-zinc-400 mb-1">Width (ft)</label>
                      <input
                        type="number"
                        min="3"
                        max="30"
                        value={autoWidth}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setAutoWidth(val);
                          if (val > 0 && autoLength > 0) setAutoSqft(autoLength * val);
                        }}
                        className="w-full p-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-bold text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 dark:text-zinc-400 mb-1">Area (sq ft)</label>
                      <input
                        type="number"
                        min="15"
                        max="500"
                        value={autoSqft}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setAutoSqft(val);
                        }}
                        className="w-full p-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-zinc-900 text-sm font-black text-amber-700 dark:text-amber-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-zinc-400 mb-1">Quality Tier</label>
                    <select
                      value={qualityTier}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setQualityTier(val);
                      }}
                      className="w-full p-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-bold text-gray-900 dark:text-white"
                    >
                      <option value="Standard">Standard — Ceramic Tiles &amp; Diverter</option>
                      <option value="Premium">Premium — Vitrified &amp; Toughened Glass</option>
                      <option value="Luxury">Luxury — Statuario &amp; Thermostatic</option>
                    </select>
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
                        value={minCost ?? ''}
                        onChange={(e) => setMinCost(Number(e.target.value))}
                        className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">Max Budget (₹)</label>
                      <input
                        type="number"
                        step="5000"
                        value={maxCost ?? ''}
                        onChange={(e) => setMaxCost(Number(e.target.value))}
                        className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">Rate / Unit Tag</label>
                      <input
                        type="text"
                        value={ratePerUnit ?? ''}
                        onChange={(e) => setRatePerUnit(e.target.value)}
                        placeholder="₹1,800 / sq ft"
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
                      placeholder="Toughened Glass Partition, LED Backlit Mirror, Wall-Hung WC"
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
                      placeholder="bathroom design india, wet dry bathroom partition"
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
                  <span>{editingId ? 'Save Changes' : 'Publish Bathroom Design'}</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Layout Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-zinc-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mr-1">Filter Layout:</span>
            {['All', ...LAYOUT_TYPES].map((layout) => (
              <button
                key={layout}
                onClick={() => setFilterType(layout)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterType === layout
                    ? 'bg-secondary text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200'
                }`}
              >
                {layout}
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
              <p className="font-bold text-sm">Loading bathroom designs...</p>
            </div>
          ) : filteredDesigns.length === 0 ? (
            <div className="py-20 text-center text-gray-400 border-2 border-dashed border-gray-100 dark:border-zinc-800 rounded-2xl m-6">
              <i className="fas fa-bath text-4xl mb-3 opacity-30"></i>
              <p className="font-bold text-base text-gray-600 dark:text-zinc-400">No bathroom designs found</p>
              <p className="text-xs text-gray-400 mt-1">Click &quot;Add Bathroom Design&quot; above to upload your first design.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-zinc-950/60 border-b border-gray-200 dark:border-zinc-800 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Visual (9:16)</th>
                    <th className="py-3.5 px-4">Title &amp; Specifications</th>
                    <th className="py-3.5 px-4">Layout Type</th>
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
                            {design.vanity_type}
                          </span>
                        </div>
                      </td>

                      {/* Layout Badge */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                          {design.layout_type}
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
                          onClick={() => handleToggleActive(design.id, design.is_active)}
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
