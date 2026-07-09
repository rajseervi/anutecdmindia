"use client";

import { useState } from "react";
import { Product } from "@/types/product";
import Image from "next/image";
import Link from "next/link";
import { normalizeImageUrl } from "@/lib/imageUrl";

interface ProductGridViewProps {
  products: Product[];
  selectedProducts: string[];
  onToggleSelect: (id: string) => void;
}

const FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' fill='%23e5e7eb'%3E%3Crect width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' fill='%239ca3af' font-family='sans-serif' font-size='16' text-anchor='middle' dominant-baseline='central' font-weight='bold'%3ENo Image%3C/text%3E%3C/svg%3E";

function StockBadge({ inventory }: { inventory: number }) {
  if (inventory === 0) {
    return (
      <span className="absolute top-3 right-3 bg-red-500 text-white px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider shadow-sm">
        Out of Stock
      </span>
    );
  }
  if (inventory <= 5) {
    return (
      <span className="absolute top-3 right-3 bg-amber-400 text-amber-900 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider shadow-sm">
        Low Stock
      </span>
    );
  }
  return null;
}

function StockIndicator({ inventory }: { inventory: number }) {
  const color = inventory === 0
    ? "bg-red-500"
    : inventory <= 5
    ? "bg-amber-500"
    : "bg-emerald-500";
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${color} mr-1.5`} />
  );
}

function ProductImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100">
        <img src={FALLBACK_IMG} alt="" className="w-full h-full object-cover" />
      </div>
    );
  }

  const normalizedSrc = normalizeImageUrl(src);

  return (
    <Image
      src={normalizedSrc}
      alt={alt}
      width={400}
      height={300}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      onError={() => setError(true)}
    />
  );
}

export default function ProductGridView({ products, selectedProducts, onToggleSelect }: ProductGridViewProps) {
  if (products.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
      {products.map((product, index) => {
        const isSelected = selectedProducts.includes(product.id);
        const stockStatus = product.inventory === 0 ? "out" : product.inventory <= 5 ? "low" : "ok";
        return (
          <div
            key={product.id || `product-${index}`}
            className={`group bg-white rounded-xl border overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
              isSelected
                ? "border-indigo-400 ring-2 ring-indigo-200"
                : "border-slate-200 hover:border-slate-300"
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="relative h-44 bg-slate-50 border-b border-slate-200 overflow-hidden">
              <ProductImage src={product.imageUrl} alt={product.name || "Product image"} />
              <StockBadge inventory={product.inventory} />
              {product.hidden && (
                <span className="absolute bottom-3 left-3 bg-slate-900/70 text-white px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm">
                  Hidden
                </span>
              )}
              <label className="absolute top-3 left-3 z-10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelect(product.id)}
                  className="h-4 w-4 rounded border-slate-400 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </label>
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-900 truncate flex-1">{product.name}</h3>
                <p className="text-lg font-bold text-emerald-600 shrink-0">
                  ${typeof product.price === "number" ? product.price.toFixed(2) : "0.00"}
                </p>
              </div>
              {product.category && (
                <span className="inline-block text-[10px] font-medium px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md mt-1.5 uppercase tracking-wider border border-indigo-200">
                  {product.category}
                </span>
              )}
              <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{product.description}</p>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                <div className="flex items-center text-xs font-medium text-slate-500">
                  <StockIndicator inventory={product.inventory} />
                  {product.inventory === 0 ? (
                    <span className="text-red-600 font-semibold">No stock</span>
                  ) : (
                    <>
                      <span className="text-slate-800 font-semibold">{product.inventory}</span>
                      <span className="ml-1">in stock</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <Link
                  href={`/admin/products/edit/${product.id}`}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-3 py-2 rounded-lg text-xs font-medium text-center transition-all shadow-sm"
                >
                  Edit
                </Link>
                <Link
                  href={`/product/${product.id}`}
                  className="flex-1 bg-white hover:bg-slate-50 hover:border-slate-400 active:scale-95 text-slate-700 px-3 py-2 rounded-lg text-xs font-medium text-center border border-slate-300 transition-all"
                >
                  View
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
