"use client";

export default function CatalogLoader() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center select-none">
      {/* Outer decorative ring */}
      <div className="relative flex items-center justify-center">
        {/* Spinning ring */}
        <div
          className="absolute w-28 h-28 rounded-full border-[3px] border-transparent border-t-indigo-500 border-r-purple-400 animate-spinSlow"
          style={{ animationDuration: "3s" }}
        />

        {/* Second ring counter-rotating */}
        <div
          className="absolute w-24 h-24 rounded-full border-2 border-transparent border-b-pink-400 border-l-indigo-300 animate-spinSlow"
          style={{ animationDuration: "2.4s", animationDirection: "reverse" }}
        />

        {/* Dotted ring */}
        <div
          className="absolute w-32 h-32 rounded-full"
          style={{
            background: "radial-gradient(circle, transparent 40%, rgba(99,102,241,0.08) 40%)",
            animation: "spinSlow 4s linear infinite",
          }}
        />

        {/* ── Catalog Book SVG Icon ── */}
        <div className="relative z-10 flex items-center justify-center w-16 h-16">
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-lg"
          >
            {/* Book cover spine */}
            <rect
              x="8"
              y="6"
              width="48"
              height="52"
              rx="4"
              fill="#6366f1"
              className="drop-shadow-md"
            />

            {/* Book inner pages (left stack) */}
            <rect x="12" y="10" width="18" height="44" rx="2" fill="#eef2ff" />
            <rect x="14" y="12" width="14" height="40" rx="1" fill="#ffffff" />

            {/* Book inner pages (right stack) */}
            <rect x="34" y="10" width="18" height="44" rx="2" fill="#eef2ff" />
            <rect x="36" y="12" width="14" height="40" rx="1" fill="#ffffff" />

            {/* Left page text lines */}
            <rect x="18" y="20" width="8" height="1.5" rx="0.75" fill="#c7d2fe" />
            <rect x="18" y="25" width="6" height="1.5" rx="0.75" fill="#c7d2fe" />
            <rect x="18" y="30" width="7" height="1.5" rx="0.75" fill="#c7d2fe" />
            <rect x="18" y="35" width="5" height="1.5" rx="0.75" fill="#c7d2fe" />
            <rect x="18" y="40" width="7" height="1.5" rx="0.75" fill="#c7d2fe" />

            {/* Right page text lines */}
            <rect x="40" y="20" width="6" height="1.5" rx="0.75" fill="#c7d2fe" />
            <rect x="40" y="25" width="8" height="1.5" rx="0.75" fill="#c7d2fe" />
            <rect x="40" y="30" width="5" height="1.5" rx="0.75" fill="#c7d2fe" />
            <rect x="40" y="35" width="7" height="1.5" rx="0.75" fill="#c7d2fe" />
            <rect x="40" y="40" width="6" height="1.5" rx="0.75" fill="#c7d2fe" />

            {/* Book spine line */}
            <line x1="32" y1="10" x2="32" y2="54" stroke="#4f46e5" strokeWidth="1.5" />

            {/* Animated bookmarks / page markers */}
            <rect
              x="28"
              y="16"
              width="8"
              height="2"
              rx="1"
              fill="#f472b6"
              className="origin-left"
              style={{ animation: "pageFlip 2s ease-in-out infinite" }}
            />
            <rect
              x="28"
              y="22"
              width="8"
              height="2"
              rx="1"
              fill="#a78bfa"
              className="origin-left"
              style={{ animation: "pageFlip 2s ease-in-out 0.4s infinite" }}
            />
            <rect
              x="28"
              y="28"
              width="8"
              height="2"
              rx="1"
              fill="#34d399"
              className="origin-left"
              style={{ animation: "pageFlip 2s ease-in-out 0.8s infinite" }}
            />

            {/* Decorative dots on cover */}
            <circle cx="16" cy="14" r="1.5" fill="#c7d2fe" opacity="0.6" />
            <circle cx="48" cy="14" r="1.5" fill="#c7d2fe" opacity="0.6" />
          </svg>
        </div>
      </div>

      {/* ── Loading Text ── */}
      <div className="mt-10 flex items-center gap-1">
        <span className="text-sm font-semibold text-gray-900 tracking-wide">
          Loading catalog
        </span>
        <span className="flex items-center gap-0.5 ml-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-indigo-500"
              style={{
                animation: "dotBounce 1.4s ease-in-out infinite",
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </span>
      </div>

      {/* ── Subtext ── */}
      <p className="mt-2 text-xs text-gray-400 font-medium tracking-wider uppercase">
        Please wait while we prepare your products
      </p>

      {/* ── Progress bar ── */}
      <div className="mt-8 w-40 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full animate-slide-infinite"
        />
      </div>

      {/* ── Decorative floating catalog icons ── */}
      <div
        className="absolute left-[15%] top-[25%] opacity-20"
        style={{ animation: "float 3s ease-in-out infinite" }}
      >
        <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
          <rect x="1" y="2" width="18" height="20" rx="2" fill="#6366f1" />
          <rect x="3" y="4" width="6" height="16" rx="1" fill="#eef2ff" />
          <rect x="11" y="4" width="6" height="16" rx="1" fill="#eef2ff" />
          <line x1="10" y1="4" x2="10" y2="20" stroke="#4f46e5" strokeWidth="0.8" />
        </svg>
      </div>

      <div
        className="absolute right-[20%] top-[35%] opacity-15"
        style={{ animation: "float 4s ease-in-out 1s infinite" }}
      >
        <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
          <rect x="1" y="1" width="14" height="18" rx="2" fill="#a78bfa" />
          <rect x="3" y="4" width="4" height="13" rx="1" fill="#f3e8ff" />
          <rect x="9" y="4" width="4" height="13" rx="1" fill="#f3e8ff" />
        </svg>
      </div>

      <div
        className="absolute left-[25%] bottom-[30%] opacity-10"
        style={{ animation: "float 3.5s ease-in-out 0.5s infinite" }}
      >
        <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
          <rect width="14" height="18" rx="2" fill="#f472b6" />
          <rect x="2" y="3" width="4" height="13" rx="1" fill="#fce7f3" />
          <rect x="8" y="3" width="4" height="13" rx="1" fill="#fce7f3" />
        </svg>
      </div>
    </div>
  );
}
