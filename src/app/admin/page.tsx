"use client";

import { useEffect, useState, useCallback } from "react";
import { Product } from "@/types/product";
import DashboardStats from "./_components/DashboardStats";
import CategoryAnalytics from "./_components/CategoryAnalytics";
import StockAlerts from "./_components/StockAlerts";
import CsvExport from "./_components/CsvExport";
import QuickActions from "./_components/QuickActions";
import { useToast } from "./_components/Toast";
import Link from "next/link";

export const dynamic = "force-dynamic";

const COLORS = [
  "#6366f1", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#ec4899", "#f97316",
];

interface CategoryAnalysis {
  name: string;
  count: number;
  totalValue: number;
  averagePrice: number;
  lowStockCount: number;
  percentage: number;
  color: string;
}

interface DashboardStatsData {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  hiddenCount: number;
  averagePrice: number;
}

// ─── Skeleton block ───
function SkeletonBlock({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-slate-200/70 ${className || ""}`}
      style={style}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </div>
  );
}

// ─── Skeleton card ───
function SkeletonCard({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 p-5 ${className || ""}`}>
      {children}
    </div>
  );
}

// ─── Full-page skeleton loader ───
function DashboardSkeleton() {
  return (
    <div className="space-y-5 max-w-7xl mx-auto animate-fadeIn">
      {/* Welcome banner skeleton */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/20 via-indigo-400/10 to-slate-100 p-6 sm:p-8 border border-indigo-100/50">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-3 flex-1">
            <SkeletonBlock className="h-3 w-48" />
            <SkeletonBlock className="h-8 w-72 sm:h-9" />
            <SkeletonBlock className="h-4 w-56" />
          </div>
          <div className="flex gap-2">
            <SkeletonBlock className="h-10 w-36 rounded-xl" />
            <SkeletonBlock className="h-10 w-24 rounded-xl" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-5">
          <SkeletonBlock className="h-7 w-28 rounded-full" />
          <SkeletonBlock className="h-7 w-24 rounded-full" />
          <SkeletonBlock className="h-7 w-28 rounded-full" />
        </div>
        {/* Decorative dots */}
        <div className="absolute top-4 right-6 hidden sm:grid grid-cols-4 gap-2 opacity-20">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-white" />
          ))}
        </div>
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <SkeletonBlock className="h-10 w-10 rounded-xl" />
              <SkeletonBlock className="h-5 w-16 rounded-full" />
            </div>
            <SkeletonBlock className="h-7 w-20 mb-1" />
            <SkeletonBlock className="h-3 w-24 mb-3" />
            <div className="flex items-end gap-1 h-6">
              {Array.from({ length: 8 }).map((_, j) => (
                <SkeletonBlock key={j} className="flex-1 rounded-t" style={{ height: `${30 + Math.random() * 70}%` }} />
              ))}
            </div>
          </SkeletonCard>
        ))}
      </div>

      {/* Quick actions + CSV skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SkeletonCard>
          <div className="flex items-center gap-2 mb-4">
            <SkeletonBlock className="h-7 w-7 rounded-lg" />
            <SkeletonBlock className="h-5 w-28" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100">
                <SkeletonBlock className="h-9 w-9 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <SkeletonBlock className="h-4 w-20" />
                  <SkeletonBlock className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </SkeletonCard>
        <SkeletonCard>
          <div className="flex items-center gap-2 mb-4">
            <SkeletonBlock className="h-7 w-7 rounded-lg" />
            <SkeletonBlock className="h-5 w-24" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-100">
                <div className="flex items-center gap-3">
                  <SkeletonBlock className="h-8 w-8 rounded-lg" />
                  <div className="space-y-1">
                    <SkeletonBlock className="h-4 w-32" />
                    <SkeletonBlock className="h-3 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SkeletonCard>
      </div>

      {/* Bottom line */}
      <div className="flex items-center justify-center gap-4 pt-4 pb-8">
        <SkeletonBlock className="h-4 w-28" />
        <SkeletonBlock className="h-3 w-1" />
        <SkeletonBlock className="h-4 w-28" />
      </div>
    </div>
  );
}

