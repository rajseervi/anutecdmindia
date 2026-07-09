"use client";

import { useState } from "react";
import { Product } from "@/types/product";
import Image from "next/image";
import Link from "next/link";
import { normalizeImageUrl } from "@/lib/imageUrl";

const FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40' fill='%23e5e7eb'%3E%3Crect width='40' height='40'/%3E%3Ctext x='50%25' y='50%25' fill='%239ca3af' font-family='sans-serif' font-size='7' text-anchor='middle' dominant-baseline='central'%3EN/A%3C/text%3E%3C/svg%3E";

function TableImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);
  const normalizedSrc = normalizeImageUrl(src);
  if (error || !normalizedSrc) {
    return <img src={FALLBACK_IMG} alt="" className="h-full w-full object-cover" />;
  }
  return (
    <Image
      src={normalizedSrc}
      alt={alt}
      width={40}
      height={40}
      className="h-full w-full object-cover"
      onError={() => setError(true)}
    />
  );
}

interface ProductTableViewProps {
  products: Product[];
  selectedProducts: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

export default function ProductTableView({
  products,
  selectedProducts,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
}: ProductTableViewProps) {
  const allSelected = products.length > 0 && selectedProducts.length === products.length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">
          Products <span className="text-slate-400 font-normal">({products.length})</span>
        </h3>
        <div className="flex items-center gap-3">
          {selectedProducts.length > 0 && (
            <span className="text-xs text-slate-500">
              <span className="font-semibold text-indigo-600">{selectedProducts.length}</span> selected
            </span>
          )}
          <button
            onClick={allSelected ? onClearSelection : onSelectAll}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            {allSelected ? "Deselect All" : "Select All"}
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={allSelected ? onClearSelection : onSelectAll}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product, index) => (
              <tr
                key={product.id || `table-product-${index}`}
                className={`hover:bg-slate-50 transition-colors ${
                  selectedProducts.includes(product.id) ? "bg-indigo-50/40" : ""
                }`}
              >
                <td className="px-5 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => onToggleSelect(product.id)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      <TableImage src={product.imageUrl} alt={product.name || "Product thumbnail"} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate max-w-[200px]">{product.name}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[250px]">{product.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  {product.category ? (
                    <span className="inline-flex px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {product.category}
                    </span>
                  ) : (
                    <span className="text-slate-300 text-sm">—</span>
                  )}
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                  ${typeof product.price === "number" ? product.price.toFixed(2) : "0.00"}
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <span
                    className={`text-sm font-semibold ${
                      product.inventory === 0
                        ? "text-red-600"
                        : product.inventory <= 5
                        ? "text-amber-600"
                        : "text-slate-900"
                    }`}
                  >
                    {product.inventory}
                  </span>
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {product.inventory === 0 && (
                      <span className="inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full bg-red-50 text-red-700 uppercase tracking-wider border border-red-200">
                        Out of Stock
                      </span>
                    )}
                    {product.inventory > 0 && product.inventory <= 5 && (
                      <span className="inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-50 text-amber-700 uppercase tracking-wider border border-amber-200">
                        Low Stock
                      </span>
                    )}
                    {product.hidden && (
                      <span className="inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">
                        Hidden
                      </span>
                    )}
                    {product.inventory > 5 && !product.hidden && (
                      <span className="inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-50 text-emerald-700 uppercase tracking-wider border border-emerald-200">
                        Active
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/products/edit/${product.id}`}
                      className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/product/${product.id}`}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <div className="text-center py-12 px-6">
          <div className="mx-auto h-12 w-12 text-slate-300 mb-3">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-900">No products found</p>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
}
