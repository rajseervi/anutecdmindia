"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Product } from "@/types/product";
import { CompanyProfile, DEFAULT_COMPANY_PROFILE } from "@/types/company";
import { useToast } from "@/app/admin/_components/Toast";
import Image from "next/image";
import Link from "next/link";
import { normalizeImageUrl } from "@/lib/imageUrl";
import { ProductsGrid } from "./_components/ProductsGrid";
import { ProductsTable } from "./_components/ProductsTable";
import { FiltersBar } from "./_components/FiltersBar";
import { ProductFormInline } from "./_components/ProductFormInline";
import { DeleteModal } from "./_components/DeleteModal";
import { BulkActionsBar } from "./_components/BulkActionsBar";

export const dynamic = "force-dynamic";

type FilterType = "all" | "low-stock" | "out-of-stock" | "in-stock" | "hidden";
type SortField = "name" | "price" | "inventory" | "category" | "value" | "created";
type ViewMode = "grid" | "table";
type BulkAction = "hide" | "show" | "delete" | "duplicate";

export default function AdminProductsPage() {
  const { addToast } = useToast();

  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [company, setCompany] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [allCategories, setAllCategories] = useState<string[]>([]);

  // Sort
  const [sortBy, setSortBy] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // View
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Selection
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: "", description: "", price: 0, imageUrl: "", qrCode: "", inventory: 0, category: "", hidden: false,
  });
  const [saving, setSaving] = useState(false);

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 24;

  // Stats
  const stats = useMemo(() => {
    const total = products.length;
    const totalValue = products.reduce((s, p) => s + (p.price || 0) * p.inventory, 0);
    const lowStock = products.filter((p) => p.inventory > 0 && p.inventory <= 5).length;
    const outOfStock = products.filter((p) => p.inventory === 0).length;
    const hidden = products.filter((p) => p.hidden).length;
    const avgPrice = total > 0 ? products.reduce((s, p) => s + (p.price || 0), 0) / total : 0;
    return { total, totalValue, lowStock, outOfStock, hidden, avgPrice };
  }, [products]);

  // Fetch
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products?limit=1000&includeHidden=true");
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products);
        if (data.company) setCompany({ ...DEFAULT_COMPANY_PROFILE, ...data.company });
        const cats = Array.from(
          new Set((data.products || []).map((p: Product) => (p.category || "").trim()).filter(Boolean))
        ) as string[];
        setAllCategories(cats);
      } else {
        addToast(data.error || "Failed to fetch products", "error");
      }
    } catch {
      addToast("Failed to fetch products", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Reset page on filter change
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, filter, selectedCategory, sortBy, sortOrder]);

  // Filtered + sorted
  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter((p) =>
        [p.name, p.description, p.id, p.category].some((v) => v && v.toLowerCase().includes(q))
      );
    }
    if (selectedCategory !== "all") {
      result = result.filter((p) => (p.category || "").trim() === selectedCategory);
    }
    switch (filter) {
      case "low-stock": result = result.filter((p) => p.inventory > 0 && p.inventory <= 5); break;
      case "out-of-stock": result = result.filter((p) => p.inventory === 0); break;
      case "in-stock": result = result.filter((p) => p.inventory > 5 && !p.hidden); break;
      case "hidden": result = result.filter((p) => p.hidden); break;
    }
    result.sort((a, b) => {
      let av: number | string, bv: number | string;
      switch (sortBy) {
        case "price": av = a.price; bv = b.price; break;
        case "inventory": av = a.inventory; bv = b.inventory; break;
        case "value": av = a.price * a.inventory; bv = b.price * b.inventory; break;
        case "category": av = (a.category || "").toLowerCase(); bv = (b.category || "").toLowerCase(); break;
        case "created": av = a.id; bv = b.id; break;
        default: av = (a.name || "").toLowerCase(); bv = (b.name || "").toLowerCase(); break;
      }
      if (typeof av === "string") return sortOrder === "asc" ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
      return sortOrder === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return result;
  }, [products, debouncedSearch, selectedCategory, filter, sortBy, sortOrder]);

  // Paginated
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProducts = useMemo(
    () => filteredProducts.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filteredProducts, safePage, pageSize]
  );

  // Form handlers
  const handleFormChange = (field: string, value: string | number | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const resetForm = () => {
    setEditing(null);
    setForm({ name: "", description: "", price: 0, imageUrl: "", qrCode: "", inventory: 0, category: "", hidden: false });
    setShowForm(false);
  };

  const openNewForm = () => {
    setEditing(null);
    setForm({ name: "", description: "", price: 0, imageUrl: "", qrCode: "", inventory: 0, category: "", hidden: false });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openEditForm = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name, description: product.description, price: product.price, imageUrl: product.imageUrl,
      qrCode: product.qrCode || "", inventory: product.inventory, category: product.category || "", hidden: product.hidden || false,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editing ? "PUT" : "POST";
      const body = editing ? { ...form, id: editing.id } : form;
      const res = await fetch("/api/products", {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      if (res.ok) {
        addToast(editing ? `"${form.name}" updated!` : `"${form.name}" added!`, "success");
        resetForm();
        fetchProducts();
      } else {
        const err = await res.json();
        addToast(`Error: ${err.error}`, "error");
      }
    } catch {
      addToast("Failed to save product", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/products", {
        method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: deleteConfirm.id }),
      });
      if (res.ok) {
        addToast(`"${deleteConfirm.name}" deleted`, "success");
        setDeleteConfirm(null);
        setSelectedProducts((prev) => prev.filter((id) => id !== deleteConfirm.id));
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

  const toggleHidden = async (product: Product) => {
    try {
      const res = await fetch("/api/products", {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...product, hidden: !product.hidden }),
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

  const duplicateProduct = async (product: Product) => {
    try {
      const res = await fetch("/api/products", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${product.name} (Copy)`, description: product.description, price: product.price,
          imageUrl: product.imageUrl, qrCode: product.qrCode, inventory: 0,
          category: product.category || "", hidden: true,
        }),
      });
      if (res.ok) {
        addToast(`"${product.name}" duplicated`, "success");
        fetchProducts();
      } else {
        const err = await res.json();
        addToast(err.error || "Duplicate failed", "error");
      }
    } catch {
      addToast("Failed to duplicate product", "error");
    }
  };

  const handleBulkAction = async (action: BulkAction) => {
    if (selectedProducts.length === 0) return;
    try {
      if (action === "delete") {
        for (const id of selectedProducts) {
          await fetch("/api/products", {
            method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }),
          });
        }
        addToast(`${selectedProducts.length} products deleted`, "success");
      } else if (action === "duplicate") {
        for (const id of selectedProducts) {
          const p = products.find((x) => x.id === id);
          if (!p) continue;
          await fetch("/api/products", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: `${p.name} (Copy)`, description: p.description, price: p.price,
              imageUrl: p.imageUrl, qrCode: p.qrCode, inventory: 0,
              category: p.category || "", hidden: true,
            }),
          });
        }
        addToast(`${selectedProducts.length} products duplicated`, "success");
      } else {
        const hidden = action === "hide";
        for (const id of selectedProducts) {
          const p = products.find((x) => x.id === id);
          if (!p) continue;
          await fetch("/api/products", {
            method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...p, hidden }),
          });
        }
        addToast(`${selectedProducts.length} products ${hidden ? "hidden" : "shown"}`, "success");
      }
      setSelectedProducts([]);
      fetchProducts();
    } catch {
      addToast("Bulk action failed", "error");
    }
  };

  const toggleSelection = (id: string) =>
    setSelectedProducts((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const selectAll = () => setSelectedProducts(products.map((p) => p.id));
  const clearSelection = () => setSelectedProducts([]);

  // Loading
  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading products...</p>
        </div>
      </div>
    );
  }

  const hasActiveFilters = Boolean(debouncedSearch || selectedCategory !== "all" || filter !== "all");

  return (
    <div className="space-y-5 max-w-7xl mx-auto">

      {/* ═══════ HEADER ═══════ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Advanced product management &middot; {stats.total} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openNewForm}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </button>
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="p-2.5 border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors bg-white disabled:opacity-50"
            title="Refresh"
          >
            <svg className={`w-5 h-5 text-slate-600 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* ═══════ STATS BANNER ═══════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <div className="stat-glow-card indigo col-span-2 sm:col-span-1 lg:col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="glow-icon indigo p-1.5 rounded-lg bg-indigo-50">
              <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span className="text-xs font-medium text-slate-500">Total Products</span>
          </div>
          <p className="text-xl font-bold text-slate-900">{stats.total}</p>
        </div>
        {company.showPrices && (
          <div className="stat-glow-card emerald">
            <div className="flex items-center gap-2 mb-1">
              <div className="glow-icon emerald p-1.5 rounded-lg bg-emerald-50">
                <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <span className="text-xs font-medium text-slate-500">Total Value</span>
            </div>
            <p className="text-xl font-bold text-slate-900">${stats.totalValue.toLocaleString("en-US", { minimumFractionDigits: 0 })}</p>
          </div>
        )}
        <div className="stat-glow-card amber">
          <div className="flex items-center gap-2 mb-1">
            <div className="glow-icon amber p-1.5 rounded-lg bg-amber-50">
              <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-slate-500">Low Stock</span>
          </div>
          <p className="text-xl font-bold text-slate-900">{stats.lowStock}</p>
        </div>
        <div className="stat-glow-card red">
          <div className="flex items-center gap-2 mb-1">
            <div className="glow-icon red p-1.5 rounded-lg bg-red-50">
              <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span className="text-xs font-medium text-slate-500">Out of Stock</span>
          </div>
          <p className="text-xl font-bold text-slate-900">{stats.outOfStock}</p>
        </div>
        <div className="stat-glow-card violet">
          <div className="flex items-center gap-2 mb-1">
            <div className="glow-icon violet p-1.5 rounded-lg bg-violet-50">
              <svg className="w-3.5 h-3.5 text-violet-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-slate-500">Hidden</span>
          </div>
          <p className="text-xl font-bold text-slate-900">{stats.hidden}</p>
        </div>
        {!company.showPrices && (
          <div className="stat-glow-card emerald">
            <div className="flex items-center gap-2 mb-1">
              <div className="glow-icon emerald p-1.5 rounded-lg bg-emerald-50">
                <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <span className="text-xs font-medium text-slate-500">Avg Price</span>
            </div>
            <p className="text-xl font-bold text-slate-900">${stats.avgPrice.toFixed(2)}</p>
          </div>
        )}
      </div>

      {/* ═══════ PRODUCT FORM ═══════ */}
      {showForm && (
        <ProductFormInline
          form={form}
          editing={editing}
          saving={saving}
          allCategories={allCategories}
          onSubmit={handleSubmit}
          onChange={handleFormChange}
          onCancel={resetForm}
        />
      )}

      {/* ═══════ FILTERS ═══════ */}
      <FiltersBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filter={filter}
        onFilterChange={setFilter}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        allCategories={allCategories}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderToggle={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalResults={filteredProducts.length}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={() => { setSearchQuery(""); setFilter("all"); setSelectedCategory("all"); }}
      />

      {/* ═══════ PRODUCT GRID ═══════ */}
      {viewMode === "grid" && (
        <ProductsGrid
          products={paginatedProducts}
          selectedProducts={selectedProducts}
          onToggleSelect={toggleSelection}
          onEdit={openEditForm}
          onToggleHidden={toggleHidden}
          onDuplicate={duplicateProduct}
          onDelete={setDeleteConfirm}
          hasActiveFilters={hasActiveFilters}
          onAddNew={openNewForm}
        />
      )}

      {/* ═══════ PRODUCT TABLE ═══════ */}
      {viewMode === "table" && (
        <ProductsTable
          products={paginatedProducts}
          selectedProducts={selectedProducts}
          company={company}
          onToggleSelect={toggleSelection}
          onSelectAll={selectAll}
          onClearSelection={clearSelection}
          onEdit={openEditForm}
          onToggleHidden={toggleHidden}
          onDuplicate={duplicateProduct}
          onDelete={setDeleteConfirm}
          filteredCount={filteredProducts.length}
        />
      )}

      {/* ═══════ PAGINATION ═══════ */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-lg text-sm font-medium border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all bg-white"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
            .map((p, idx, arr) => (
              <span key={p} className="flex items-center gap-1">
                {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-slate-300 text-sm">...</span>}
                <button
                  onClick={() => setCurrentPage(p)}
                  className={`min-w-[36px] px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    p === currentPage
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "border border-slate-300 hover:bg-slate-100 bg-white text-slate-700"
                  }`}
                >
                  {p}
                </button>
              </span>
            ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-lg text-sm font-medium border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all bg-white"
          >
            Next
          </button>
        </div>
      )}

      {/* ═══════ BULK ACTIONS BAR ═══════ */}
      {selectedProducts.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedProducts.length}
          onHide={() => handleBulkAction("hide")}
          onShow={() => handleBulkAction("show")}
          onDelete={() => handleBulkAction("delete")}
          onDuplicate={() => handleBulkAction("duplicate")}
          onClear={clearSelection}
        />
      )}

      {/* ═══════ DELETE MODAL ═══════ */}
      {deleteConfirm && (
        <DeleteModal
          product={deleteConfirm}
          deleting={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
