"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CompanyProfile, DEFAULT_COMPANY_PROFILE } from "@/types/company";
import CatalogHeader, { type CatalogHeaderConfig } from "@/components/CatalogHeader";
import { useScrollBehavior } from "@/hooks/useScrollBehavior";

const SITEMAP_SECTIONS = [
  {
    title: "Main Pages",
    icon: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5",
    links: [
      { href: "/", label: "Home", description: "Welcome to Anutec Taps — premium faucets & taps manufacturer in India" },
      { href: "/about", label: "About Us", description: "Our story, mission, values, and manufacturing excellence since 2010" },
      { href: "/contact", label: "Contact Us", description: "Get in touch with our team for inquiries, orders, or support" },
    ],
  },
  {
    title: "Products & Services",
    icon: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z",
    links: [
      { href: "/search", label: "All Products", description: "Browse our complete catalog of taps, faucets, mixers & accessories" },
      { href: "/search?category=taps", label: "Taps", description: "Premium taps for kitchen and bathroom" },
      { href: "/search?category=faucets", label: "Faucets", description: "Bathroom basin and wall-mounted faucets" },
      { href: "/search?category=mixers", label: "Mixers", description: "Shower mixers and kitchen sink mixers" },
      { href: "/search?category=showers", label: "Showers", description: "Overhead showers and hand showers" },
      { href: "/search?category=accessories", label: "Accessories", description: "Towel rails, soap dispensers & bathroom accessories" },
    ],
  },
  {
    title: "Tools & Features",
    icon: "M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75",
    links: [
      { href: "/scan", label: "Scan QR Code", description: "Scan product QR codes for details and verification" },
      { href: "/inventory", label: "Inventory Lookup", description: "Check stock availability and product information" },
      { href: "/demo", label: "Product Demo", description: "Interactive demonstration of our product catalog" },
    ],
  },
  {
    title: "Account & Admin",
    icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
    links: [
      { href: "/login", label: "Sign In / Login", description: "Login to your dealer or admin account" },
      { href: "/admin", label: "Admin Dashboard", description: "Admin panel for product and content management" },
    ],
  },
  {
    title: "Legal & Info",
    icon: "M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z",
    links: [
      { href: "/terms", label: "Terms of Service", description: "Terms & conditions for using our website and services" },
      { href: "/privacy", label: "Privacy Policy", description: "How we collect, use, and protect your personal data" },
      { href: "/sitemap", label: "Sitemap", description: "Complete site structure and page listing (you are here)" },
    ],
  },
];

const ALL_LINKS = SITEMAP_SECTIONS.flatMap((s) => s.links);

export default function SitemapPage() {
  const [company, setCompany] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);
  const { isScrolled } = useScrollBehavior();

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await fetch("/api/company");
        const data = await res.json();
        if (res.ok && data.company) {
          setCompany((prev) => ({ ...prev, ...data.company }));
        }
      } catch {
        // fallback to defaults
      }
    };
    fetchCompany();
  }, []);

  const headerConfig: CatalogHeaderConfig = {
    companyName: company.name,
    tagline: company.tagline,
    totalProducts: 0,
    searchTerm: "",
    isSearching: false,
    isScrolled,
    phone: company.phone,
    email: company.email,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CatalogHeader
        config={headerConfig}
        onSearchChange={() => {}}
        onClearSearch={() => {}}
      />

      {/* Page Header */}
      <section className="relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/30 via-slate-900 to-orange-900/30" />
        <div className="absolute top-20 left-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 text-amber-300 text-xs font-semibold tracking-wide mb-4 backdrop-blur-sm">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              Site Navigation
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
              Sitemap
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
              A complete overview of all pages available on our website. Use this to quickly find
              what you are looking for.
            </p>
          </div>
        </div>
      </section>

      {/* Sitemap Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Quick Jump — All Links Bar */}
        <div className="mb-10 bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">
            Quick Jump
          </h2>
          <div className="flex flex-wrap gap-2">
            {ALL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-700 transition-colors text-xs font-semibold"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {SITEMAP_SECTIONS.map((section) => (
            <div
              key={section.title}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg hover:shadow-gray-200/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              {/* Section Header */}
              <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d={section.icon} />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-white">{section.title}</h2>
              </div>

              {/* Links */}
              <div className="p-5 sm:p-6 space-y-1">
                {section.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block p-3 rounded-xl transition-all duration-200 group ${
                      link.href === "/sitemap"
                        ? "bg-amber-50 border border-amber-200"
                        : "hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        link.href === "/sitemap"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600"
                      } transition-colors`}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </span>
                      <div className="min-w-0">
                        <p className={`text-sm font-bold ${
                          link.href === "/sitemap" ? "text-amber-800" : "text-gray-800 group-hover:text-blue-600"
                        } transition-colors truncate`}>
                          {link.label}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                          {link.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Statistics Card */}
        <div className="mt-10 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">{ALL_LINKS.length}</p>
              <p className="text-xs text-slate-400 font-semibold mt-1 uppercase tracking-wider">Total Pages</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">{SITEMAP_SECTIONS.length}</p>
              <p className="text-xs text-slate-400 font-semibold mt-1 uppercase tracking-wider">Categories</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">5</p>
              <p className="text-xs text-slate-400 font-semibold mt-1 uppercase tracking-wider">Product Categories</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">2</p>
              <p className="text-xs text-slate-400 font-semibold mt-1 uppercase tracking-wider">Legal Pages</p>
            </div>
          </div>
        </div>

        {/* XML Sitemap Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            Looking for the machine-readable sitemap?{" "}
            <a
              href="/sitemap.xml"
              className="text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-2 transition-colors"
            >
              View XML Sitemap
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
