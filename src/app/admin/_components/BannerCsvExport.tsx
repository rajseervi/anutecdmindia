"use client";

import { useState } from "react";
import { Banner } from "@/types/banner";

interface BannerCsvExportProps {
  banners: Banner[];
}

export default function BannerCsvExport({ banners }: BannerCsvExportProps) {
  const [exporting, setExporting] = useState(false);

  const generateCsv = (filterFn?: (b: Banner) => boolean): string => {
    const headers = ["ID", "Title", "Subtitle", "Description", "Image URL", "CTA Text", "CTA Link", "Active", "Sort Order"];
    const filtered = filterFn ? banners.filter(filterFn) : banners;
    const sorted = [...filtered].sort((a, b) => a.sortOrder - b.sortOrder);

    const rows = sorted.map((b) => [
      b.id,
      `"${(b.title || "").replace(/"/g, '""')}"`,
      `"${(b.subtitle || "").replace(/"/g, '""')}"`,
      `"${(b.description || "").replace(/"/g, '""')}"`,
      `"${(b.imageUrl || "").replace(/"/g, '""')}"`,
      `"${(b.ctaText || "").replace(/"/g, '""')}"`,
      `"${(b.ctaLink || "").replace(/"/g, '""')}"`,
      b.isActive ? "Yes" : "No",
      b.sortOrder,
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
      downloadCsv(csv, `banners-export-${timestamp}.csv`);
    } finally {
      setExporting(false);
    }
  };

  const handleExportActive = () => {
    setExporting(true);
    try {
      const csv = generateCsv((b) => b.isActive);
      const timestamp = new Date().toISOString().slice(0, 10);
      downloadCsv(csv, `banners-active-${timestamp}.csv`);
    } finally {
      setExporting(false);
    }
  };

  const activeCount = banners.filter((b) => b.isActive).length;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden mb-6">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-base font-bold text-gray-900">CSV Export</h3>
      </div>
      <div className="px-5 py-4 space-y-3">
        <button
          onClick={handleExportAll}
          disabled={exporting || banners.length === 0}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-white transition-colors">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">Export All Banners</p>
              <p className="text-xs text-gray-500">{banners.length} banners</p>
            </div>
          </div>
          <span className="text-xs font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
            Download
          </span>
        </button>

        <button
          onClick={handleExportActive}
          disabled={exporting || activeCount === 0}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 group-hover:bg-white transition-colors">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">Export Active Banners Only</p>
              <p className="text-xs text-gray-500">{activeCount} visible banners</p>
            </div>
          </div>
          <span className="text-xs font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
            Download
          </span>
        </button>

        {exporting && (
          <div className="flex items-center justify-center gap-2 py-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600" />
            <span className="text-sm text-gray-500">Generating CSV...</span>
          </div>
        )}
      </div>
    </div>
  );
}
