"use client";

interface DashboardStatsData {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  hiddenCount: number;
  averagePrice: number;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bg: string;
  progress?: number;
  trend?: { direction: "up" | "down"; text: string };
  delay: number;
}

function StatCard({ label, value, icon, color, bg, progress, trend, delay }: StatCardProps) {
  return (
    <div
      className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-slate-300 transition-all duration-200 animate-fadeInUp group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${bg} group-hover:scale-110 transition-transform duration-200`}>
          <div className={color}>{icon}</div>
        </div>
        {trend && (
          <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
            trend.direction === "up"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-amber-50 text-amber-600"
          }`}>
            {trend.text}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
      <p className="text-xs font-medium text-slate-500 mt-0.5">{label}</p>
      {progress !== undefined && (
        <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${color.replace("text-", "bg-")}`}
            style={{ width: "0%" }}
            ref={(el) => {
              if (el) {
                requestAnimationFrame(() => {
                  el.style.width = `${progress}%`;
                });
              }
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function DashboardStats({ stats }: { stats: DashboardStatsData }) {
  const totalInventory = stats.totalProducts * (stats.averagePrice || 1);
  const healthScore = stats.totalProducts > 0
    ? Math.round(((stats.totalProducts - stats.lowStockCount - stats.outOfStockCount) / stats.totalProducts) * 100)
    : 0;

  const cards: StatCardProps[] = [
    {
      label: "Total Products",
      value: stats.totalProducts,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      progress: Math.min(stats.totalProducts / 10, 100),
      delay: 0,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      label: "Total Value",
      value: `$${stats.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      progress: stats.totalValue > 0 ? Math.min((stats.totalValue / 500000) * 100, 100) : 0,
      delay: 50,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
    },
    {
      label: "Low Stock",
      value: stats.lowStockCount,
      color: "text-amber-600",
      bg: "bg-amber-50",
      trend: stats.lowStockCount > 0 ? { direction: "up", text: "Needs attention" } : undefined,
      progress: stats.totalProducts > 0 ? (stats.lowStockCount / stats.totalProducts) * 100 : 0,
      delay: 100,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    {
      label: "Out of Stock",
      value: stats.outOfStockCount,
      color: "text-red-600",
      bg: "bg-red-50",
      trend: stats.outOfStockCount > 0 ? { direction: "up", text: "Critical" } : undefined,
      progress: stats.totalProducts > 0 ? (stats.outOfStockCount / stats.totalProducts) * 100 : 0,
      delay: 150,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
    {
      label: "Inventory Health",
      value: `${healthScore}%`,
      color: healthScore > 80 ? "text-emerald-600" : healthScore > 50 ? "text-amber-600" : "text-red-600",
      bg: healthScore > 80 ? "bg-emerald-50" : healthScore > 50 ? "bg-amber-50" : "bg-red-50",
      trend: healthScore > 80 ? { direction: "up", text: "Good" } : healthScore > 50 ? { direction: "down", text: "Needs work" } : undefined,
      progress: healthScore,
      delay: 200,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      label: "Avg Price",
      value: `$${stats.averagePrice.toFixed(2)}`,
      color: "text-violet-600",
      bg: "bg-violet-50",
      progress: Math.min((stats.averagePrice / 500) * 100, 100),
      delay: 250,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {cards.map((card, i) => (
        <StatCard key={i} {...card} />
      ))}
    </div>
  );
}