// ─── Page ───
export default function AdminDashboard() {
  const { addToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [categoryAnalysis, setCategoryAnalysis] = useState<CategoryAnalysis[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products?limit=1000&includeHidden=true");
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products);
        setLastRefreshed(new Date().toLocaleTimeString());
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

  useEffect(() => {
    if (products.length === 0) { setStats(null); setCategoryAnalysis([]); return; }

    const totalProducts = products.length;
    const totalValue = products.reduce((s, p) => s + (p.price || 0) * p.inventory, 0);
    const lowStockCount = products.filter((p) => p.inventory > 0 && p.inventory <= 5).length;
    const outOfStockCount = products.filter((p) => p.inventory === 0).length;
    const hiddenCount = products.filter((p) => p.hidden).length;
    const averagePrice = totalProducts > 0 ? products.reduce((s, p) => s + (p.price || 0), 0) / totalProducts : 0;

    setStats({ totalProducts, totalValue, lowStockCount, outOfStockCount, hiddenCount, averagePrice });

    const catMap = new Map<string, Product[]>();
    products.forEach((p) => {
      const cat = p.category || "Uncategorized";
      if (!catMap.has(cat)) catMap.set(cat, []);
      catMap.get(cat)!.push(p);
    });
    const analysis: CategoryAnalysis[] = Array.from(catMap.entries())
      .map(([name, catProds], i) => {
        const count = catProds.length;
        const catTotalValue = catProds.reduce((s, p) => s + (p.price || 0) * p.inventory, 0);
        const catAveragePrice = count > 0 ? catProds.reduce((s, p) => s + (p.price || 0), 0) / count : 0;
        const catLowStock = catProds.filter((p) => p.inventory > 0 && p.inventory <= 5).length;
        return {
          name, count, totalValue: catTotalValue, averagePrice: catAveragePrice,
          lowStockCount: catLowStock, percentage: (count / totalProducts) * 100,
          color: COLORS[i % COLORS.length],
        };
      })
      .sort((a, b) => b.count - a.count);
    setCategoryAnalysis(analysis);
  }, [products]);

  const lowStockCount = products.filter((p) => p.inventory > 0 && p.inventory <= 5).length;
  const outOfStockCount = products.filter((p) => p.inventory === 0).length;

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const hour = today.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  if (loading && products.length === 0) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">

      {/* ═══════ WELCOME BANNER ═══════ */}
      <div className="welcome-banner !p-4 sm:!p-6 lg:!p-8 animate-fadeInUp">
        <div className="decorative-dots hidden sm:grid">
          {Array.from({ length: 16 }).map((_, i) => <div key={i} className="decorative-dot" />)}
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <p className="text-indigo-200/80 text-[10px] sm:text-xs font-semibold uppercase tracking-widest mb-1 truncate">{dateStr}</p>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
              {greeting}, <span className="text-indigo-300">Admin</span>
            </h1>
            <p className="text-indigo-200/60 text-xs sm:text-sm mt-1 sm:mt-2 max-w-md">
              Here&rsquo;s what&rsquo;s happening with your product catalog today.
              {stats && (
                <span className="block mt-1 text-indigo-300/80 font-medium">
                  {stats.totalProducts} products &middot; {stats.lowStockCount + stats.outOfStockCount} need attention
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-semibold backdrop-blur-sm border border-white/10 transition-all active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Manage Products
            </Link>
            <button
              onClick={fetchProducts}
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

        {stats && (
          <div className="relative z-10 flex flex-wrap gap-2 mt-5 animate-fadeInUp">
            <span className="chip-modern bg-white/10 text-white/80 border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {stats.totalProducts} Products
            </span>
            <span className="chip-modern bg-white/10 text-white/80 border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> {stats.lowStockCount} Low Stock
            </span>
            <span className="chip-modern bg-white/10 text-white/80 border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> {stats.outOfStockCount} Out of Stock
            </span>
            {lastRefreshed && (
              <span className="chip-modern bg-white/5 text-white/50 border border-white/5 text-[10px]">
                Updated {lastRefreshed}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ═══════ STATS GRID ═══════ */}
      {stats && (
        <div className="animate-fadeInUp" style={{ animationDelay: "0.05s" }}>
          <DashboardStats stats={stats} />
        </div>
      )}

      {/* ═══════ QUICK ACTIONS + CSV EXPORT ═══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
        <div className="bento-card !p-0">
          <QuickActions
            onAddProduct={() => window.location.href = "/admin/products"}
            onOpenSettings={() => window.location.href = "/admin/settings"}
            productCount={products.length}
          />
        </div>
        <div className="bento-card !p-0">
          <CsvExport products={products} />
        </div>
      </div>

      {/* ═══════ STOCK ALERTS + CATEGORY ANALYTICS ═══════ */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 animate-fadeInUp" style={{ animationDelay: "0.15s" }}>
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

      {/* ═══════ BOTTOM NAV ═══════ */}
      <div className="text-center pt-4 pb-8 animate-fadeIn" style={{ animationDelay: "0.2s" }}>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-indigo-600 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Public Catalog
          </Link>
          <span className="text-slate-300 text-xs">&middot;</span>
          <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-indigo-600 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Product Management
          </Link>
          <span className="text-slate-300 text-xs">&middot;</span>
          <Link href="/admin/settings" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-indigo-600 transition-colors">
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
