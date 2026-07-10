"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useSpring } from "framer-motion";

/* ── Types ────────────────────────────────────────────────── */
interface Brand {
  name: string;
  description: string;
  imageUrl?: string;
}

/* ── Default brand data with local images (fallback) ─────── */
const DEFAULT_BRANDS: Brand[] = [
  { name: "ACTIVE SERIES", description: "Bath Fittings", imageUrl: "/img/WhatsApp Image 2026-07-09 at 11.30.43 AM.jpeg" },
  { name: "LX SERIES", description: "Bath Fittings", imageUrl: "/img/WhatsApp Image 2026-07-09 at 11.30.44 AM (1).jpeg" },
  { name: "DIAMOND SERIES", description: "Bath Fittings", imageUrl: "/img/WhatsApp Image 2026-07-09 at 11.30.44 AM.jpeg" },
  { name: "ANUTEC", description: "Premium Taps", imageUrl: "/img/WhatsApp Image 2026-07-09 at 11.30.45 AM (1).jpeg" },
  { name: "ACCESSORIES", description: "Marketing & Mfg", imageUrl: "/img/WhatsApp Image 2026-07-09 at 11.30.45 AM (2).jpeg" },
  { name: "PREMIUM", description: "Bathware", imageUrl: "/img/WhatsApp Image 2026-07-09 at 11.30.45 AM.jpeg" },
  { name: "KITCHEN", description: "Sinks & Mixers", imageUrl: "/img/WhatsApp Image 2026-07-09 at 11.30.46 AM.jpeg" },
  { name: "SHOWERS", description: "Rain & Handheld", imageUrl: "/img/WhatsApp Image 2026-07-09 at 11.30.47 AM (1).jpeg" },
];


