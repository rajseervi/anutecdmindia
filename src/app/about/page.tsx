"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import { CompanyProfile, DEFAULT_COMPANY_PROFILE } from "@/types/company";
import CatalogHeader, { type CatalogHeaderConfig } from "@/components/CatalogHeader";
import { useScrollBehavior } from "@/hooks/useScrollBehavior";

const MILESTONES = [
  { year: "2010", title: "Founded", description: "Anutec established with a vision to manufacture world-class taps and faucets for the Indian market." },
  { year: "2013", title: "First Production Line", description: "Launched our first fully automated precision casting and finishing facility." },
  { year: "2016", title: "Product Range Expansion", description: "Expanded into bathroom accessories, shower mixers, and premium kitchen taps." },
  { year: "2019", title: "Quality Certification", description: "Achieved ISO 9001 certification and implemented rigorous multi-stage quality control." },
  { year: "2023", title: "Digital Catalog Launch", description: "Launched our digital product catalog for nationwide dealer and customer access." },
  { year: "2025+", title: "Innovating Ahead", description: "Expanding into smart water-saving fixtures and growing our pan-India Manufacturer network." },
];

const STATS = [
  { value: 200, suffix: "+", label: "Product Variants" },
  { value: 15, suffix: "+", label: "Years of Manufacturing" },
  { value: 50, suffix: "+", label: "Distributor Partners" },
  { value: 10000, suffix: "+", label: "Happy Customers" },
];

const VALUES = [
  {
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    title: "Precision Manufacturing",
    description: "Every Anutec tap and faucet is crafted using premium brass components, advanced casting techniques, and multi-stage quality checks for flawless finish.",
  },
  {
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    title: "Innovation & Design",
    description: "Our in-house design team continuously innovates — combining contemporary aesthetics with water-saving technology for modern Indian bathrooms.",
  },
  {
    icon: "M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3",
    title: "Built to Last",
    description: "We use corrosion-resistant materials, ceramic disc cartridges, and electroplated finishes tested to withstand years of daily use in Indian water conditions.",
  },
  {
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    title: "Dealer-First Approach",
    description: "We support our nationwide network of dealers and distributors with competitive pricing, reliable supply, and marketing assistance.",
  },
];

const CATEGORY_THEMES: Record<string, { bg: string; text: string; badge: string; icon: string }> = {
  blue: { bg: "bg-blue-100", text: "text-blue-700", badge: "text-blue-600 bg-blue-50", icon: "text-blue-500" },
  amber: { bg: "bg-amber-100", text: "text-amber-700", badge: "text-amber-600 bg-amber-50", icon: "text-amber-500" },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-700", badge: "text-emerald-600 bg-emerald-50", icon: "text-emerald-500" },
  rose: { bg: "bg-rose-100", text: "text-rose-700", badge: "text-rose-600 bg-rose-50", icon: "text-rose-500" },
};

const PRODUCT_CATEGORIES = [
  {
    name: "Bathroom Faucets",
    tagline: "Elegance & Durability",
    color: "blue",
    icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
    description: "A complete range of basin mixers, wall-mounted faucets, and pillar taps — designed for modern bathrooms with superior chrome finish.",
  },
  {
    name: "Kitchen Taps",
    tagline: "Functionality First",
    color: "amber",
    icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4",
    description: "Ergonomic kitchen sink mixers with 360° swivel spouts, pull-out sprays, and high-pressure performance for daily use.",
  },
  {
    name: "Shower Mixers",
    tagline: "Spa-Like Experience",
    color: "emerald",
    icon: "M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
    description: "Thermostatic and manual shower mixers with overhead showers and hand showers — precision flow control for a luxurious feel.",
  },
  {
    name: "Accessories",
    tagline: "Complete Your Bathroom",
    color: "rose",
    icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
    description: "Towel rails, soap dispensers, grab bars, corner shelves, and more — all manufactured with the same commitment to quality.",
  },
];

