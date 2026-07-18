"use client";

import { useEffect, useState, useCallback } from "react";
import { Banner } from "@/types/banner";
import Image from "next/image";
import BannerCsvExport from "@/app/admin/_components/BannerCsvExport";
import GalleryImagePicker from "@/app/admin/_components/GalleryImagePicker";

const EMPTY_BANNER: Omit<Banner, "id"> = {
  title: "",
  subtitle: "",
  description: "",
  imageUrl: "",
  ctaText: "",
  ctaLink: "",
  isActive: true,
  sortOrder: 0,
};

export const dynamic = "force-dynamic";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState<Omit<Banner, "id">>(EMPTY_BANNER);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/banners?includeInactive=true");
      const data = await res.json();
      if (res.ok && data.banners) {
        setBanners(data.banners);
      }
    } catch (err) {
      console.error("Error fetching banners:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  const handleEdit = (banner: Banner) => {
    setEditing(banner);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle,
      description: banner.description,
      imageUrl: banner.imageUrl,
      ctaText: banner.ctaText,
      ctaLink: banner.ctaLink,
      isActive: banner.isActive,
      sortOrder: banner.sortOrder,
    });
    setShowForm(true);
    setError("");
  };

  const handleNew = () => {
    setEditing(null);
    setForm(EMPTY_BANNER);
    setShowForm(true);
    setError("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    try {
      const res = await fetch("/api/banners", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        fetchBanners();
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete banner");
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      await fetch("/api/banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...banner, isActive: !banner.isActive }),
      });
      fetchBanners();
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const sorted = [...banners].sort((a, b) => a.sortOrder - b.sortOrder);
    const current = sorted[index];
    const previous = sorted[index - 1];
    try {
      await Promise.all([
        fetch("/api/banners", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...current, sortOrder: previous.sortOrder }),
        }),
        fetch("/api/banners", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...previous, sortOrder: current.sortOrder }),
        }),
      ]);
      fetchBanners();
    } catch (err) {
      console.error("Reorder error:", err);
    }
  };

  const handleMoveDown = async (index: number) => {
    const sorted = [...banners].sort((a, b) => a.sortOrder - b.sortOrder);
    if (index >= sorted.length - 1) return;
    const current = sorted[index];
    const next = sorted[index + 1];
    try {
      await Promise.all([
        fetch("/api/banners", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...current, sortOrder: next.sortOrder }),
        }),
        fetch("/api/banners", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...next, sortOrder: current.sortOrder }),
        }),
      ]);
      fetchBanners();
    } catch (err) {
      console.error("Reorder error:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const method = editing ? "PUT" : "POST";
      const body = editing ? { ...form, id: editing.id } : form;
      const res = await fetch("/api/banners", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setShowForm(false);
        setEditing(null);
        setForm(EMPTY_BANNER);
        fetchBanners();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save banner");
      }
    } catch (err) {
      setError("Failed to save banner");
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const sortedBanners = [...banners].sort((a, b) => a.sortOrder - b.sortOrder);

  if (loading && banners.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading banners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Banner Slider</h1>
          <p className="text-sm text-gray-500 mt-1">Manage the hero slider banners on the catalog page</p>
        </div>
        <button
          onClick={handleNew}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-md"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Banner
        </button>
      </div>

      {/* CSV Export */}
      <BannerCsvExport banners={sortedBanners} />

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editing ? "Edit Banner" : "New Banner"}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL *</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={form.imageUrl}
                      onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                      placeholder="https://example.com/banner.jpg"
                      className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                    <GalleryImagePicker
                      currentImageUrl={form.imageUrl}
                      onSelect={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
                    />
                  </div>
                  {form.imageUrl && (
                    <div className="mt-2 relative w-full h-32 rounded-lg overflow-hidden bg-gray-100">
                      <Image src={form.imageUrl} alt="Banner preview" fill className="object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Premium Plumbing Solutions"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={form.subtitle}
                    onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                    placeholder="Authorized Distributor"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Your trusted dealer for high-quality plumbing solutions..."
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CTA Text</label>
                  <input
                    type="text"
                    value={form.ctaText}
                    onChange={(e) => setForm((f) => ({ ...f, ctaText: e.target.value }))}
                    placeholder="Shop Now"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CTA Link</label>
                  <input
                    type="text"
                    value={form.ctaLink}
                    onChange={(e) => setForm((f) => ({ ...f, ctaLink: e.target.value }))}
                    placeholder="/products?category=pipes"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                >
                  {saving ? "Saving..." : editing ? "Update Banner" : "Create Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Banners list */}
      {sortedBanners.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="mx-auto h-14 w-14 text-gray-300 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No banners yet</h3>
          <p className="text-sm text-gray-500 mb-6">Add your first banner to feature on the catalog homepage.</p>
          <button
            onClick={handleNew}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors text-sm shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Banner
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedBanners.map((banner, index) => (
            <div
              key={`${banner.id}-${index}`}
              className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all ${
                banner.isActive ? "border-gray-100" : "border-gray-200 opacity-60"
              }`}
            >
              <div className="flex flex-col sm:flex-row gap-4 p-4">
                {/* Thumbnail */}
                <div className="relative w-full sm:w-48 h-28 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  {banner.imageUrl ? (
                    <Image src={banner.imageUrl} alt={banner.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-indigo-900 flex items-center justify-center">
                      <span className="text-white/40 text-xs">No image</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 truncate">{banner.title || "Untitled"}</h3>
                      {banner.subtitle && (
                        <p className="text-xs text-gray-500 mt-0.5">{banner.subtitle}</p>
                      )}
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                      banner.isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {banner.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {banner.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{banner.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>Order: {banner.sortOrder}</span>
                    {banner.ctaText && <span>CTA: {banner.ctaText}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col items-center sm:items-stretch gap-1 shrink-0">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move up"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index >= sortedBanners.length - 1}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move down"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                <div className="flex sm:flex-col items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleActive(banner)}
                    className={`p-2 rounded-xl text-xs font-semibold transition-all ${
                      banner.isActive
                        ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                        : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    }`}
                    title={banner.isActive ? "Deactivate" : "Activate"}
                  >
                    {banner.isActive ? "Hide" : "Show"}
                  </button>
                  <button
                    onClick={() => handleEdit(banner)}
                    className="p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Live preview hint */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-100 shrink-0">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-indigo-900">Live Preview</h3>
            <p className="text-sm text-indigo-700 mt-1">
              Banners appear in the hero section of your public catalog page. Only active banners are shown to visitors.
              The slider automatically rotates every 5 seconds and supports touch swipe on mobile.
            </p>
            <a href="/" target="_blank" className="inline-flex items-center gap-1.5 mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
              View catalog
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