/* ── 3D Coverflow Galaxy Slider ──────────────────────────── */
export default function BrandGalaxySlider() {
  const [brands, setBrands] = useState<Brand[]>(DEFAULT_BRANDS);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── Spring-animated mouse for smoother parallax ── */
  const springMouseX = useSpring(mouseX, { stiffness: 120, damping: 30 });
  const springMouseY = useSpring(mouseY, { stiffness: 120, damping: 30 });

  /* ── Fetch brands from API ── */
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch("/api/brands");
        const data = await res.json();
        if (data.brands?.length > 0) {
          // Use the API data directly — imageUrl is now managed in the sheet
          const mapped: Brand[] = data.brands.map((b: { name: string; description: string; imageUrl: string }) => ({
            name: b.name,
            description: b.description,
            imageUrl: b.imageUrl || undefined,
          }));
          setBrands(mapped.length >= 2 ? mapped : DEFAULT_BRANDS);
        }
      } catch { /* use defaults */ }
    };
    fetchBrands();
  }, []);

  /* ── Auto-slide ── */
  useEffect(() => {
    if (isPaused || brands.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % brands.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [brands.length, isPaused]);

  /* ── Mouse parallax with spring smoothing ── */
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseX(x * 20);  // much more sensitive
    setMouseY(y * -14);
  }, []);

  const handleMouseEnter = useCallback(() => setIsHovering(true), []);
  const handleMouseLeave = useCallback(() => {
    setMouseX(0);
    setMouseY(0);
    setIsHovering(false);
  }, []);

  const goTo = useCallback((index: number) => {
    setActiveIndex(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 5000);
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % brands.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 5000);
  }, [brands.length]);

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + brands.length) % brands.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 5000);
  }, [brands.length]);

  /* ── Get visible brands ── */
  const getVisibleBrands = () => {
    const visible: { brand: Brand; index: number; offset: number }[] = [];
    for (let offset = -2; offset <= 2; offset++) {
      const idx = (activeIndex + offset + brands.length) % brands.length;
      visible.push({ brand: brands[idx], index: idx, offset });
    }
    return visible;
  };

  if (!brands.length) return null;

  const visibleBrands = getVisibleBrands();

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-indigo-950 py-12 sm:py-16 lg:py-20">
      {/* ── Deep space starfield ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {/* Multi-colored nebula layers */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-gradient-to-br from-blue-500/6 via-indigo-500/6 to-transparent blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-purple-500/6 via-rose-500/3 to-transparent blur-[120px]" />
        <div className="absolute top-1/3 left-0 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-cyan-500/4 to-transparent blur-[100px]" />

        {/* Animated star particles - 3 depth layers */}
        {Array.from({ length: 80 }).map((_, i) => {
          const layer = i < 30 ? 0 : i < 55 ? 1 : 2;
          const size = layer === 0 ? 1 + Math.random() * 1.5 : layer === 1 ? 1.5 + Math.random() * 2 : 2 + Math.random() * 2.5;
          const blur = layer === 2 ? "blur(1px)" : "none";
          const duration = layer === 0 ? 2 + Math.random() * 3 : layer === 1 ? 3 + Math.random() * 4 : 4 + Math.random() * 5;
          return (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: size,
                height: size,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                filter: blur,
                opacity: layer === 0 ? 0.6 : layer === 1 ? 0.4 : 0.2,
              }}
              animate={{
                opacity: [0.1, 0.6 + layer * 0.3, 0.1],
                scale: [1, 1.2 + layer * 0.3, 1],
              }}
              transition={{
                duration,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeInOut",
              }}
            />
          );
        })}

        {/* Shooting star */}
        <motion.div
          className="absolute h-px bg-gradient-to-r from-transparent via-blue-300/60 to-transparent"
          style={{ width: 120, top: "15%", left: "-5%", rotate: -25 }}
          animate={{
            left: ["-5%", "105%"],
            top: ["15%", "25%"],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: 7,
            ease: "linear",
          }}
        />
      </div>

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        style={{ perspective: "800px" }}  /* tighter perspective = more dramatic 3D */
      >
        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-8 sm:mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400" />
            </span>
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">Our Brand Galaxy</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Trusted Brands We Represent
          </h2>
          <p className="text-sm sm:text-base text-blue-200/60 mt-3 max-w-2xl mx-auto">
            Partnering with India&rsquo;s finest sanitaryware and plumbing brands to deliver quality assured products
          </p>
        </motion.div>

        {/* ── 3D Coverflow Carousel ── */}
        <div
          className="relative mx-auto max-w-5xl select-none"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Navigation arrows */}
          <button
            onClick={goPrev}
            className="absolute left-2 sm:left-0 top-1/2 -translate-y-1/2 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 hover:scale-110 transition-all duration-300"
            aria-label="Previous brand"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goNext}
            className="absolute right-2 sm:right-0 top-1/2 -translate-y-1/2 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 hover:scale-110 transition-all duration-300"
            aria-label="Next brand"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* 3D Carousel */}
          <div className="relative flex items-center justify-center h-[400px] sm:h-[480px] lg:h-[580px] overflow-visible">
            <motion.div
              className="relative w-full h-full flex items-center justify-center"
              style={{
                transformStyle: "preserve-3d",
                transform: isHovering
                  ? `rotateX(${springMouseY.get() * 0.4}deg) rotateY(${springMouseX.get() * 0.6}deg)`
                  : "rotateX(3deg) rotateY(0deg)",
              }}
              transition={{ type: "spring", stiffness: 80, damping: 20 }}
            >
              <AnimatePresence mode="popLayout">
                {visibleBrands.map(({ brand, index, offset }) => {
                  const isCenter = offset === 0;
                  const absOffset = Math.abs(offset);

                  // ── Deep 3D transforms ──
                  const rotateY = offset * -35;           // stronger Y rotation for side cards
                  const rotateZ = offset * -4;             // slight Z twist for drama
                  const translateZ = isCenter ? 200 : absOffset === 1 ? -60 : -200;  // extreme Z depth
                  const translateX = offset * (isCenter ? 0 : offset > 0 ? 240 : -240);  // wider spread for bigger cards
                  const scale = isCenter ? 1.05 : 1 - absOffset * 0.22;
                  const opacity = isCenter ? 1 : Math.max(0, 1 - absOffset * 0.35);
                  const blurAmount = isCenter ? 0 : absOffset === 1 ? 3 : 6;

                  return (
                    <motion.div
                      key={`${brand.name}-${index}`}
                      layout
                      initial={{ opacity: 0, scale: 0.5, rotateY: offset * -40, z: -400 }}
                      animate={{
                        opacity,
                        scale,
                        rotateY,
                        rotateZ,
                        x: translateX,
                        z: translateZ,
                      }}
                      exit={{ opacity: 0, scale: 0.5, rotateY: offset * -40, z: -400 }}
                      transition={{
                        type: "spring",
                        stiffness: 220,
                        damping: 24,
                        mass: 1.3,
                      }}
                      className="absolute cursor-pointer select-none"
                      style={{
                        transformStyle: "preserve-3d",
                        filter: `blur(${blurAmount}px)`,
                        zIndex: isCenter ? 50 : 50 - absOffset,
                      }}
                      onClick={() => goTo(index)}
                    >
                      <div
                        className={`relative overflow-hidden transition-all duration-500 ${
                          isCenter
                            ? "rounded-3xl ring-2 ring-white/30 shadow-2xl shadow-blue-600/30"
                            : "rounded-2xl ring-1 ring-white/15 shadow-xl"
                        }`}
                        style={{
                          width: isCenter ? 300 : 210,
                          height: isCenter ? 380 : 260,
                          transform: isCenter ? "translateZ(20px)" : "none",  // extra pop for center
                        }}
                      >
                        {/* Brand Image */}
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900">
                          <Image
                            src={brand.imageUrl || "/img/anutec-logo.svg"}
                            alt={brand.name}
                            fill
                            className="object-cover transition-all duration-700 ease-out hover:scale-110"
                            sizes="(max-width: 640px) 170px, 240px"
                            loading="lazy"
                          />
                        </div>

                        {/* Deep gradient overlay for readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* 3D glossy reflection on center card */}
                        {isCenter && (
                          <>
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent pointer-events-none"
                              animate={{ opacity: [0.2, 0.05, 0.2] }}
                              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            />
                            {/* Hover glow ring */}
                            <div className="absolute -inset-[3px] rounded-[calc(1.5rem+3px)] bg-gradient-to-br from-blue-400/40 via-indigo-500/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10 blur-sm" />
                          </>
                        )}

                        {/* Depth-of-field blur overlay on side cards */}
                        {!isCenter && (
                          <div className="absolute inset-0 backdrop-blur-[1px] bg-black/15" />
                        )}

                        {/* ── Content Overlay ── */}
                        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                          <h3
                            className={`font-bold text-white drop-shadow-xl ${
                              isCenter ? "text-xl" : "text-sm"
                            }`}
                            style={{ transform: "translateZ(10px)" }}
                          >
                            {brand.name}
                          </h3>
                          {isCenter && (
                            <motion.p
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-sm text-blue-200/80 mt-1.5 font-medium"
                              style={{ transform: "translateZ(8px)" }}
                            >
                              {brand.description}
                            </motion.p>
                          )}
                        </div>

                        {/* Featured badge for center */}
                        {isCenter && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
                            className="absolute top-4 right-4"
                            style={{ transform: "translateZ(15px)" }}
                          >
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 backdrop-blur-sm text-[10px] font-bold text-white shadow-lg shadow-blue-600/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                              Featured
                            </span>
                          </motion.div>
                        )}

                        {/* Index badge on side cards */}
                        {!isCenter && (
                          <div
                            className="absolute top-3 left-3 w-7 h-7 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center"
                            style={{ transform: "translateZ(5px)" }}
                          >
                            <span className="text-[10px] font-bold text-white/70">{index + 1}</span>
                          </div>
                        )}

                        {/* 3D edge highlight on center card */}
                        {isCenter && (
                          <div
                            className="absolute inset-0 rounded-3xl pointer-events-none"
                            style={{
                              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.1)",
                              transform: "translateZ(2px)",
                            }}
                          />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* ── Navigation Dots ── */}
          <div className="flex items-center justify-center gap-2.5 mt-10">
            {brands.map((brand, i) => (
              <button
                key={brand.name}
                onClick={() => goTo(i)}
                className={`transition-all duration-700 rounded-full ${
                  i === activeIndex
                    ? "w-10 h-3 bg-gradient-to-r from-blue-400 to-indigo-400 shadow-lg shadow-blue-500/25"
                    : "w-2.5 h-2.5 bg-white/20 hover:bg-white/40 hover:scale-125"
                }`}
                aria-label={`Go to brand ${brand.name}`}
              />
            ))}
          </div>

          {/* ── Brand info indicator ── */}
          <motion.div
            key={brands[activeIndex]?.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-4"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-blue-200/70 backdrop-blur-sm">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
              {brands[activeIndex]?.name}
              <span className="text-blue-300/50">—</span>
              {brands[activeIndex]?.description}
            </span>
          </motion.div>
        </div>

        {/* ── Bottom Trust Strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-14 sm:mt-18 text-center"
        >
          <div className="inline-flex items-center gap-4 px-6 py-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg">
            <div className="flex -space-x-2">
              {["bg-blue-500", "bg-emerald-500", "bg-amber-500"].map((c, i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${c} ring-2 ring-slate-800`} />
              ))}
            </div>
            <span className="text-sm text-blue-200/80">
              <strong className="text-white">{brands.length}+</strong> premium brands &nbsp;·&nbsp;
              <strong className="text-white">ISO 9001</strong> certified &nbsp;·&nbsp;
              Pan India Delivery
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
