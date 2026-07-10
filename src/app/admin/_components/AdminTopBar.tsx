"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { auth } from "@/lib/firebase";
import { signOut as firebaseSignOut } from "firebase/auth";
import { useSidebar } from "./SidebarContext";

const BREADCRUMB_MAP: Record<string, string> = {
  admin: "Dashboard",
  products: "Products",
  banners: "Banners",
  brands: "Brand Galaxy",
  settings: "Settings",
  inventory: "Inventory",
  scan: "QR Scanner",
  edit: "Edit",
};

export default function AdminTopBar() {
  const { collapsed } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const [showLogout, setShowLogout] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setSigningOut(true);
    if (auth) {
      try { await firebaseSignOut(auth); } catch { /* continue */ }
    }
    await signOut({ callbackUrl: "/" });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/admin?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Build breadcrumbs
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label = BREADCRUMB_MAP[seg] || seg.charAt(0).toUpperCase() + seg.slice(1);
    return { href, label, last: i === segments.length - 1 };
  });

  // Get current time greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <header
        className={`fixed top-0 right-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6 transition-all duration-300 left-0 ${
          collapsed ? "lg:left-[72px]" : "lg:left-64"
        }`}
      >
        {/* Left: Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <nav className="hidden sm:flex items-center gap-1.5 text-sm min-w-0" aria-label="Breadcrumb">
            {breadcrumbs.length === 1 && breadcrumbs[0].label === "Admin" ? (
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-slate-400">{greeting} 👋</span>
              </div>
            ) : (
              breadcrumbs.map((crumb, i) => (
                <div key={crumb.href} className="flex items-center gap-1.5 min-w-0">
                  {i > 0 && (
                    <svg className="w-3.5 h-3.5 text-slate-300 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                  {crumb.last ? (
                    <span className="text-sm font-semibold text-slate-800 truncate">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href} className="text-sm font-medium text-slate-400 hover:text-indigo-600 transition-colors truncate">
                      {crumb.label}
                    </Link>
                  )}
                </div>
              ))
            )}
          </nav>
          {/* Mobile: just show greeting */}
          <span className="sm:hidden text-xs font-semibold text-slate-500">{greeting}</span>
        </div>

        {/* Right: Search, Notifications, User */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="admin-input pl-9 pr-3 py-1.5 w-48 text-xs focus:w-64 transition-all duration-300"
              />
            </div>
          </form>

          {/* Notifications */}
          <button
            className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Notifications"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 pulse-dot" />
          </button>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="avatar-ring">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-[10px] font-bold">
                  AD
                </div>
              </div>
              <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 hidden sm:block ${showUserMenu ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 animate-fadeIn z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800">Admin User</p>
                  <p className="text-xs text-slate-500">admin@anutec.com</p>
                </div>
                <div className="py-1">
                  <Link
                    href="/admin/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </Link>
                  <Link
                    href="/"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Catalog
                  </Link>
                </div>
                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={() => { setShowUserMenu(false); setShowLogout(true); }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogout && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-sm w-full p-6 animate-fadeIn">
            <div className="flex items-center gap-4 mb-5">
              <div className="p-3 rounded-xl bg-red-50">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Sign Out</h3>
                <p className="text-sm text-slate-500">Are you sure you want to leave the admin panel?</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogout(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={signingOut}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 transition-all disabled:opacity-50"
              >
                {signingOut ? "Leaving..." : "Yes, Sign Out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
