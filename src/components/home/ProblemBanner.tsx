"use client";

import { useRef } from "react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const SOLUTIONS = [
  {
    title: "In-House Manufacturing",
    desc: "Designed, machined, and assembled in our own facility — zero outsourcing.",
  },
  {
    title: "Multi-Stage Quality Testing",
    desc: "Pressure tests, plating checks, and final Q.C. at every production step.",
  },
  {
    title: "Corrosion-Resistant Plating",
    desc: "Advanced electroplating that withstands years of daily use.",
  },
];

export default function ProblemBanner() {
  const ref = useRef<HTMLElement>(null);

  return (
    <section ref={ref} className="relative bg-warm-light py-20 sm:py-28 lg:py-32 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          {/* ── Left: Problem ── */}
          <motion.div
            className="lg:col-span-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
            }}
          >
            <motion.span variants={fadeUp} className="inline-block text-xs font-semibold uppercase tracking-[0.15em] text-blue-600 mb-5">
              The Problem
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-[1.12] tracking-tight mb-5">
              Taps that leak,
              <br />
              tarnish, or look
              <br />
              outdated.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-md">
              Cheap materials, poor plating, and zero testing mean most
              bathroom fixtures fail within months. You deserve better.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex gap-3">
              {["Leaks", "Rust", "Tarnish"].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-semibold border border-red-200"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {item}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Center: Divider ── */}
          <motion.div
            className="hidden lg:flex lg:col-span-2 justify-center pt-4"
            initial={{ opacity: 0, scaleY: 0 }}
            whileInView={{ opacity: 1, scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-px flex-1 bg-gradient-to-b from-transparent via-slate-200 to-transparent" />
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
              <div className="w-px flex-1 bg-gradient-to-b from-transparent via-slate-200 to-transparent" />
            </div>
          </motion.div>

          {/* ── Right: Solution ── */}
          <motion.div
            className="lg:col-span-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
            }}
          >
            <motion.span variants={fadeUp} className="inline-block text-xs font-semibold uppercase tracking-[0.15em] text-blue-600 mb-5">
              The Solution
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-[1.12] tracking-tight mb-2">
              <span className="gradient-text">Anutec</span>
              <br />
              <span className="text-slate-400 font-light text-4xl">Precision manufactured.</span>
            </motion.h2>

            <motion.div variants={fadeUp} className="mt-8 space-y-4">
              {SOLUTIONS.map((sol, i) => (
                <motion.div
                  key={sol.title}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.12, duration: 0.4 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{sol.title}</h4>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-0.5">{sol.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
