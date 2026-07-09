"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Banner } from "@/types/banner";

interface HeroSliderProps {
  banners: Banner[];
  companyName: string;
  phone: string;
}

export default function HeroSlider({ banners }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [slideKey, setSlideKey] = useState(0);
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const totalSlides = banners.length;

  /* ── Detect touch device ── */
  useEffect(() => {
    const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(hasTouch);
  }, []);

  /* ── Parallax: scroll-based offset ── */
  useEffect(() => {
    const handleScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const progress = Math.max(0, Math.min(1, -rect.top / viewportH));
      setParallaxOffset(progress * 120);
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

  const goToSlide = useCallback((index: number) => {
    const newIndex = ((index % totalSlides) + totalSlides) % totalSlides;
    setCurrentSlide(newIndex);
    setSlideKey((k) => k + 1);
  }, [totalSlides]);

  const goNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
    setSlideKey((k) => k + 1);
  }, [totalSlides]);

  const goPrev = useCallback(() => {
    setCurrentSlide((prev) => ((prev - 1) % totalSlides + totalSlides) % totalSlides);
    setSlideKey((k) => k + 1);
  }, [totalSlides]);

  /* ── Autoplay with progress bar ── */
  useEffect(() => {
    if (!isAutoPlaying || totalSlides <= 1) return;

    if (progressRef.current) {
      progressRef.current.style.animation = "none";
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      progressRef.current.offsetHeight;
      progressRef.current.style.animation = "";
    }

    intervalRef.current = setInterval(goNext, 6000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAutoPlaying, totalSlides, goNext, currentSlide]);

  const resumeAutoplay = useCallback(() => {
    setTimeout(() => setIsAutoPlaying(true), 8000);
  }, []);

  const handleSwipe = useCallback((startX: number, endX: number) => {
    const distance = startX - endX;
    const threshold = 50;
    if (Math.abs(distance) > threshold) {
      if (distance > 0) goNext();
      else goPrev();
    }
  }, [goNext, goPrev]);

  /* ── Touch handlers ── */
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setIsDragging(true);
    setIsAutoPlaying(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    handleSwipe(touchStartX, touchEndX);
    resumeAutoplay();
  };

  /* ── Mouse drag handlers (desktop) ── */
  const handleMouseDown = (e: React.MouseEvent) => {
    setTouchStartX(e.clientX);
    setIsDragging(true);
    setIsAutoPlaying(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTouchEndX(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    handleSwipe(touchStartX, touchEndX);
    resumeAutoplay();
  };

  /* ── Keyboard nav ── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { goPrev(); setIsAutoPlaying(false); resumeAutoplay(); }
      if (e.key === "ArrowRight") { goNext(); setIsAutoPlaying(false); resumeAutoplay(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goPrev, goNext, resumeAutoplay]);

  if (totalSlides === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="group relative w-full h-dvh min-h-[480px] overflow-hidden bg-slate-950 select-none"
      aria-label="Featured promotions carousel"
      role="region"
      aria-roledescription="carousel"
    >
      {/* ── Slides ── */}
      <div
        className="flex h-full transition-transform duration-700 ease-out cursor-grab active:cursor-grabbing"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { if (isDragging) { setIsDragging(false); resumeAutoplay(); } }}
      >
        {banners.map((banner, index) => {
          const isActive = currentSlide === index;
          return (
            <div
              key={`${banner.id}-${index}`}
              className="min-w-full h-full relative"
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${index + 1} of ${totalSlides}: ${banner.title}`}
              aria-hidden={!isActive}
            >
              {/* Parallax image wrapper */}
              <div className="absolute inset-0 overflow-hidden">
                <div
                  className="absolute inset-0 will-change-transform"
                  style={
                    isTouchDevice
                      ? { transform: `translateY(${parallaxOffset}px)` }
                      : { transform: `translateY(${parallaxOffset}px) translateX(${(mousePos.x - 0.5) * -12}px)` }
                  }
                >
                  {banner.imageUrl ? (
                    <Image
                      src={banner.imageUrl}
                      alt={banner.title || `Banner ${index + 1}`}
                      fill
                      className="object-cover"
                      style={{
                        transform: isActive ? "scale(1.12)" : "scale(1.05)",
                        transition: "transform 10000ms linear",
                      }}
                      priority={index === 0}
                      sizes="100vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" />
                  )}
                </div>
              </div>

              {/* ── Premium Overlays ── */}

              {/* Dark gradient left side */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent z-[2]" />

              {/* Bottom gradient */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent z-[2]" />

              {/* Subtle noise texture */}
              <div className="absolute inset-0 z-[3] pointer-events-none noise-overlay" />

              {/* ── Content overlay ── */}
              <div className="absolute inset-0 flex items-center z-[4]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div
                    key={`content-${slideKey}-${index}`}
                    className={`max-w-xl lg:max-w-2xl transition-all duration-700 ease-out ${
                      isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                    }`}
                    style={{ transitionDelay: isActive ? "200ms" : "0ms" }}
                  >
                    {/* Subtitle badge */}
                    {banner.subtitle && (
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 border border-white/10 text-blue-300 text-[11px] sm:text-xs font-semibold tracking-wide mb-4 sm:mb-5 backdrop-blur-sm transition-all duration-700 ease-out ${
                          isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                        }`}
                        style={{ transitionDelay: isActive ? "250ms" : "0ms" }}
                      >
                        <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-blue-400" />
                        </span>
                        {banner.subtitle}
                      </div>
                    )}

                    {/* Title */}
                    <h2
                      className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-[1.08] tracking-tight mb-3 sm:mb-4 drop-shadow-2xl transition-all duration-700 ease-out ${
                        isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                      }`}
                      style={{ transitionDelay: isActive ? "350ms" : "0ms" }}
                    >
                      {banner.title}
                    </h2>

                    {/* Description */}
                    {banner.description && (
                      <p
                        className={`text-xs sm:text-sm md:text-base lg:text-lg text-slate-200/90 leading-relaxed mb-6 sm:mb-8 max-w-lg line-clamp-2 sm:line-clamp-3 transition-all duration-700 ease-out ${
                          isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                        }`}
                        style={{ transitionDelay: isActive ? "450ms" : "0ms" }}
                      >
                        {banner.description}
                      </p>
                    )}

                    {/* CTA */}
                    {banner.ctaText && (
                      <div
                        className={`transition-all duration-700 ease-out ${
                          isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                        }`}
                        style={{ transitionDelay: isActive ? "550ms" : "0ms" }}
                      >
                        <Link
                          href={banner.ctaLink || "/"}
                          className="group inline-flex items-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-blue-900/30 hover:shadow-blue-900/50 transition-all duration-300 active:scale-[0.97]"
                        >
                          {banner.ctaText}
                          <svg
                            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Slide counter (top-right) — hidden on small mobile, shown on wider ── */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[4] glass-dark rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-mono text-white/60 tracking-wider">
                <span className="text-white font-bold">{String(index + 1).padStart(2, "0")}</span>{" "}
                / {String(totalSlides).padStart(2, "0")}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Nav arrows — always visible on mobile, hover on desktop ── */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={() => { goPrev(); setIsAutoPlaying(false); resumeAutoplay(); }}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-[5] w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-all duration-300 active:scale-95 shadow-lg lg:opacity-80 lg:hover:opacity-100"
            aria-label="Previous slide"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => { goNext(); setIsAutoPlaying(false); resumeAutoplay(); }}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-[5] w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-all duration-300 active:scale-95 shadow-lg lg:opacity-80 lg:hover:opacity-100"
            aria-label="Next slide"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* ── Scroll-down indicator ── */}
      <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-[5] flex flex-col items-center gap-2 sm:gap-3">
        <span className="text-[9px] sm:text-[10px] text-white/40 tracking-[0.25em] uppercase font-semibold">Scroll to explore</span>
        <div className="w-5 h-8 sm:w-6 sm:h-10 rounded-full border-2 border-white/15 flex items-start justify-center p-1 sm:p-1.5">
          <div className="w-1 h-2.5 sm:w-1.5 sm:h-3 rounded-full bg-white/40 animate-bounce" />
        </div>
      </div>

      {/* ── Dot indicators ── */}
      {totalSlides > 1 && (
        <div className="absolute bottom-24 sm:bottom-32 md:bottom-36 left-1/2 -translate-x-1/2 z-[5] flex items-center gap-2 sm:gap-2.5">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => { goToSlide(index); setIsAutoPlaying(false); resumeAutoplay(); }}
              className={`transition-all duration-500 ease-out rounded-full ${
                currentSlide === index
                  ? "w-6 sm:w-8 h-2 sm:h-2.5 bg-gradient-to-r from-blue-400 to-indigo-400 shadow-lg shadow-blue-400/40"
                  : "w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/30 hover:bg-white/60 active:scale-125"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* ── Progress bar ── */}
      {totalSlides > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/5 z-[5]">
          <div
            ref={progressRef}
            key={`progress-${slideKey}`}
            className="h-full bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-400 rounded-r-full animate-progress-slide"
            style={{
              animation: `progressFill 6000ms linear forwards`,
            }}
          />
        </div>
      )}
    </section>
  );
}
