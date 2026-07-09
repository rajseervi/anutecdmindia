"use client";

import Link from "next/link";
import { useState } from "react";

interface QuickAction {
  label: string;
  description: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  color: string;
  bg: string;
}

interface QuickActionsProps {
  onAddProduct: () => void;
  onOpenSettings: () => void;
  productCount?: number;
}

export default function QuickActions({ onAddProduct, onOpenSettings }: QuickActionsProps) {
  const [showAll, setShowAll] = useState(false);

  const actions: QuickAction[] = [
    {
      label: "Add Product",
      description: "Create a new product listing",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      ),
      onClick: onAddProduct,
    },
    {
      label: "Scan QR Code",
      description: "Quickly look up a product",
      color: "text-cyan-600",
      bg: "bg-cyan-50",
      href: "/scan",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      ),
    },
    {
      label: "View Inventory",
      description: "Manage stock levels",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      href: "/inventory",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      label: "Settings",
      description: "Company branding & display",
      color: "text-violet-600",
      bg: "bg-violet-50",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      onClick: onOpenSettings,
    },
    {
      label: "View Catalog",
      description: "See the public-facing site",
      color: "text-rose-600",
      bg: "bg-rose-50",
      href: "/",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      label: "QR Scanner",
      description: "Scan product QR codes",
      color: "text-amber-600",
      bg: "bg-amber-50",
      href: "/scan",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
    },
  ];

  const displayed = showAll ? actions : actions.slice(0, 3);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-indigo-50 text-indigo-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-slate-800">Quick Actions</h3>
        </div>
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          {showAll ? "Show Less" : `Show All (${actions.length})`}
        </button>
      </div>
      <div className="px-5 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {displayed.map((action, i) => {
            const content = (
              <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer h-full transition-all duration-150 group">
                <div className={`p-2.5 rounded-lg ${action.bg} ${action.color} shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{action.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{action.description}</p>
                </div>
              </div>
            );

            if (action.href) return <Link key={i} href={action.href}>{content}</Link>;
            return <button key={i} onClick={action.onClick} className="text-left">{content}</button>;
          })}
        </div>
        {!showAll && actions.length > 3 && (
          <button
            onClick={() => setShowAll(true)}
            className="w-full mt-3 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
          >
            +{actions.length - 3} more actions
          </button>
        )}
      </div>
    </div>
  );
}
