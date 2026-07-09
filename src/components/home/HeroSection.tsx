"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const BackgroundPaths = dynamic(
  () => import("@/components/ui/modern-background-paths"),
  { ssr: false }
);

interface HeroSectionProps {
  companyName: string;
  phone: string;
}

const TRUST_ITEMS = [
  { label: "ISO 9001 Certified" },
  { label: "15+ Years Experience" },
  { label: "200+ Product Variants" },
  { label: "5,000+ Happy Clients" },
];

/* ------------------------------------------------------------------ */
/* Deterministic seeded random for SSR-safe SVG patterns              */
/* ------------------------------------------------------------------ */

function seededRandom(seed: number) {
  return () => {
    seed = (seed * 16807 + 0) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const RNG = seededRandom(42);
function rand() {
  return RNG();
}

/* ------------------------------------------------------------------ */
/* Background pattern components (from demo page)                     */
/* ------------------------------------------------------------------ */

function NeuralPaths() {
  const nodes = Array.from({ length: 30 }, (_, i) => ({
    x: rand() * 800,
    y: rand() * 600,
    id: `node-${i}`,
  }));

  const connections: { id: string; d: string; delay: number }[] = [];
  nodes.forEach((node, i) => {
    const nearby = nodes.filter((other, j) => {
      if (i === j) return false;
      const dist = Math.sqrt(Math.pow(node.x - other.x, 2) + Math.pow(node.y - other.y, 2));
      return dist < 120 && rand() > 0.6;
    });
    nearby.forEach((target) => {
      connections.push({
        id: `conn-${i}-${target.id}`,
        d: `M${node.x},${node.y} L${target.x},${target.y}`,
        delay: rand() * 8,
      });
    });
  });

  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 600">
      {connections.map((conn) => (
        <motion.path
          key={conn.id}
          d={conn.d}
          stroke="currentColor"
          strokeWidth="0.4"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 0], opacity: [0, 0.35, 0] }}
          transition={{ duration: 6, delay: conn.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
       
      {nodes.map((node) => (
        <motion.circle
          key={node.id}
          cx={node.x}
          cy={node.y}
          r="2"
          fill="currentColor"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1, 1.2, 1], opacity: [0, 0.25, 0.35, 0.25] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
}

function FlowPaths() {
  const flows = Array.from({ length: 8 }, (_, i) => ({
    id: `flow-${i}`,
    d: `M-100,${200 + i * 60} Q200,${200 + i * 60 - (40 + i * 8)} 500,${200 + i * 60} T900,${200 + i * 60}`,
    strokeWidth: 0.8 + i * 0.2,
    opacity: 0.06 + i * 0.03,
    delay: i * 0.8,
  }));

  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 800">
      {flows.map((f) => (
        <motion.path
          key={f.id}
          d={f.d}
          fill="none"
          stroke="currentColor"
          strokeWidth={f.strokeWidth}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{
            pathLength: [0, 1, 0.8, 0],
            opacity: [0, f.opacity, f.opacity * 0.6, 0],
          }}
          transition={{ duration: 15, delay: f.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
}

function GeometricPaths() {
  const gridSize = 40;
  const paths: { id: string; d: string; delay: number }[] = [];
  for (let x = 0; x < 20; x++) {
    for (let y = 0; y < 12; y++) {
      if (rand() > 0.7) {
        paths.push({
          id: `grid-${x}-${y}`,
          d: `M${x * gridSize},${y * gridSize} L${(x + 1) * gridSize},${y * gridSize} L${(x + 1) * gridSize},${(y + 1) * gridSize} L${x * gridSize},${(y + 1) * gridSize} Z`,
          delay: rand() * 5,
        });
      }
    }
  }
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 480">
      {paths.map((p) => (
        <motion.path
          key={p.id}
          d={p.d}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 0], opacity: [0, 0.3, 0] }}
          transition={{ duration: 8, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
}

function HeroBackground() {
  const [mounted, setMounted] = useState(false);
  const [patternIdx, setPatternIdx] = useState(0);
  const patterns = ["neural", "flow", "geometric"];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      setPatternIdx((prev) => (prev + 1) % patterns.length);
    }, 12000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  const render = () => {
    switch (patternIdx) {
      case 0: return <NeuralPaths />;
      case 1: return <FlowPaths />;
      case 2: return <GeometricPaths />;
      default: return <NeuralPaths />;
    }
  };

  if (!mounted) {
    return <div className="absolute inset-0 pointer-events-none" />;
  }

  return (
    <div className="absolute inset-0 pointer-events-none text-amber-900/20">
      <AnimatePresence mode="wait">
        <motion.div
          key={patternIdx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
        >
          {render()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero Section                                                       */
/* ------------------------------------------------------------------ */

export default function HeroSection({ companyName: _companyName, phone }: HeroSectionProps) {
  const sanitizedPhone = useMemo(() => phone.replace(/\s+/g, ""), [phone]);

  return (
    <section
      className="relative w-full min-h-[100dvh] bg-gradient-to-br from-amber-50 via-orange-50/40 to-white flex items-center overflow-hidden"
      aria-label="Hero banner"
    >
      {/* ── Animated demo-style background patterns ── */}
      <HeroBackground />
    
      {/* Warm dot grid (subtle on top) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(217,119,6,0.03) 0.5px, transparent 0.5px)",
          backgroundSize: "48px 48px",
        }}
      />
      

      {/* Subtle warm gradient orbs */}
      <div className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 60%)",
          top: "-20%",
          right: "-10%",
        }}
      />
      <div className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 60%)",
          bottom: "-10%",
          left: "-5%",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24 sm:py-32 lg:py-36">
<BackgroundPaths title="Anutec Taps" />
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">

          {/* ── Left: Text ── */}
          <div className="lg:col-span-7 space-y-8">
            {/* Status pill */}
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-amber-50 border border-amber-200/60 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400/60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
                <span className="text-xs sm:text-sm font-semibold text-amber-700">
                  Premium Indian Manufacturer
                </span>
              </div>
            </motion.div>

            {/* Main headline */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight"
              >
                <span className="gradient-text">Anutec</span>
                <br />
                <span className="text-slate-900">Taps & Faucets</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-slate-400 leading-[1.2] tracking-tight"
              >
                Precision engineered.
                <br />
                Built to last.
              </motion.p>
            </div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.5 }}
              className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-md"
            >
              India-manufactured bathroom faucets, kitchen taps, and shower
              mixers that combine craftsmanship with durability. No shortcuts
              — just quality that speaks for itself.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1"
            >
              <Link
                href="/search"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-500 transition-all duration-200 shadow-lg shadow-blue-600/15 hover:shadow-blue-500/25"
              >
                Explore Products
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>

              <a
                href={`tel:${sanitizedPhone}`}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-amber-50 text-amber-800 font-semibold text-sm rounded-xl border border-amber-200 hover:bg-amber-100 hover:border-amber-300 transition-all duration-200"
              >
                <svg
                  className="w-4 h-4 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {phone}
              </a>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-8 border-t border-slate-200"
            >
              {TRUST_ITEMS.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.85 + i * 0.08, duration: 0.35 }}
                  className="flex items-center gap-2"
                >
                  <svg
                    className="w-3.5 h-3.5 text-blue-500 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* ── Right: Visual ── */}
          <motion.div
            className="hidden lg:flex lg:col-span-5 items-center justify-center"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="relative w-80 h-80 xl:w-[420px] xl:h-[420px]">
              {/* Concentric rings */}
              <motion.div
                className="absolute inset-0 rounded-full border border-slate-300/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-8 rounded-full border border-slate-300/20"
                animate={{ rotate: -360 }}
                transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-16 rounded-full border border-dashed border-slate-300/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
              />

              {/* Glow center */}
              <motion.div
                className="absolute inset-12 rounded-full bg-blue-400/10 blur-3xl"
                animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Center faucet illustration */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  width="170"
                  height="190"
                  viewBox="0 0 170 190"
                  fill="none"
                  className="drop-shadow-[0_0_40px_rgba(37,99,235,0.1)]"
                >
                  <rect x="50" y="118" width="70" height="10" rx="5" fill="#2563eb" opacity="0.08" />
                  <rect x="55" y="114" width="60" height="4" rx="2" fill="#2563eb" opacity="0.06" />
                  <rect x="62" y="44" width="46" height="70" rx="12" fill="#2563eb" opacity="0.06" />
                  <rect x="64" y="46" width="42" height="66" rx="10" fill="#2563eb" opacity="0.04" />
                  <path
                    d="M62 58c0 0 0 36 28 36s28-20 28-20"
                    stroke="#2563eb"
                    strokeWidth="10"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.08"
                  />
                  <path
                    d="M62 58c0 0 0 36 28 36s28-20 28-20"
                    stroke="#2563eb"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.7"
                  />
                  <rect x="112" y="34" width="12" height="34" rx="6" fill="#2563eb" opacity="0.08" />
                  <rect x="113" y="35" width="10" height="32" rx="5" fill="#2563eb" opacity="0.35" />
                  <circle cx="118" cy="28" r="10" fill="#2563eb" opacity="0.06" />
                  <circle cx="118" cy="28" r="5" fill="#2563eb" opacity="0.35" />
                  <motion.circle
                    cx="82" cy="140" r="4"
                    fill="#2563eb" opacity="0.4"
                    animate={{ y: [0, 12, 0], opacity: [0.4, 0.15, 0.4] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <circle cx="86" cy="150" r="2.5" fill="#2563eb" opacity="0.25" />
                  <circle cx="80" cy="158" r="1.8" fill="#2563eb" opacity="0.15" />
                </svg>
              </div>

              {/* Floating badges */}
              <motion.div
                className="absolute -top-2 -left-4 px-4 py-2.5 rounded-xl bg-white border border-slate-200 shadow-lg shadow-black/[0.04]"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="text-xs font-semibold text-blue-600 tracking-wide">
                  Made in India
                </span>
              </motion.div>
              <motion.div
                className="absolute -bottom-2 -right-4 px-4 py-2.5 rounded-xl bg-white border border-slate-200 shadow-lg shadow-black/[0.04]"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <span className="text-xs font-semibold text-slate-600 tracking-wide">
                  ISO 9001
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        <motion.span
          className="text-[10px] text-slate-300 tracking-[0.35em] uppercase font-medium"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          Scroll
        </motion.span>
        <div className="w-5 h-9 rounded-full border border-slate-300 flex items-start justify-center p-1">
          <motion.div
            className="w-1 h-2.5 rounded-full bg-blue-400/60"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#faf9f6] to-transparent pointer-events-none" />
      
    </section>
  );
}
