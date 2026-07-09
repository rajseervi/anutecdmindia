"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";

const STATS = [
  { value: 200, suffix: "+", label: "Product Variants" },
  { value: 15, suffix: "+", label: "Years Manufacturing" },
  { value: 50, suffix: "+", label: "Dealer Partners" },
  { value: 10000, suffix: "+", label: "Happy Customers" },
];

function AnimatedCounter({
  target,
  suffix,
  label,
  isVisible,
  index,
}: {
  target: number;
  suffix: string;
  label: string;
  isVisible: boolean;
  index: number;
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return () => unsub();
  }, [rounded]);

  useEffect(() => {
    if (!isVisible) return;
    const controls = animate(count, target, {
      duration: 2,
      ease: [0.25, 0.46, 0.45, 0.94],
      delay: 0.15 + index * 0.1,
    });
    return () => controls.stop();
  }, [isVisible, target, count, index]);

  return (
    <div className="text-center">
      <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tabular-nums tracking-tight">
        {display}
        {suffix}
      </p>
      <p className="text-xs sm:text-sm text-white/60 font-medium mt-1">{label}</p>
    </div>
  );
}

export default function StatsCounter() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative bg-gradient-to-br from-slate-800 via-slate-700 to-blue-900 py-16 sm:py-24 overflow-hidden">
      {/* Background dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.03) 0.5px, transparent 0.5px)",
          backgroundSize: "36px 36px",
        }}
      />

      {/* Ambient orbs */}
      <div className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 60%)",
          top: "-20%",
          right: "-10%",
        }}
      />
      <div className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(147,51,234,0.06) 0%, transparent 60%)",
          bottom: "-15%",
          left: "-10%",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm py-12 sm:py-16 px-6 sm:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
            {STATS.map((stat, i) => (
              <AnimatedCounter
                key={stat.label}
                target={stat.value}
                suffix={stat.suffix}
                label={stat.label}
                isVisible={isInView}
                index={i}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
