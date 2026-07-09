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

  const _handleEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      qrCode: product.qrCode,
      inventory: product.inventory,
      category: product.category || "",
      hidden: product.hidden || false,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  // ----- Loading state -----
  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="mx-auto mb-4 w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center animate-pulse">
            <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ───── TOOLBAR ───── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 animate-fadeIn">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm shrink-0 overflow-hidden">
              <img src="/logo.svg" alt="eCatloge" className="h-full w-full object-contain p-1.5 brightness-0 invert" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">Dashboard</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs font-medium text-slate-500">{products.length} products</p>
                {lastRefreshed && (
                  <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    Updated {lastRefreshed}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => fetchProducts()}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-400 transition-all disabled:opacity-50 shadow-sm"
            >
              <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? "Loading..." : "Refresh"}
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View Catalog
            </Link>
            <button
              onClick={() => { setShowForm((v) => !v); if (!showForm) window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-medium transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={showForm ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
              </svg>
              {showForm ? "Close Form" : "Add Product"}
            </button>
          </div>
        </div>
      </div>

      {/* ───── STATS ───── */}
      {stats && <DashboardStats stats={stats} />}

      {/* ───── PRODUCT FORM ───── */}
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

      {/* ───── BENTO: ACTIONS + CSV + STOCK ALERTS ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeInUpBig" style={{ animationDelay: "0.1s" }}>
        <QuickActions
          onAddProduct={() => { setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          onOpenSettings={() => window.location.href = "/admin/settings"}
          productCount={products.length}
        />
        <CsvExport products={products} />
      </div>

      {/* ───── STOCK ALERTS + CATEGORIES ───── */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 animate-fadeInUpBig" style={{ animationDelay: "0.2s" }}>
        {(lowStockCount > 0 || outOfStockCount > 0) && (
          <div className="xl:col-span-1">
            <StockAlerts products={products} />
          </div>
        )}
        <div className={(lowStockCount > 0 || outOfStockCount > 0) ? "xl:col-span-3" : "xl:col-span-4"}>
          <CategoryAnalytics categories={categoryAnalysis} />
        </div>
      </div>

      {/* ───── SEARCH + FILTERS ───── */}
      <div className="animate-fadeInUpBig" style={{ animationDelay: "0.3s" }}>
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
      </div>

      {/* ───── PRODUCTS VIEW ───── */}
      <div className="animate-fadeInUpBig" style={{ animationDelay: "0.4s" }}>
        {viewMode === "grid" ? (
          <ProductGridView
            products={sortedProducts}
            selectedProducts={selectedProducts}
            onToggleSelect={toggleSelection}
          />
        ) : (
          <ProductTableView
            products={sortedProducts}
            selectedProducts={selectedProducts}
            onToggleSelect={toggleSelection}
            onSelectAll={selectAll}
            onClearSelection={clearSelection}
          />
        )}
      </div>

      {/* ───── EMPTY STATE ───── */}
      {sortedProducts.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm animate-fadeInUpBig">
          <div className="mx-auto h-14 w-14 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">No products found</h3>
          <p className="text-sm text-slate-500 mb-6">Add your first product to get started.</p>
          <button
            onClick={() => { setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-medium transition-all shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </button>
        </div>
      )}

      {/* ───── VIEW TOGGLE ───── */}
      <div className="flex items-center justify-center gap-2 mt-4 animate-fadeIn" style={{ animationDelay: "0.5s" }}>
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden flex shadow-sm">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              viewMode === "grid"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            <svg className="w-4 h-4 inline mr-1.5 -mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Grid
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              viewMode === "table"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            <svg className="w-4 h-4 inline mr-1.5 -mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
            </svg>
            Table
          </button>
        </div>
      </div>

      {/* ───── BULK ACTIONS ───── */}
      {selectedProducts.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 bg-white border border-slate-200 rounded-xl shadow-lg px-5 py-3 flex items-center gap-4 animate-fadeInUp">
          <span className="text-sm font-semibold text-slate-800">
            <span className="text-indigo-600">{selectedProducts.length}</span> selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction("hide")}
              className="px-3 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 active:scale-95 transition-all"
            >
              Hide
            </button>
            <button
              onClick={() => handleBulkAction("show")}
              className="px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 active:scale-95 transition-all"
            >
              Show
            </button>
            <button
              onClick={clearSelection}
              className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-200 active:scale-95 transition-all"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
