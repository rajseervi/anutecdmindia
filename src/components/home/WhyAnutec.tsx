"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const ADVANTAGES = [
  {
    number: "01",
    title: "In-House Manufacturing",
    description:
      "Every product is designed, machined, assembled, and tested in our own facility — zero outsourcing, zero compromises on quality.",
  },
  {
    number: "02",
    title: "Rigorous Quality Testing",
    description:
      "Multi-stage inspection: raw material checks, pressure testing, plating verification, and final assembly Q.C. before shipping.",
  },
  {
    number: "03",
    title: "Pan-India Dealer Network",
    description:
      "Our growing network of authorized dealers across India ensures Anutec products reach customers reliably with full manufacturer backing.",
  },
];

export default function WhyAnutec() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative bg-warm-light py-20 sm:py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section header */}
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-600 mb-3 block">
            Why Choose Us
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-[1.15] tracking-tight">
            The Anutec Advantage
          </h2>
        </motion.div>

        {/* Advantage cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ADVANTAGES.map((item, i) => (
            <motion.div
              key={item.number}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="group"
            >
              <div className="bg-slate-50 rounded-xl border border-slate-100 p-6 sm:p-8 transition-all duration-200 group-hover:border-blue-200 group-hover:bg-blue-50/30 group-hover:shadow-md">
                {/* Number */}
                <span className="text-5xl sm:text-6xl font-bold text-slate-200 group-hover:text-blue-200 transition-colors duration-200 block mb-5 tracking-tight leading-none">
                  {item.number}
                </span>

                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-3">
                  {item.title}
                </h3>

                <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
