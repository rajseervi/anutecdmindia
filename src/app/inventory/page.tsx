"use client";

import { useEffect, useState, useCallback } from "react";
import { Product } from "@/types/product";
import { CompanyProfile, DEFAULT_COMPANY_PROFILE } from "@/types/company";
import Image from "next/image";
import Link from "next/link";
import { normalizeImageUrl } from "@/lib/imageUrl";

const FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40' fill='%23e5e7eb'%3E%3Crect width='40' height='40'/%3E%3Ctext x='50%25' y='50%25' fill='%239ca3af' font-family='sans-serif' font-size='7' text-anchor='middle' dominant-baseline='central'%3EN/A%3C/text%3E%3C/svg%3E";

function InventoryImage({ src, alt }: { src: string; alt: string }) {
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
import { useToast } from "@/app/admin/_components/Toast";
import CsvExport from "@/app/admin/_components/CsvExport";

export const dynamic = "force-dynamic";

type FilterType = "all" | "low-stock" | "out-of-stock" | "in-stock" | "hidden";

export default function InventoryDashboard() {
  const { addToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [company, setCompany] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<"name" | "price" | "inventory" | "value">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/products?limit=1000&includeHidden=true");
      const data = await response.json();
      if (response.ok) {
        setProducts(data.products);
        if (data.company) {
          setCompany({ ...DEFAULT_COMPANY_PROFILE, ...data.company });
        }
      } else {
        addToast(data.error || "Failed to fetch products", "error");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      addToast("Failed to fetch inventory", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const stats = {
    totalProducts: products.length,
    totalValue: products.reduce((s, p) => s + ((p.price || 0) * p.inventory), 0),
    lowStockItems: products.filter(p => p.inventory > 0 && p.inventory <= 5).length,
    outOfStockItems: products.filter(p => p.inventory === 0).length,
    hiddenItems: products.filter(p => p.hidden).length,
    averagePrice: products.length > 0 ? products.reduce((s, p) => s + (p.price || 0), 0) / products.length : 0,
  };

  const filteredProducts = products
    .filter((p) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !(p.category || "").toLowerCase().includes(q)) return false;
      }
      switch (filter) {
        case "low-stock": return p.inventory > 0 && p.inventory <= 5;
        case "out-of-stock": return p.inventory === 0;
        case "in-stock": return p.inventory > 5 && !p.hidden;
        case "hidden": return p.hidden;
        default: return true;
      }
    })
    .sort((a, b) => {
      let av: number | string, bv: number | string;
      switch (sortBy) {
        case "price": av = a.price; bv = b.price; break;
        case "inventory": av = a.inventory; bv = b.inventory; break;
        case "value": av = a.price * a.inventory; bv = b.price * b.inventory; break;
        default: av = (a.name || "").toLowerCase(); bv = (b.name || "").toLowerCase();
      }
      if (typeof av === "string") return sortOrder === "asc" ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
      return sortOrder === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });

  const getStockBadge = (inv: number) => {
    if (inv === 0) return { label: "Out of Stock", color: "bg-red-500" };
    if (inv <= 5) return { label: "Low Stock", color: "bg-amber-500" };
    return { label: "In Stock", color: "bg-emerald-500" };
  };

  const toggleHidden = async (product: Product) => {
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...product, hidden: !product.hidden }),
      });
      if (res.ok) {
        addToast(`"${product.name}" ${product.hidden ? "shown" : "hidden"}`, "success");
        fetchProducts();
      } else {
        const err = await res.json();
        addToast(err.error || "Update failed", "error");
      }
    } catch {
      addToast("Failed to update product", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteConfirm.id }),
      });
      if (res.ok) {
        addToast(`"${deleteConfirm.name}" deleted successfully`, "success");
        setDeleteConfirm(null);
        fetchProducts();
      } else {
        const err = await res.json();
        addToast(err.error || "Delete failed", "error");
      }
    } catch {
      addToast("Failed to delete product", "error");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500 mt-0.5">Monitor stock levels and product availability</p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-md border-l-4 border-indigo-500 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Products</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalProducts}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md border-l-4 border-emerald-500 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {company.showPrices ? `$${stats.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—"}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-md border-l-4 border-amber-500 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Low Stock</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.lowStockItems}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md border-l-4 border-red-500 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Out of Stock</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.outOfStockItems}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md border-l-4 border-gray-500 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Hidden</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.hiddenItems}</p>
        </div>
      </div>

      {/* CSV Export inline */}
      <div className="mb-6">
        <CsvExport products={products} />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-md p-5 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 w-full max-w-md">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or category..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Filter */}
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterType)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer pr-10"
              >
                <option value="all">All Products</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock (≤5)</option>
                <option value="out-of-stock">Out of Stock</option>
                <option value="hidden">Hidden</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "name" | "price" | "inventory" | "value")}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer pr-10"
              >
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="inventory">Stock</option>
                <option value="value">Total Value</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Sort order */}
            <button
              onClick={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
              className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors bg-gray-50"
              title={`Sort ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
            >
              <svg className={`w-4 h-4 text-gray-600 transition-transform ${sortOrder === "desc" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            </button>

            {/* Refresh */}
            <button
              onClick={fetchProducts}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-500">
          Showing <span className="font-semibold text-gray-800">{filteredProducts.length}</span> of{" "}
          <span className="font-semibold text-gray-800">{products.length}</span> products
          {filter !== "all" && <span className="text-gray-400"> (filtered)</span>}
        </div>
      </div>

      {/* Inventory table */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                {company.showPrices && <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>}
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                {company.showPrices && <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Value</th>}
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product, index) => {
                const badge = getStockBadge(product.inventory);
                const totalValue = (product.price || 0) * product.inventory;

                return (
                  <tr key={product.id || `inv-product-${index}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                          <InventoryImage src={product.imageUrl} alt={product.name || "Product"} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">
                            {product.name}
                            {product.hidden && <span className="ml-2 text-[10px] font-bold text-gray-400 uppercase">(Hidden)</span>}
                          </p>
                          <p className="text-xs text-gray-500 truncate max-w-[250px]">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {product.category ? (
                        <span className="inline-flex px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-indigo-50 text-indigo-700">
                          {product.category}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                    </td>
                    {company.showPrices && (
                      <td className="px-5 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ${(product.price || 0).toFixed(2)}
                      </td>
                    )}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${badge.color}`} />
                        <span className={`text-sm font-semibold ${
                          product.inventory === 0 ? "text-red-600" :
                          product.inventory <= 5 ? "text-amber-600" : "text-gray-900"
                        }`}>
                          {product.inventory}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold rounded-full text-white uppercase tracking-wider ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                    {company.showPrices && (
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                        ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                    )}
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/products/edit/${product.id}`}
                          className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/product/${product.id}`}
                          className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => toggleHidden(product)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                            product.hidden
                              ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                              : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                          }`}
                          title={product.hidden ? "Show product" : "Hide product"}
                        >
                          {product.hidden ? "Show" : "Hide"}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(product)}
                          className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete product"
                        >
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

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="mx-auto h-12 w-12 text-gray-300 mb-3">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900">No products found</p>
            <p className="text-xs text-gray-500 mt-1">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fadeIn">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-full bg-red-100">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Product</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Are you sure you want to delete <strong className="text-gray-700">{deleteConfirm.name}</strong>?
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-4">This action cannot be undone. The product data will be permanently removed.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
