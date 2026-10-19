"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CadTutorial, CAD_TUTORIAL_CATEGORIES } from "@/data/cadTutorials";
import { CadTutorialService, extractYouTubeId } from "@/services/cadTutorialService";

export default function AdminCadTutorialsPage() {
  const [tutorials, setTutorials] = useState<CadTutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formYoutubeInput, setFormYoutubeInput] = useState("");
  const [formCategory, setFormCategory] = useState<CadTutorial["category"]>("walls");
  const [formDuration, setFormDuration] = useState("3:00");
  const [formBadge, setFormBadge] = useState<CadTutorial["badge"] | "">("");
  const [formIcon, setFormIcon] = useState("fa-pen-ruler");
  const [formDesc, setFormDesc] = useState("");
  const [formTakeaways, setFormTakeaways] = useState("");

  // Video Preview Modal State
  const [previewVideo, setPreviewVideo] = useState<CadTutorial | null>(null);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load tutorials
  const loadTutorials = async () => {
    setLoading(true);
    try {
      const data = await CadTutorialService.getTutorials();
      setTutorials(data);
    } catch {
      showToast("Failed to load tutorials", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTutorials();
  }, []);

  // Filtered tutorials
  const filtered = tutorials.filter((t) => {
    const matchesCat = selectedCategory === "all" || t.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.youtubeId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingId(null);
    setFormTitle("");
    setFormYoutubeInput("");
    setFormCategory("walls");
    setFormDuration("3:00");
    setFormBadge("Basics");
    setFormIcon("fa-pen-ruler");
    setFormDesc("");
    setFormTakeaways("Point-and-click drawing, Smart corner snapping, 300 DPI vector output");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (tutorial: CadTutorial) => {
    setEditingId(tutorial.id);
    setFormTitle(tutorial.title);
    setFormYoutubeInput(tutorial.youtubeId);
    setFormCategory(tutorial.category);
    setFormDuration(tutorial.duration);
    setFormBadge(tutorial.badge || "");
    setFormIcon(tutorial.icon || "fa-pen-ruler");
    setFormDesc(tutorial.description);
    setFormTakeaways(tutorial.keyTakeaways ? tutorial.keyTakeaways.join("\n") : "");
    setIsModalOpen(true);
  };

  // Save (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      showToast("Please enter a tutorial title", "error");
      return;
    }

    const cleanYtId = extractYouTubeId(formYoutubeInput);
    if (!cleanYtId) {
      showToast("Please provide a valid YouTube Video ID or URL", "error");
      return;
    }

    // Parse takeaways by line or commas
    const takeaways = formTakeaways
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);

    const targetCategoryObj = CAD_TUTORIAL_CATEGORIES.find((c) => c.id === formCategory);
    const categoryLabel = targetCategoryObj ? targetCategoryObj.label : "General";

    const payload: CadTutorial = {
      id: editingId || `tutorial-${Date.now()}`,
      title: formTitle.trim(),
      category: formCategory,
      categoryLabel,
      duration: formDuration.trim() || "3:00",
      youtubeId: cleanYtId,
      icon: formIcon.trim() || "fa-pen-ruler",
      badge: (formBadge as any) || undefined,
      description: formDesc.trim(),
      keyTakeaways: takeaways.length > 0 ? takeaways : ["High precision CAD drafting"],
    };

    try {
      const updatedList = await CadTutorialService.saveTutorial(payload);
      setTutorials(updatedList);
      setIsModalOpen(false);
      showToast(editingId ? "Tutorial updated and saved successfully!" : "New tutorial added and live!");
    } catch {
      showToast("Failed to save tutorial", "error");
    }
  };

  // Delete
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      const updatedList = await CadTutorialService.deleteTutorial(id);
      setTutorials(updatedList);
      showToast("Tutorial deleted successfully");
    } catch {
      showToast("Failed to delete tutorial", "error");
    }
  };

  // Reset to Defaults
  const handleReset = async () => {
    if (!confirm("Reset all tutorials back to the factory 20 HDE Studio masterclass videos? This will replace your custom edits.")) {
      return;
    }

    try {
      const defaults = await CadTutorialService.resetToDefaults();
      setTutorials(defaults);
      showToast("Reset to factory defaults");
    } catch {
      showToast("Failed to reset", "error");
    }
  };

  // Preview extracted ID
  const currentExtractedId = extractYouTubeId(formYoutubeInput);

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-xl font-bold text-xs flex items-center gap-2.5 transition-all text-white ${
              toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
            }`}
          >
            <i className={`fas ${toast.type === "success" ? "fa-circle-check" : "fa-triangle-exclamation"}`}></i>
            <span>{toast.message}</span>
          </div>
        )}

        {/* Top Breadcrumb & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-1">
              <Link href="/admin" className="hover:text-primary no-underline text-slate-500">
                Admin Hub
              </Link>
              <span>/</span>
              <span className="text-primary font-bold">CAD Video Tutorials</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center text-sm">
                <i className="fab fa-youtube"></i>
              </span>
              <span>CAD Video Masterclass Manager (CRUD)</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage all 16:9 widescreen tool tutorials shown on the HDE Studio CAD download page.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/download#tutorials"
              target="_blank"
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-primary text-xs font-bold transition flex items-center gap-1.5 shadow-2xs no-underline"
            >
              <i className="fas fa-arrow-up-right-from-square text-[11px]"></i>
              <span>View Live Gallery</span>
            </Link>

            <button
              onClick={handleOpenCreate}
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-black shadow-sm transition flex items-center gap-2 cursor-pointer"
            >
              <i className="fas fa-plus"></i>
              <span>Add New Tutorial</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Videos</span>
            <span className="text-2xl font-black text-slate-900">{tutorials.length}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Categories</span>
            <span className="text-2xl font-black text-primary">{CAD_TUTORIAL_CATEGORIES.length - 1}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Player Ratio</span>
            <span className="text-2xl font-black text-emerald-600">16:9 HD</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Factory Reset</span>
              <button
                onClick={handleReset}
                className="text-xs font-bold text-red-600 hover:underline cursor-pointer mt-1"
              >
                Reset to Defaults
              </button>
            </div>
            <i className="fas fa-rotate-left text-slate-300 text-lg"></i>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {CAD_TUTORIAL_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-[#0f2042] text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-64 shrink-0">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tutorial..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 focus:outline-none"
            />
          </div>
        </div>

        {/* Tutorials Table / List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs font-bold">
              <i className="fas fa-spinner fa-spin text-lg mb-2 block"></i>
              Loading tutorials...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <i className="fas fa-film text-3xl text-slate-300"></i>
              <p className="text-sm font-bold text-slate-700">No tutorials found</p>
              <button
                onClick={handleOpenCreate}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold"
              >
                Add Your First Tutorial
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">16:9 Thumbnail</th>
                    <th className="py-3.5 px-4">Tutorial Title &amp; Details</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Duration</th>
                    <th className="py-3.5 px-4">YouTube ID</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((t, idx) => (
                    <tr key={t.id} className="hover:bg-slate-50/60 transition">
                      {/* Thumbnail Preview */}
                      <td className="py-3 px-4 w-36">
                        {t.youtubeId ? (
                          <div
                            onClick={() => setPreviewVideo(t)}
                            className="relative aspect-video rounded-lg overflow-hidden bg-slate-900 cursor-pointer group shadow-2xs"
                          >
                            <img
                              src={`https://img.youtube.com/vi/${t.youtubeId}/hqdefault.jpg`}
                              alt={t.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition flex items-center justify-center">
                              <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]">
                                <i className="fas fa-play ml-0.5"></i>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => handleOpenEdit(t)}
                            className="aspect-video rounded-lg border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center p-2 text-center cursor-pointer hover:bg-slate-100 transition"
                            title="Click to add YouTube video URL"
                          >
                            <i className="fas fa-video-slash text-slate-400 text-xs mb-1"></i>
                            <span className="text-[10px] text-slate-500 font-semibold leading-tight">No Video (Click to Add)</span>
                          </div>
                        )}
                      </td>

                      {/* Title & Desc */}
                      <td className="py-3 px-4 max-w-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-slate-900 text-xs">
                              {t.title}
                            </span>
                            {t.badge && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-emerald-100 text-emerald-800">
                                {t.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            {t.description}
                          </p>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-[#0f2042]/10 text-[#0f2042] font-bold text-[10px] uppercase">
                          {t.categoryLabel}
                        </span>
                      </td>

                      {/* Duration */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        {t.duration}
                      </td>

                      {/* YouTube ID */}
                      <td className="py-3 px-4">
                        {t.youtubeId ? (
                          <a
                            href={`https://youtu.be/${t.youtubeId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-[11px] text-red-600 hover:underline flex items-center gap-1"
                          >
                            <span>{t.youtubeId}</span>
                            <i className="fas fa-arrow-up-right-from-square text-[9px]"></i>
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No URL set</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewVideo(t)}
                            title="Play Video"
                            className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer transition"
                          >
                            <i className="fas fa-eye text-xs"></i>
                          </button>
                          <button
                            onClick={() => handleOpenEdit(t)}
                            title="Edit Tutorial"
                            className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-primary flex items-center justify-center cursor-pointer transition"
                          >
                            <i className="fas fa-pen text-xs"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(t.id, t.title)}
                            title="Delete Tutorial"
                            className="w-7 h-7 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-red-600 flex items-center justify-center cursor-pointer transition"
                          >
                            <i className="fas fa-trash-can text-xs"></i>
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

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-black text-lg text-slate-900">
                {editingId ? "Edit CAD Tutorial" : "Add New CAD Tutorial"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Title */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Tutorial Title *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. 1. Drawing Smart Walls & 90° Ortho Angle Snapping"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 font-medium"
                />
              </div>

              {/* YouTube Video URL or ID */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>YouTube Video URL or ID *</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Supports youtu.be, youtube.com/watch?v=, or raw 11-char ID
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={formYoutubeInput}
                  onChange={(e) => setFormYoutubeInput(e.target.value)}
                  placeholder="https://youtu.be/dQw4w9WgXcQ or dQw4w9WgXcQ"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 font-mono"
                />
                {currentExtractedId && (
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-[11px] text-emerald-600 font-bold">
                      Extracted ID: <code className="bg-emerald-50 px-1.5 py-0.5 rounded">{currentExtractedId}</code>
                    </span>
                    <div className="w-20 aspect-video rounded overflow-hidden bg-slate-900 shrink-0">
                      <img
                        src={`https://img.youtube.com/vi/${currentExtractedId}/hqdefault.jpg`}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Category & Duration & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 font-medium"
                  >
                    <option value="walls">Walls & Layouts</option>
                    <option value="doors-windows">Doors & Windows</option>
                    <option value="dimensions">Dimensions & Sq Ft</option>
                    <option value="blocks">Furniture Blocks</option>
                    <option value="structure">Stairs & Columns</option>
                    <option value="export">PDF Blueprints & Print</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Duration (MM:SS) *</label>
                  <input
                    type="text"
                    required
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    placeholder="2:45"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Badge (Optional)</label>
                  <select
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 font-medium"
                  >
                    <option value="">None</option>
                    <option value="Basics">Basics</option>
                    <option value="Essential">Essential</option>
                    <option value="Pro Tip">Pro Tip</option>
                    <option value="Popular">Popular</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Short Tool Summary / Description *</label>
                <textarea
                  rows={2}
                  required
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Explain what the user will achieve with this CAD tool..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800"
                ></textarea>
              </div>

              {/* Key Takeaways */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>Pro Drafting Tips (One per line or comma-separated)</span>
                  <span className="text-[10px] text-slate-400">Shown as checkmark bullets</span>
                </label>
                <textarea
                  rows={3}
                  value={formTakeaways}
                  onChange={(e) => setFormTakeaways(e.target.value)}
                  placeholder="Hold Shift for 90° ortho lock&#10;Live numeric length entry&#10;Continuous wall chaining"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 font-mono text-[11px]"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-black shadow-md cursor-pointer flex items-center gap-2"
                >
                  <i className="fas fa-check"></i>
                  <span>Save Tutorial &amp; Publish Live</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 16:9 PREVIEW MODAL */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800 truncate pr-4">
                16:9 Preview: {previewVideo.title}
              </span>
              <button
                onClick={() => setPreviewVideo(null)}
                className="w-7 h-7 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center cursor-pointer text-xs"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="aspect-video w-full bg-black flex items-center justify-center">
              {previewVideo.youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${previewVideo.youtubeId}?autoplay=1`}
                  title={previewVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                ></iframe>
              ) : (
                <div className="text-center p-8 space-y-2 text-white">
                  <i className="fas fa-video-slash text-amber-400 text-3xl mb-2"></i>
                  <h4 className="font-bold text-base">No Video Configured Yet</h4>
                  <p className="text-xs text-slate-400">Click &ldquo;Edit Tutorial&rdquo; in the table to paste a YouTube video URL when ready.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
