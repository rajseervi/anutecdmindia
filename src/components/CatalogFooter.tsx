"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CompanyProfile, DEFAULT_COMPANY_PROFILE } from "@/types/company";
import type { Brand } from "@/app/api/brands/route";

const BADGE_COLORS: Record<string, { text: string; bg: string; ring: string }> = {
  emerald: { text: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200" },
  blue:    { text: "text-blue-700",    bg: "bg-blue-50",    ring: "ring-blue-200" },
  indigo:  { text: "text-indigo-700",  bg: "bg-indigo-50",  ring: "ring-indigo-200" },
  amber:   { text: "text-amber-700",   bg: "bg-amber-50",   ring: "ring-amber-200" },
  sky:     { text: "text-sky-700",     bg: "bg-sky-50",     ring: "ring-sky-200" },
  rose:    { text: "text-rose-700",    bg: "bg-rose-50",    ring: "ring-rose-200" },
  slate:   { text: "text-slate-600",   bg: "bg-slate-100",  ring: "ring-slate-200" },
};

const DEFAULT_BRANDS: Brand[] = [
  { name: "DIAMOND SERIES",   description: "DIAMOND Bath Fittings",   badgeColor: "emerald", sortOrder: 0 },
  { name: "ACTIVE SERIES",   description: "ACTIVE Bath Fittings",           badgeColor: "slate",   sortOrder: 1 },
  { name: "LX SERIES",   description: "LX Bath Fittings",          badgeColor: "slate",   sortOrder: 2 },
];

export default function CatalogFooter() {
  const [company, setCompany] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);
  const [brands, setBrands] = useState<Brand[]>(DEFAULT_BRANDS);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companyRes, brandsRes] = await Promise.all([
          fetch("/api/company"),
          fetch("/api/brands"),
        ]);
        if (companyRes.ok) {
          const data = await companyRes.json();
          if (data.company) setCompany((prev) => ({ ...prev, ...data.company }));
        }
        if (brandsRes.ok) {
          const data = await brandsRes.json();
          if (data.brands?.length > 0) setBrands(data.brands);
        }
      } catch {
        // fall back to defaults
      }
    };
    fetchData();
  }, []);

  return (
    <footer className="bg-white border-t border-slate-200 text-slate-500">
      {/* Top decorative border */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-amber-400" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* ── 4-Column Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* ──── Column 1: About Company ──── */}
          <div>
            <h3 className="text-slate-800 text-sm font-semibold uppercase tracking-wider mb-4">
              About Company
            </h3>
            <p className="text-sm leading-relaxed text-slate-500">
              <span className="font-semibold text-slate-700">{company.name}</span>{" "}
              {company.description ? (
                company.description
              ) : (
                <>
                  is a leading Indian manufacturer of premium bathroom taps, faucets, and accessories.
                  We combine precision CNC machining, quality brass materials, and rigorous testing
                  to produce fixtures that deliver lasting performance and elegant design for modern
                  Indian bathrooms.
                </>
              )}
            </p>
            {/* Trust badge */}
            <div className="mt-4 inline-flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              ISO 9001 Certified Manufacturer
            </div>
          </div>

          {/* ──── Column 2: Our Product Categories ──── */}
          <div>
            <h3 className="text-slate-800 text-sm font-semibold uppercase tracking-wider mb-4">
              Product Categories
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Bathroom Faucets", desc: "Basin Mixers & Pillar Taps" },
                { name: "Kitchen Taps", desc: "Sink Mixers & Pull-Outs" },
                { name: "Shower Mixers", desc: "Thermostatic & Manual" },
                { name: "Accessories", desc: "Towel Rails & More" },
              ].map((cat) => (
                <li key={cat.name}>
                  <span className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    <strong className="text-slate-700">{cat.name}</strong>
                    — {cat.desc}
                  </span>
                </li>
              ))}
            </ul>
            {/* Category badges */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {brands.length > 0 && brands.map((brand) => {
                const colors = BADGE_COLORS[brand.badgeColor] || BADGE_COLORS.slate;
                return (
                  <span
                    key={brand.name}
                    className={`text-[10px] font-bold uppercase tracking-widest ${colors.text} ${colors.bg} px-2.5 py-1 rounded ${colors.ring ? `ring-1 ${colors.ring}` : ""}`}
                  >
                    {brand.name}
                  </span>
                );
              })}
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-700 bg-blue-50 px-2.5 py-1 rounded ring-1 ring-blue-200">
                Made in India
              </span>
            </div>
          </div>

          {/* ──── Column 3: Business Information ──── */}
          <div>
            <h3 className="text-slate-800 text-sm font-semibold uppercase tracking-wider mb-4">
              Business Information
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <div>
                  <p className="text-sm text-slate-700 font-medium">In-House Manufacturing</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    CNC machining, precision casting & assembly under one roof
                  </p>
                </div>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="flex items-center gap-3 text-sm text-slate-500 hover:text-blue-600 transition-colors group"
                >
                  <svg className="w-5 h-5 text-amber-500 shrink-0 group-hover:text-amber-600 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Dealer / Bulk Inquiry</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/catalogs"
                  className="flex items-center gap-3 text-sm text-slate-500 hover:text-blue-600 transition-colors group"
                >
                  <svg className="w-5 h-5 text-amber-500 shrink-0 group-hover:text-amber-600 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download Product Catalog</span>
                </Link>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <p className="text-sm text-slate-700 font-medium">GST Details</p>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">GSTIN: XX-XXXXX-XXXXX-XX</p>
                </div>
              </li>
            </ul>
          </div>

          {/* ──── Column 4: Contact & Support ──── */}
          <div>
            <h3 className="text-slate-800 text-sm font-semibold uppercase tracking-wider mb-4">
              Contact & Support
            </h3>
            <ul className="space-y-4">
              {/* Address */}
              <li className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4.5 h-4.5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-slate-700 font-medium">Manufacturing Facility</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {company.address
                      ? company.address.split("\n").map((line, i) => (
                          <span key={i}>
                            {line.trim()}
                            {i < company.address.split("\n").length - 1 && <br />}
                          </span>
                        ))
                      : "123, Industrial Area, Main Road"}
                  </p>
                </div>
              </li>

              {/* Mobile */}
              <li className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4.5 h-4.5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-slate-700 font-medium">Phone</p>
                  <a
                    href={`tel:${company.phone.replace(/\s+/g, "")}`}
                    className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    {company.phone}
                  </a>
                </div>
              </li>

              {/* Email */}
              <li className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4.5 h-4.5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-slate-700 font-medium">Email</p>
                  <a
                    href={`mailto:${company.email}`}
                    className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    {company.email}
                  </a>
                </div>
              </li>

              {/* Business Hours */}
              <li className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4.5 h-4.5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-slate-700 font-medium">Business Hours</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Mon — Sat: 9:30 AM – 7:30 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-xs text-slate-400 text-center sm:text-left">
              &copy; {currentYear} <span className="text-slate-600 font-medium">{company.name}</span>.
              All rights reserved. | Premium Taps & Faucets — Made in India
            </p>

            {/* Footer links */}
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/sitemap"
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
