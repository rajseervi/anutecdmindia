"use client";

import { useState, useMemo } from "react";
import { Product } from "@/types/product";
import Link from "next/link";

interface StockAlertsProps {
  products: Product[];
}

type AlertTab = "low" | "out" | "hidden";

export default function StockAlerts({ products }: StockAlertsProps) {
  const [activeTab, setActiveTab] = useState<AlertTab>("low");

  const alertCounts = useMemo(() => ({
    low: products.filter((p) => p.inventory > 0 && p.inventory <= 5).length,
    out: products.filter((p) => p.inventory === 0).length,
    hidden: products.filter((p) => p.hidden).length,
  }), [products]);

  const filtered = useMemo(() => {
    switch (activeTab) {
      case "low":
        return products.filter((p) => p.inventory > 0 && p.inventory <= 5).sort((a, b) => a.inventory - b.inventory);
      case "out":
        return products.filter((p) => p.inventory === 0);
      case "hidden":
        return products.filter((p) => p.hidden);
    }
  }, [products, activeTab]);

  const tabs: { key: AlertTab; label: string; count: number; color: string }[] = [
    { key: "low", label: "Low Stock", count: alertCounts.low, color: "bg-amber-500" },
    { key: "out", label: "Out of Stock", count: alertCounts.out, color: "bg-red-500" },
    { key: "hidden", label: "Hidden", count: alertCounts.hidden, color: "bg-slate-500" },
  ];

  if (alertCounts.low === 0 && alertCounts.out === 0 && alertCounts.hidden === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h3 className="text-sm font-semibold text-slate-800">Stock Alerts</h3>
        </div>
        <Link href="/inventory" className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
          View All
        </Link>
      </div>

      {/* Alert tabs */}
      <div className="flex border-b border-slate-100">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors relative ${
              activeTab === tab.key ? "text-slate-800" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${tab.color}`} />
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
              activeTab === tab.key ? "bg-slate-100 text-slate-700" : "bg-slate-50 text-slate-400"
            }`}>
              {tab.count}
            </span>
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
            )}
          </button>
        ))}
      </div>

      {/* Alert items */}
      <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto scrollbar-hide">
        {filtered.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs font-medium text-slate-500">Nothing to show here</p>
          </div>
        ) : (
          filtered.slice(0, 15).map((product, index) => (
            <div key={product.id || `stock-alert-${index}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors">
              <div className="h-9 w-9 rounded-lg overflow-hidden bg-slate-50 shrink-0 border border-slate-200">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      (e.target as HTMLImageElement).parentElement!.classList.add("flex", "items-center", "justify-center");
                    }}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-slate-300">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{product.name}</p>
                <p className="text-[10px] text-slate-500">
                  {activeTab === "low" && `${product.inventory} remaining`}
                  {activeTab === "out" && "No stock available"}
                  {activeTab === "hidden" && `$${product.price.toFixed(2)} · ${product.inventory} in stock`}
                </p>
              </div>
              <div className="shrink-0">
                {activeTab === "low" && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                    product.inventory <= 2 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                  }`}>
                    {product.inventory}
                  </span>
                )}
                {activeTab === "out" && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-red-50 text-red-700">0</span>
                )}
                {activeTab === "hidden" && (
                  <span className="text-[10px] font-medium text-slate-400">Hidden</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {filtered.length > 15 && (
        <div className="px-4 py-2.5 border-t border-slate-50 text-center">
          <Link href="/inventory" className="text-xs font-medium text-indigo-600 hover:text-indigo-800">
            View all {filtered.length} items
          </Link>
        </div>
      )}
    </div>
  );
}
