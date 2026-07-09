"use client";

import { type ChangeEvent, useRef, useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  icon: string;
  /** If true, show in bottom nav bar on mobile */
  bottomNav?: boolean;
  /** If provided, renders as a dropdown on desktop, expandable in drawer */
  children?: { href: string; label: string; description?: string }[];
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Home",
    icon: "M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25",
    bottomNav: true,
  },
  {
    href: "/#products",
    label: "Products",
    icon: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z",
    bottomNav: true,
    children: [
      { href: "/#products", label: "All Products", description: "Browse our full catalog" },
      { href: "/scan", label: "Scan & Search", description: "Find products by QR code" },
    ],
  },
  {
    href: "/about",
    label: "About",
    icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    bottomNav: true,
  },
  {
    href: "/contact",
    label: "Contact",
    icon: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155",
    bottomNav: true,
  },
  {
    href: "/scan",
    label: "QR Scan",
    icon: "M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zm0 9.75c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zm9.75-9.75c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5zm0 9.75c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z",
  },
];

const SEARCH_HINTS = [
  "Search products...",
  "Try 'Taps'...",
  "Search 'faucet'...",
  "Find 'sanitaryware'...",
  "Search by name...",
];

/* ------------------------------------------------------------------ */
/* Desktop Dropdown                                                   */
/* ------------------------------------------------------------------ */

