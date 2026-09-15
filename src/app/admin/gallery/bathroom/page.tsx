"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { BathroomDesign, CreateBathroomDesignInput, BathroomLayoutType } from '@/types/gallery';
import { bathroomGalleryService } from '@/services/bathroomGalleryService';
import { compressAndCropTo916 } from '@/utils/imageCompressor';
import { estimateIndiaBathroomCost } from '@/utils/indiaCostEstimator';

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
  const [minCost, setMinCost] = useState<number>(85000);
  const [maxCost, setMaxCost] = useState<number>(140000);
  const [ratePerUnit, setRatePerUnit] = useState('₹1,800 / sq ft');
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

  const formatCostLakhs = (min: number, max: number) => {
    const format = (num: number) => {
      if (num >= 100000) return `₹${(num / 100000).toFixed(2).replace(/\.00$/, '')} Lakhs`;
      return `₹${num.toLocaleString('en-IN')}`;
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
    setTitle(design.title);
    setSlug(design.slug);
    setLayoutType(design.layout_type);
    setDimensions(design.dimensions);
    setTileConcept(design.tile_concept);
    setVanityType(design.vanity_type);
    setFittingsBrand(design.fittings_brand);
    setPartitionType(design.partition_type);
    setFeaturesStr(design.features.join(', '));
    setMinCost(design.min_cost);
    setMaxCost(design.max_cost);
    setRatePerUnit(design.rate_per_unit || '₹1,800 / sq ft');
    setAltText(design.alt_text);
    setKeywordsStr(design.keywords.join(', '));
    setImageUrl(design.image_url);
    setFileName(design.file_name);
    setFileSizeKb(design.file_size_kb || 75);
    setIsFeatured(design.is_featured);
    setIsActive(design.is_active);
    setPreviewUrl(design.image_url);
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
      try {
        const res = await fetch('/api/gallery/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: selectedFile.name,
            fileType: selectedFile.type || 'image/webp',
            fileSize: selectedFile.size,
            category: 'bathroom'
          })
        });

        if (res.ok) {
          const { uploadUrl, publicUrl } = await res.json();
          await fetch(uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': selectedFile.type || 'image/webp' },
            body: selectedFile
          });
          finalImageUrl = publicUrl;
          finalFileName = selectedFile.name;
        } else {
          finalImageUrl = previewUrl || finalImageUrl;
        }
      } catch {
        finalImageUrl = previewUrl || finalImageUrl;
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
    : designs.filter(d => d.layout_type === filterType);

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-zinc-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold mb-1">
              <Link href="/admin/gallery" className="hover:text-primary">Gallery Admin</Link>
              <span>/</span>
              <span className="text-primary font-bold">Bathroom Designs</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-secondary dark:text-zinc-100 flex items-center gap-3">
              <i className="fas fa-bath text-primary"></i>
              Modern Bathroom Designs Admin
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 mt-1">
              Manage 9:16 mobile-first bathroom cards, wet/dry layouts, tile concepts, and approximate INR budgets.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/gallery/bathroom-designs"
              target="_blank"
              className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 text-gray-700 dark:text-zinc-300 transition-colors flex items-center gap-1.5 no-underline"
            >
              <span>View Public Page</span>
              <i className="fas fa-external-link-alt text-[10px]"></i>
            </Link>

            <button
              onClick={() => {
                if (isFormOpen) resetForm();
                else setIsFormOpen(true);
              }}
              className="px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-primary hover:bg-primary-hover text-white dark:text-zinc-950 shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <i className={`fas ${isFormOpen ? 'fa-times' : 'fa-plus'}`}></i>
              <span>{isFormOpen ? 'Close Form' : 'Add New Bathroom'}</span>
            </button>
          </div>
        </div>

        {/* CRUD Form Modal / Accordion */}
        {isFormOpen && (
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                <i className={`fas ${editingId ? 'fa-edit text-amber-500' : 'fa-plus-circle text-primary'}`}></i>
                <span>{editingId ? 'Edit Bathroom Design' : 'Create New Bathroom Card (9:16 Format)'}</span>
              </h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 text-sm">Cancel</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: 9:16 Image Dropzone */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                    Bathroom Image (9:16 Aspect Ratio) *
                  </label>

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-full aspect-[9/16] max-w-[260px] mx-auto rounded-2xl border-2 border-dashed border-gray-300 dark:border-zinc-700 hover:border-primary dark:hover:border-primary bg-gray-50 dark:bg-zinc-800/40 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all group"
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Bathroom preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="p-6 text-center space-y-2">
                        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center mx-auto text-lg">
                          <i className="fas fa-cloud-upload-alt"></i>
                        </div>
                        <p className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                          Click to select image
                        </p>
                        <p className="text-[11px] text-gray-400">
                          Auto-compressed to 720×1280 WebP (35-65 KB)
                        </p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/webp,image/jpeg,image/png"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </div>

                  {/* Fallback Direct URL Input */}
                  <div className="space-y-1 pt-2">
                    <label className="text-[11px] font-semibold text-gray-500">Or Paste Image URL directly:</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setPreviewUrl(e.target.value);
                      }}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-200"
                    />
                  </div>
                </div>

                {/* Center Column: Design Specifications */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Title */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">
                        Design Title (SEO Keyword Optimized) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Modern Wet & Dry Partition Bathroom with Fluted Vanity"
                        value={title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 font-medium"
                      />
                    </div>

                    {/* Slug */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">
                        URL Slug
                      </label>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 font-mono"
                      />
                    </div>

                    {/* Layout Type */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">
                        Layout Type *
                      </label>
                      <select
                        value={layoutType}
                        onChange={(e) => setLayoutType(e.target.value as BathroomLayoutType)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 font-semibold"
                      >
                        {LAYOUT_TYPES.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    {/* Auto-Calculate Budget Engine (India Mode) */}
                    <div className="sm:col-span-2 p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-primary/5 to-blue-500/10 border border-blue-500/30 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs">
                            <i className="fas fa-calculator"></i>
                          </span>
                          <div>
                            <p className="text-xs font-black text-blue-900 dark:text-blue-200">
                              ⚡ Auto-Calculate Renovation Budget from Sq.Ft (India Engine)
                            </p>
                            <p className="text-[10px] text-gray-500 dark:text-zinc-400">
                              Enter bathroom dimensions or total sqft to auto-fill pricing &amp; budget in seconds.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => applyAutoEstimate()}
                          className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
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
                          <label className="block text-[10px] font-bold text-gray-500 mb-1">Fitting Quality Tier</label>
                          <select
                            value={qualityTier}
                            onChange={(e) => {
                              const val = e.target.value as any;
                              setQualityTier(val);
                              applyAutoEstimate(autoSqft, autoLength, autoWidth, val);
                            }}
                            className="w-full p-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-semibold"
                          >
                            <option value="Standard">Standard (Jaquar / Ceramic)</option>
                            <option value="Premium">Premium (Kohler / Glass Partition)</option>
                            <option value="Luxury">Luxury (Grohe / Italian Marble / Spa)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Dimensions */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">
                        Dimensions (India Standard) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 8 ft × 6 ft (48 sq ft)"
                        value={dimensions}
                        onChange={(e) => setDimensions(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-200"
                      />
                    </div>

                    {/* Tile Concept */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">
                        Tile Concept / Dado
                      </label>
                      <input
                        type="text"
                        list="tile-suggestions"
                        placeholder="e.g. Vitrified Matte (2x4 ft) + Accent Wall"
                        value={tileConcept}
                        onChange={(e) => setTileConcept(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-200"
                      />
                      <datalist id="tile-suggestions">
                        {POPULAR_TILES.map(t => <option key={t} value={t} />)}
                      </datalist>
                    </div>

                    {/* Vanity Type */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">
                        Vanity & Basin Style
                      </label>
                      <input
                        type="text"
                        list="vanity-suggestions"
                        placeholder="e.g. Wall-Hung Floating Vanity with Quartz Top"
                        value={vanityType}
                        onChange={(e) => setVanityType(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-200"
                      />
                      <datalist id="vanity-suggestions">
                        {POPULAR_VANITIES.map(v => <option key={v} value={v} />)}
                      </datalist>
                    </div>

                    {/* Fittings Brand */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">
                        CP Fittings & Sanitaryware
                      </label>
                      <input
                        type="text"
                        list="fittings-suggestions"
                        placeholder="e.g. Jaquar Concealed Diverter & Rain Shower"
                        value={fittingsBrand}
                        onChange={(e) => setFittingsBrand(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-200"
                      />
                      <datalist id="fittings-suggestions">
                        {POPULAR_BRANDS.map(b => <option key={b} value={b} />)}
                      </datalist>
                    </div>

                    {/* Partition Type */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">
                        Shower Partition Type
                      </label>
                      <input
                        type="text"
                        list="partition-suggestions"
                        placeholder="e.g. 10mm Toughened Frameless Glass Partition"
                        value={partitionType}
                        onChange={(e) => setPartitionType(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-200"
                      />
                      <datalist id="partition-suggestions">
                        {POPULAR_PARTITIONS.map(p => <option key={p} value={p} />)}
                      </datalist>
                    </div>

                    {/* Features List */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">
                        Key Features (Comma-separated)
                      </label>
                      <input
                        type="text"
                        value={featuresStr}
                        onChange={(e) => setFeaturesStr(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-200"
                      />
                    </div>

                    {/* Min Budget (INR) */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">
                        Min Estimated Budget (₹ INR) *
                      </label>
                      <input
                        type="number"
                        step="5000"
                        value={minCost}
                        onChange={(e) => setMinCost(Number(e.target.value))}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-200"
                      />
                    </div>

                    {/* Max Budget (INR) */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">
                        Max Estimated Budget (₹ INR) *
                      </label>
                      <input
                        type="number"
                        step="5000"
                        value={maxCost}
                        onChange={(e) => setMaxCost(Number(e.target.value))}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-200"
                      />
                      <p className="text-[10px] text-emerald-600 font-semibold mt-1">
                        Formatted: {formatCostLakhs(minCost, maxCost)}
                      </p>
                    </div>

                    {/* Keywords */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">
                        SEO Keywords (Targeting India queries)
                      </label>
                      <input
                        type="text"
                        value={keywordsStr}
                        onChange={(e) => setKeywordsStr(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-200"
                      />
                    </div>

                    {/* Checkboxes */}
                    <div className="sm:col-span-2 flex items-center gap-6 pt-2">
                      <label className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-zinc-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isFeatured}
                          onChange={(e) => setIsFeatured(e.target.checked)}
                          className="rounded text-primary focus:ring-primary w-4 h-4"
                        />
                        <span>Feature on Top Showcase</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-zinc-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={(e) => setIsActive(e.target.checked)}
                          className="rounded text-primary focus:ring-primary w-4 h-4"
                        />
                        <span>Active / Visible to Public</span>
                      </label>
                    </div>

                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex justify-end items-center gap-3 border-t border-gray-100 dark:border-zinc-800 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 text-xs font-bold text-gray-600 dark:text-zinc-300 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white dark:text-zinc-950 text-xs font-black shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting && <i className="fas fa-spinner fa-spin"></i>}
                  <span>{editingId ? 'Save Updates' : 'Publish Bathroom Card'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">Filter by Layout:</span>
          {['All', ...LAYOUT_TYPES].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterType === type
                  ? 'bg-primary text-white dark:text-zinc-950 shadow-xs'
                  : 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:border-primary'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Existing Designs Table / Grid */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200">
              Bathroom Designs Catalog ({filteredDesigns.length})
            </h3>
            <span className="text-xs text-gray-400">Showing India Mode items</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-400 text-sm">
              <i className="fas fa-circle-notch fa-spin mr-2"></i>
              Loading designs...
            </div>
          ) : filteredDesigns.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">
              No bathroom designs found for the selected layout.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600 dark:text-zinc-400">
                <thead className="bg-gray-50 dark:bg-zinc-800/50 text-[11px] font-bold text-gray-400 uppercase">
                  <tr>
                    <th className="py-3 px-4">Card (9:16)</th>
                    <th className="py-3 px-4">Title & Specifications</th>
                    <th className="py-3 px-4">Layout</th>
                    <th className="py-3 px-4">Approx Budget</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 font-medium">
                  {filteredDesigns.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4 w-20">
                        <div className="w-12 h-20 rounded-lg overflow-hidden bg-gray-100 shadow-xs border border-gray-200 dark:border-zinc-700">
                          <img
                            src={d.image_url}
                            alt={d.alt_text}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-bold text-gray-900 dark:text-zinc-100 line-clamp-1">{d.title}</p>
                        <p className="text-[11px] text-gray-400">{d.dimensions} • {d.vanity_type}</p>
                        <p className="text-[10px] text-gray-400 line-clamp-1">Tiles: {d.tile_concept}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
                          {d.layout_type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-emerald-600 dark:text-emerald-400">{d.formatted_budget}</p>
                        <p className="text-[10px] text-gray-400">{d.rate_per_unit || '₹1,800/sqft'}</p>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleActive(d.id, d.is_active)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                            d.is_active
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : 'bg-gray-100 dark:bg-zinc-800 text-gray-400'
                          }`}
                        >
                          {d.is_active ? 'Active' : 'Hidden'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(d)}
                          className="p-1.5 text-gray-500 hover:text-amber-500 transition-colors cursor-pointer"
                          title="Edit design"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(d.id, d.title)}
                          className="p-1.5 text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
                          title="Delete design"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
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
