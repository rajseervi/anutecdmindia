"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";

interface CatalogHeroProps {
  companyName: string;
  phone: string;
}

const TRUST_METRICS = [
  { value: "15+", label: "Years Experience", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
  { value: "200+", label: "Product Variants", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
  { value: "5000+", label: "Happy Clients", icon: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
];

const FLOATING_ICONS = [
  { x: "8%", y: "15%", delay: "0s", icon: "drip" },
  { x: "85%", y: "20%", delay: "0.8s", icon: "shower" },
  { x: "12%", y: "72%", delay: "1.6s", icon: "pipe" },
  { x: "78%", y: "68%", delay: "2.4s", icon: "droplet" },
];

export default function CatalogHero({ companyName, phone }: CatalogHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const sanitizedPhone = useMemo(() => phone.replace(/\s+/g, ""), [phone]);

  /* ── Detect touch device ──────── */
  useEffect(() => {
    const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(hasTouch);
  }, []);

  /* ── Parallax scroll ──────── */
  useEffect(() => {
    const handleScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / window.innerHeight));
      setParallaxOffset(progress * 100);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ── Mouse parallax (desktop only) ── */
  useEffect(() => {
    if (isTouchDevice) return;

    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener("mousemove", handleMouse, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [isTouchDevice]);

  /* ── Entrance animation trigger ── */
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  /* ── Floating icon renderer ── */
  const renderFloatingIcon = (icon: string) => {
    switch (icon) {
      case "drip":
        return (
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
            <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0L12 2.69z" fill="currentColor" opacity="0.15" />
            <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0L12 2.69z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case "shower":
        return (
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
            <path d="M8 19v.01M8 15v.01M12 19v.01M12 15v.01M16 19v.01M16 15v.01M20 10H4a2 2 0 00-2 2v1a2 2 0 002 2h16a2 2 0 002-2v-1a2 2 0 00-2-2zM6 10V6a6 6 0 0112 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );
      case "pipe":
        return (
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
            <rect x="2" y="6" width="20" height="4" rx="2" fill="currentColor" opacity="0.15" />
            <rect x="2" y="6" width="20" height="4" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="18" cy="8" r="1.5" fill="currentColor" />
          </svg>
        );
      case "droplet":
        return (
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
            <path d="M12 3c-3.314 3.314-6 6.793-6 10a6 6 0 0012 0c0-3.207-2.686-6.686-6-10z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 18a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-dvh min-h-[568px] overflow-hidden bg-slate-950 text-white noise-overlay"
      aria-label="Hero banner"
    >
      {/* ── Animated gradient orbs (background) ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[300px] sm:w-[500px] md:w-[600px] h-[300px] sm:h-[500px] md:h-[600px] rounded-full bg-gradient-to-br from-indigo-600/30 via-blue-500/20 to-cyan-400/10 blur-3xl animate-float-slow"
          style={
            isTouchDevice
              ? { left: "-200px", top: "-100px" }
              : {
                  left: `${-200 + mousePos.x * 100}px`,
                  top: `${-100 + parallaxOffset * 2}px`,
                }
          }
        />
        <div
          className="absolute w-[250px] sm:w-[400px] md:w-[500px] h-[250px] sm:h-[400px] md:h-[500px] rounded-full bg-gradient-to-tr from-amber-500/20 via-orange-400/15 to-yellow-300/10 blur-3xl animate-float-delayed"
          style={
            isTouchDevice
              ? { right: "-100px", bottom: "-80px" }
              : {
                  right: `${-150 + mousePos.y * 80}px`,
                  bottom: `${-80 - parallaxOffset * 1.5}px`,
                }
          }
        />
        {/* Third orb — hidden on mobile for performance */}
        {!isTouchDevice && (
          <div
            className="hidden sm:block absolute w-[350px] h-[350px] rounded-full bg-gradient-to-r from-pink-500/15 to-rose-400/10 blur-3xl animate-float"
            style={{
              left: `${40 + mousePos.x * 60}%`,
              top: `${30 - mousePos.y * 40}%`,
            }}
          />
        )}
      </div>

      {/* ── Subtle grid pattern ── */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── Floating UI icons (desktop only) ── */}
      {!isTouchDevice && (
        <div className="hidden sm:block absolute inset-0 pointer-events-none overflow-hidden">
          {FLOATING_ICONS.map((item, i) => (
            <div
              key={i}
              className="absolute text-white/15 animate-float"
              style={{
                left: item.x,
                top: item.y,
                animationDelay: item.delay,
              }}
            >
              {renderFloatingIcon(item.icon)}
            </div>
          ))}
        </div>
      )}

      {/* ── Content ── */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 sm:py-20 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center">

            {/* ── Left: Text Content ── */}
            <div className={`space-y-5 sm:space-y-6 lg:space-y-8 transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-cyan-300 text-[11px] sm:text-xs font-semibold tracking-wide"
                style={isTouchDevice ? undefined : { transform: `translateY(${parallaxOffset * -0.3}px)` }}
              >
                <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-cyan-400" />
                </span>
                <span className="hidden xs:inline">Indian Manufacturer — Premium Taps & Faucets</span>
                <span className="xs:hidden">Premium Taps & Faucets</span>
              </div>

              {/* Headline */}
              <h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight text-balance"
                style={isTouchDevice ? undefined : { transform: `translateY(${parallaxOffset * -0.15}px)` }}
              >
                Precision-Engineered{" "}
                <span className="gradient-text">
                  Taps & Faucets
                </span>{" "}
                for Modern Indian Bathrooms
              </h1>

              {/* Description */}
              <p
                className="text-sm sm:text-base md:text-lg text-slate-300/90 leading-relaxed max-w-xl text-balance"
                style={isTouchDevice ? undefined : { transform: `translateY(${parallaxOffset * -0.08}px)` }}
              >
                {companyName} manufactures high-quality bathroom faucets, kitchen taps, shower mixers,
                and accessories — combining precision engineering with elegant design. Built to last,
                designed to impress.
              </p>

              {/* Trust metrics — horizontal on desktop, wrapped grid on mobile */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 py-1 sm:py-2">
                {TRUST_METRICS.map((metric, i) => (
                  <div key={i} className="flex items-center gap-2 sm:gap-2.5">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 backdrop-blur-sm">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d={metric.icon} />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm sm:text-base md:text-lg font-bold text-white leading-none">{metric.value}</p>
                      <p className="text-[9px] sm:text-[10px] md:text-xs text-slate-400 tracking-wide uppercase">{metric.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTAs — stacked on mobile, inline on desktop */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2">
                <a
                  href={`tel:${sanitizedPhone}`}
                  className="group inline-flex items-center gap-2.5 px-5 py-3.5 sm:px-6 sm:py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-sm shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 active:scale-[0.97] justify-center"
                  aria-label={`Call ${companyName} at ${phone}`}
                >
                  <span className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </span>
                  <span>
                    <span className="block text-[10px] uppercase tracking-widest opacity-70">Call Now</span>
                    {phone}
                  </span>
                </a>
                <Link
                  href="#products"
                  className="group inline-flex items-center gap-2.5 px-5 py-3.5 sm:px-6 sm:py-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-sm backdrop-blur-sm transition-all duration-300 hover:border-white/20 justify-center"
                >
                  Browse Products
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* ── Right: Premium Visual (desktop only — hidden on mobile via CSS) ── */}
            <div
              className="hidden lg:flex items-center justify-center"
              style={isTouchDevice ? undefined : { transform: `translateY(${parallaxOffset * -0.4}px)` }}
            >
              <div
                className="relative w-80 h-80 xl:w-96 xl:h-96"
                style={
                  isTouchDevice
                    ? undefined
                    : {
                        transform: `perspective(1000px) rotateY(${(mousePos.x - 0.5) * 8}deg) rotateX(${(0.5 - mousePos.y) * 8}deg)`,
                        transition: "transform 0.2s ease-out",
                      }
                }
              >
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border border-white/10 animate-spin-slow" style={{ animationDirection: "reverse" }} />
                <div className="absolute inset-4 rounded-full border border-dashed border-white/8 animate-spin-slow" />

                {/* Glowing core */}
                <div className="absolute inset-8 rounded-full bg-gradient-to-br from-indigo-500/20 via-blue-500/15 to-cyan-400/10 blur-sm" />
                <div className="absolute inset-12 rounded-full bg-gradient-to-br from-indigo-400/15 to-cyan-400/10 animate-pulse-glow" />

                {/* Center faucet icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className="text-white/70 drop-shadow-2xl">
                      <rect x="50" y="82" width="40" height="8" rx="4" fill="currentColor" opacity="0.5" />
                      <rect x="56" y="28" width="28" height="54" rx="6" fill="currentColor" opacity="0.7" />
                      <path d="M56 36c0 0 0 24 20 24s20-12 20-12" stroke="currentColor" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.8" />
                      <rect x="84" y="22" width="8" height="20" rx="4" fill="currentColor" opacity="0.65" />
                      <circle cx="88" cy="18" r="6" fill="currentColor" opacity="0.6" />
                      <circle cx="96" cy="52" r="4" fill="currentColor" opacity="0.5" className="animate-bounce" />
                      <circle cx="98" cy="62" r="3" fill="currentColor" opacity="0.35" />
                      <circle cx="95" cy="70" r="2" fill="currentColor" opacity="0.2" />
                    </svg>
                    <div className="absolute inset-0 bg-gradient-to-t from-cyan-400/30 to-transparent rounded-full blur-2xl -z-10 scale-150" />
                  </div>
                </div>

                {/* Corner brand dots */}
                <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/20 flex items-center justify-center text-[11px] font-bold text-indigo-300 backdrop-blur-sm">
                  A
                </div>
                <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/20 flex items-center justify-center text-[11px] font-bold text-cyan-300 backdrop-blur-sm">
                  Q
                </div>
                <div className="absolute bottom-10 left-8 w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/20 flex items-center justify-center text-[9px] font-bold text-amber-300 backdrop-blur-sm">
                  ✓
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 sm:gap-3">
        <span className="text-[9px] sm:text-[10px] text-white/40 tracking-[0.25em] uppercase font-semibold">Scroll to explore</span>
        <div className="w-5 h-8 sm:w-6 sm:h-10 rounded-full border-2 border-white/15 flex items-start justify-center p-1 sm:p-1.5">
          <div className="w-1 h-2.5 sm:w-1.5 sm:h-3 rounded-full bg-white/40 animate-bounce" />
        </div>
      </div>

      {/* ── Bottom gradient fade into content ── */}
      <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
    </section>
  );
}
