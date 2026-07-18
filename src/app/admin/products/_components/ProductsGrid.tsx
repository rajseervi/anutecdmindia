"use client";

import { Product } from "@/types/product";
import { normalizeImageUrl } from "@/lib/imageUrl";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' fill='%23e5e7eb'%3E%3Crect width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' fill='%239ca3af' font-family='sans-serif' font-size='16' text-anchor='middle' dominant-baseline='central' font-weight='bold'%3ENo Image%3C/text%3E%3C/svg%3E";

function getStockBadge(inv: number) {
  if (inv === 0) return { label: "Out of Stock", color: "bg-red-500" };
  if (inv <= 5) return { label: "Low Stock", color: "bg-amber-400 text-amber-900" };
  return null;
}

function ProductImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);
  const normalized = normalizeImageUrl(src);
  if (error || !normalized) {
    return <img src={FALLBACK_IMG} alt="" className="w-full h-full object-cover" />;
  }
  return (
    <Image
      src={normalized} alt={alt} width={400} height={300}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      onError={() => setError(true)}
    />
  );
}

interface ProductsGridProps {
  products: Product[];
  selectedProducts: string[];
  onToggleSelect: (id: string) => void;
  onEdit: (p: Product) => void;
  onToggleHidden: (p: Product) => void;
  onDuplicate: (p: Product) => void;
  onDelete: (p: Product) => void;
  hasActiveFilters: boolean;
  onAddNew: () => void;
}

export function ProductsGrid({
  products, selectedProducts, onToggleSelect, onEdit, onToggleHidden, onDuplicate, onDelete, hasActiveFilters, onAddNew,
}: ProductsGridProps) {
  if (products.length === 0) {
    return (
      <div className="bento-card text-center py-16">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">No products found</h3>
        <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">
          {hasActiveFilters ? "Try adjusting your search or filter criteria." : "Add your first product to get started."}
        </p>
        {!hasActiveFilters && (
          <button onClick={onAddNew}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {products.map((product) => {
        const isSelected = selectedProducts.includes(product.id);
        const badge = getStockBadge(product.inventory);
        return (
          <div key={product.id}
            className={`group bg-white rounded-xl border overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
              isSelected ? "border-indigo-400 ring-2 ring-indigo-200" : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="relative h-36 sm:h-40 bg-slate-50 border-b border-slate-200 overflow-hidden">
              <ProductImage src={product.imageUrl} alt={product.name} />
              {badge && (
                <span className={`absolute top-2 right-2 ${badge.color} text-white px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm`}>
                  {badge.label}
                </span>
              )}
              {product.hidden && (
                <span className="absolute bottom-2 left-2 bg-slate-900/70 text-white px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                  Hidden
                </span>
              )}
              <label className="absolute top-2 left-2 z-10 cursor-pointer">
                <input type="checkbox" checked={isSelected} onChange={() => onToggleSelect(product.id)}
                  className="h-3.5 w-3.5 rounded border-slate-400 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
              </label>
            </div>

            <div className="p-3 sm:p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900 truncate flex-1">{product.name}</h3>
                <p className="text-sm sm:text-base font-bold text-emerald-600 shrink-0">${(product.price || 0).toFixed(2)}</p>
              </div>
              {product.category && (
                <span className="inline-block text-[10px] font-medium px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md mt-1 uppercase tracking-wider border border-indigo-200">
                  {product.category}
                </span>
              )}
              <p className="text-[11px] sm:text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">{product.description}</p>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className={`w-2 h-2 rounded-full ${product.inventory === 0 ? "bg-red-500" : product.inventory <= 5 ? "bg-amber-500" : "bg-emerald-500"}`} />
                  <span className="font-semibold text-slate-800">{product.inventory}</span>
                  <span>in stock</span>
                </div>
              </div>

              <div className="flex gap-1.5 mt-3">
                <button onClick={() => onEdit(product)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all shadow-sm">
                  Edit
                </button>
                <Link href={`/product/${product.id}`}
                  className="flex-1 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 px-2 py-1.5 rounded-lg text-[11px] font-medium text-center border border-slate-300 transition-all">
                  View
                </Link>
                <button onClick={() => onToggleHidden(product)}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                    product.hidden
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                      : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-100"
                  }`} title={product.hidden ? "Show" : "Hide"}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    {product.hidden ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    )}
                  </svg>
                </button>
                <button onClick={() => onDuplicate(product)}
                  className="px-2 py-1.5 rounded-lg text-[11px] font-medium bg-white text-slate-600 border border-slate-300 hover:bg-slate-100 transition-all" title="Duplicate">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button onClick={() => onDelete(product)}
                  className="px-2 py-1.5 rounded-lg text-[11px] font-medium text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-all" title="Delete">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
