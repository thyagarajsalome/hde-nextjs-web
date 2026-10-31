"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  HousePlanRecord,
  HousePlanStoreService,
  calculateSmartPlanMetrics,
} from '@/services/housePlanStoreService';
import { useUser } from '@/context/UserContext';
import { WatermarkedPlanViewer } from '@/components/plans/WatermarkedPlanViewer';
import { PlanTradeCostCalculator } from '@/components/plans/PlanTradeCostCalculator';

const POPULAR_DIMENSIONS = ['20x30', '30x40', '30x50', '40x60', '30x60', '20x40', '25x40'];
const FACING_OPTIONS = ['East', 'North', 'West', 'South', 'North-East', 'North-West'];
const FLOOR_OPTIONS = ['Ground Only', 'G+1', 'G+2', 'G+3', 'Duplex Villa'];

export const AdminPlansManager: React.FC = () => {
  const { user, isDeveloper } = useUser();
  const [plans, setPlans] = useState<HousePlanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterFacing, setFilterFacing] = useState('all');
  const [filterDim, setFilterDim] = useState('all');

  // Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [dimensions, setDimensions] = useState('30x40');
  const [areaSqft, setAreaSqft] = useState<number>(1200);
  const [builtUpAreaSqft, setBuiltUpAreaSqft] = useState<number>(2040);
  const [carpetAreaSqft, setCarpetAreaSqft] = useState<number>(1530);
  const [facing, setFacing] = useState('East');
  const [floors, setFloors] = useState('G+1');
  const [bedrooms, setBedrooms] = useState<number>(3);
  const [bathrooms, setBathrooms] = useState<number>(3);
  const [parking, setParking] = useState('1 Covered Car');
  const [livingHallSqft, setLivingHallSqft] = useState<number>(240);
  const [kitchenSqft, setKitchenSqft] = useState<number>(100);
  const [electricalPoints, setElectricalPoints] = useState<number>(48);
  const [orientationNotes, setOrientationNotes] = useState('East-Facing Solar & Cross-Ventilation Alignment');
  const [priceInr, setPriceInr] = useState<number>(499);
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // File Upload Handlers
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Preview Modal for testing
  const [previewPlan, setPreviewPlan] = useState<HousePlanRecord | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadPlans = async () => {
    setLoading(true);
    try {
      const data = await HousePlanStoreService.getAllPlans();
      setPlans(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load plans from Supabase', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  // Smart Auto-Populate Action (Zero manual typing for admin)
  const handleSmartAutoPopulate = (
    targetDim = dimensions,
    targetFloors = floors,
    targetBeds = bedrooms,
    targetBaths = bathrooms,
    targetFacing = facing
  ) => {
    const metrics = calculateSmartPlanMetrics(
      targetDim,
      targetFloors,
      targetBeds,
      targetBaths,
      targetFacing
    );

    setAreaSqft(metrics.plotAreaSqft);
    setBuiltUpAreaSqft(metrics.builtUpAreaSqft);
    setCarpetAreaSqft(metrics.carpetAreaSqft);
    setLivingHallSqft(metrics.livingHallSqft);
    setKitchenSqft(metrics.kitchenSqft);
    setElectricalPoints(metrics.electricalPointsCount);
    setOrientationNotes(metrics.orientationNotes);
    setDescription(metrics.autoDescription);

    if (!title || title.includes('Duplex') || title.includes('BHK') || title.includes('House Plan')) {
      setTitle(`${metrics.plotAreaSqft} Sq.ft ${targetBeds} BHK ${targetFloors} Architectural House Plan (${targetDim})`);
    }

    showToast(`✨ Auto-populated spatial metrics: ${metrics.builtUpAreaSqft} sq.ft built-up, ${metrics.electricalPointsCount} electrical points.`);
  };

  // Upload file to Cloudflare R2
  const uploadToR2 = async (file: File, isPdf = false): Promise<string> => {
    const res = await fetch('/api/gallery/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        category: 'house-plans',
        contentType: isPdf ? 'application/pdf' : (file.type || 'image/webp'),
        fileSize: file.size,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success || !data.uploadUrl) {
      throw new Error(data.error || 'Failed to obtain Cloudflare R2 upload authorization.');
    }

    const uploadRes = await fetch(data.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': isPdf ? 'application/pdf' : (file.type || 'image/webp') },
      body: file,
    });

    if (!uploadRes.ok) {
      throw new Error(`Cloudflare R2 rejected upload (HTTP ${uploadRes.status}).`);
    }

    return data.publicUrl;
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDimensions('30x40');
    setAreaSqft(1200);
    setBuiltUpAreaSqft(2040);
    setCarpetAreaSqft(1530);
    setFacing('East');
    setFloors('G+1');
    setBedrooms(3);
    setBathrooms(3);
    setParking('1 Covered Car');
    setLivingHallSqft(240);
    setKitchenSqft(100);
    setElectricalPoints(48);
    setOrientationNotes('East-Facing Solar & Cross-Ventilation Alignment');
    setPriceInr(499);
    setDescription('');
    setFileUrl('');
    setPdfUrl('');
    setYoutubeUrl('');
    setIsActive(true);
    setIsFeatured(false);
    setImageFile(null);
    setPdfFile(null);
    setIsFormOpen(false);
    setUploadStatus(null);
  };

  const handleEdit = (plan: HousePlanRecord) => {
    setEditingId(plan.id);
    setTitle(plan.title || '');
    setDimensions(plan.dimensions || '30x40');
    setAreaSqft(plan.area_sqft || 1200);
    setBuiltUpAreaSqft(plan.built_up_area_sqft || 2040);
    setCarpetAreaSqft(plan.carpet_area_sqft || 1530);
    setFacing(plan.facing || 'East');
    setFloors(plan.floors || 'G+1');
    setBedrooms(plan.bedrooms || 3);
    setBathrooms(plan.bathrooms || 3);
    setParking(plan.parking || '1 Covered Car');
    setLivingHallSqft(plan.living_hall_sqft || 240);
    setKitchenSqft(plan.kitchen_sqft || 100);
    setElectricalPoints(plan.electrical_points_count || 48);
    setOrientationNotes(plan.orientation_notes || 'East-Facing Solar & Cross-Ventilation Alignment');
    setPriceInr(plan.price_inr || 499);
    setDescription(plan.description || '');
    setFileUrl(plan.file_url || '');
    setPdfUrl(plan.pdf_url || '');
    setYoutubeUrl(plan.youtube_url || '');
    setIsActive(plan.is_active ?? true);
    setIsFeatured(Boolean(plan.is_featured));
    setImageFile(null);
    setPdfFile(null);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (plan: HousePlanRecord) => {
    if (!window.confirm(`⚠️ Permanently delete plan "${plan.title}" from database?`)) return;
    try {
      const res = await HousePlanStoreService.deletePlan(plan.id);
      if (!res.success) throw new Error(res.error);
      setPlans((prev) => prev.filter((p) => p.id !== plan.id));
      showToast('Plan deleted successfully.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete plan', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please enter a plan title', 'error');
      return;
    }

    setSubmitting(true);
    try {
      let finalImageUrl = fileUrl;
      let finalPdfUrl = pdfUrl;

      // Upload image if selected
      if (imageFile) {
        setUploadStatus('Uploading Blueprint Preview Image to Cloudflare R2...');
        finalImageUrl = await uploadToR2(imageFile, false);
      }

      // Upload PDF if selected
      if (pdfFile) {
        setUploadStatus('Uploading Vector PDF Blueprint to Cloudflare R2...');
        finalPdfUrl = await uploadToR2(pdfFile, true);
      }

      const payload: Partial<HousePlanRecord> = {
        title: title.trim(),
        dimensions: dimensions.trim(),
        area_sqft: Number(areaSqft) || 1200,
        built_up_area_sqft: Number(builtUpAreaSqft) || 2040,
        carpet_area_sqft: Number(carpetAreaSqft) || 1530,
        facing: facing.trim(),
        floors: floors.trim(),
        bedrooms: Number(bedrooms) || 3,
        bathrooms: Number(bathrooms) || 3,
        parking: parking.trim(),
        living_hall_sqft: Number(livingHallSqft) || 240,
        kitchen_sqft: Number(kitchenSqft) || 100,
        electrical_points_count: Number(electricalPoints) || 48,
        orientation_notes: orientationNotes.trim(),
        price_inr: Number(priceInr) || 499,
        description: description.trim(),
        file_url: finalImageUrl || 'full-plans/1775572207976-plan.webp',
        pdf_url: finalPdfUrl,
        youtube_url: youtubeUrl.trim() || undefined,
        is_active: isActive,
        is_featured: isFeatured,
      };

      if (editingId) {
        setUploadStatus('Updating plan in Supabase...');
        const res = await HousePlanStoreService.updatePlan(editingId, payload);
        if (!res.success) throw new Error(res.error);
        setPlans((prev) =>
          prev.map((p) => (p.id === editingId ? ({ ...p, ...payload } as HousePlanRecord) : p))
        );
        showToast('House plan updated successfully!', 'success');
      } else {
        setUploadStatus('Saving new plan to Supabase...');
        const res = await HousePlanStoreService.createPlan(payload);
        if (!res.success) throw new Error(res.error);
        if (res.data) {
          setPlans((prev) => [res.data!, ...prev]);
        }
        showToast('New architectural house plan created successfully!', 'success');
      }

      resetForm();
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
      setUploadStatus(null);
    }
  };

  const filteredPlans = plans.filter((p) => {
    if (filterFacing !== 'all' && !p.facing?.toLowerCase().includes(filterFacing.toLowerCase())) {
      return false;
    }
    if (filterDim !== 'all' && !p.dimensions?.toLowerCase().includes(filterDim.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-2xl font-bold text-sm flex items-center gap-3 transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          <i
            className={`fas ${
              toastMessage.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'
            }`}
          ></i>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Admin Clarification Banner: Explaining the two admins */}
      <div className="bg-gradient-to-r from-blue-50 to-amber-50 dark:from-blue-950/40 dark:to-amber-950/30 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <i className="fas fa-file-pdf text-lg"></i>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
              <span>★ Dedicated PDF Architectural Blueprints Admin</span>
              <span className="bg-blue-600 text-white text-[9px] px-2 py-0.5 rounded-full">Active</span>
            </span>
            <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed max-w-3xl">
              <strong>This is where you upload PDF House Plans.</strong> Here you upload downloadable <strong>Vector AutoCAD/PDF Working Drawings</strong> for 20×30, 30×40, etc., with automatic spatial calculations and watermarked previews.
              <br />
              <span className="text-slate-500 text-[11px]">
                (The other admin at <Link href="/admin/gallery" className="underline text-blue-600 font-bold hover:text-blue-800">/admin/gallery</Link> is strictly for <strong>9:16 vertical photos</strong> for Instagram-style kitchen &amp; bathroom inspiration).
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
              handleSmartAutoPopulate('30x40', 'G+1', 3, 3, 'East');
            }}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <i className="fas fa-cloud-arrow-up"></i>
            <span>Upload PDF Plan</span>
          </button>
        </div>
      </div>

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <i className="fas fa-layer-group text-blue-600"></i>
            Architectural Drawing Store Manager
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Manage vector PDF working drawings, preview watermarks, spatial dimensions, and trade budgets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/plans/store"
            target="_blank"
            className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 transition flex items-center gap-2"
          >
            <i className="fas fa-external-link-alt text-[10px]"></i>
            View Live Store
          </Link>

          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
              handleSmartAutoPopulate('30x40', 'G+1', 3, 3, 'East');
            }}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition flex items-center gap-2 cursor-pointer"
          >
            <i className="fas fa-plus"></i>
            Add New Plan
          </button>
        </div>
      </div>

      {/* Upload/Edit Modal / Drawer */}
      {isFormOpen && (
        <div className="bg-white dark:bg-zinc-900 border-2 border-blue-500/40 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                {editingId ? 'Edit Architectural Drawing' : 'Upload New Blueprint & Working Drawing'}
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100 mt-1">
                {editingId ? 'Update House Plan Record' : 'Add New House Plan to Store'}
              </h3>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2"
            >
              <i className="fas fa-times text-base"></i>
            </button>
          </div>

          {/* Quick Auto-Fill Preset Pills */}
          <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-slate-200/60 dark:border-zinc-700">
            <span className="text-xs font-bold text-slate-700 dark:text-zinc-200 block mb-2">
              ⚡ 1-Click Smart Dimension Preset (Eliminates Manual Calculations):
            </span>
            <div className="flex flex-wrap gap-2">
              {POPULAR_DIMENSIONS.map((dim) => (
                <button
                  key={dim}
                  type="button"
                  onClick={() => {
                    setDimensions(dim);
                    handleSmartAutoPopulate(dim, floors, bedrooms, bathrooms, facing);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                    dimensions === dim
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-blue-400'
                  }`}
                >
                  {dim} Plot
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Grid Row 1: Title, Plot Dimensions, Floors, Facing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Plan Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 1200 Sqft 3 BHK Duplex House Plan (30x40)"
                  required
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Plot Dimensions *
                </label>
                <input
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  placeholder="e.g. 30x40"
                  required
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Plot Area (Sq.ft) *
                </label>
                <input
                  type="number"
                  value={areaSqft}
                  onChange={(e) => setAreaSqft(Number(e.target.value))}
                  required
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Grid Row 2: Directional Facing, Floors, Bedrooms, Bathrooms */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Facing (Direction) *
                </label>
                <select
                  value={facing}
                  onChange={(e) => {
                    const newFacing = e.target.value;
                    setFacing(newFacing);
                    setOrientationNotes(`${newFacing}-Facing Directional Alignment with optimized solar daylighting and cross-ventilation flow.`);
                  }}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                >
                  {FACING_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Floors *
                </label>
                <select
                  value={floors}
                  onChange={(e) => {
                    setFloors(e.target.value);
                    handleSmartAutoPopulate(dimensions, e.target.value, bedrooms, bathrooms, facing);
                  }}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                >
                  {FLOOR_OPTIONS.map((fl) => (
                    <option key={fl} value={fl}>
                      {fl}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Bedrooms *
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Bathrooms *
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>
            </div>

            {/* Grid Row 3: Spatial Breakdown (Built-up, Carpet, Living Hall, Kitchen, Electrical Points, Price) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 bg-blue-50/40 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-200/50 dark:border-blue-900/40">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 block mb-1">
                  Built-Up (Sq.ft)
                </label>
                <input
                  type="number"
                  value={builtUpAreaSqft}
                  onChange={(e) => setBuiltUpAreaSqft(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 block mb-1">
                  Carpet (Sq.ft)
                </label>
                <input
                  type="number"
                  value={carpetAreaSqft}
                  onChange={(e) => setCarpetAreaSqft(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 block mb-1">
                  Living Hall (Sq.ft)
                </label>
                <input
                  type="number"
                  value={livingHallSqft}
                  onChange={(e) => setLivingHallSqft(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 block mb-1">
                  Kitchen (Sq.ft)
                </label>
                <input
                  type="number"
                  value={kitchenSqft}
                  onChange={(e) => setKitchenSqft(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 block mb-1">
                  Electrical Points
                </label>
                <input
                  type="number"
                  value={electricalPoints}
                  onChange={(e) => setElectricalPoints(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-amber-700 dark:text-amber-400 block mb-1">
                  Price (INR ₹) *
                </label>
                <input
                  type="number"
                  value={priceInr}
                  onChange={(e) => setPriceInr(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400"
                />
              </div>
            </div>

            {/* Directional Alignment Notes & Description */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Directional Orientation Notes (Cross-Ventilation &amp; Solar Daylighting)
                </label>
                <input
                  type="text"
                  value={orientationNotes}
                  onChange={(e) => setOrientationNotes(e.target.value)}
                  placeholder="e.g. East-Facing Directional Alignment with optimized morning solar daylighting..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Plan Description (Auto-generated or custom)
                  </label>
                  <button
                    type="button"
                    onClick={() => handleSmartAutoPopulate()}
                    className="text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline"
                  >
                    🔄 Regenerate Auto-Description
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter detailed description..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </div>
            </div>

            {/* File Upload Section: Primary Vector PDF + Preview Thumbnail */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* PRIMARY: Vector PDF File */}
              <div className="bg-amber-50/70 dark:bg-amber-950/20 p-4 rounded-xl border-2 border-dashed border-amber-300 dark:border-amber-800 space-y-2">
                <div className="flex items-center gap-2">
                  <i className="fas fa-file-pdf text-rose-600 text-lg"></i>
                  <label className="text-xs font-black text-slate-800 dark:text-zinc-200">
                    ★ Primary Working Drawing (PDF Blueprint)
                  </label>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                  Upload your vector drawing pack or AutoCAD PDF. Downloaded by customers upon unlock.
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setPdfFile(e.target.files[0]);
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => pdfInputRef.current?.click()}
                    className="px-4 py-2.5 text-xs font-bold bg-white dark:bg-zinc-800 border border-amber-300 dark:border-zinc-600 rounded-xl hover:bg-amber-50 transition cursor-pointer flex items-center gap-2 shadow-2xs"
                  >
                    <i className="fas fa-file-arrow-up text-rose-600"></i>
                    {pdfFile ? pdfFile.name : 'Choose Vector PDF Plan'}
                  </button>
                  {pdfUrl && !pdfFile && (
                    <span className="text-[11px] text-emerald-600 font-bold truncate max-w-[150px]">
                      ✓ Current PDF Attached
                    </span>
                  )}
                </div>
              </div>

              {/* SECONDARY: Preview Thumbnail for Watermarked Preview */}
              <div className="bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-2">
                <div className="flex items-center gap-2">
                  <i className="fas fa-image text-blue-600 text-lg"></i>
                  <label className="text-xs font-black text-slate-800 dark:text-zinc-200">
                    Preview Thumbnail (WebP / JPG / PNG)
                  </label>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                  Displayed on the store with the diagonal HDE watermark overlay for unpaid viewers.
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setImageFile(e.target.files[0]);
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="px-4 py-2.5 text-xs font-bold bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-600 rounded-xl hover:bg-slate-100 transition cursor-pointer flex items-center gap-2 shadow-2xs"
                  >
                    <i className="fas fa-image text-blue-600"></i>
                    {imageFile ? imageFile.name : 'Choose Preview Image'}
                  </button>
                  {fileUrl && !imageFile && (
                    <span className="text-[11px] text-slate-500 truncate max-w-[150px]">
                      Current: {fileUrl.split('/').pop()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Checkbox Toggles & Submitting Status */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>Active in Store</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600"
                  />
                  <span>Featured on Homepage</span>
                </label>
              </div>

              {uploadStatus && (
                <span className="text-xs font-bold text-blue-600 animate-pulse">
                  <i className="fas fa-spinner fa-spin mr-1.5"></i>
                  {uploadStatus}
                </span>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i>
                      {editingId ? 'Update Plan' : 'Publish to Store'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">Filters:</span>
          <select
            value={filterDim}
            onChange={(e) => setFilterDim(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800"
          >
            <option value="all">All Dimensions</option>
            {POPULAR_DIMENSIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={filterFacing}
            onChange={(e) => setFilterFacing(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800"
          >
            <option value="all">All Facings</option>
            {FACING_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
          Showing <span className="text-blue-600 font-black">{filteredPlans.length}</span> blueprints
        </span>
      </div>

      {/* Plans Data Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <i className="fas fa-circle-notch fa-spin text-2xl text-blue-600"></i>
            <p className="text-xs font-bold">Loading house plans from Supabase...</p>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <i className="fas fa-drafting-compass text-3xl text-slate-300"></i>
            <p className="text-sm font-bold text-slate-600 dark:text-zinc-300">No house plans found</p>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setIsFormOpen(true);
                handleSmartAutoPopulate('30x40', 'G+1', 3, 3, 'East');
              }}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white"
            >
              Add First Plan
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 uppercase font-black tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Plan / Dimensions</th>
                  <th className="py-3 px-4">Orientation</th>
                  <th className="py-3 px-4">Spatial Areas</th>
                  <th className="py-3 px-4">Points</th>
                  <th className="py-3 px-4">PDF Drawing</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                {filteredPlans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-zinc-100 max-w-xs truncate">
                        {plan.title}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-mono font-bold text-blue-600">{plan.dimensions}</span>
                        <span>•</span>
                        <span>{plan.floors || 'G+1'}</span>
                        <span>•</span>
                        <span>{plan.bedrooms}B/{plan.bathrooms}B</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-slate-700 dark:text-zinc-300">
                        <i className="fas fa-compass text-blue-500 text-[10px]"></i>
                        {plan.facing}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 dark:text-zinc-200">
                        Built-up: <strong className="font-bold">{plan.built_up_area_sqft || plan.area_sqft}</strong> sq.ft
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Carpet: {plan.carpet_area_sqft || Math.round((plan.area_sqft || 1200) * 0.75)} sq.ft
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-zinc-300">
                      ~{plan.electrical_points_count || 45} pts
                    </td>

                    <td className="py-3.5 px-4">
                      {plan.pdf_url ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                          <i className="fas fa-check"></i>
                          PDF Pack
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Preview Only</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-black text-amber-600 dark:text-amber-400">
                      ₹{plan.price_inr || 499}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          plan.is_active !== false
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-200 text-slate-600 dark:bg-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {plan.is_active !== false ? 'Live' : 'Hidden'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setPreviewPlan(plan)}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 hover:bg-slate-100 dark:border-zinc-700 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 transition"
                        title="Preview Watermark & Cost Breakdown"
                      >
                        <i className="fas fa-eye text-blue-500"></i>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEdit(plan)}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 hover:bg-slate-100 dark:border-zinc-700 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 transition"
                        title="Edit Plan"
                      >
                        <i className="fas fa-edit text-amber-500"></i>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(plan)}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 hover:bg-rose-50 dark:border-zinc-700 dark:hover:bg-rose-950/40 text-rose-600 transition"
                        title="Delete Plan"
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

      {/* Developer/Admin Interactive Preview Modal */}
      {previewPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto border border-slate-300 dark:border-zinc-700">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  Previewing Plan: {previewPlan.dimensions}
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-zinc-100">
                  {previewPlan.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPlan(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-2"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            {/* Watermarked Preview Viewer */}
            <WatermarkedPlanViewer
              imageUrl={previewPlan.file_url}
              pdfUrl={previewPlan.pdf_url}
              title={previewPlan.title}
              isUnlocked={Boolean(isDeveloper)}
              priceInr={previewPlan.price_inr || 499}
              onUnlockClick={() => showToast('Simulating ₹499 checkout for user.')}
            />

            {/* Spatial & Trade Cost Engine Breakdown */}
            <PlanTradeCostCalculator plan={previewPlan} />
          </div>
        </div>
      )}
    </div>
  );
};
