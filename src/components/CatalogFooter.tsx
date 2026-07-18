"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { CompanyProfile, DEFAULT_COMPANY_PROFILE } from "@/types/company";
import type { Brand } from "@/app/api/brands/route";
import type { ContactContent, FooterContent, SocialLink } from "@/types/content";
import { DEFAULT_CONTACT, DEFAULT_FOOTER } from "@/types/content";

/* ── Badge colour map ────────────────────────────────────────── */
const BADGE_COLORS: Record<string, { text: string; bg: string; ring: string }> = {
  emerald: { text: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200" },
  blue:    { text: "text-blue-700",    bg: "bg-blue-50",    ring: "ring-blue-200" },
  indigo:  { text: "text-indigo-700",  bg: "bg-indigo-50",  ring: "ring-indigo-200" },
  amber:   { text: "text-amber-700",   bg: "bg-amber-50",   ring: "ring-amber-200" },
  sky:     { text: "text-sky-700",     bg: "bg-sky-50",     ring: "ring-sky-200" },
  rose:    { text: "text-rose-700",    bg: "bg-rose-50",    ring: "ring-rose-200" },
  slate:   { text: "text-slate-600",   bg: "bg-slate-100",  ring: "ring-slate-200" },
};

/* ── Social icon SVG map ─────────────────────────────────────── */
const SOCIAL_ICONS: Record<string, (size?: number) => React.ReactElement> = {
  facebook: (s = 20) => (
    <svg width={s} height={s} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  instagram: (s = 20) => (
    <svg width={s} height={s} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
  youtube: (s = 20) => (
    <svg width={s} height={s} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  linkedin: (s = 20) => (
    <svg width={s} height={s} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  twitter: (s = 20) => (
    <svg width={s} height={s} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  whatsapp: (s = 20) => (
    <svg width={s} height={s} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  ),
};

const DEFAULT_BRANDS: Brand[] = [
  { id: "default-1", name: "DIAMOND SERIES",   description: "DIAMOND Bath Fittings",   imageUrl: "", badgeColor: "emerald", sortOrder: 0 },
  { id: "default-2", name: "ACTIVE SERIES",   description: "ACTIVE Bath Fittings",    imageUrl: "", badgeColor: "slate",   sortOrder: 1 },
  { id: "default-3", name: "LX SERIES",        description: "LX Bath Fittings",       imageUrl: "", badgeColor: "slate",   sortOrder: 2 },
];

/* ── Scroll reveal hook ──────────────────────────────────────── */
function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: "0px 0px -60px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/* ── Strip non-digit chars from phone for tel: links ────────── */
function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

/* ═════════════════════════════════════════════════════════════ */
/* Main Footer Component                                       */
/* ═════════════════════════════════════════════════════════════ */

export default function CatalogFooter() {
  const [company, setCompany] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);
  const [contact, setContact] = useState<ContactContent>(DEFAULT_CONTACT);
  const [footer, setFooter] = useState<FooterContent>(DEFAULT_FOOTER);
  const [brands, setBrands] = useState<Brand[]>(DEFAULT_BRANDS);
  const currentYear = new Date().getFullYear();

  const reveal = useScrollReveal(0.08);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companyRes, brandsRes, contentRes] = await Promise.all([
          fetch("/api/company"),
          fetch("/api/brands"),
          fetch("/api/content"),
        ]);
        if (companyRes.ok) {
          const data = await companyRes.json();
          if (data.company) setCompany((prev) => ({ ...prev, ...data.company }));
        }
        if (brandsRes.ok) {
          const data = await brandsRes.json();
          if (data.brands?.length > 0) setBrands(data.brands);
        }
        if (contentRes.ok) {
          const data = await contentRes.json();
          if (data.contact) setContact((prev) => ({ ...prev, ...data.contact }));
          if (data.footer) setFooter((prev) => ({ ...prev, ...data.footer }));
        }
      } catch {
        // fall back to defaults
      }
    };
    fetchData();
  }, []);

  /* ── Get social links that have actual URLs ── */
  const activeSocials = contact.socialLinks?.filter(
    (s: SocialLink) => s.url && s.url !== "#"
  ) ?? [];

  /* ── Footer link columns data ── */
  const aboutText =
    footer.aboutText ||
    `is a leading Indian manufacturer of premium bathroom taps, faucets, and accessories. We combine precision CNC machining, quality brass materials, and rigorous testing to produce fixtures that deliver lasting performance and elegant design for modern Indian bathrooms.`;

  const categories = footer.categories?.length
    ? footer.categories
    : DEFAULT_FOOTER.categories;

  const footerLinks = footer.footerLinks?.length
    ? footer.footerLinks
    : DEFAULT_FOOTER.footerLinks;

  const quickLinks = [
    { href: "/", label: "Home" },
    { href: "/search", label: "All Products" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact & Support" },
    { href: "/scan", label: "Scan QR Code" },
    { href: "/inventory", label: "Inventory Lookup" },
  ];

  return (
    <footer className="bg-white border-t border-slate-200 text-slate-500">
      {/* ── Top decorative border ── */}
      <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-400" />

      <div
        ref={reveal.ref}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16"
      >
        {/* ── 4-Column Grid ── */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 lg:gap-8 transition-all duration-800 ease-out ${
            reveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {/* ──── Column 1: About Company ──── */}
          <div className="transition-all duration-500" style={{ transitionDelay: "50ms" }}>
            <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
              <img
                src="/img/main-logo.jpg"
                alt={company.name}
                className="h-7 sm:h-9 w-auto"
              />
            </div>
            <p className="text-xs sm:text-sm leading-relaxed sm:leading-relaxed text-slate-500">
              <span className="font-semibold text-slate-700">{company.name}</span>{" "}
              {aboutText}
            </p>

            {/* Trust badges */}
            <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-1.5 sm:gap-2">
              {footer.showIsoBadge && (
                <span className="inline-flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-xs text-blue-600 bg-blue-50 px-2 sm:px-3 py-1 rounded-full ring-1 ring-blue-200">
                  <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {footer.isoLabel}
                </span>
              )}
              {footer.showMadeInIndia && (
                <span className="inline-flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-xs font-bold text-blue-700 bg-blue-50 px-2 sm:px-3 py-1 rounded-full ring-1 ring-blue-200">
                  <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  Made in India
                </span>
              )}
            </div>
          </div>

          {/* ──── Column 2: Product Categories ──── */}
          <div className="transition-all duration-500" style={{ transitionDelay: "150ms" }}>
            <h3 className="text-slate-800 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
              <span className="w-1 h-3 sm:h-4 rounded-full bg-blue-500 shrink-0" />
              Product Categories
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {categories.map((cat) => (
                <li key={cat.name}>
                  <span className="flex items-start gap-2 sm:gap-2.5 text-xs sm:text-sm text-slate-500 group">
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-blue-500 shrink-0 mt-1 sm:mt-1.5 group-hover:scale-150 transition-transform" />
                    <span className="min-w-0">
                      <strong className="text-slate-700 group-hover:text-blue-600 transition-colors">
                        {cat.name}
                      </strong>
                      <span className="text-slate-300 mx-0.5 sm:mx-1">—</span>
                      <span className="text-slate-400 text-[11px] sm:text-sm">
                        {cat.description}
                      </span>
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            {/* Brand badges */}
            {brands.length > 0 && (
              <div className="mt-3 sm:mt-5 flex flex-wrap items-center gap-1 sm:gap-2">
                {brands.map((brand) => {
                  const colors = BADGE_COLORS[brand.badgeColor ?? "slate"] || BADGE_COLORS.slate;
                  return (
                    <span
                      key={brand.name}
                      className={`text-[8px] sm:text-[10px] font-bold uppercase tracking-widest ${colors.text} ${colors.bg} px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded ${colors.ring ? `ring-1 ${colors.ring}` : ""}`}
                    >
                      {brand.name}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* ──── Column 3: Quick Links ──── */}
          <div className="transition-all duration-500" style={{ transitionDelay: "250ms" }}>
            <h3 className="text-slate-800 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
              <span className="w-1 h-3 sm:h-4 rounded-full bg-amber-400 shrink-0" />
              Quick Links
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-slate-500 hover:text-blue-600 transition-colors group"
                  >
                    <svg
                      className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-300 shrink-0 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ──── Column 4: Contact & Social ──── */}
          <div className="transition-all duration-500" style={{ transitionDelay: "350ms" }}>
            <h3 className="text-slate-800 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
              <span className="w-1 h-3 sm:h-4 rounded-full bg-emerald-500 shrink-0" />
              Get In Touch
            </h3>

            {/* Contact items in a responsive 2-col grid on small screens */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-0">
              {/* Phone */}
              <div className="flex items-start gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-sm text-slate-700 font-medium">Phone</p>
                  <a
                    href={`tel:${sanitizePhone(contact.phone)}`}
                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-500 transition-colors font-semibold break-all"
                  >
                    {contact.phone}
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-sm text-slate-700 font-medium">Email</p>
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-500 transition-colors font-semibold break-all"
                  >
                    {contact.email}
                  </a>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-2.5 sm:gap-3 xs:col-span-2 sm:col-span-1">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-sm text-slate-700 font-medium">Address</p>
                  <p className="text-[11px] sm:text-sm text-slate-400 mt-0.5 leading-relaxed break-words">
                    {contact.address}
                  </p>
                </div>
              </div>
            </div>

            {/* WhatsApp */}
            {contact.socialLinks?.find((s: SocialLink) => s.icon === "whatsapp" && s.url !== "#") && (
              <div className="mt-2 sm:mt-4 flex items-start gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                  {SOCIAL_ICONS.whatsapp(14)}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-sm text-slate-700 font-medium">WhatsApp</p>
                  <a
                    href={contact.socialLinks.find((s: SocialLink) => s.icon === "whatsapp")?.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-500 transition-colors font-semibold break-all"
                  >
                    Chat with us
                  </a>
                </div>
              </div>
            )}

            {/* Business Hours */}
            <div className="mt-3 sm:mt-5 pt-3 sm:pt-4 border-t border-slate-100">
              <div className="flex items-start gap-2.5 sm:gap-3">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-sm text-slate-700 font-medium">Business Hours</p>
                  <p className="text-[11px] sm:text-sm text-slate-400 mt-0.5">
                    Mon — Sat: {contact.businessHours}
                    {contact.closedDay && (
                      <><br className="hidden xs:inline" />{" "}{contact.closedDay}: Closed</>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            {activeSocials.length > 0 && (
              <div className="mt-3 sm:mt-5 pt-3 sm:pt-4 border-t border-slate-100">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 sm:mb-3">
                  Follow Us
                </p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                  {activeSocials.map((social: SocialLink) => {
                    const iconFn = SOCIAL_ICONS[social.icon];
                    if (!iconFn) return null;
                    return (
                      <a
                        key={social.platform}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600 flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-sm"
                        aria-label={social.label}
                      >
                        {iconFn(13)}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Divider ── */}
        <div
          className={`mt-8 sm:mt-12 pt-5 sm:pt-8 border-t border-slate-200 transition-all duration-700 ${
            reveal.visible ? "opacity-100" : "opacity-0"
          }`}
          style={{ transitionDelay: "500ms" }}
        >
          {/* Copyright row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
            <p className="text-[10px] sm:text-xs text-slate-400 text-center sm:text-left">
              &copy; {currentYear}{" "}
              <span className="text-slate-600 font-medium">{company.name}</span>.{" "}
              {footer.copyrightText || "All rights reserved."}
            </p>

            {/* GSTIN + Footer links */}
            <div className="flex flex-col xs:flex-row items-center gap-1.5 sm:gap-6 text-center xs:text-left">
              {footer.gstin && footer.gstin !== DEFAULT_FOOTER.gstin && (
                <span className="text-[9px] sm:text-[11px] font-mono text-slate-400 bg-slate-50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-md ring-1 ring-slate-200">
                  {footer.gstin}
                </span>
              )}
              <div className="flex flex-wrap items-center justify-center gap-x-2.5 sm:gap-x-3 gap-y-0.5">
                {footerLinks.map((link) => (
                  <Link
                    key={link.url}
                    href={link.url}
                    className="text-[10px] sm:text-xs text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom branding */}
          <div className="mt-3 sm:mt-6 text-center">
            <p className="text-[9px] sm:text-[11px] text-slate-300 leading-relaxed px-2">
              Crafted with precision in Hyderabad, India{" "}
              <span className="mx-0.5 sm:mx-1.5 hidden xs:inline">·</span>
              <span className="block xs:inline" />
              Premium Taps, Faucets & Bathroom Accessories{" "}
              <span className="mx-0.5 sm:mx-1.5 hidden xs:inline">·</span>
              <span className="block xs:inline" />
              <span className="text-slate-400 font-medium">Anutec</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
