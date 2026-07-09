'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Product, ProductListResponse } from '@/types/product';
import { Banner } from '@/types/banner';
import { CompanyProfile, DEFAULT_COMPANY_PROFILE } from '@/types/company';
import Image from 'next/image';
import Link from 'next/link';
import CatalogHeader, { type CatalogHeaderConfig } from '@/components/CatalogHeader';
import SearchLoader from '@/components/SearchLoader';
import CatalogLoader from '@/components/CatalogLoader';
import CatalogHero from '@/components/CatalogHero';
import HeroSlider from '@/components/HeroSlider';
import { useScrollBehavior } from '@/hooks/useScrollBehavior';
import { normalizeImageUrl } from '@/lib/imageUrl';

export const dynamic = 'force-dynamic';

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categories, setCategories] = useState<string[]>(['all']);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSearching, setIsSearching] = useState(false);
  const [company, setCompany] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannersLoaded, setBannersLoaded] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const productsRef = useRef<HTMLDivElement>(null);
  const hasInitiallyScrolled = useRef(false);

  const limit = 50;

  const { isScrolled } = useScrollBehavior();

  /* ── fetch company profile ── */
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

  /* ── fetch banners ───────── */
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch("/api/banners");
        const data = await res.json();
        if (res.ok && Array.isArray(data.banners)) {
          setBanners(data.banners);
        }
      } catch {
        // no banners — fallback to static hero
      } finally {
        setBannersLoaded(true);
      }
    };
    fetchBanners();
  }, []);

  /* ── debounce search ─────── */
  useEffect(() => {
    setIsSearching(true);
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
      setIsSearching(false);
    }, 300);
    return () => { clearTimeout(t); setIsSearching(false); };
  }, [searchTerm]);

  /* ── scroll to products when search/category changes ── */
  useEffect(() => {
    if (!hasInitiallyScrolled.current) {
      hasInitiallyScrolled.current = true;
      return;
    }
    if (productsRef.current) {
      productsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [debouncedSearch, selectedCategory]);

  /* ── fetch products ──────── */
  useEffect(() => {
    const fetchProducts = async () => {
      if (page === 1) setLoading(true);

      try {
        const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (selectedCategory !== 'all') params.set('category', selectedCategory);

        const res = await fetch(`/api/products?${params}`);
        const data: ProductListResponse = await res.json();

        if (res.ok && data.products) {
          setProducts(data.products);
          setTotalPages(data.totalPages || 1);
          setTotalProducts(data.total || 0);
          if (Array.isArray(data.categories) && data.categories.length > 0) {
            setCategories(['all', ...data.categories]);
          }
        } else {
          setProducts([]);
          setTotalPages(1);
          setTotalProducts(0);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setProducts([]);
        setTotalPages(1);
        setTotalProducts(0);
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    };

    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, selectedCategory]);

  /* ── Scroll-to-top visibility ── */
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ── Scroll Reveal Observer ── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [products, loading]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSearchChange = (value: string) => setSearchTerm(value);
  const handleClearSearch = () => setSearchTerm('');

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
    setLoading(true);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  /* ── loading screen ──────── */
  if (loading && isInitialLoad) {
    return <CatalogLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CatalogHeader
        config={headerConfig}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
      />

      {/* Hero Section — full viewport height with parallax */}
      {bannersLoaded && banners.length > 0 ? (
        <HeroSlider banners={banners} companyName={company.name} phone={company.phone} />
      ) : (
        <CatalogHero companyName={company.name} phone={company.phone} />
      )}

      {/* Products section anchor */}
      <div id="products" ref={productsRef}>
        {/* Category Filter - Glass sticky bar */}
        <div className="sticky top-[44px] sm:top-[52px] md:top-[72px] lg:top-[124px] z-40 glass border-b border-white/20 shadow-sm">
          <div className="px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="hidden sm:flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Categories
              </span>
              {/* Scroll container with gradient fade */}
              <div className="relative flex-1 min-w-0">
                <div className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide pr-2 py-1">
                  {categories.map((cat) => {
                    const isActive = selectedCategory === cat;
                    const label = cat === 'all' ? 'All Products' : cat.charAt(0).toUpperCase() + cat.slice(1);
                    return (
                      <button
                        key={cat}
                        onClick={() => handleCategorySelect(cat)}
                        className={`relative px-3 sm:px-4 py-2 text-[13px] sm:text-sm font-semibold rounded-xl whitespace-nowrap transition-all duration-300 flex-shrink-0 ${
                          isActive
                            ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-200/60'
                            : 'bg-white/80 text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-md border border-gray-200/60'
                        }`}
                      >
                        {label}
                        {isActive && (
                          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 sm:w-5 h-1 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {/* Right-edge fade indicator for overflow */}
                <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-10 bg-gradient-to-l from-white/60 to-transparent pointer-events-none rounded-r-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        {!loading && products.length > 0 && (
          <div className="px-4 sm:px-6 lg:px-8 py-3 bg-white border-b border-gray-100">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-sm text-gray-500">
                Showing <span className="font-bold text-gray-900">{products.length}</span> of{' '}
                <span className="font-bold text-gray-900">{totalProducts}</span> products
                {debouncedSearch && (
                  <span className="ml-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
                    &ldquo;{debouncedSearch}&rdquo;
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-400 font-medium">
                Page {page} of {totalPages}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {renderProducts()}
      </main>

      {/* ── Scroll-to-Top FAB (raised for bottom nav on mobile) ── */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-16 sm:bottom-20 lg:bottom-6 right-6 z-50 w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-xl shadow-indigo-300/40 hover:shadow-indigo-400/60 hover:scale-110 active:scale-95 flex items-center justify-center transition-all duration-300 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </div>
  );

  /* ================================================================ */
  /*  RENDER PRODUCTS                                                 */
  /* ================================================================ */
  function renderProducts() {
    // Loading skeleton
    if (loading && !isInitialLoad) {
      return <SearchLoader count={limit} />;
    }

    // Empty state
    if (!loading && products.length === 0) {
      return (
        <div className="max-w-sm mx-auto text-center py-20">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-inner">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No products found</h2>
          <p className="text-sm text-gray-500 mb-6">Try adjusting your search or filters.</p>
          {(debouncedSearch || selectedCategory !== 'all') && (
            <button
              onClick={() => { setSearchTerm(''); handleCategorySelect('all'); }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all hover:scale-[1.02] active:scale-[0.97]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset filters
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
          {products.map((product, index) => {
            const stockLabel =
              product.inventory === 0
                ? { text: 'Out of Stock', bg: 'bg-red-500' }
                : product.inventory <= 5
                  ? { text: 'Low Stock', bg: 'bg-amber-500' }
                  : null;

            return (
              <div
                key={product.id}
                className="scroll-reveal group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-gray-200/60 hover:border-indigo-100 transition-all duration-500 hover:-translate-y-1.5"
                style={{ transitionDelay: `${(index % 12) * 0.04}s` }}
              >
                <Link href={`/product/${product.id}`} className="block">
                  {/* Image container */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="aspect-square overflow-hidden">
                      <Image
                        src={normalizeImageUrl(product.imageUrl)}
                        alt={product.name || "Product"}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        loading="lazy"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                    </div>

                    {/* Image overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    {/* Stock badge */}
                    {stockLabel && (
                      <div className={`absolute top-3 right-3 ${stockLabel.bg} text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-md backdrop-blur-sm`}>
                        {stockLabel.text}
                      </div>
                    )}

                    {/* Category label */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-gray-700 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg shadow-sm border border-white/50">
                      {product.category}
                    </div>

                    {/* Quick view indicator */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-gray-800 text-xs font-semibold shadow-lg">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Details
                      </span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-3 sm:p-4">
                    <h2 className="text-sm font-bold text-gray-900 mb-1.5 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-snug">
                      {product.name}
                    </h2>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-1">{product.description}</p>
                    <div className="flex items-center justify-between">
                      {company.showPrices && (
                        <p className="text-base font-extrabold text-gray-900 tracking-tight">
                          ₹{(product.price || 0).toFixed(2)}
                        </p>
                      )}
                      {product.inventory > 0 && (
                        <p className="text-[11px] text-gray-400 font-medium">
                          {product.inventory} left
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center gap-5 pt-6 pb-10">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Prev
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  const showPage = p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1);
                  const showEllipsis = (p === page - 2 && page > 3) || (p === page + 2 && page < totalPages - 2);
                  if (showEllipsis) return <span key={p} className="px-2 text-gray-300 text-sm font-medium">...</span>;
                  if (!showPage) return null;
                  return (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`min-w-[40px] h-10 px-3 text-sm font-bold rounded-xl transition-all ${
                        p === page
                          ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-200'
                          : 'text-gray-600 hover:bg-gray-100'
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
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-400 font-medium">
              Page {page} of {totalPages}
            </p>
          </div>
        )}
      </div>
    );
  }
}
