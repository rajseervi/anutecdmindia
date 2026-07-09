"use client";

export default function SearchLoader({ count = 24, isInitial }: { count?: number; isInitial?: boolean }) {
  // Creates a more polished loading grid with staggered animation and subtle gradients
  const cards = Array.from({ length: count }, (_, i) => i);

  return (
    <div className="space-y-6" role="status" aria-live="polite" aria-label="Loading products">
      {/* Animated progress bar at top */}
      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full animate-slide-infinite" />
      </div>

      {!isInitial && (
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500" />
          </span>
          Searching products...
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {cards.map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse"
            style={{
              animationDelay: `${(i % 12) * 40}ms`,
              animationDuration: "1.5s",
            }}
          >
            {/* Image placeholder with gradient shimmer */}
            <div className="w-full aspect-square bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer" />
            </div>

            {/* Content placeholders */}
            <div className="p-4 space-y-3">
              {/* Title */}
              <div className="space-y-1.5">
                <div className="h-3.5 bg-gradient-to-r from-gray-100 to-gray-50 rounded w-3/4" />
                <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-50 rounded w-1/2" />
              </div>

              {/* Price/stock row */}
              <div className="flex items-center justify-between pt-2">
                <div className="h-5 bg-gradient-to-r from-gray-100 to-gray-50 rounded w-16" />
                <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-50 rounded w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
