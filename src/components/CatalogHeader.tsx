"use client";

import { type ChangeEvent, useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

/* ------------------------------------------------------------------ */
/* Types                                                             */
/* ------------------------------------------------------------------ */

export interface CatalogHeaderConfig {
  companyName: string;
  tagline: string;
  totalProducts: number;
  searchTerm: string;
  isSearching: boolean;
  isScrolled: boolean;
  phone: string;
  email: string;
}

interface CatalogHeaderProps {
  config: CatalogHeaderConfig;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
}

/* ------------------------------------------------------------------ */
/* Navigation data                                                   */
/* ------------------------------------------------------------------ */

interface NavItem {
  href: string;
  label: string;
  bottomNav?: boolean;
  isSale?: boolean;
}

const PRIMARY_NAV: NavItem[] = [
  { href: "/", label: "Home", bottomNav: true },
  { href: "/search", label: "All Products", bottomNav: true },
  { href: "/about", label: "About", bottomNav: true },
  { href: "/contact", label: "Contact", bottomNav: true },
  { href: "/scan", label: "Scan QR", bottomNav: true },
];

const CATEGORY_NAV: NavItem[] = [
  { href: "/search?category=taps", label: "Taps" },
  { href: "/search?category=faucets", label: "Faucets" },
  { href: "/search?category=mixers", label: "Mixers" },
  { href: "/search?category=showers", label: "Showers" },
  { href: "/search?category=accessories", label: "Accessories" },
  { href: "/search", label: "On Sale", isSale: true },
];

const SEARCH_HINTS = [
  "Search products...",
  "Try 'Taps'...",
  "Search 'faucet'...",
  "Find 'sanitaryware'...",
  "Search by name...",
];

/* ------------------------------------------------------------------ */
/* Hook: rotating search placeholder                                   */
/* ------------------------------------------------------------------ */

function useRotatingPlaceholder(interval = 4000): number {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIndex((prev) => (prev + 1) % SEARCH_HINTS.length), interval);
    return () => clearInterval(t);
  }, [interval]);
  return index;
}

/* ------------------------------------------------------------------ */
/* Main Component                                                      */
/* ------------------------------------------------------------------ */

