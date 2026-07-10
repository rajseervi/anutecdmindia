"use client";

import { useEffect, useState, useCallback } from "react";
import { Product } from "@/types/product";
import DashboardStats from "./_components/DashboardStats";
import CategoryAnalytics from "./_components/CategoryAnalytics";
import SearchFilterBar from "./_components/SearchFilterBar";
import ProductForm from "./_components/ProductForm";
import ProductGridView from "./_components/ProductGridView";
import ProductTableView from "./_components/ProductTableView";
import StockAlerts from "./_components/StockAlerts";
import CsvExport from "./_components/CsvExport";
import QuickActions from "./_components/QuickActions";
import { useToast } from "./_components/Toast";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface DashboardStatsData {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  hiddenCount: number;
  averagePrice: number;
}

interface CategoryAnalysis {
  name: string;
  count: number;
  totalValue: number;
  averagePrice: number;
  lowStockCount: number;
  percentage: number;
  color: string;
}

const COLORS = [
  "#6366f1", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#ec4899", "#f97316",
];

const EMPTY_FORM = {
  name: "",
  description: "",
  price: 0,
  imageUrl: "",
  qrCode: "",
  inventory: 0,
  category: "",
  hidden: false,
};

export default function AdminDashboard() {
  const { addToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [sortBy, setSortBy] = useState<"name" | "price" | "inventory" | "category">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [categoryAnalysis, setCategoryAnalysis] = useState<CategoryAnalysis[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");

  // ----- Data fetching -----
  const fetchProducts = useCallback(async (opts?: { search?: string; category?: string }) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: "1000", includeHidden: "true" });
      if (opts?.search) params.set("search", opts.search);
      if (opts?.category && opts.category !== "all") params.set("category", opts.category);
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products);
        setLastRefreshed(new Date().toLocaleTimeString());
        const cats = Array.from(
          new Set((data.products || []).map((p: Product) => (p.category || "").trim()).filter(Boolean))
        ) as string[];
        setAllCategories(cats);
      } else {
        addToast(data.error || "Failed to fetch products", "error");
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      addToast("Failed to fetch products", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    if (products.length === 0) { setStats(null); setCategoryAnalysis([]); return; }
    calculateStatsAndCategories(products);
  }, [products]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    fetchProducts({
      search: debouncedSearch || undefined,
      category: selectedCategory !== "all" ? selectedCategory : undefined,
    });
  }, [debouncedSearch, selectedCategory, fetchProducts]);

  const calculateStatsAndCategories = (prods: Product[]) => {
    const totalProducts = prods.length;
    const totalValue = prods.reduce((s, p) => s + (typeof p.price === "number" ? p.price : 0) * p.inventory, 0);
    const lowStockCount = prods.filter((p) => p.inventory > 0 && p.inventory <= 5).length;
    const outOfStockCount = prods.filter((p) => p.inventory === 0).length;
    const hiddenCount = prods.filter((p) => p.hidden).length;
    const averagePrice = totalProducts > 0 ? prods.reduce((s, p) => s + (typeof p.price === "number" ? p.price : 0), 0) / totalProducts : 0;

    setStats({ totalProducts, totalValue, lowStockCount, outOfStockCount, hiddenCount, averagePrice });

    const catMap = new Map<string, Product[]>();
    prods.forEach((p) => {
      const cat = p.category || "Uncategorized";
      if (!catMap.has(cat)) catMap.set(cat, []);
      catMap.get(cat)!.push(p);
    });
    const analysis: CategoryAnalysis[] = Array.from(catMap.entries())
      .map(([name, catProds], i) => {
        const count = catProds.length;
        const catTotalValue = catProds.reduce((s, p) => s + (typeof p.price === "number" ? p.price : 0) * p.inventory, 0);
        const catAveragePrice = count > 0 ? catProds.reduce((s, p) => s + (typeof p.price === "number" ? p.price : 0), 0) / count : 0;
        const catLowStock = catProds.filter((p) => p.inventory > 0 && p.inventory <= 5).length;
        return {
          name,
          count,
          totalValue: catTotalValue,
          averagePrice: catAveragePrice,
          lowStockCount: catLowStock,
          percentage: (count / totalProducts) * 100,
          color: COLORS[i % COLORS.length],
        };
      })
      .sort((a, b) => b.count - a.count);
    setCategoryAnalysis(analysis);
  };

  // ----- CRUD -----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editing ? "PUT" : "POST";
      const body = editing ? { ...form, id: editing.id } : form;
      const res = await fetch("/api/products", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        addToast(editing ? `"${form.name}" updated!` : `"${form.name}" added!`, "success");
        resetForm();
        fetchProducts({ search: searchQuery || undefined, category: selectedCategory !== "all" ? selectedCategory : undefined });
      } else {
        const err = await res.json();
        addToast(`Error: ${err.error}`, "error");
      }
    } catch (err) {
      console.error("Error saving product:", err);
      addToast("Failed to save product", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (field: string, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };


  const resetForm = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(false);
  };

  const handleBulkAction = async (action: "hide" | "show") => {
    if (selectedProducts.length === 0) return;
    try {
      addToast(`${action === "hide" ? "Hiding" : "Showing"} ${selectedProducts.length} products...`, "info", 2000);
      for (const productId of selectedProducts) {
        const product = products.find((p) => p.id === productId);
        if (!product) continue;
        await fetch("/api/products", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...product, hidden: action === "hide" }),
        });
      }
      setSelectedProducts([]);
      addToast(`${selectedProducts.length} products ${action === "hide" ? "hidden" : "shown"}!`, "success");
      fetchProducts({ search: searchQuery || undefined, category: selectedCategory !== "all" ? selectedCategory : undefined });
    } catch (err) {
      console.error("Bulk action failed:", err);
      addToast("Bulk action failed", "error");
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    let aVal: string | number;
    let bVal: string | number;
    switch (sortBy) {
      case "price": aVal = a.price; bVal = b.price; break;
      case "inventory": aVal = a.inventory; bVal = b.inventory; break;
      case "category": aVal = a.category || ""; bVal = b.category || ""; break;
      default: aVal = (a.name || "").toLowerCase(); bVal = (b.name || "").toLowerCase();
    }
    if (typeof aVal === "string") return sortOrder === "asc" ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
    return sortOrder === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const toggleSelection = (id: string) => {
    setSelectedProducts((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const selectAll = () => setSelectedProducts(products.map((p) => p.id));
  const clearSelection = () => setSelectedProducts([]);

  const lowStockCount = products.filter((p) => p.inventory > 0 && p.inventory <= 5).length;
  const outOfStockCount = products.filter((p) => p.inventory === 0).length;

  // Date formatting
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const hour = today.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  // ----- Loading state -----
  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="mx-auto mb-6 relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/20">
              <svg className="w-8 h-8 text-white animate-spin-slow" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-500">Loading your dashboard...</p>
          <div className="mt-4 flex gap-1.5 justify-center">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">

      {/* ═══════════ WELCOME BANNER ═══════════ */}
      <div className="welcome-banner !p-4 sm:!p-6 lg:!p-8 animate-fadeInUp">
        {/* Decorative dots - hide on mobile */}
        <div className="decorative-dots hidden sm:grid">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="decorative-dot" />
          ))}
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <p className="text-indigo-200/80 text-[10px] sm:text-xs font-semibold uppercase tracking-widest mb-1 truncate">{dateStr}</p>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
              {greeting}, <span className="text-indigo-300">Admin</span>
            </h1>
            <p className="text-indigo-200/60 text-xs sm:text-sm mt-1 sm:mt-2 max-w-md">
              Here{"'"}s what{"'"}s happening with your product catalog today.
              {stats && (
                <span className="block mt-1 text-indigo-300/80 font-medium">
                  {stats.totalProducts} products &middot; {stats.lowStockCount + stats.outOfStockCount} need attention
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => { setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-semibold backdrop-blur-sm border border-white/10 transition-all active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Product
            </button>
            <button
              onClick={() => fetchProducts()}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 text-sm font-medium backdrop-blur-sm border border-white/10 transition-all disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Quick stat pills */}
        {stats && (
          <div className="relative z-10 flex flex-wrap gap-2 mt-5">
            <span className="chip-modern bg-white/10 text-white/80 border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {stats.totalProducts} Products
            </span>
            <span className="chip-modern bg-white/10 text-white/80 border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              {stats.lowStockCount} Low Stock
            </span>
            <span className="chip-modern bg-white/10 text-white/80 border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              {stats.outOfStockCount} Out of Stock
            </span>
            {lastRefreshed && (
              <span className="chip-modern bg-white/5 text-white/50 border border-white/5 text-[10px]">
                Updated {lastRefreshed}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ═══════════ STATS ═══════════ */}
      {stats && <DashboardStats stats={stats} />}

      {/* ═══════════ PRODUCT FORM ═══════════ */}
      {showForm && (
        <div className="animate-slideDown">
          <ProductForm
            form={form}
            editing={editing}
            saving={saving}
            allCategories={allCategories}
            onSubmit={handleSubmit}
            onChange={handleFormChange}
            onCancel={resetForm}
          />
        </div>
      )}

      {/* ═══════════ BENTO GRID: QUICK ACTIONS + CSV ═══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
        <div className="bento-card">
          <QuickActions
            onAddProduct={() => { setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            onOpenSettings={() => window.location.href = "/admin/settings"}
            productCount={products.length}
          />
        </div>
        <div className="bento-card">
          <CsvExport products={products} />
        </div>
      </div>

      {/* ═══════════ STOCK ALERTS + CATEGORIES ═══════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
        {(lowStockCount > 0 || outOfStockCount > 0) && (
          <div className="xl:col-span-1">
            <div className="bento-card !p-0">
              <StockAlerts products={products} />
            </div>
          </div>
        )}
        <div className={lowStockCount > 0 || outOfStockCount > 0 ? "xl:col-span-3" : "xl:col-span-4"}>
          <CategoryAnalytics categories={categoryAnalysis} />
        </div>
      </div>

      {/* ═══════════ SEARCH + FILTER BAR ═══════════ */}
      <div className="animate-fadeInUp" style={{ animationDelay: "0.3s" }}>
        <div className="bento-card">
          <SearchFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            allCategories={allCategories}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortOrder={sortOrder}
            onSortOrderToggle={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
            totalResults={sortedProducts.length}
            isLoading={loading}
          />
          {/* View Toggle inside filter bar */}
          <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-slate-100">
            <span className="text-xs font-medium text-slate-400 mr-2">View:</span>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "grid"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              <svg className="w-3.5 h-3.5 inline mr-1 -mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Grid
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "table"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              <svg className="w-3.5 h-3.5 inline mr-1 -mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
              </svg>
              Table
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════ PRODUCTS VIEW ═══════════ */}
      <div className="animate-fadeInUp" style={{ animationDelay: "0.4s" }}>
        {viewMode === "grid" ? (
          <ProductGridView
            products={sortedProducts}
            selectedProducts={selectedProducts}
            onToggleSelect={toggleSelection}
          />
        ) : (
          <div className="bento-card !p-0 overflow-hidden">
            <ProductTableView
              products={sortedProducts}
              selectedProducts={selectedProducts}
              onToggleSelect={toggleSelection}
              onSelectAll={selectAll}
              onClearSelection={clearSelection}
            />
          </div>
        )}
      </div>

      {/* ═══════════ EMPTY STATE ═══════════ */}
      {sortedProducts.length === 0 && (
        <div className="bento-card text-center py-16 animate-fadeInUp" style={{ animationDelay: "0.4s" }}>
          <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center mb-5 shadow-sm">
            <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No products found</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">
            {searchQuery || selectedCategory !== "all"
              ? "Try adjusting your search or filters."
              : "Add your first product to get started with your catalog."}
          </p>
          <button
            onClick={() => { setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </button>
        </div>
      )}

      {/* ═══════════ BULK ACTIONS FLOATING BAR ═══════════ */}
      {selectedProducts.length > 0 && (
        <div className="fixed bottom-4 sm:bottom-6 left-2 right-2 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-20 bg-white border border-slate-200 rounded-2xl shadow-2xl px-3 sm:px-5 py-2.5 sm:py-3 flex flex-wrap items-center gap-2 sm:gap-4 animate-fadeInUp backdrop-blur-xl bg-white/95 max-w-[calc(100vw-1rem)] sm:max-w-none">
          <span className="text-xs sm:text-sm font-semibold text-slate-800 w-full sm:w-auto text-center sm:text-left">
            <span className="text-indigo-600 bg-indigo-50 px-1.5 sm:px-2 py-0.5 rounded-lg">{selectedProducts.length}</span> selected
          </span>
          <div className="hidden sm:block h-6 w-px bg-slate-200" />
          <div className="flex gap-1.5 sm:gap-2 w-full sm:w-auto justify-center sm:justify-start">
            <button
              onClick={() => handleBulkAction("hide")}
              className="px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 active:scale-95 transition-all"
            >
              Hide
            </button>
            <button
              onClick={() => handleBulkAction("show")}
              className="px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 active:scale-95 transition-all"
            >
              Show
            </button>
            <button
              onClick={clearSelection}
              className="px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-200 active:scale-95 transition-all"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* ═══════════ FOOTER ═══════════ */}
      <div className="text-center pt-4 pb-8 animate-fadeIn">
        <div className="flex items-center justify-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Public Catalog
          </Link>
          <span className="text-slate-300 text-xs">&middot;</span>
          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </Link>
        </div>
        <p className="text-[10px] text-slate-300 mt-3">eCatloge Admin Panel</p>
      </div>
    </div>
  );
}
