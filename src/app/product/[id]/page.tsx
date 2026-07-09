'use client';

import { useEffect, useState, Suspense } from 'react';
import { Product, ProductListResponse } from '@/types/product';
import { CompanyProfile, DEFAULT_COMPANY_PROFILE } from '@/types/company';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import CatalogHeader, { type CatalogHeaderConfig } from '@/components/CatalogHeader';
import { useScrollBehavior } from '@/hooks/useScrollBehavior';
import { normalizeImageUrl } from '@/lib/imageUrl';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://anutecdmindia.com//";

function ProductContent() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [company, setCompany] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { isScrolled } = useScrollBehavior();
  const router = useRouter();

  useEffect(() => {
    // Update document title dynamically based on product
    const fetchData = async () => {
      if (typeof id !== 'string') return;
      try {
        const productResponse = await fetch(`/api/products?id=${id}`);
        if (productResponse.ok) {
          const productData = await productResponse.json();
          const fetchedProduct = productData.product || productData;
          setProduct(fetchedProduct);

          if (productData.company) {
            setCompany((prev) => ({ ...prev, ...productData.company }));
          }

          // Update page title
          if (fetchedProduct?.name) {
            document.title = `${fetchedProduct.name} | Anutec  Wholesale Pipes & Fittings Supplier`;
          }

          // Update meta description
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc && fetchedProduct?.description) {
            metaDesc.setAttribute(
              "content",
              `${fetchedProduct.name} - ${fetchedProduct.description?.slice(0, 160)}. Available at Anutec  Wholesale Pipes & Fittings Supplier.`
            );
          }

          // Fetch related products (same category, excluding current)
          if (fetchedProduct.category) {
            const params = new URLSearchParams({
              category: fetchedProduct.category,
              limit: '5',
            });
            const relRes = await fetch(`/api/products?${params}`);
            if (relRes.ok) {
              const relData: ProductListResponse = await relRes.json();
              if (relData.products) {
                setRelatedProducts(
                  relData.products.filter((p) => p.id !== id).slice(0, 4)
                );
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCompany = async () => {
      try {
        const res = await fetch("/api/company");
        const data = await res.json();
        if (res.ok && data.company) {
          setCompany((prev) => ({ ...prev, ...data.company }));
        }
      } catch {
        // fallback
      }
    };

    fetchData();
    fetchCompany();
  }, [id]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      router.push(`/?search=${encodeURIComponent(value.trim())}`);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const headerConfig: CatalogHeaderConfig = {
    companyName: company.name,
    tagline: company.tagline,
    totalProducts: 0,
    searchTerm,
    isSearching,
    isScrolled,
    phone: company.phone,
    email: company.email,
  };

  const getStockInfo = (inventory: number) => {
    if (inventory === 0) return { label: 'Out of Stock', color: 'bg-red-50 text-red-700 ring-red-600/20', dot: 'bg-red-500' };
    if (inventory <= 5) return { label: 'Low Stock', color: 'bg-amber-50 text-amber-700 ring-amber-600/20', dot: 'bg-amber-500' };
    if (inventory <= 20) return { label: 'In Stock', color: 'bg-green-50 text-green-700 ring-green-600/20', dot: 'bg-green-500' };
    return { label: 'In Stock', color: 'bg-green-50 text-green-700 ring-green-600/20', dot: 'bg-green-500' };
  };

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CatalogHeader config={headerConfig} onSearchChange={handleSearchChange} onClearSearch={handleClearSearch} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="bg-gray-100 rounded-2xl aspect-square animate-pulse" />
            <div className="space-y-6">
              <div className="h-3 bg-gray-100 rounded w-24 animate-pulse" />
              <div className="h-8 bg-gray-100 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse" />
              <div className="h-24 bg-gray-100 rounded animate-pulse" />
              <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Not Found State ── */
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <CatalogHeader config={headerConfig} onSearchChange={handleSearchChange} onClearSearch={handleClearSearch} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Product not found</h2>
          <p className="text-sm text-gray-500 mb-6">The product you&rsquo;re looking for doesn&rsquo;t exist or has been removed.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to catalog
          </Link>
        </div>
      </div>
      </div>
    );
  }

  const stockInfo = getStockInfo(product.inventory);

  return (
    <div className="min-h-screen bg-gray-50">
      <CatalogHeader config={headerConfig} onSearchChange={handleSearchChange} onClearSearch={handleClearSearch} />

      {/* Breadcrumb Nav — scrollable on mobile */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center h-12 sm:h-14 gap-1 sm:gap-2 text-xs sm:text-sm overflow-x-auto scrollbar-hide whitespace-nowrap">
              <li className="shrink-0">
                <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors font-medium">
                  Home
                </Link>
              </li>
              <li className="shrink-0">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </li>
              <li className="shrink-0">
                <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors font-medium">
                  Catalog
                </Link>
              </li>
              {product.category && (
                <>
                  <li className="shrink-0">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </li>
                  <li className="shrink-0">
                    <span className="text-gray-400 font-medium">{product.category}</span>
                  </li>
                </>
              )}
              <li className="shrink-0">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </li>
              <li>
                <span className="text-gray-900 font-semibold truncate" aria-current="page">{product.name}</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-12">
          {/* ── Image ── */}
          <div className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden group">
            <div className="aspect-square relative bg-gray-50">
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full border-2 border-gray-100 border-t-indigo-400 animate-spin" />
                </div>
              )}
              <Image
                src={normalizeImageUrl(product.imageUrl)}
                alt={`${product.name} – Plumbing product at Anutec  Wholesale Pipes & Fittings Supplier`}
                fill
                className={`object-cover transition-all duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/[0.02] to-transparent pointer-events-none" />
            </div>
            <div className={`absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ring-1 shadow-sm ${stockInfo.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${stockInfo.dot}`} />
              {stockInfo.label}
            </div>
          </div>

          {/* ── Details ── */}
          <div className="flex flex-col">
            {/* Category Tag */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium w-fit mb-4">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {product.category}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>

            {/* Price & Stock */}
            <div className="flex items-baseline gap-4 mt-4">
              {company.showPrices && (
                <p className="text-3xl lg:text-4xl font-bold text-gray-900">
                  ₹{(product.price || 0).toFixed(2)}
                </p>
              )}
              <span className="text-sm text-gray-400">
                {product.inventory > 0
                  ? `${product.inventory} unit${product.inventory !== 1 ? 's' : ''} available`
                  : 'Currently unavailable'}
              </span>
            </div>

            {/* Stock bar */}
            {product.inventory > 0 && (
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 max-w-[200px] h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (product.inventory / 50) * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 font-medium">
                  {product.inventory > 20 ? 'Well stocked' : product.inventory > 5 ? 'Running low' : 'Almost gone'}
                </span>
              </div>
            )}

            <hr className="my-6 border-gray-100" />

            {/* Description */}
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Description</h2>
              <div className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {product.description}
              </div>
            </div>

            <hr className="my-6 border-gray-100" />

            {/* Product Meta */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Product ID</p>
                <p className="text-sm font-mono font-semibold text-gray-900 mt-1 truncate">{product.id}</p>
              </div>
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Category</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{product.category || 'Uncategorized'}</p>
              </div>
            </div>

            {/* QR Code */}
            {product.qrCode && (
              <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <Image src={product.qrCode} alt={`QR Code for ${product.name}`} width={64} height={64} className="rounded" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">QR Code</p>
                    <p className="text-xs text-gray-400 mt-0.5">Scan to view product details</p>
                  </div>
                </div>
              </div>
            )}

            {/* Contact CTA */}
            <div className="mt-auto pt-6 space-y-3">
              <a
                href={`tel:${company.phone.replace(/\s+/g, "")}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                aria-label={`Call Anutec  Wholesale Pipes & Fittings Supplier about ${product.name}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call for price & availability
              </a>
              <Link
                href={`/?category=${product.category || ''}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Browse more {product.category?.toLowerCase() || 'plumbing products'}
              </Link>
            </div>
          </div>
        </div>

        {/* ── Related Products ── */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 lg:mt-20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Related Plumbing Products</h2>
              <Link href="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                View all products →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {relatedProducts.map((rp) => (
                <Link
                  key={rp.id}
                  href={`/product/${rp.id}`}
                  className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300"
                >
                  <div className="relative overflow-hidden bg-gray-50">
                    <Image
                      src={normalizeImageUrl(rp.imageUrl)}
                      alt={`${rp.name} – Plumbing & sanitaryware`}
                      width={200}
                      height={200}
                      className="w-full aspect-square object-cover transition-all duration-500 group-hover:scale-105"
                      loading="lazy"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {rp.name}
                    </h3>
                    {company.showPrices && (
                      <p className="text-sm font-bold text-gray-900">₹{(rp.price || 0).toFixed(2)}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* JSON-LD structured data for this product */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description?.slice(0, 200),
            image: product.imageUrl,
            category: product.category,
            sku: product.id,
            offers: {
              "@type": "Offer",
              price: product.price || 0,
              priceCurrency: "INR",
              availability: product.inventory > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
              seller: {
                "@type": "LocalBusiness",
                name: "Anutec  Wholesale Pipes & Fittings Supplier",
                url: siteUrl,
                telephone: company.phone,
              },
            },
          }),
        }}
      />
    </div>
  );
}

export default function ProductPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-[3px] border-gray-100 border-t-indigo-500 animate-spin" />
        </div>
      }
    >
      <ProductContent />
    </Suspense>
  );
}