export default function CatalogHeader({
  config,
  onSearchChange,
  onClearSearch,
}: CatalogHeaderProps) {
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef(0);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const pathname = usePathname();

  const { companyName, searchTerm, isSearching, isScrolled, phone, email } = config;
  const placeholderIndex = useRotatingPlaceholder(4000);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const input = searchInputRef.current;
      if (!input) return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        input.focus();
        return;
      }

      if (
        e.key === "/" &&
        document.activeElement !== input &&
        !["INPUT", "TEXTAREA", "SELECT"].includes((document.activeElement as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        input.focus();
        return;
      }

      if (e.key === "Escape") {
        if (document.activeElement === input) {
          e.preventDefault();
          if (searchTerm) {
            onClearSearch();
          } else {
            input.blur();
          }
        } else if (drawerOpen) {
          setDrawerOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchTerm, onClearSearch, drawerOpen]);

  /* ── Close drawer on desktop resize ── */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setDrawerOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ── Body scroll lock ── */
  useEffect(() => {
    if (drawerOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = original; };
    }
  }, [drawerOpen]);

  /* ── Swipe-to-close drawer ── */
  const handleDrawerTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleDrawerTouchMove = useCallback((e: React.TouchEvent) => {
    const deltaX = e.touches[0].clientX - touchStartX.current;
    if (deltaX > 0 && drawerRef.current) {
      drawerRef.current.style.transform = `translateX(${Math.min(deltaX, 120)}px)`;
      drawerRef.current.style.opacity = `${1 - deltaX / 300}`;
    }
  }, []);

  const handleDrawerTouchEnd = useCallback((e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (drawerRef.current) {
      drawerRef.current.style.transform = "";
      drawerRef.current.style.opacity = "";
    }
    if (deltaX > 60) setDrawerOpen(false);
  }, []);

  /* ── Active link detection ── */
  const getActiveForLink = useCallback((href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/search")) return pathname.startsWith("/search") || pathname.startsWith("/product");
    if (href === "/scan") return pathname === "/scan";
    if (href === "/about") return pathname === "/about";
    if (href === "/contact") return pathname === "/contact";
    return false;
  }, [pathname]);

  return (
    <>
      {/* ═══════════════ Main Header ═══════════════ */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 bg-white ${
          isScrolled ? "shadow-sm border-b border-gray-200" : "border-b border-gray-100"
        }`}
      >
        {/* ── Primary Bar: Logo | Search | Actions ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 sm:h-20 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0 group">
              <span className="text-xl sm:text-2xl font-black tracking-tighter text-gray-900 group-hover:text-gray-600 transition-colors">
                {companyName || "ANUTEC"}
              </span>
            </Link>

            {/* Search — hidden on mobile unless focused */}
            <div className={`flex-1 hidden sm:block ${searchFocused ? "block sm:block" : ""}`}>
              <div className="max-w-lg mx-auto">
                <div className="relative flex items-center border border-gray-200 rounded-full bg-gray-50 hover:border-gray-300 focus-within:border-gray-400 focus-within:bg-white transition-all">
                  {/* Category dropdown */}
                  <div className="relative shrink-0">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="appearance-none bg-transparent pl-4 pr-7 py-2.5 text-xs font-medium text-gray-600 border-r border-gray-200 rounded-l-full cursor-pointer hover:text-gray-900 focus:outline-none"
                    >
                      <option value="all">All Categories</option>
                      <option value="taps">Taps</option>
                      <option value="faucets">Faucets</option>
                      <option value="mixers">Mixers</option>
                      <option value="showers">Showers</option>
                      <option value="accessories">Accessories</option>
                    </select>
                    <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* Search input */}
                  <div className="flex-1 flex items-center">
                    <svg className="w-4 h-4 text-gray-400 ml-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                      placeholder={SEARCH_HINTS[placeholderIndex]}
                      className="w-full px-3 py-2.5 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                    />
                    {searchTerm && (
                      <button onClick={onClearSearch} className="mr-2 p-1 rounded-full hover:bg-gray-200 transition-colors" aria-label="Clear search">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                    {isSearching && searchTerm && (
                      <svg className="animate-spin h-4 w-4 text-gray-400 mr-2 shrink-0" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V2a10 10 0 00-9.95 9.05L4 12z" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2 ml-auto">
              {/* Store Locator */}
              <Link
                href="/contact"
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="hidden xl:inline">Find a Store</span>
              </Link>

              {/* Sign In */}
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden lg:inline">Sign In</span>
              </Link>

              {/* Cart / Enquiry */}
              <button
                className="relative flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
                aria-label="View enquiries"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <span className="hidden lg:inline">Enquiry</span>
                <span className="absolute -top-0.5 -right-0.5 lg:top-0 lg:right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">0</span>
              </button>

              {/* Mobile menu trigger */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Open menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Search (visible only on small screens) ── */}
        <div className="sm:hidden px-4 pb-3">
          <div className="relative flex items-center border border-gray-200 rounded-full bg-gray-50 focus-within:border-gray-400 focus-within:bg-white transition-all">
            <svg className="w-4 h-4 text-gray-400 ml-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder={SEARCH_HINTS[placeholderIndex]}
              className="w-full px-3 py-2.5 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
            {searchTerm && (
              <button onClick={onClearSearch} className="mr-2 p-1 rounded-full hover:bg-gray-200 transition-colors" aria-label="Clear search">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* ── Secondary Nav ── */}
        <div className="hidden lg:block border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <nav className="flex items-center gap-0 -ml-3" aria-label="Category navigation">
              {CATEGORY_NAV.map((item) => {
                const isActive = pathname.startsWith(item.href.split("?")[0]);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`relative px-3 py-3 text-xs font-semibold tracking-wide uppercase transition-colors ${
                      item.isSale
                        ? "text-red-500 hover:text-red-600"
                        : isActive
                          ? "text-gray-900"
                          : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {item.label}
                    {isActive && !item.isSale && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gray-900" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* ═══════════════ Mobile Bottom Nav ═══════════════ */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe flex items-center"
        aria-label="Main navigation"
      >
        {PRIMARY_NAV.map((item) => {
          const isActive = getActiveForLink(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-2 px-2 min-w-0 flex-1 transition-colors group ${
                isActive ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {item.href === "/" && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              )}
              {item.href === "/search" && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              )}
              {item.href === "/about" && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
              )}
              {item.href === "/contact" && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              )}
              {item.href === "/scan" && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zm0 9.75c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zm9.75-9.75c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5zm0 9.75c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z" />
                </svg>
              )}
              <span className="text-[10px] font-semibold leading-none">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setDrawerOpen(true)}
          className="relative flex flex-col items-center justify-center gap-0.5 py-2 px-2 min-w-0 flex-1 text-gray-400 hover:text-gray-600 transition-colors group"
          aria-label="More menu"
        >
          <div className="w-7 h-7 flex items-center justify-center rounded-lg group-hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </div>
          <span className="text-[10px] font-semibold leading-none">Menu</span>
        </button>
      </nav>

      {/* ═══════════════ Mobile Drawer ═══════════════ */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              ref={drawerRef}
              onTouchStart={handleDrawerTouchStart}
              onTouchMove={handleDrawerTouchMove}
              onTouchEnd={handleDrawerTouchEnd}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
              className="absolute top-0 right-0 bottom-0 w-[80vw] max-w-[340px] bg-white border-l border-gray-200 shadow-xl overflow-y-auto pb-24"
            >
              {/* Drawer Header */}
              <div className="sticky top-0 bg-white z-10 px-5 py-5 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xl font-black tracking-tighter text-gray-900">
                  {companyName || "ANUTEC"}
                </span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
                  aria-label="Close menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Quick actions */}
              <div className="px-4 pt-4 pb-3 flex gap-2">
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gray-900 text-white font-semibold text-sm active:scale-[0.97] transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  Call
                </a>
                <a
                  href={`mailto:${email}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-semibold text-sm border border-gray-200 active:scale-[0.97] transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  Email
                </a>
              </div>

              {/* Navigation */}
              <div className="px-4 py-3 space-y-1">
                <p className="px-3 pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Navigation</p>
                {[
                  { href: "/", label: "Home", icon: "M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" },
                  { href: "/search", label: "All Products", icon: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" },
                  { href: "/about", label: "About", icon: "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" },
                  { href: "/contact", label: "Contact", icon: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" },
                  { href: "/scan", label: "Scan QR", icon: "M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zm0 9.75c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zm9.75-9.75c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5zm0 9.75c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z" },
                ].map((item) => {
                  const isActive = getActiveForLink(item.href);
                  return (
                    <button
                      key={item.href}
                      onClick={() => {
                        window.location.href = item.href;
                        setDrawerOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                        isActive
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-400"
                      }`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d={item.icon} />
                        </svg>
                      </span>
                      <span className="font-semibold text-sm">{item.label}</span>
                      {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gray-900 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Category Links */}
              <div className="px-4 py-3 border-t border-gray-100">
                <p className="px-3 pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Shop by Category</p>
                <div className="space-y-0.5">
                  {CATEGORY_NAV.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        window.location.href = item.href;
                        setDrawerOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm transition-colors text-left ${
                        item.isSale ? "text-red-500 font-semibold" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.isSale ? "bg-red-400" : "bg-gray-300"}`} />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 pt-4 pb-6 mt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">Mon–Sat: 9:30 AM – 7:30 PM</p>
                <p className="text-xs text-gray-400 mt-0.5">Sunday: Closed</p>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                  <a href={`tel:${phone.replace(/\s+/g, "")}`} className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">
                    {phone}
                  </a>
                  <a href={`mailto:${email}`} className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">
                    {email}
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
