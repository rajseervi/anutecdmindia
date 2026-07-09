"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Product, ProductListResponse } from "@/types/product";
import { CompanyProfile, DEFAULT_COMPANY_PROFILE } from "@/types/company";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import CatalogHeader, { type CatalogHeaderConfig } from "@/components/CatalogHeader";
import SearchLoader from "@/components/SearchLoader";
import { useScrollBehavior } from "@/hooks/useScrollBehavior";
import { normalizeImageUrl } from "@/lib/imageUrl";

export const dynamic = "force-dynamic";

const gridVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

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

  useEffect(() => {
    setIsSearching(true);
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
      setIsSearching(false);
    }, 300);
    return () => { clearTimeout(t); setIsSearching(false); };
  }, [searchTerm]);

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
      } catch (err) {
        console.error("Fetch error:", err);
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

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 600);
    };
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

  if (loading && isInitialLoad) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto border-2 border-slate-200 rounded-full flex items-center justify-center animate-spin-slow">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="mt-4 font-medium text-sm text-slate-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 lg:pb-0">
      <CatalogHeader
        config={headerConfig}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
      />

      {/* Page header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Product Catalog</h1>
              <p className="text-sm text-slate-500">
                {totalProducts > 0 ? `${totalProducts} products available` : "Browse our range"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="bg-white border-b border-slate-200 sticky top-[60px] sm:top-[68px] md:top-[80px] lg:top-[136px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              const label = cat === "all" ? "All Products" : cat.charAt(0).toUpperCase() + cat.slice(1);
              return (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results count */}
      <AnimatePresence>
        {!loading && products.length > 0 && (
          <motion.div
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="font-semibold text-slate-900">{products.length}</span>
              <span>of</span>
              <span className="font-semibold text-slate-900">{totalProducts}</span>
              <span>products</span>
              {debouncedSearch && (
                <span className="ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                  &ldquo;{debouncedSearch}&rdquo;
                </span>
              )}
              <span className="ml-auto text-xs text-slate-400">Page {page} of {totalPages}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderProducts()}
      </main>

      {/* Scroll to top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-white border border-slate-200 rounded-xl shadow-lg flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-colors"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            aria-label="Scroll to top"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );

  function renderProducts() {
    if (loading && !isInitialLoad) {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <SearchLoader count={limit} />
        </motion.div>
      );
    }

    if (!loading && products.length === 0) {
      return (
        <motion.div
          className="max-w-sm mx-auto text-center py-20"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No products found</h2>
          <p className="text-sm text-slate-500 mb-6">Try adjusting your search or filters.</p>
          {(debouncedSearch || selectedCategory !== "all") && (
            <button
              onClick={() => { setSearchTerm(""); handleCategorySelect("all"); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset filters
            </button>
          )}
        </motion.div>
      );
    }

    return (
      <motion.div className="space-y-10">
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5"
          variants={gridVariants}
          initial="hidden"
          animate="visible"
          key={`${debouncedSearch}-${selectedCategory}-${page}`}
        >
          {products.map((product) => {
            const stockLabel =
              product.inventory === 0
                ? { text: "Out of Stock", style: "bg-red-500 text-white" }
                : product.inventory <= 5
                  ? { text: "Low Stock", style: "bg-amber-500 text-white" }
                  : null;

            return (
              <motion.div key={product.id} variants={cardVariants}>
                <Link href={`/product/${product.id}`} className="block group">
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-200">
                    {/* Image */}
                    <div className="relative bg-slate-100">
                      <div className="aspect-square overflow-hidden">
                        <Image
                          src={normalizeImageUrl(product.imageUrl)}
                          alt={product.name || "Product"}
                          width={300}
                          height={300}
                          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          loading="lazy"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        />
                      </div>

                      {stockLabel && (
                        <div className={`absolute top-2 right-2 text-[10px] font-semibold px-2.5 py-1 rounded-md ${stockLabel.style}`}>
                          {stockLabel.text}
                        </div>
                      )}

                      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-slate-600 text-[10px] font-medium px-2.5 py-1 rounded-md border border-slate-200">
                        {product.category}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-3 sm:p-4">
                      <h2 className="text-sm font-semibold text-slate-900 mb-1.5 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
                        {product.name}
                      </h2>
                      <p className="text-xs text-slate-400 mb-3 line-clamp-1">{product.description}</p>
                      <div className="flex items-center justify-between">
                        {company.showPrices && (
                          <p className="text-base font-bold text-slate-900 tracking-tight">
                            ₹{(product.price || 0).toFixed(2)}
                          </p>
                        )}
                        {product.inventory > 0 && (
                          <p className="text-[11px] text-slate-400 font-medium">
                            {product.inventory} in stock
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            className="flex flex-col items-center gap-5 pt-6 pb-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Prev
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  const showPage = p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1);
                  const showEllipsis = (p === page - 2 && page > 3) || (p === page + 2 && page < totalPages - 2);
                  if (showEllipsis) return <span key={p} className="px-2 text-slate-300 text-sm">...</span>;
                  if (!showPage) return null;
                  return (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`min-w-[38px] h-10 px-3 text-sm font-medium rounded-lg transition-colors ${
                        p === page
                          ? "bg-blue-600 text-white"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-slate-400">Page {page} of {totalPages}</p>
          </motion.div>
        )}
      </motion.div>
    );
  }
}
