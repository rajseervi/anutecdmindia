"use client";

import { useState } from "react";
import { Product } from "@/types/product";

interface CsvExportProps {
  products: Product[];
}

export default function CsvExport({ products }: CsvExportProps) {
  const [exporting, setExporting] = useState(false);

  const generateCsv = (): string => {
    const headers = ["Name", "Description", "Price", "Category", "Inventory", "Status", "Image URL", "QR Code"];
    const rows = products.map((p) => [
      `"${(p.name || "").replace(/"/g, '""')}"`,
      `"${(p.description || "").replace(/"/g, '""')}"`,
      p.price,
      `"${(p.category || "").replace(/"/g, '""')}"`,
      p.inventory,
      p.inventory === 0 ? "Out of Stock" : p.inventory <= 5 ? "Low Stock" : p.hidden ? "Hidden" : "Active",
      `"${p.imageUrl || ""}"`,
      `"${p.qrCode || ""}"`,
    ]);

    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  };

  const downloadCsv = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAll = () => {
    setExporting(true);
    try {
      const csv = generateCsv();
      const timestamp = new Date().toISOString().slice(0, 10);
      downloadCsv(csv, `products-export-${timestamp}.csv`);
    } finally {
      setExporting(false);
    }
  };

  const handleExportFiltered = () => {
    setExporting(true);
    try {
      const active = products.filter((p) => !p.hidden && p.inventory > 0);
      const csv = [
        ["Name", "Description", "Price", "Category", "Inventory", "Status", "Image URL", "QR Code"],
        ...active.map((p) => [
          `"${(p.name || "").replace(/"/g, '""')}"`,
          `"${(p.description || "").replace(/"/g, '""')}"`,
          p.price,
          `"${(p.category || "").replace(/"/g, '""')}"`,
          p.inventory,
          "Active",
          `"${p.imageUrl || ""}"`,
          `"${p.qrCode || ""}"`,
        ]),
      ]
        .map((r) => r.join(","))
        .join("\n");
      downloadCsv(csv, `products-active-${new Date().toISOString().slice(0, 10)}.csv`);
    } finally {
      setExporting(false);
    }
  };

  const handleExportLowStock = () => {
    setExporting(true);
    try {
      const lowStock = products.filter((p) => p.inventory > 0 && p.inventory <= 5).sort((a, b) => a.inventory - b.inventory);
      const csv = [
        ["Name", "Description", "Price", "Category", "Inventory", "Image URL", "QR Code"],
        ...lowStock.map((p) => [
          `"${(p.name || "").replace(/"/g, '""')}"`,
          `"${(p.description || "").replace(/"/g, '""')}"`,
          p.price,
          `"${(p.category || "").replace(/"/g, '""')}"`,
          p.inventory,
          `"${p.imageUrl || ""}"`,
          `"${p.qrCode || ""}"`,
        ]),
      ]
        .map((r) => r.join(","))
        .join("\n");
      downloadCsv(csv, `products-low-stock-${new Date().toISOString().slice(0, 10)}.csv`);
    } finally {
      setExporting(false);
    }
  };

  const totalActive = products.filter((p) => !p.hidden && p.inventory > 0).length;
  const totalLowStock = products.filter((p) => p.inventory > 0 && p.inventory <= 5).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-sm font-semibold text-slate-800">CSV Export</h3>
      </div>
      <div className="px-5 py-4 space-y-2">
        <button
          onClick={handleExportAll}
          disabled={exporting || products.length === 0}
          className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-800">Export All Products</p>
              <p className="text-xs text-slate-500">{products.length} products</p>
            </div>
          </div>
          <span className="text-xs font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
            Download
          </span>
        </button>

        <button
          onClick={handleExportFiltered}
          disabled={exporting || totalActive === 0}
          className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-800">Export Active Products Only</p>
              <p className="text-xs text-slate-500">{totalActive} visible products</p>
            </div>
          </div>
          <span className="text-xs font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
            Download
          </span>
        </button>

        <button
          onClick={handleExportLowStock}
          disabled={exporting || totalLowStock === 0}
          className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-800">Export Low Stock Report</p>
              <p className="text-xs text-slate-500">{totalLowStock} items need attention</p>
            </div>
          </div>
          <span className="text-xs font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
            Download
          </span>
        </button>

        {exporting && (
          <div className="flex items-center justify-center gap-2 py-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600" />
            <span className="text-sm text-slate-500">Generating CSV...</span>
          </div>
        )}
      </div>
    </div>
  );
}
