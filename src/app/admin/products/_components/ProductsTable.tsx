"use client";

import { Product } from "@/types/product";
import { CompanyProfile } from "@/types/company";
import { normalizeImageUrl } from "@/lib/imageUrl";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40' fill='%23e5e7eb'%3E%3Crect width='40' height='40'/%3E%3Ctext x='50%25' y='50%25' fill='%239ca3af' font-family='sans-serif' font-size='7' text-anchor='middle' dominant-baseline='central'%3EN/A%3C/text%3E%3C/svg%3E";

function TableImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);
  const normalized = normalizeImageUrl(src);
  if (error || !normalized) return <img src={FALLBACK_IMG} alt="" className="h-full w-full object-cover" />;
  return (
    <Image src={normalized} alt={alt} width={40} height={40} className="h-full w-full object-cover" onError={() => setError(true)} />
  );
}

interface ProductsTableProps {
  products: Product[];
  selectedProducts: string[];
  company: CompanyProfile;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onEdit: (p: Product) => void;
  onToggleHidden: (p: Product) => void;
  onDuplicate: (p: Product) => void;
  onDelete: (p: Product) => void;
  filteredCount: number;
}

export function ProductsTable({
  products, selectedProducts, company, onToggleSelect, onSelectAll, onClearSelection,
  onEdit, onToggleHidden, onDuplicate, onDelete, filteredCount,
}: ProductsTableProps) {
  const allSelected = products.length > 0 && selectedProducts.length === filteredCount;

  return (
    <div className="bento-card !p-0 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={allSelected ? onClearSelection : onSelectAll}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
            {allSelected ? "Deselect All" : "Select All"}
          </button>
          {selectedProducts.length > 0 && (
            <span className="text-xs text-slate-500">
              <span className="font-semibold text-indigo-600">{selectedProducts.length}</span> selected
            </span>
          )}
        </div>
        {selectedProducts.length > 0 && (
          <button onClick={onClearSelection} className="text-xs font-medium text-slate-500 hover:text-slate-700">
            Clear
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-left">
                <input type="checkbox" checked={allSelected}
                  onChange={allSelected ? onClearSelection : onSelectAll}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
              {company.showPrices && <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>}
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              {company.showPrices && <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Value</th>}
              <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => {
              const isSelected = selectedProducts.includes(product.id);
              const totalValue = (product.price || 0) * product.inventory;
              return (
                <tr key={product.id} className={`hover:bg-slate-50 transition-colors ${isSelected ? "bg-indigo-50/40" : ""}`}>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <input type="checkbox" checked={isSelected} onChange={() => onToggleSelect(product.id)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        <TableImage src={product.imageUrl} alt={product.name} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate max-w-[200px]">
                          {product.name}
                          {product.hidden && <span className="ml-2 text-[10px] font-bold text-slate-400 uppercase">(Hidden)</span>}
                        </div>
                        <div className="text-xs text-slate-500 truncate max-w-[250px]">{product.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    {product.category ? (
                      <span className="inline-flex px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">{product.category}</span>
                    ) : <span className="text-slate-300 text-sm">—</span>}
                  </td>
                  {company.showPrices && (
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">${(product.price || 0).toFixed(2)}</td>
                  )}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${product.inventory === 0 ? "bg-red-500" : product.inventory <= 5 ? "bg-amber-500" : "bg-emerald-500"}`} />
                      <span className={`text-sm font-semibold ${product.inventory === 0 ? "text-red-600" : product.inventory <= 5 ? "text-amber-600" : "text-slate-900"}`}>
                        {product.inventory}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {product.inventory === 0 && (
                        <span className="inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-50 text-red-700 uppercase tracking-wider border border-red-200">Out of Stock</span>
                      )}
                      {product.inventory > 0 && product.inventory <= 5 && (
                        <span className="inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-700 uppercase tracking-wider border border-amber-200">Low Stock</span>
                      )}
                      {product.hidden && (
                        <span className="inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">Hidden</span>
                      )}
                      {product.inventory > 5 && !product.hidden && (
                        <span className="inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 uppercase tracking-wider border border-emerald-200">Active</span>
                      )}
                    </div>
                  </td>
                  {company.showPrices && (
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">
                      ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                  )}
                  <td className="px-5 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => onEdit(product)}
                        className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">Edit</button>
                      <Link href={`/product/${product.id}`}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">View</Link>
                      <button onClick={() => onToggleHidden(product)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                          product.hidden ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100" : "text-slate-600 bg-slate-100 hover:bg-slate-200"
                        }`}>{product.hidden ? "Show" : "Hide"}</button>
                      <button onClick={() => onDuplicate(product)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        title="Duplicate">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button onClick={() => onDelete(product)}
                        className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Delete">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm font-medium text-slate-900">No products found</p>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
}
