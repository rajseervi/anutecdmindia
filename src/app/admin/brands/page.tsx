"use client";

import { useEffect, useState, useCallback } from "react";

interface Brand {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  sortOrder: number;
}

const EMPTY_BRAND = {
  id: "",
  name: "",
  description: "",
  imageUrl: "",
  sortOrder: 0,
};

export const dynamic = "force-dynamic";

const DEFAULT_BRAND_IMAGES = [
  "/img/WhatsApp Image 2026-07-09 at 11.30.43 AM.jpeg",
  "/img/WhatsApp Image 2026-07-09 at 11.30.44 AM (1).jpeg",
  "/img/WhatsApp Image 2026-07-09 at 11.30.44 AM.jpeg",
  "/img/WhatsApp Image 2026-07-09 at 11.30.45 AM (1).jpeg",
  "/img/WhatsApp Image 2026-07-09 at 11.30.45 AM (2).jpeg",
  "/img/WhatsApp Image 2026-07-09 at 11.30.45 AM.jpeg",
  "/img/WhatsApp Image 2026-07-09 at 11.30.46 AM.jpeg",
  "/img/WhatsApp Image 2026-07-09 at 11.30.47 AM (1).jpeg",
];

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [form, setForm] = useState<Omit<Brand, "id">>(EMPTY_BRAND);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/brands");
      const data = await res.json();
      if (res.ok && data.brands) {
        setBrands(data.brands);
      }
    } catch (err) {
      console.error("Error fetching brands:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBrands(); }, [fetchBrands]);

  const handleEdit = (brand: Brand) => {
    setEditing(brand);
    setForm({
      name: brand.name,
      description: brand.description,
      imageUrl: brand.imageUrl,
      sortOrder: brand.sortOrder,
    });
    setShowForm(true);
    setError("");
  };

  const handleNew = () => {
    setEditing(null);
    setForm({ ...EMPTY_BRAND, sortOrder: brands.length });
    setShowForm(true);
    setError("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this brand?")) return;
    try {
      const res = await fetch("/api/brands", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        fetchBrands();
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete brand");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const method = editing ? "PUT" : "POST";
      const body = editing ? { ...form, id: editing.id } : form;
      const res = await fetch("/api/brands", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setShowForm(false);
        setEditing(null);
        setForm({ ...EMPTY_BRAND, sortOrder: brands.length });
        fetchBrands();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save brand");
      }
    } catch (err) {
      setError("Failed to save brand");
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const sorted = [...brands].sort((a, b) => a.sortOrder - b.sortOrder);
    const current = sorted[index];
    const previous = sorted[index - 1];
    try {
      await Promise.all([
        fetch("/api/brands", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...current, sortOrder: previous.sortOrder }),
        }),
        fetch("/api/brands", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...previous, sortOrder: current.sortOrder }),
        }),
      ]);
      fetchBrands();
    } catch (err) {
      console.error("Reorder error:", err);
    }
  };

  const handleMoveDown = async (index: number) => {
    const sorted = [...brands].sort((a, b) => a.sortOrder - b.sortOrder);
    if (index >= sorted.length - 1) return;
    const current = sorted[index];
    const next = sorted[index + 1];
    try {
      await Promise.all([
        fetch("/api/brands", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...current, sortOrder: next.sortOrder }),
        }),
        fetch("/api/brands", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...next, sortOrder: current.sortOrder }),
        }),
      ]);
      fetchBrands();
    } catch (err) {
      console.error("Reorder error:", err);
    }
  };

  if (loading && brands.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading brands...</p>
        </div>
      </div>
    );
  }

  const sortedBrands = [...brands].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Brand Galaxy</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage the brands displayed in the 3D coverflow carousel on the homepage
          </p>
        </div>
        <button
          onClick={handleNew}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-md shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Brand
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editing ? "Edit Brand" : "Add New Brand"}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. ACTIVE SERIES"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="e.g. Bath Fittings"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                    placeholder="https://example.com/brand-image.jpg"
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  />
                  {!editing && !form.imageUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        const randomImg = DEFAULT_BRAND_IMAGES[Math.floor(Math.random() * DEFAULT_BRAND_IMAGES.length)];
                        setForm((f) => ({ ...f, imageUrl: randomImg }));
                      }}
                      className="px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
                      title="Pick a default image"
                    >
                      Default
                    </button>
                  )}
                </div>
                {form.imageUrl && (
                  <div className="mt-2 relative w-full h-36 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                    <img
                      src={form.imageUrl}
                      alt="Brand preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/img/anutec-logo.svg";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))}
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1 shadow-sm transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  min={0}
                />
                <p className="text-xs text-gray-400 mt-1">Lower numbers appear first in the carousel</p>
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

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
                  {saving ? "Saving..." : editing ? "Update Brand" : "Add Brand"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Brands list */}
      {sortedBrands.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="mx-auto h-14 w-14 text-gray-300 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No brands yet</h3>
          <p className="text-sm text-gray-500 mb-6">Add your first brand to appear in the 3D carousel on the homepage.</p>
          <button
            onClick={handleNew}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors text-sm shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Brand
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedBrands.map((brand, index) => (
            <div
              key={brand.id || `brand-${index}`}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all group"
            >
              {/* Brand Image */}
              <div className="relative h-40 bg-gradient-to-br from-slate-700 to-slate-900 overflow-hidden">
                {brand.imageUrl ? (
                  <img
                    src={brand.imageUrl}
                    alt={brand.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/img/anutec-logo.svg";
                      (e.target as HTMLImageElement).style.objectFit = "contain";
                      (e.target as HTMLImageElement).style.padding = "2rem";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-white/20" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                {/* Order badge */}
                <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 border border-white/10">
                  <span className="text-xs font-bold text-white">#{brand.sortOrder}</span>
                </div>

                {/* Reorder buttons */}
                <div className="absolute top-3 right-3 flex gap-1">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="Move up"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index >= sortedBrands.length - 1}
                    className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="Move down"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Brand name on image */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-lg font-bold text-white drop-shadow-lg truncate">{brand.name}</h3>
                  {brand.description && (
                    <p className="text-xs text-white/80 mt-0.5 truncate">{brand.description}</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="p-3 flex gap-2">
                <button
                  onClick={() => handleEdit(brand)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-semibold transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(brand.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 text-xs font-semibold transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
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
              Brands appear in the <strong>3D Coverflow Galaxy Slider</strong> on the homepage. Up to 8 brands recommended
              for the best visual experience. Images should be at least <strong>600x800px</strong> for crisp display on all devices.
              The carousel automatically rotates every 4 seconds.
            </p>
            <a href="/" target="_blank" className="inline-flex items-center gap-1.5 mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
              View homepage
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
