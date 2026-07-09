"use client";

import { useRef, useMemo } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

interface CTABannerProps {
  phone: string;
}

export default function CTABanner({ phone }: CTABannerProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const sanitizedPhone = useMemo(() => phone.replace(/\s+/g, ""), [phone]);

  return (
    <section ref={sectionRef} className="relative bg-gradient-to-br from-slate-800 via-slate-700 to-blue-900 py-20 sm:py-28 lg:py-32 overflow-hidden">
      {/* Background pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.04) 0.5px, transparent 0.5px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Ambient orbs */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 60%)",
          top: "-20%",
          right: "-10%",
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(147,51,234,0.08) 0%, transparent 60%)",
          bottom: "-15%",
          left: "-10%",
        }}
      />

      {/* Content */}
      <div className="relative max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-blue-300 mb-6"
          >
            Get In Touch
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-5 max-w-3xl mx-auto"
          >
            Ready to upgrade
            <br />
            your bathroom
            <span className="text-blue-300">?</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg mx-auto mb-10"
          >
            Whether you{"'"}re a dealer or a customer, we{"'"}re here to help with
            product inquiries, pricing, and availability.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/contact"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-800 font-semibold text-sm rounded-xl hover:bg-slate-50 transition-all duration-200 shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Us
              <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>

            <a
              href={`tel:${sanitizedPhone}`}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-white/10 text-white font-semibold text-sm rounded-xl border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call {phone}
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
