"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

const CATEGORIES = [
  {
    name: "Bathroom Faucets",
    description: "Wall-mounted, deck-mounted, and pillar taps for every bathroom.",
    icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
    color: "#2563eb",
    bg: "bg-blue-50",
  },
  {
    name: "Kitchen Taps",
    description: "Sink mixers with swivel spouts, pull-out sprays, and more.",
    icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4",
    color: "#059669",
    bg: "bg-emerald-50",
  },
  {
    name: "Shower Mixers",
    description: "Thermostatic and manual mixers with precise temperature control.",
    icon: "M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
    color: "#7c3aed",
    bg: "bg-violet-50",
  },
  {
    name: "Accessories",
    description: "Soap dispensers, towel racks, robe hooks and bathroom essentials.",
    icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
    color: "#ec4899",
    bg: "bg-pink-50",
  },
];

export default function FeaturedCategories() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="relative bg-warm-light py-20 sm:py-28 lg:py-32">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <motion.span
            className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-600 mb-3 block"
            initial={{ opacity: 0, y: 8 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            What We Make
          </motion.span>
          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-[1.15] tracking-tight"
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Product Categories
          </motion.h2>
        </motion.div>

        {/* Category grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{
                duration: 0.5,
                delay: 0.1 + i * 0.08,
                ease: [0.25, 0.46, 0.45, 0.94] as const,
              }}
            >
              <Link href="/search" className="block group">
                <div className="modern-card p-6 sm:p-7">
                  {/* Icon with colored background */}
                  <div
                    className={`w-12 h-12 rounded-xl ${cat.bg} border border-${cat.color}/10 flex items-center justify-center mb-5`}
                  >
                    <svg
                      className="w-6 h-6"
                      style={{ color: cat.color }}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d={cat.icon} />
                    </svg>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-5">{cat.description}</p>

                  <span
                    className="inline-flex items-center gap-1.5 text-sm font-semibold"
                    style={{ color: cat.color }}
                  >
                    Explore
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
