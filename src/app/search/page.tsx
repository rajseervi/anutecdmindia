"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Product, ProductListResponse } from "@/types/product";
import { CompanyProfile, DEFAULT_COMPANY_PROFILE } from "@/types/company";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from "framer-motion";
import CatalogHeader, { type CatalogHeaderConfig } from "@/components/CatalogHeader";
import CatalogFooter from "@/components/CatalogFooter";
import SearchLoader from "@/components/SearchLoader";
import { useScrollBehavior } from "@/hooks/useScrollBehavior";
import { normalizeImageUrl } from "@/lib/imageUrl";

export const dynamic = "force-dynamic";

/* ── Animations ───────────────────────────────────────────── */
const gridVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

/* ── Stock helpers ──────────────────────────────────────────── */
function getStockInfo(inventory: number) {
  if (inventory === 0) return { label: "Out of Stock", dot: "bg-red-500", bg: "bg-red-50 text-red-700 border-red-200/60", icon: "M6 18L18 6M6 6l12 12" };
  if (inventory <= 5) return { label: "Low Stock", dot: "bg-amber-500", bg: "bg-amber-50 text-amber-700 border-amber-200/60", icon: "M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" };
  if (inventory <= 20) return { label: "In Stock", dot: "bg-green-500", bg: "bg-green-50 text-green-700 border-green-200/60", icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" };
  return { label: "Well Stocked", dot: "bg-emerald-500", bg: "bg-emerald-50 text-emerald-700 border-emerald-200/60", icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" };
}

/* ── Initial Loader ─────────────────────────────────────────── */
function InitialLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6">
          <div className="relative mx-auto w-20 h-20">
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600"
              animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-500 animate-fan" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-blue-400"
              animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            />
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-lg text-slate-800">Loading Catalog</p>
            <p className="text-sm text-slate-400">Fetching latest products...</p>
          </div>

          <div className="flex items-center justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-blue-400"
                animate={{ scale: [0.4, 1, 0.4], opacity: [0.4, 1, 0.4], y: [0, -4, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 3D Tilt Card Wrapper ──────────────────────────────────── */
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 8, y: y * -8 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        perspective: "800px",
      }}
    >
      <motion.div
        animate={{
          rotateX: isHovered ? tilt.y : 0,
          rotateY: isHovered ? tilt.x : 0,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ── ScrollProgress button ─────────────────────────────────── */
function ScrollProgressButton({ onClick, show }: { onClick: () => void; show: boolean }) {
  const { scrollYProgress } = useScroll();
  const springProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const pathLength = useTransform(springProgress, [0, 1], [0, 1]);
  const displayProgress = useTransform(springProgress, (v) => Math.round(v * 100));

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          onClick={onClick}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 group"
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          aria-label="Scroll to top"
        >
          {/* Progress ring background */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="25" fill="none" stroke="#e2e8f0" strokeWidth="2.5" />
            <motion.circle
              cx="28" cy="28" r="25"
              fill="none"
              stroke="url(#scrollGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{ pathLength }}
            />
            <defs>
              <linearGradient id="scrollGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
          </svg>

          {/* Inner button */}
          <div className="absolute inset-[3px] rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center group-hover:shadow-blue-500/10 transition-shadow">
            <motion.span className="text-[9px] font-bold text-blue-600 absolute" key="progress-text">
              {displayProgress}
            </motion.span>
            <svg
              className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/* ── Main Component ───────────────────────────────────────── */
export default function SearchPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categories, setCategories] = useState<string[]>(["all"]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [company, setCompany] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const limit = 50;
  const { isScrolled } = useScrollBehavior();
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const activeCategoryRef = useRef<HTMLButtonElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  /* ── Company data ── */
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await fetch("/api/company");
        const data = await res.json();
        if (res.ok && data.company) {
          setCompany((prev) => ({ ...prev, ...data.company }));
        }
      } catch { /* fallback */ }
    };
    fetchCompany();
  }, []);

  /* ── Search debounce ── */
  useEffect(() => {
    setIsSearching(true);
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
      setIsSearching(false);
    }, 300);
    return () => { clearTimeout(t); setIsSearching(false); };
  }, [searchTerm]);

  /* ── Fetch products ── */
  useEffect(() => {
    const fetchProducts = async () => {
      if (page === 1) setLoading(true);

      try {
        const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (selectedCategory !== "all") params.set("category", selectedCategory);

        const res = await fetch(`/api/products?${params}`);
        const data: ProductListResponse = await res.json();

        if (res.ok && data.products) {
          setProducts(data.products);
          setTotalPages(data.totalPages || 1);
          setTotalProducts(data.total || 0);
          if (Array.isArray(data.categories) && data.categories.length > 0) {
            setCategories(["all", ...data.categories]);
          }
        } else {
          setProducts([]);
          setTotalPages(1);
          setTotalProducts(0);
        }
      } catch {
        setProducts([]);
        setTotalPages(1);
        setTotalProducts(0);
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    };

    fetchProducts();
  }, [page, debouncedSearch, selectedCategory]);

  /* ── Auto-scroll active category into view ── */
  useEffect(() => {
    if (activeCategoryRef.current && categoryScrollRef.current) {
      const container = categoryScrollRef.current;
      const el = activeCategoryRef.current;
      const offset = el.offsetLeft - container.offsetLeft - 16;
      container.scrollTo({ left: offset, behavior: "smooth" });
    }
  }, [selectedCategory]);

  /* ── Scroll listener ── */
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSearchChange = (value: string) => setSearchTerm(value);
  const handleClearSearch = () => setSearchTerm("");

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
    setLoading(true);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const headerConfig: CatalogHeaderConfig = {
    companyName: company.name,
    tagline: company.tagline,
    totalProducts,
    searchTerm,
    isSearching,
    isScrolled,
    phone: company.phone,
    email: company.email,
  };

  /* ── Initial Load ── */
  if (loading && isInitialLoad) {
    return <InitialLoader />;
  }

  return (
    <div ref={mainRef} className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 pb-20 lg:pb-0 relative">
      <CatalogHeader
        config={headerConfig}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
      />

      {/* ════════════════════════════════════════
          HERO BANNER
          ════════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-[0.06]">
          <svg className="w-full h-full" viewBox="0 0 1200 400" preserveAspectRatio="none">
            <defs>
              <pattern id="search-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#search-grid)" />
          </svg>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-blue-400/20"
              style={{
                left: `${15 + i * 18}%`,
                top: `${20 + (i % 3) * 30}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.4,
              }}
            />
          ))}
        </div>

        {/* Glow orbs */}
        <div className="absolute top-0 -right-20 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[100px]" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[100px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10">
            {/* Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.6, rotate: -15 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="relative shrink-0"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex items-center justify-center shadow-2xl shadow-blue-600/30 ring-4 ring-white/15">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <motion.div
                className="absolute -inset-3 rounded-2xl border border-blue-400/20"
                animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex-1"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                Product Catalog
              </h1>
              <p className="text-sm sm:text-base text-blue-200/70 mt-2 max-w-xl">
                {totalProducts > 0
                  ? `${totalProducts.toLocaleString()} premium products across ${categories.length - 1} categories — quality brass taps & fittings`
                  : "Browse our complete range of premium products"}
              </p>
            </motion.div>

            {/* Stat pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-3 shrink-0"
            >
              {totalProducts > 0 && (
                <>
                  <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 shadow-lg">
                    <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                    </svg>
                    <div>
                      <p className="text-lg font-bold text-white leading-none">{totalProducts.toLocaleString()}</p>
                      <p className="text-[10px] text-blue-200/70 font-medium">Products</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 shadow-lg">
                    <svg className="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                    </svg>
                    <div>
                      <p className="text-lg font-bold text-white leading-none">{categories.length - 1}</p>
                      <p className="text-[10px] text-amber-200/70 font-medium">Categories</p>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>

        {/* Bottom gradient transition */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent" />
      </div>

      {/* ════════════════════════════════════════
          CATEGORY FILTER
          ════════════════════════════════════════ */}
      <div className="sticky top-[60px] sm:top-[68px] md:top-[80px] lg:top-[136px] z-40 bg-white/90 backdrop-blur-2xl border-b border-slate-200/70 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div
            ref={categoryScrollRef}
            className="flex items-center gap-2 overflow-x-auto scrollbar-hide"
          >
            {categories.map((cat, idx) => {
              const isActive = selectedCategory === cat;
              const label = cat === "all" ? "All Products" : cat.charAt(0).toUpperCase() + cat.slice(1);
              return (
                <motion.button
                  key={cat}
                  ref={isActive ? activeCategoryRef : undefined}
                  onClick={() => handleCategorySelect(cat)}
                  whileTap={{ scale: 0.95 }}
                  className={`shrink-0 relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                    isActive
                      ? "text-white"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeCategory"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/20"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {idx === 0 && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                      </svg>
                    )}
                    {idx === 1 && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                      </svg>
                    )}
                    {label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          RESULTS SUMMARY
          ════════════════════════════════════════ */}
      <AnimatePresence>
        {!loading && products.length > 0 && (
          <motion.div
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm">
                <div className="flex -space-x-1.5">
                  {["bg-blue-500", "bg-indigo-500", "bg-emerald-500"].map((c, i) => (
                    <div key={i} className={`w-2.5 h-2.5 rounded-full ${c} ring-2 ring-white`} />
                  ))}
                </div>
                <span className="text-sm font-bold text-slate-900">{products.length}</span>
                <span className="text-xs text-slate-400">of</span>
                <span className="text-sm font-bold text-slate-900">{totalProducts.toLocaleString()}</span>
                <span className="text-xs text-slate-400">products</span>
              </div>

              {debouncedSearch && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold shadow-sm">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  &ldquo;{debouncedSearch}&rdquo;
                  <button onClick={handleClearSearch} className="ml-0.5 p-0.5 rounded-md hover:bg-blue-100 transition-colors">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}

              <span className="ml-auto text-xs text-slate-400 font-medium">
                Page {page} of {totalPages}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════
          PRODUCT GRID
          ════════════════════════════════════════ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        {renderProducts()}
      </main>

      {/* ════════════════════════════════════════
          FOOTER
          ════════════════════════════════════════ */}
      <CatalogFooter />

      {/* ════════════════════════════════════════
          SCROLL TO TOP (with progress ring)
          ════════════════════════════════════════ */}
      <ScrollProgressButton onClick={scrollToTop} show={showScrollTop} />
    </div>
  );

  /* ── Render Products ────────────────────────────────────── */
  function renderProducts() {
    /* ── Loading (non-initial) ── */
    if (loading && !isInitialLoad) {
      return (
        <motion.div
          key="loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <SearchLoader count={limit} />
        </motion.div>
      );
    }

    /* ── Empty State ── */
    if (!loading && products.length === 0) {
      return (
        <motion.div
          key="empty"
          className="max-w-lg mx-auto text-center py-16 sm:py-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Floating illustration */}
          <motion.div
            className="relative mx-auto w-28 h-28 mb-8"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Outer ring */}
            <motion.div
              className="absolute inset-0 rounded-[2rem] border-2 border-dashed border-slate-300/40"
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            />
            {/* Inner circle */}
            <div className="absolute inset-3 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center shadow-inner">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {/* Pulse ring */}
            <motion.div
              className="absolute -inset-4 rounded-[2.5rem] border border-slate-200/50"
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
            />
          </motion.div>

          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">No products found</h2>
          <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
            We couldn&rsquo;t find anything matching your search. Try a different keyword or browse a different category.
          </p>

          {(debouncedSearch || selectedCategory !== "all") && (
            <motion.button
              onClick={() => { setSearchTerm(""); handleCategorySelect("all"); }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-2xl shadow-xl shadow-blue-600/25 hover:shadow-blue-600/35 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset All Filters
            </motion.button>
          )}
        </motion.div>
      );
    }

    /* ── Product Grid ── */
    return (
      <motion.div
        className="space-y-10"
        key={`${debouncedSearch}-${selectedCategory}-${page}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
      >
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5"
          variants={gridVariants}
          initial="hidden"
          animate="visible"
        >
          {products.map((product) => {
            const stock = getStockInfo(product.inventory);

            return (
              <motion.div key={product.id} variants={cardVariants} layout>
                <TiltCard>
                  <Link href={`/product/${product.id}`} className="block group h-full">
                    <div className="relative h-full bg-white rounded-2xl border border-slate-200/70 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/60 hover:border-slate-300/80 transition-all duration-300">
                      {/* ── Image Section ── */}
                      <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
                        <div className="aspect-square overflow-hidden">
                          <Image
                            src={normalizeImageUrl(product.imageUrl)}
                            alt={product.name || "Product"}
                            width={300}
                            height={300}
                            className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:rotate-[1.5deg]"
                            loading="lazy"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                          />
                        </div>

                        {/* Image gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Stock badge */}
                        <div className={`absolute top-2.5 right-2.5 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm backdrop-blur-sm border ${stock.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${stock.dot}`} />
                          {stock.label}
                        </div>

                        {/* Category tag */}
                        <div className="absolute top-2.5 left-2.5 bg-white/80 backdrop-blur-md text-slate-700 text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-white/50 shadow-sm">
                          {product.category}
                        </div>

                        {/* Quick view overlay on hover */}
                        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center pb-3 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out">
                          <span className="bg-white/95 backdrop-blur-sm text-slate-800 text-[11px] font-semibold px-4 py-1.5 rounded-full shadow-xl border border-white/70">
                            Quick View
                          </span>
                        </div>
                      </div>

                      {/* ── Body ── */}
                      <div className="p-3 sm:p-4">
                        <h2 className="text-sm font-semibold text-slate-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug min-h-[2.5em]">
                          {product.name}
                        </h2>

                        {product.description && (
                          <p className="text-xs text-slate-400 mb-3 line-clamp-1">{product.description}</p>
                        )}

                        {/* Price & Stock row */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          {company.showPrices && (
                            <div className="flex items-baseline gap-0.5">
                              <span className="text-xs text-slate-400 font-medium">₹</span>
                              <span className="text-base font-bold text-slate-900 tracking-tight">
                                {(product.price || 0).toFixed(2)}
                              </span>
                            </div>
                          )}
                          {product.inventory > 0 && !company.showPrices && (
                            <span className="text-[11px] text-slate-400 font-medium">
                              {product.inventory} in stock
                            </span>
                          )}
                          {product.inventory > 0 && company.showPrices && (
                            <span className="text-[10px] text-slate-400 font-medium">
                              {product.inventory} in stock
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Hover glow ring */}
                      <div className="absolute inset-0 rounded-2xl ring-1 ring-transparent group-hover:ring-blue-400/30 transition-all duration-300 pointer-events-none" />
                    </div>
                  </Link>
                </TiltCard>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ════════════════════════════════════════
            PAGINATION
            ════════════════════════════════════════ */}
        {totalPages > 1 && (
          <motion.div
            className="flex flex-col items-center gap-6 pt-8 pb-14"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {/* Page buttons */}
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                whileTap={page > 1 ? { scale: 0.93 } : undefined}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Prev</span>
              </motion.button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  const showPage = p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1);
                  const isEllipsisLeft = p === page - 2 && page > 3;
                  const isEllipsisRight = p === page + 2 && page < totalPages - 2;
                  if (isEllipsisLeft || isEllipsisRight) {
                    return (
                      <span key={p} className="flex items-center justify-center w-9 h-9 text-slate-300 text-sm font-medium">
                        ...
                      </span>
                    );
                  }
                  if (!showPage) return null;

                  return (
                    <motion.button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      whileTap={{ scale: 0.93 }}
                      className={`relative min-w-[40px] h-10 px-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                        p === page
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm"
                      }`}
                    >
                      {p}
                    </motion.button>
                  );
                })}
              </div>

              <motion.button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                whileTap={page < totalPages ? { scale: 0.93 } : undefined}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <span className="hidden sm:inline">Next</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            </div>

            {/* Page indicator with decorative lines */}
            <div className="flex items-center gap-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
              <div className="flex items-center gap-2.5">
                <motion.div
                  className="w-2 h-2 rounded-full bg-blue-500"
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <p className="text-xs text-slate-400 font-semibold">
                  Page <span className="text-slate-700">{page}</span> of {totalPages}
                </p>
                <motion.div
                  className="w-2 h-2 rounded-full bg-indigo-500"
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                />
              </div>
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  }
}
