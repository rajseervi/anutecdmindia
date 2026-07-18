"use client";

import { useState } from "react";
import { Product } from "@/types/product";
import { normalizeImageUrl } from "@/lib/imageUrl";
import Image from "next/image";

interface ProductFormInlineProps {
  form: {
    name: string; description: string; price: number; imageUrl: string;
    qrCode: string; inventory: number; category: string; hidden: boolean;
  };
  editing: Product | null;
  saving: boolean;
  allCategories: string[];
  onSubmit: (e: React.FormEvent) => void;
  onChange: (field: string, value: string | number | boolean) => void;
  onCancel: () => void;
}

export function ProductFormInline({
  form, editing, saving, allCategories, onSubmit, onChange, onCancel,
}: ProductFormInlineProps) {
  const [previewError, setPreviewError] = useState(false);

  return (
    <div className="bento-card animate-slideDown !p-0 overflow-hidden">
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
            {editing ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{editing ? "Edit Product" : "Add New Product"}</h2>
            <p className="text-sm text-slate-500">{editing ? "Update product details and inventory" : "Add a new product to your catalog"}</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input type="text" value={form.name} onChange={(e) => onChange("name", e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 focus:bg-white text-sm"
                placeholder="Enter product name" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Price <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>
                <input type="number" step="0.01" min="0" value={form.price}
                  onChange={(e) => onChange("price", parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white text-sm"
                  placeholder="0.00" required />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea value={form.description} onChange={(e) => onChange("description", e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white text-sm resize-none"
              placeholder="Enter product description" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Image URL <span className="text-red-500">*</span>
              </label>
              <input type="url" value={form.imageUrl} onChange={(e) => onChange("imageUrl", e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white text-sm"
                placeholder="https://example.com/image.jpg" required />
              {form.imageUrl && (
                <div className="mt-3 relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50 h-32">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {previewError ? (
                    <div className="flex items-center justify-center h-full text-slate-400 text-sm">Unable to load image</div>
                  ) : (
                    <img
                      src={normalizeImageUrl(form.imageUrl)}
                      alt="Preview"
                      className="w-full h-full object-contain"
                      onError={() => setPreviewError(true)}
                      onLoad={() => setPreviewError(false)}
                    />
                  )}
                </div>
              )}
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Inventory / Stock <span className="text-red-500">*</span>
                </label>
                <input type="number" min="0" value={form.inventory}
                  onChange={(e) => onChange("inventory", parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white text-sm"
                  placeholder="0" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                <input type="text" value={form.category} onChange={(e) => onChange("category", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white text-sm"
                  placeholder="e.g., Electronics" list="form-categories" />
                <datalist id="form-categories">
                  {allCategories.map((cat) => <option key={cat} value={cat} />)}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">QR Code URL</label>
                <input type="url" value={form.qrCode} onChange={(e) => onChange("qrCode", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white text-sm"
                  placeholder="https://example.com/qr.png" />
              </div>
            </div>
          </div>

          <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
            <div className="relative">
              <input type="checkbox" checked={form.hidden} onChange={(e) => onChange("hidden", e.target.checked)} className="sr-only peer" />
              <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[3px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
            </div>
            <div>
              <span className="text-sm font-medium text-slate-800">Hide product from catalog</span>
              <p className="text-xs text-slate-500">Hidden products are not visible publicly</p>
            </div>
          </label>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
              {saving ? (
                <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Saving...</>
              ) : (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  {editing
                    ? <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v4h4l12-12-4-4-12 12z" />
                    : <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />}
                </svg>{editing ? "Update Product" : "Add Product"}</>
              )}
            </button>
            <button type="button" onClick={onCancel}
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