function NavDropdown({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <Link
        href={item.href}
        aria-haspopup="true"
        aria-expanded={open}
        className={`group relative px-5 py-3 text-sm font-medium tracking-wide transition-colors inline-flex items-center gap-1 focus:outline-none ${
          isActive ? "text-blue-700" : "text-gray-500 hover:text-blue-600"
        }`}
      >
        {item.label}
        {item.children && (
          <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
        <span
          className={`absolute bottom-0 left-3 right-3 h-0.5 rounded-full transition-transform duration-200 ${
            isActive ? "bg-blue-600 scale-x-100" : "bg-blue-400 scale-x-0 group-hover:scale-x-100 group-focus:scale-x-100"
          }`}
        />
      </Link>

      {item.children && open && (
        <div className="absolute top-full left-0 w-64 bg-white rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-gray-100 py-2 z-50">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className="block px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
            >
              <p className="text-sm font-semibold text-gray-900">{child.label}</p>
              {child.description && (
                <p className="text-xs text-gray-500 mt-0.5">{child.description}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Drawer Nav Item (mobile)                                           */
/* ------------------------------------------------------------------ */

function DrawerNavItem({
  item,
  isActive,
  onNavigate,
}: {
  item: NavItem;
  isActive: boolean;
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div>
      <button
        onClick={(e) => {
          if (hasChildren) {
            e.preventDefault();
            setExpanded(!expanded);
          } else {
            onNavigate();
          }
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-[0.98] min-h-[48px] text-left ${
          isActive
            ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
            : "text-gray-700 hover:bg-gray-50"
        }`}
      >
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          isActive ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
        }`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d={item.icon} />
          </svg>
        </span>
        <span className="font-semibold text-sm flex-1">{item.label}</span>
        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
        {hasChildren && (
          <svg className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>
      {hasChildren && expanded && (
        <div className="ml-10 mt-1 space-y-1 border-l-2 border-blue-100 pl-3">
          {item.children?.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={onNavigate}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
              <span className="font-medium">{child.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bottom Nav Item                                                    */
/* ------------------------------------------------------------------ */

function BottomNavItem({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={`relative flex flex-col items-center justify-center gap-0.5 py-1.5 px-2 min-w-0 flex-1 transition-colors group ${
        isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
      }`}
    >
      <div className={`relative w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
        isActive ? "bg-blue-50" : "group-hover:bg-gray-50"
      }`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d={item.icon} />
        </svg>
      </div>
      <span className="text-[10px] font-semibold leading-none">{item.label}</span>
      {isActive && (
        <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-[3px] bg-blue-600 rounded-full" />
      )}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Hook: rotating search placeholder                                   */
/* ------------------------------------------------------------------ */

function useRotatingPlaceholder(interval = 4000): number {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((prev) => (prev + 1) % SEARCH_HINTS.length);
    }, interval);
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  const { companyName, tagline, totalProducts, searchTerm, isSearching, isScrolled, phone, email } = config;
  const placeholderIndex = useRotatingPlaceholder(4000);
  const sanitizePhone = useMemo(() => phone.replace(/\s+/g, ""), [phone]);

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
        } else if (menuOpen) {
          setMenuOpen(false);
        } else if (drawerOpen) {
          setDrawerOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchTerm, onClearSearch, drawerOpen, menuOpen]);

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
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
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
    if (deltaX > 60) {
      setDrawerOpen(false);
    }
  }, []);

  /* ── Active link detection ── */
  const getActiveForLink = useCallback((href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#products")) return pathname === "/" || pathname.startsWith("/product");
    if (href === "/scan") return pathname === "/scan";
    if (href === "/about") return pathname === "/about";
    if (href === "/contact") return pathname === "/contact";
    return false;
  }, [pathname]);

  /* ── Bottom nav items ── */
  const bottomNavItems = NAV_ITEMS.filter((item) => item.bottomNav);

  return (
    <>
      {/* ═══════════════ Header ═══════════════ */}
      <header className={`sticky top-0 z-50 bg-white transition-all duration-300 ${isScrolled ? "shadow-md" : "shadow-sm"}`}>
        {/* Gradient accent bar */}
        <div className="h-1 bg-gradient-to-r from-blue-600 via-cyan-600 to-slate-700 relative overflow-hidden" />

        {/* Desktop Contact Strip */}
        <div className="hidden lg:block bg-slate-900 text-slate-400 text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <a href={`tel:${sanitizePhone}`} className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{phone}</span>
              </a>
              <span className="w-px h-3.5 bg-slate-700" />
              <a href={`mailto:${email}`} className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{email}</span>
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                </span>
                Mon to Sat, 9:30 AM - 7:30 PM
              </span>
            </div>
          </div>
        </div>

        {/* Main Bar */}
        <div className={`px-3 sm:px-6 lg:px-8 transition-all duration-300 ${isScrolled ? "py-1.5" : "py-2.5"}`}>
          <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-3">
            {/* Logo */}
            <Link href="/" className={`flex items-center gap-2 sm:gap-2.5 shrink-0 group ${searchFocused ? "hidden sm:flex" : "flex"}`}>
              <div className={`relative rounded-xl bg-gradient-to-br from-blue-600 to-slate-700 flex items-center justify-center text-white font-extrabold shadow-sm transition-all duration-200 shrink-0 ${isScrolled ? "w-8 h-8 text-sm" : "w-9 h-9 sm:w-11 sm:h-11 text-base sm:text-lg"}`}>
                {companyName.charAt(0)}
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full ring-2 ring-white" />
              </div>
              <div className={`min-w-0 ${isScrolled ? "hidden sm:block" : "hidden sm:block"}`}>
                <h1 className={`font-extrabold text-gray-900 leading-tight tracking-tight truncate ${isScrolled ? "text-xs sm:text-sm" : "text-sm lg:text-lg"}`}>
                  {companyName}
                </h1>
                {!isScrolled && (
                  <div className="flex items-center gap-1.5 text-gray-500 text-[11px] mt-0.5">
                    <span className="truncate max-w-[120px]">{tagline || "Browse our catalog"}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0 hidden sm:block" />
                    <span className="font-semibold text-gray-800 shrink-0 hidden sm:block">
                      {totalProducts.toLocaleString()} items
                    </span>
                  </div>
                )}
              </div>
            </Link>

            {/* Search */}
            <div className={`relative flex-1 min-w-0 transition-all duration-300 ${searchFocused ? "flex-[1.5]" : "flex-1"}`}>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder={SEARCH_HINTS[placeholderIndex]}
                  className="w-full pl-9 sm:pl-10 pr-12 h-9 sm:h-10 text-sm rounded-xl border border-gray-200 bg-gray-50/80 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-all duration-200"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {searchTerm && (
                    <button onClick={onClearSearch} className="flex items-center justify-center w-6 h-6 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all" aria-label="Clear search">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  {isSearching && searchTerm && (
                    <svg className="animate-spin h-4 w-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V2a10 10 0 00-9.95 9.05L4 12z" />
                    </svg>
                  )}
                  {!searchFocused && !searchTerm && (
                    <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-md">
                      <span>⌘</span>K
                    </kbd>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop Menu Button */}
            <div ref={menuRef} className="hidden lg:block shrink-0 relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  menuOpen
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Menu
                <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Desktop Menu Dropdown */}
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-[480px] bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15)] border border-gray-100 z-50 overflow-hidden animate-slideDown">
                    {/* Menu Header */}
                    <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white font-extrabold text-base">
                          {companyName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-extrabold text-white text-sm tracking-tight">{companyName}</p>
                          <p className="text-blue-100 text-xs">{totalProducts.toLocaleString()} products available</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Grid */}
                    <div className="p-3 grid grid-cols-2 gap-1">
                      {NAV_ITEMS.map((item) => {
                        const isActive = getActiveForLink(item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMenuOpen(false)}
                            className={`flex items-start gap-3 p-3 rounded-xl transition-all group ${
                              isActive
                                ? "bg-blue-50 ring-1 ring-blue-100"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                              isActive
                                ? "bg-blue-100 text-blue-600"
                                : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                            }`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <path d={item.icon} />
                              </svg>
                            </span>
                            <div className="min-w-0">
                              <p className={`text-sm font-bold leading-none transition-colors ${
                                isActive ? "text-blue-700" : "text-gray-900 group-hover:text-blue-600"
                              }`}>
                                {item.label}
                              </p>
                              {item.children && item.children.length > 0 && (
                                <p className="text-[11px] text-gray-400 mt-1.5 line-clamp-1">
                                  {item.children.map((c) => c.label).join(" · ")}
                                </p>
                              )}
                              {!item.children && (
                                <p className="text-[11px] text-gray-400 mt-1.5">
                                  {item.href === "/" ? "Go to homepage" : item.href === "/about" ? "Learn about us" : item.href === "/contact" ? "Get in touch" : item.href === "/scan" ? "Scan QR codes" : ""}
                                </p>
                              )}
                            </div>
                            {isActive && (
                              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1" />
                            )}
                          </Link>
                        );
                      })}
                    </div>

                    {/* Menu Footer */}
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
                      <a
                        href={`tel:${sanitizePhone}`}
                        className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {phone}
                      </a>
                      <span className="w-px h-3 bg-gray-300" />
                      <span className="text-[11px] text-gray-400">Mon–Sat, 9:30 AM – 7:30 PM</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Hamburger button — more prominent on mobile */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden shrink-0 flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800 active:scale-95 transition-all shadow-sm"
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="text-xs font-semibold hidden sm:inline">Menu</span>
            </button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:block border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center">
              {NAV_ITEMS.filter((item) => !item.bottomNav || item.children).map((item) => {
                const isActive = getActiveForLink(item.href);
                return item.children ? (
                  <NavDropdown key={item.href} item={item} isActive={isActive} />
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative px-5 py-3 text-sm font-medium tracking-wide transition-colors ${isActive ? "text-blue-700" : "text-gray-500 hover:text-blue-600"}`}
                  >
                    {item.label}
                    <span className={`absolute bottom-0 left-3 right-3 h-0.5 rounded-full transition-transform duration-200 ${isActive ? "bg-blue-600 scale-x-100" : "bg-blue-400 scale-x-0 group-hover:scale-x-100"}`} />
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* ═══════════════ Mobile Bottom Nav ═══════════════ */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] pb-safe flex items-center"
        aria-label="Main navigation"
      >
        {bottomNavItems.map((item) => (
          <BottomNavItem key={item.href} item={item} isActive={getActiveForLink(item.href)} />
        ))}
        {/* Menu button in bottom nav — opens the drawer */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="relative flex flex-col items-center justify-center gap-0.5 py-1.5 px-2 min-w-0 flex-1 text-gray-400 hover:text-gray-600 transition-colors group"
          aria-label="More menu"
        >
          <div className="w-7 h-7 flex items-center justify-center rounded-lg group-hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
          <span className="text-[10px] font-semibold leading-none">Menu</span>
        </button>
      </nav>

      {/* ═══════════════ Mobile Drawer ═══════════════ */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer panel */}
          <div
            ref={drawerRef}
            onTouchStart={handleDrawerTouchStart}
            onTouchMove={handleDrawerTouchMove}
            onTouchEnd={handleDrawerTouchEnd}
            className="absolute top-0 right-0 bottom-0 w-[80vw] max-w-[340px] bg-white shadow-2xl overflow-y-auto animate-slideIn pb-24"
          >
            {/* Drawer Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-slate-700 flex items-center justify-center text-white font-extrabold text-base shadow-sm">
                  {companyName.charAt(0)}
                </div>
                <div>
                  <p className="font-extrabold text-gray-900 text-sm tracking-tight">{companyName}</p>
                  <p className="text-[11px] text-gray-400">{totalProducts.toLocaleString()} products</p>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 active:scale-95 transition-all"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Quick actions */}
            <div className="px-4 pt-4 pb-2 flex gap-2">
              <a
                href={`tel:${sanitizePhone}`}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm active:scale-[0.97] transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call
              </a>
              <a
                href={`mailto:${email}`}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm active:scale-[0.97] transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
              </a>
            </div>

            {/* Navigation links */}
            <div className="px-4 py-2 space-y-1">
              <p className="px-3 pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Navigation</p>
              {NAV_ITEMS.map((item) => (
                <DrawerNavItem
                  key={item.href}
                  item={item}
                  isActive={getActiveForLink(item.href)}
                  onNavigate={() => setDrawerOpen(false)}
                />
              ))}
            </div>

            {/* Footer info */}
            <div className="px-5 pt-4 pb-6 mt-4 border-t border-gray-100">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Business Hours</p>
              <p className="text-xs text-gray-500">Mon – Sat: 9:30 AM – 7:30 PM</p>
              <p className="text-xs text-gray-400">Sunday: Closed</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
