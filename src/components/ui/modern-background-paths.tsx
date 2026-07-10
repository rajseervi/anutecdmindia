"use client";

import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef, useCallback } from "react";

/* ------------------------------------------------------------------ */
/* Deterministic seeded random                                        */
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
/* Cursor Glow                                                         */
/* ------------------------------------------------------------------ */
function CursorGlow({
  mouseX,
  mouseY,
  isMoving,
}: {
  mouseX: number;
  mouseY: number;
  isMoving: boolean;
}) {
  const springX = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 20 });

  return (
    <motion.div
      className="fixed pointer-events-none z-50"
      style={{
        left: springX,
        top: springY,
        x: "-50%",
        y: "-50%",
        width: 200,
        height: 200,
        background:
          "radial-gradient(circle, rgba(59,130,246,0.12) 0%, rgba(147,51,234,0.06) 40%, transparent 70%)",
        borderRadius: "50%",
        opacity: isMoving ? 0.9 : 0.3,
        transition: "opacity 0.4s ease",
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Click Ripple                                                        */
/* ------------------------------------------------------------------ */
interface Ripple {
  id: number;
  x: number;
  y: number;
}

function ClickRipples() {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const id = nextId.current++;
      setRipples((prev) => [...prev.slice(-12), { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 1200);
    };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  return (
    <>
      {ripples.map((r) => (
        <motion.div
          key={r.id}
          className="fixed pointer-events-none z-40"
          style={{ left: r.x, top: r.y, x: "-50%", y: "-50%" }}
          initial={{ width: 0, height: 0, opacity: 0.5, borderWidth: 2 }}
          animate={{ width: 120, height: 120, opacity: 0, borderWidth: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <div className="w-full h-full rounded-full border border-blue-400/40" />
        </motion.div>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Interactive Particles (cursor-aware)                                */
/* ------------------------------------------------------------------ */
function InteractiveParticles({
  mouseX,
  mouseY,
}: {
  mouseX: number;
  mouseY: number;
}) {
  const particles = useRef(
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      baseX: rand() * 800,
      baseY: rand() * 600,
      size: 1.5 + rand() * 3,
      speed: 0.3 + rand() * 0.7,
      phase: rand() * Math.PI * 2,
    }))
  ).current;

  const [winW, setWinW] = useState(1200);
  const [winH, setWinH] = useState(800);

  useEffect(() => {
    setWinW(window.innerWidth);
    setWinH(window.innerHeight);
    const onResize = () => {
      setWinW(window.innerWidth);
      setWinH(window.innerHeight);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox={`0 0 ${winW} ${winH}`}
    >
      {particles.map((p) => {
        // Map mouse from window coords to viewBox coords (rough)
        const mx = (mouseX / winW) * winW;
        const my = (mouseY / winH) * winH;
        // Attraction radius
        const dx = mx - p.baseX;
        const dy = my - p.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const influence = dist < 250 ? (1 - dist / 250) * 40 : 0;
        const ax = dx > 0 ? influence : -influence;
        const ay = dy > 0 ? influence : -influence;

        return (
          <motion.circle
            key={p.id}
            cx={p.baseX + ax}
            cy={p.baseY + ay}
            r={p.size}
            fill="currentColor"
            className="text-blue-500/30"
            animate={{
              opacity: [0.2, 0.6, 0.2],
              r: [p.size, p.size * 1.8, p.size],
            }}
            transition={{
              duration: 4 + p.speed * 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: p.phase,
            }}
            style={{
              transition: "cx 0.3s ease-out, cy 0.3s ease-out",
            }}
          />
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Geometric Grid Paths                                                */
/* ------------------------------------------------------------------ */
function GeometricPaths() {
  const gridSize = 40;
  const paths: { id: string; d: string; delay: number }[] = [];

  for (let x = 0; x < 20; x++) {
    for (let y = 0; y < 12; y++) {
      if (rand() > 0.7) {
        paths.push({
          id: `grid-${x}-${y}`,
          d: `M${x * gridSize},${y * gridSize} L${(x + 1) * gridSize},${y * gridSize} L${
            (x + 1) * gridSize
          },${(y + 1) * gridSize} L${x * gridSize},${(y + 1) * gridSize} Z`,
          delay: rand() * 5,
        });
      }
    }
  }

  return (
    <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 800 480">
      {paths.map((path) => (
        <motion.path
          key={path.id}
          d={path.d}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: [0, 1, 0],
            opacity: [0, 0.6, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 8,
            delay: path.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Flow Paths                                                          */
/* ------------------------------------------------------------------ */
function FlowPaths() {
  const flowPaths = Array.from({ length: 12 }, (_, i) => {
    const amplitude = 50 + i * 10;
    const offset = i * 60;

    return {
      id: `flow-${i}`,
      d: `M-100,${200 + offset} Q200,${200 + offset - amplitude} 500,${200 + offset} T900,${
        200 + offset
      }`,
      strokeWidth: 1 + i * 0.3,
      opacity: 0.1 + i * 0.05,
      delay: i * 0.8,
    };
  });

  return (
    <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 800 800">
      {flowPaths.map((path) => (
        <motion.path
          key={path.id}
          d={path.d}
          fill="none"
          stroke="currentColor"
          strokeWidth={path.strokeWidth}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{
            pathLength: [0, 1, 0.8, 0],
            opacity: [0, path.opacity, path.opacity * 0.7, 0],
          }}
          transition={{
            duration: 15,
            delay: path.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Neural Network Paths                                                */
/* ------------------------------------------------------------------ */
function NeuralPaths() {
  const nodes = Array.from({ length: 50 }, (_, i) => ({
    x: rand() * 800,
    y: rand() * 600,
    id: `node-${i}`,
  }));

  const connections: { id: string; d: string; delay: number }[] = [];
  nodes.forEach((node, i) => {
    const nearbyNodes = nodes.filter((other, j) => {
      if (i === j) return false;
      const distance = Math.sqrt(
        Math.pow(node.x - other.x, 2) + Math.pow(node.y - other.y, 2)
      );
      return distance < 120 && rand() > 0.6;
    });

    nearbyNodes.forEach((target) => {
      connections.push({
        id: `conn-${i}-${target.id}`,
        d: `M${node.x},${node.y} L${target.x},${target.y}`,
        delay: rand() * 10,
      });
    });
  });

  return (
    <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 800 600">
      {connections.map((conn) => (
        <motion.path
          key={conn.id}
          d={conn.d}
          stroke="currentColor"
          strokeWidth="0.5"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: [0, 1, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 6,
            delay: conn.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
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
          animate={{
            scale: [0, 1, 1.2, 1],
            opacity: [0, 0.6, 0.8, 0.6],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Spiral Paths                                                        */
/* ------------------------------------------------------------------ */
function SpiralPaths() {
  const spirals = Array.from({ length: 8 }, (_, i) => {
    const centerX = 400 + ((i % 4) - 1.5) * 200;
    const centerY = 300 + Math.floor(i / 4 - 0.5) * 200;
    const radius = 80 + i * 15;
    const turns = 3 + i * 0.5;

    let path = `M${centerX + radius},${centerY}`;
    for (let angle = 0; angle <= turns * 360; angle += 5) {
      const radian = (angle * Math.PI) / 180;
      const currentRadius = radius * (1 - angle / (turns * 360));
      const x = centerX + currentRadius * Math.cos(radian);
      const y = centerY + currentRadius * Math.sin(radian);
      path += ` L${x},${y}`;
    }

    return { id: `spiral-${i}`, d: path, delay: i * 1.2 };
  });

  return (
    <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 800 600">
      {spirals.map((spiral) => (
        <motion.path
          key={spiral.id}
          d={spiral.d}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{
            pathLength: [0, 1, 0],
          }}
          transition={{
            duration: 12,
            delay: spiral.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Waveform Paths (new - scroll reactive)                              */
/* ------------------------------------------------------------------ */
function WaveformPaths({ mouseY }: { mouseY: number }) {
  const waves = Array.from({ length: 10 }, (_, i) => {
    const offset = 60 + i * 70;
    return {
      id: `wave-${i}`,
      delay: i * 0.5,
      offset,
      amplitude: 20 + i * 8,
      freq: 0.008 + i * 0.002,
    };
  });

  const viewH = 800;
  // Mouse Y slightly shifts wave vertical positions
  const mouseInfluence = mouseY > 0 ? (mouseY / window.innerHeight - 0.5) * 30 : 0;

  return (
    <svg className="absolute inset-0 w-full h-full opacity-20" viewBox={`0 0 800 ${viewH}`}>
      {waves.map((wave) => {
        let d = `M0,${wave.offset + mouseInfluence} `;
        for (let x = 0; x <= 800; x += 20) {
          const y =
            wave.offset +
            Math.sin(x * wave.freq) * wave.amplitude +
            mouseInfluence * Math.sin(x * 0.02);
          d += `L${x},${y} `;
        }
        return (
          <motion.path
            key={wave.id}
            d={d}
            fill="none"
            stroke="currentColor"
            className="text-blue-400/40"
            strokeWidth="1"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1, 0.7, 0],
              opacity: [0, 0.5, 0.3, 0],
            }}
            transition={{
              duration: 8,
              delay: wave.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Main Component                                                      */
/* ------------------------------------------------------------------ */
export default function EnhancedBackgroundPaths({
  title = "Neural Dynamics",
  variant = "demo",
}: {
  title?: string;
  variant?: "demo" | "hero";
}) {
  const [currentPattern, setCurrentPattern] = useState(0);
  const [isHoveringDot, setIsHoveringDot] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const patterns = ["neural", "flow", "geometric", "spiral", "waveform"];
  const words = title.split(" ");

  // Mouse tracking via ref-based raw values (for spring smoothness)
  const rawMouseX = useMotionValue(-1000);
  const rawMouseY = useMotionValue(-1000);
  const springMouseX = useSpring(rawMouseX, { stiffness: 60, damping: 18 });
  const springMouseY = useSpring(rawMouseY, { stiffness: 60, damping: 18 });

  // Tilt transforms
  const tiltX = useTransform(springMouseY, [0, typeof window !== "undefined" ? window.innerHeight : 800], [3, -3]);
  const tiltY = useTransform(springMouseX, [0, typeof window !== "undefined" ? window.innerWidth : 1200], [-3, 3]);

  // Raw mouse position state for non-motion-value consumers
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const handleMouse = (e: MouseEvent) => {
      rawMouseX.set(e.clientX);
      rawMouseY.set(e.clientY);
      setMousePos({ x: e.clientX, y: e.clientY });
      setIsMoving(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsMoving(false), 200);
    };
    const handleTouch = (e: TouchEvent) => {
      if (e.touches.length) {
        rawMouseX.set(e.touches[0].clientX);
        rawMouseY.set(e.touches[0].clientY);
        setMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        setIsMoving(true);
        clearTimeout(timeout);
        timeout = setTimeout(() => setIsMoving(false), 200);
      }
    };

    window.addEventListener("mousemove", handleMouse, { passive: true });
    window.addEventListener("touchmove", handleTouch, { passive: true });

    const interval = setInterval(() => {
      setCurrentPattern((prev) => (prev + 1) % patterns.length);
    }, 12000);

    return () => {
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("touchmove", handleTouch);
      clearInterval(interval);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchPattern = useCallback((idx: number) => {
    setCurrentPattern(idx);
  }, []);

  const renderPattern = () => {
    switch (currentPattern) {
      case 0:
        return <NeuralPaths />;
      case 1:
        return <FlowPaths />;
      case 2:
        return <GeometricPaths />;
      case 3:
        return <SpiralPaths />;
      case 4:
        return <WaveformPaths mouseY={mousePos.y} />;
      default:
        return <NeuralPaths />;
    }
  };

  const isDemo = variant === "demo";

  return (
    <motion.div
      ref={containerRef}
      className={
        isDemo
          ? "relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
          : "absolute inset-0 pointer-events-none"
      }
      style={
        isDemo
          ? {
              perspective: 1000,
              rotateX: tiltX,
              rotateY: tiltY,
            }
          : undefined
      }
    >
      {/* Cursor Glow */}
      <CursorGlow mouseX={mousePos.x} mouseY={mousePos.y} isMoving={isMoving} />

      {/* Click Ripples */}
      <ClickRipples />

      {/* Interactive Particles */}
      <InteractiveParticles mouseX={mousePos.x} mouseY={mousePos.y} />

      {/* Dynamic Background Patterns */}
      <div className="absolute inset-0 text-slate-600 dark:text-slate-400 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPattern}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
          >
            {renderPattern()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-white/60 dark:from-slate-900/60 dark:via-transparent dark:to-slate-900/60 pointer-events-none" />

      {/* Pattern Indicator Dots — now interactive */}
      <div className={`${isDemo ? "absolute top-8 right-8" : "absolute top-4 right-4"} flex gap-2 z-20 ${isDemo ? "" : "pointer-events-auto"}`}>
        {patterns.map((_, i) => (
          <motion.button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              switchPattern(i);
            }}
            onMouseEnter={() => setIsHoveringDot(i)}
            onMouseLeave={() => setIsHoveringDot(null)}
            className={`rounded-full transition-all duration-300 cursor-pointer border-0 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
              i === currentPattern
                ? "bg-slate-800 dark:bg-white shadow-md"
                : "bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500"
            }`}
            style={{ width: 10, height: 10, padding: 0 }}
            aria-label={`Switch to ${patterns[i]} pattern`}
            title={patterns[i]}
            animate={{
              scale: i === currentPattern ? 1.2 : i === isHoveringDot ? 1.15 : 1,
              opacity: i === currentPattern ? 1 : i === isHoveringDot ? 0.8 : 0.5,
            }}
            transition={{ duration: 0.2 }}
          />
        ))}
      </div>

      {/* Quick hint for pattern switching */}
      {isDemo && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ duration: 3, delay: 2, repeat: Infinity, repeatDelay: 8 }}
          className="absolute top-12 right-8 text-[10px] text-slate-400 font-mono tracking-wider z-20 pointer-events-none"
        >
          click dots to switch
        </motion.p>
      )}

      {/* Demo variant: full layout with title & CTA */}
      {isDemo && (
        <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="max-w-5xl mx-auto"
          >
            {/* Main Title with magnetic letters */}
            <div className="mb-8">
              <h1 className="text-6xl sm:text-8xl md:text-9xl font-black mb-4 tracking-tighter leading-none">
                {words.map((word, wordIndex) => (
                  <span key={wordIndex} className="inline-block mr-6 last:mr-0">
                    {word.split("").map((letter, letterIndex) => (
                      <MagneticLetter
                        key={`${wordIndex}-${letterIndex}`}
                        mouseX={mousePos.x}
                        mouseY={mousePos.y}
                        delay={wordIndex * 0.15 + letterIndex * 0.05}
                      >
                        {letter}
                      </MagneticLetter>
                    ))}
                  </span>
                ))}
              </h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 font-light tracking-wide max-w-2xl mx-auto"
              >
                Precision-Engineered Taps & Faucets for Modern Indian Bathrooms
              </motion.p>
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5, duration: 0.8, type: "spring", stiffness: 100 }}
              className="inline-block group"
            >
              <div className="relative p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl group-hover:from-blue-600 group-hover:via-purple-600 group-hover:to-pink-600 transition-all duration-300">
                <Button
                  variant="ghost"
                  size="lg"
                  className="relative rounded-[14px] px-12 py-6 text-lg font-semibold
                              bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800
                              text-slate-900 dark:text-white transition-all duration-300
                              group-hover:-translate-y-1 group-hover:shadow-2xl
                              border-0 backdrop-blur-sm"
                >
                  <motion.span
                    className="flex items-center gap-3"
                    whileHover={{ x: 2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <span className="relative">
                      Explore Products
                      <motion.span
                        className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"
                        initial={{ width: 0 }}
                        whileHover={{ width: "100%" }}
                      />
                    </span>
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="text-xl"
                    >
                      →
                    </motion.span>
                  </motion.span>
                </Button>
              </div>
            </motion.div>

            {/* Pattern Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 1 }}
              className="mt-12 text-sm text-slate-500 dark:text-slate-400 font-mono tracking-wider"
            >
              manufactures high-quality bathroom faucets, kitchen taps, shower mixers, and accessories :{" "}
              <span className="text-slate-700 dark:text-slate-200 font-semibold capitalize">
                {patterns[currentPattern]}
              </span>
            </motion.div>
          </motion.div>
        </div>
      )}

      {/* Floating Elements */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-500/20 rounded-full blur-sm pointer-events-none"
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-3/4 right-1/3 w-6 h-6 bg-purple-500/20 rounded-full blur-sm pointer-events-none"
        animate={{
          y: [0, 15, 0],
          x: [0, -15, 0],
          scale: [1, 0.8, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Magnetic Letter — follows cursor subtly                             */
/* ------------------------------------------------------------------ */
function MagneticLetter({
  children,
  mouseX,
  mouseY,
  delay,
}: {
  children: string;
  mouseX: number;
  mouseY: number;
  delay: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 180 && dist > 0) {
      const strength = (1 - dist / 180) * 14;
      setOffset({ x: (dx / dist) * strength, y: (dy / dist) * strength });
    } else {
      setOffset({ x: 0, y: 0 });
    }
  }, [mouseX, mouseY]);

  return (
    <motion.span
      ref={ref}
      initial={{ y: 100, opacity: 0, rotateX: -90 }}
      animate={{
        y: offset.y,
        x: offset.x,
        opacity: 1,
        rotateX: 0,
      }}
      transition={{
        delay,
        type: "spring",
        stiffness: 100,
        damping: 20,
      }}
      className="inline-block text-transparent bg-clip-text 
                  bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500
                  dark:from-white dark:via-slate-200 dark:to-slate-400
                  hover:from-blue-600 hover:to-purple-600 dark:hover:from-blue-400 dark:hover:to-purple-400
                  transition-all duration-500 cursor-default"
      whileHover={{ scale: 1.08, y: -4 }}
    >
      {children}
    </motion.span>
  );
}
