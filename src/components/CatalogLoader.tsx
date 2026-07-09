"use client";

export default function CatalogLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center select-none relative overflow-hidden">
      {/* Background dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.03) 0.5px, transparent 0.5px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Gradient orbs */}
      <div
        className="absolute w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 60%)",
          top: "10%",
          left: "15%",
        }}
      />
      <div
        className="absolute w-60 h-60 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 60%)",
          bottom: "15%",
          right: "12%",
        }}
      />

      {/* ── Main animated logo ── */}
      <div className="relative flex items-center justify-center">
        {/* Outer pulsing ring */}
        <div
          className="absolute w-40 h-40 rounded-full border border-white/[0.06]"
          style={{
            animation: "ringPulse 2.5s ease-out infinite",
          }}
        />

        {/* Rotating ring */}
        <div
          className="absolute w-32 h-32 rounded-full border border-dashed border-blue-400/30 animate-fan"
        />

        {/* Inner ring */}
        <div
          className="absolute w-24 h-24 rounded-full border border-white/[0.08] animate-spin-slow"
          style={{ animationDirection: "reverse" }}
        />

        {/* Center logo mark */}
        <div
          className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20"
          style={{
            animation: "logoPulse 2s ease-in-out infinite",
          }}
        >
          <svg
            width="44"
            height="44"
            viewBox="0 0 44 44"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22 4L40 38H4L22 4Z"
              fill="white"
              opacity="0.9"
            />
            <path
              d="M22 14L28 28H16L22 14Z"
              fill="#1e3a5f"
            />
          </svg>
        </div>
      </div>

      {/* ── Loading text ── */}
      <div className="mt-10 flex flex-col items-center gap-3">
        <div className="flex items-center gap-1">
          <span className="text-lg font-bold text-white tracking-tight">
            Anutec
          </span>
          <span className="text-lg text-slate-500">|</span>
          <span className="text-lg font-medium text-blue-300">
            Loading
          </span>
          <span className="flex items-center gap-1 ml-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-blue-400"
                style={{
                  animation: "dotBounce 1.4s ease-in-out infinite",
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </span>
        </div>

        <p className="text-xs font-medium text-slate-500 tracking-wider animate-pulse">
          Precision Engineered Products
        </p>
      </div>

      {/* ── Progress bar ── */}
      <div className="mt-8 w-48 h-1 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-400 rounded-full animate-slide-infinite"
        />
      </div>

      {/* ── Decorative floating elements ── */}
      <div
        className="absolute left-[10%] bottom-[25%] opacity-20"
        style={{ animation: "float 3.5s ease-in-out 0.5s infinite" }}
      >
        <svg width="24" height="28" viewBox="0 0 24 28" fill="none">
          <rect x="8" y="16" width="8" height="6" rx="1" fill="#3b82f6" />
          <path d="M8 18c0 0 0-8 4-8s4 4 4 4" stroke="#3b82f6" strokeWidth="2" fill="none" />
          <circle cx="16" cy="8" r="3" fill="#60a5fa" />
        </svg>
      </div>

      <div
        className="absolute right-[18%] top-[30%] opacity-20"
        style={{ animation: "float 4s ease-in-out 1.2s infinite" }}
      >
        <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
          <rect x="2" y="2" width="16" height="20" rx="2" stroke="#6366f1" strokeWidth="1.5" fill="none" />
          <path d="M6 8h8M6 12h8M6 16h5" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