/* ── Animated Counter Hook ── */
function useAnimatedCounter(target: number, isVisible: boolean, duration = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    let startTime: number | null = null;
    let rafId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [target, isVisible, duration]);

  return count;
}

/* ── Scroll Reveal Hook ── */
function useScrollReveal(threshold = 0.15) {
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
      { threshold, rootMargin: "0px 0px -50px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/* ── Stat Counter Component ── */
function StatCounter({ value, suffix, label, visible }: { value: number; suffix: string; label: string; visible: boolean }) {
  const count = useAnimatedCounter(value, visible);
  return (
    <div className="text-center">
      <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tabular-nums">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-blue-100 text-sm sm:text-base mt-1 font-medium">{label}</p>
    </div>
  );
}

/* ── Stat Card Component (for story section stats) ── */
function StatCard({ stat, visible }: { stat: typeof STATS[number]; visible: boolean }) {
  const count = useAnimatedCounter(stat.value, visible);
  return (
    <div className="text-center">
      <p className="text-3xl sm:text-4xl font-extrabold gradient-text-blue tabular-nums">
        {count.toLocaleString()}{stat.suffix}
      </p>
      <p className="text-sm text-gray-500 mt-1.5 font-semibold">{stat.label}</p>
    </div>
  );
}

/* ── Timeline Dot (animated when visible) ── */
function TimelineDot({ visible, delay = 0 }: { visible: boolean; delay?: number }) {
  return (
    <div
      className="absolute left-4 sm:left-1/2 top-5 -translate-x-1/2 z-10"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div
        className={`w-5 h-5 rounded-full border-[3px] border-blue-500 bg-white shadow-lg shadow-blue-200/50 transition-all duration-700 ${
          visible ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`}
      >
        <div className={`w-2 h-2 rounded-full bg-blue-500 absolute inset-0 m-auto transition-all duration-500 ${visible ? "scale-100" : "scale-0"}`} />
      </div>
    </div>
  );
}

export default function AboutPage() {
  const [company, setCompany] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);
  const { isScrolled } = useScrollBehavior();
  const [heroVisible, setHeroVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  /* ── Mouse parallax ── */
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener("mousemove", handleMouse, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  /* ── Hero entrance ── */
  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 150);
    return () => clearTimeout(timer);
  }, []);

  /* ── Refs & visibility for each section ── */
  const storySection = useScrollReveal(0.15);
  const statsBarSection = useScrollReveal(0.2);
  const valuesSection = useScrollReveal(0.1);
  const categoriesSection = useScrollReveal(0.1);
  const timelineSection = useScrollReveal(0.05);
  const whyChooseSection = useScrollReveal(0.1);
  const ctaSection = useScrollReveal(0.2);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await fetch("/api/company");
        const data = await res.json();
        if (res.ok && data.company) {
          setCompany((prev) => ({ ...prev, ...data.company }));
        }
      } catch {
        // Safe fallback
      }
    };
    fetchCompany();
  }, []);

  const headerConfig: CatalogHeaderConfig = useMemo(() => ({
    companyName: company.name,
    tagline: company.tagline,
    totalProducts: 0,
    searchTerm: "",
    isSearching: false,
    isScrolled,
    phone: company.phone,
    email: company.email,
  }), [company, isScrolled]);

  return (
    <div className="min-h-screen bg-gray-50">
      <CatalogHeader
        config={headerConfig}
        onSearchChange={() => {}}
        onClearSearch={() => {}}
      />

      {/* ── Hero Section (animated entrance + parallax orbs) ── */}
      <section ref={heroRef} className="relative bg-slate-950 overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-br from-blue-600/25 via-indigo-500/15 to-cyan-400/10 blur-3xl animate-float-slow"
            style={{
              left: `${-100 + mousePos.x * 80}px`,
              top: `${-80 - mousePos.y * 40}px`,
            }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-amber-500/20 to-orange-400/10 blur-3xl animate-float-delayed"
            style={{
              right: `${-80 - mousePos.x * 60}px`,
              bottom: `${-60 + mousePos.y * 50}px`,
            }}
          />
        </div>

        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-28">
          <div
            className={`max-w-3xl transition-all duration-1000 ease-out ${
              heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            {/* Badge */}
            <div
              className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-blue-400/10 border border-blue-400/20 text-blue-300 text-xs font-semibold tracking-wide mb-6 backdrop-blur-sm transition-all duration-700 delay-100 ${
                heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-400" />
              </span>
              About {company.name}
            </div>

            <h1
              className={`text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.08] tracking-tight mb-6 transition-all duration-700 delay-200 ${
                heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              Precision-Engineered{" "}
              <span className="gradient-text">Since 2010</span>
            </h1>

            <p
              className={`text-base sm:text-lg text-slate-300/90 leading-relaxed max-w-2xl transition-all duration-700 delay-300 ${
                heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              {company.name} is an Indian manufacturer of premium bathroom taps, faucets, and accessories.
              Every product leaving our facility reflects our commitment to precision engineering, quality materials,
              and lasting durability.
            </p>

            {/* Quick stats in hero */}
            <div
              className={`flex flex-wrap items-center gap-6 mt-10 transition-all duration-700 delay-400 ${
                heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              {STATS.slice(0, 3).map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={i === 0 ? "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" : i === 1 ? "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" : "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{stat.value.toLocaleString()}{stat.suffix}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
      </section>

      {/* ── Our Story Section (scroll reveal) ── */}
      <section ref={storySection.ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center transition-all duration-800 ease-out ${
          storySection.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}>
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold tracking-wide mb-5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Our Story
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight">
              Manufacturing Excellence,{" "}
              <span className="gradient-text-blue">Every Day</span>
            </h2>
            <div className="mt-6 space-y-4 text-gray-600 leading-relaxed text-base">
              <p>
                Founded in 2010, <strong className="text-gray-900">{company.name}</strong> began with a clear
                mission — to manufacture high-quality bathroom taps and faucets that combine elegant design with
                rugged durability, purpose-built for Indian homes and conditions.
              </p>
              <p>
                From our state-of-the-art manufacturing facility, we produce a comprehensive range of products
                including <strong className="text-gray-900">bathroom faucets</strong>,{" "}
                <strong className="text-gray-900">kitchen taps</strong>,{" "}
                <strong className="text-gray-900">shower mixers</strong>, and{" "}
                <strong className="text-gray-900">bathroom accessories</strong> — every component
                machined, assembled, and finished under strict quality protocols.
              </p>
              <p>
                Our products are built from premium brass forgings, fitted with ceramic disc cartridges
                for drip-free performance, and finished with multi-layer electroplating that resists corrosion,
                tarnishing, and daily wear. We do not compromise — because our name goes on every product.
              </p>
            </div>
          </div>

          {/* Stats card */}
          <div
            className={`relative transition-all duration-800 delay-300 ${
              storySection.visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <div className="relative bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/40 p-8 sm:p-10 overflow-hidden">
              {/* Decorative gradient corner */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-gradient-to-tl from-amber-400/10 to-orange-400/10 rounded-full blur-2xl" />

              <div className="relative grid grid-cols-2 gap-6">
                {STATS.map((stat) => (
                  <StatCard key={stat.label} stat={stat} visible={storySection.visible} />
                ))}
              </div>
              <div className="relative mt-8 pt-8 border-t border-gray-100">
                <blockquote className="text-sm text-gray-500 italic leading-relaxed">
                  &ldquo;We do not just make taps — we engineer solutions that families trust every single day.&rdquo;
                </blockquote>
                <p className="text-sm font-bold text-gray-900 mt-3">— Founder, {company.name}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar (animated counters) ── */}
      <section ref={statsBarSection.ref} className="relative bg-gradient-to-r from-indigo-700 via-blue-600 to-cyan-600 overflow-hidden">
        {/* Animated shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 animate-shimmer pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <StatCounter
                key={stat.label}
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
                visible={statsBarSection.visible}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission, Vision, Values (staggered card reveal) ── */}
      <section ref={valuesSection.ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className={`text-center max-w-2xl mx-auto mb-14 transition-all duration-700 ${
          valuesSection.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold tracking-wide mb-5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            What Drives Us
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight">
            Our Manufacturing Philosophy
          </h2>
          <p className="mt-5 text-gray-500 leading-relaxed text-base max-w-xl mx-auto">
            Every tap, faucet, and accessory we produce is guided by a clear set of principles — precision,
            innovation, durability, and respect for the people who sell and use our products.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map((value, i) => (
            <div
              key={value.title}
              className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 hover:shadow-xl hover:shadow-gray-200/40 hover:border-blue-100 transition-all duration-500 hover:-translate-y-1 group ${
                valuesSection.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${i * 120 + 200}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-5 group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-300 group-hover:scale-110">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={value.icon} />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{value.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Product Categories (staggered + hover 3D) ── */}
      <section ref={categoriesSection.ref} className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className={`text-center max-w-2xl mx-auto mb-14 transition-all duration-700 ${
            categoriesSection.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold tracking-wide mb-5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              What We Make
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight">
              Our Product Range
            </h2>
            <p className="mt-5 text-gray-500 leading-relaxed text-base max-w-xl mx-auto">
              Every category is manufactured in-house — from raw material to finished product — ensuring
              consistent quality across the entire Anutec range.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {PRODUCT_CATEGORIES.map((cat, i) => {
              const theme = CATEGORY_THEMES[cat.color] || CATEGORY_THEMES.blue;
              return (
                <div
                  key={cat.name}
                  className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-7 sm:p-8 text-center hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 hover:-translate-y-2 group ${
                    categoriesSection.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                  }`}
                  style={{ transitionDelay: `${i * 150 + 200}ms` }}
                >
                  <div className={`w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center ${theme.bg} group-hover:scale-110 transition-all duration-300`}>
                    <svg className={`w-8 h-8 ${theme.icon}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={cat.icon} />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{cat.name}</h3>
                  <p className={`text-sm font-bold mt-1 ${theme.text}`}>{cat.tagline}</p>
                  <p className="text-sm text-gray-500 mt-3 leading-relaxed">{cat.description}</p>
                  <div className={`mt-5 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${theme.badge} group-hover:scale-105 transition-transform`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Made in India
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Timeline / Milestones (animated entrance) ── */}
      <section ref={timelineSection.ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className={`text-center max-w-2xl mx-auto mb-14 transition-all duration-700 ${
          timelineSection.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold tracking-wide mb-5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Our Journey
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight">
            Milestones
          </h2>
          <p className="mt-5 text-gray-500 leading-relaxed text-base max-w-xl mx-auto">
            Key moments that have shaped our growth as a trusted Indian manufacturer of bathroom fixtures.
          </p>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div
            className={`absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-amber-400 to-blue-400 -translate-x-1/2 transition-all duration-1000 origin-top ${
              timelineSection.visible ? "scale-y-100" : "scale-y-0"
            }`}
          />

          <div className="space-y-10">
            {MILESTONES.map((milestone, index) => {
              const isLeft = index % 2 === 0;
              const dotDelay = 300 + index * 200;
              const cardDelay = 400 + index * 200;

              return (
                <div
                  key={milestone.year}
                  className={`relative flex flex-col sm:flex-row items-start gap-6 sm:gap-0 ${
                    isLeft ? "sm:flex-row" : "sm:flex-row-reverse"
                  }`}
                >
                  {/* Content card */}
                  <div
                    className={`sm:w-[calc(50%-2rem)] w-full pl-10 sm:pl-0 transition-all duration-700 ${
                      isLeft ? "sm:pr-8 sm:text-right" : "sm:pl-8"
                    } ${
                      timelineSection.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                    }`}
                    style={{ transitionDelay: `${cardDelay}ms` }}
                  >
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6 hover:shadow-lg hover:shadow-gray-200/30 hover:border-blue-100 transition-all duration-300 group">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-xs font-bold mb-2.5 group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors">
                        {milestone.year}
                      </span>
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{milestone.title}</h3>
                      <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{milestone.description}</p>
                    </div>
                  </div>

                  {/* Center dot */}
                  <TimelineDot visible={timelineSection.visible} delay={dotDelay} />

                  {/* Spacer */}
                  <div className="hidden sm:block sm:w-[calc(50%-2rem)]" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us (animated cards) ── */}
      <section ref={whyChooseSection.ref} className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        {/* Floating background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-float-delayed" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className={`text-center max-w-2xl mx-auto mb-14 transition-all duration-700 ${
            whyChooseSection.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-400/10 border border-blue-400/20 text-blue-300 text-xs font-semibold tracking-wide mb-5 backdrop-blur-sm">
              Why Choose Anutec
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.1] tracking-tight">
              The Anutec Advantage
            </h2>
            <p className="mt-5 text-slate-400 leading-relaxed text-base max-w-xl mx-auto">
              What sets our manufacturing apart — and why dealers and customers choose Anutec.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                title: "In-House Manufacturing",
                description: "Every product is designed, machined, assembled, and tested in our own facility — no outsourcing, no compromises on quality control.",
                icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
              },
              {
                title: "Rigorous Quality Testing",
                description: "Multi-stage inspection — from raw material checks to pressure testing, plating thickness verification, and final assembly Q.C.",
                icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
              },
              {
                title: "Pan-India Manufacturer",
                description: "Our growing network of authorized dealers across India ensures Anutec products reach customers reliably — with full manufacturer backing.",
                icon: "M13 10V3L4 14h7v7l9-11h-7z",
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className={`bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-7 sm:p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:-translate-y-1 group ${
                  whyChooseSection.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${i * 150 + 200}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400/20 to-indigo-400/20 flex items-center justify-center mb-5 group-hover:from-blue-400/30 group-hover:to-indigo-400/30 group-hover:scale-110 transition-all duration-300">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2.5 group-hover:text-blue-300 transition-colors">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          <div className={`mt-12 text-center transition-all duration-700 delay-500 ${
            whyChooseSection.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}>
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 shadow-xl shadow-blue-900/30 hover:shadow-blue-900/50 hover:scale-[1.02] active:scale-[0.97]"
            >
              Get In Touch
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA Banner (animated entrance + floating particles) ── */}
      <section ref={ctaSection.ref} className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 overflow-hidden">
        {/* Background animation layer */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-white/10 rounded-full blur-3xl animate-float-delayed" />
        </div>

        <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 text-center transition-all duration-800 ${
          ctaSection.visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight">
            Looking for Quality Taps & Faucets?
          </h2>
          <p className="text-amber-50 text-sm sm:text-base max-w-lg mx-auto mb-8 leading-relaxed">
            Whether you are a dealer looking to partner with us or a customer exploring our range,
            we are ready to help you with product inquiries, pricing, and availability.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-white text-amber-700 font-bold text-sm hover:bg-amber-50 transition-all shadow-xl shadow-amber-900/30 hover:shadow-amber-900/50 active:scale-[0.97] hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Us
            </Link>
            <a
              href={`tel:${company.phone.replace(/\s+/g, "")}`}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-white/15 text-white font-bold text-sm hover:bg-white/25 transition-all shadow-xl ring-1 ring-white/30 active:scale-[0.97] backdrop-blur-sm hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call {company.phone}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
