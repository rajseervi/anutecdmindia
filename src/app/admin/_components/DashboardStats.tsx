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
  colorClass: string;
  accentClass: string;
  iconBgClass: string;
  sparkData?: number[];
  trend?: { direction: "up" | "down"; text: string };
  delay: number;
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="sparkline-bar !h-6 sm:!h-8">
      {data.map((val, i) => (
        <div
          key={i}
          className={`spark-bar ${color}`}
          style={{ height: `${(val / max) * 100}%` }}
        />
      ))}
    </div>
  );
}

function StatCard({ label, value, icon, colorClass, accentClass, iconBgClass, sparkData, trend, delay }: StatCardProps) {
  return (
    <div
      className={`stat-glow-card ${accentClass} animate-fadeInUp`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <div className={`glow-icon ${accentClass} p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl ${iconBgClass}`}>
          <div className={`w-4 h-4 sm:w-5 sm:h-5 relative z-10 ${colorClass}`}>
            {icon}
          </div>
        </div>
        {trend && (
          <span className={`chip-modern text-[10px] sm:text-xs ${
            trend.direction === "up"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}>
            {trend.text}
          </span>
        )}
      </div>
      <p className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight leading-none">{value}</p>
      <p className="text-[11px] sm:text-xs font-medium text-slate-500 mt-1">{label}</p>
      {sparkData && sparkData.length > 0 && (
        <div className="mt-2 sm:mt-3 pt-1.5 sm:pt-2 border-t border-slate-100">
          <Sparkline data={sparkData} color={colorClass.includes("indigo") ? "bg-indigo-300" : colorClass.includes("emerald") ? "bg-emerald-300" : colorClass.includes("amber") ? "bg-amber-300" : colorClass.includes("red") ? "bg-red-300" : colorClass.includes("violet") ? "bg-violet-300" : "bg-cyan-300"} />
        </div>
      )}
    </div>
  );
}

export default function DashboardStats({ stats }: { stats: DashboardStatsData }) {
  const healthScore = stats.totalProducts > 0
    ? Math.round(((stats.totalProducts - stats.lowStockCount - stats.outOfStockCount) / stats.totalProducts) * 100)
    : 0;

  // Generate mock sparkline data (in production, this would come from actual time-series data)
  const generateSparkData = (base: number, variance: number) =>
    Array.from({ length: 12 }, () => Math.max(1, base + Math.floor((Math.random() - 0.5) * variance)));

  const cards: StatCardProps[] = [
    {
      label: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      colorClass: "text-indigo-500",
      accentClass: "indigo",
      iconBgClass: "bg-indigo-50",
      sparkData: generateSparkData(8, 6),
      delay: 0,
      icon: (
        <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      label: "Total Value",
      value: `$${stats.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      colorClass: "text-emerald-500",
      accentClass: "emerald",
      iconBgClass: "bg-emerald-50",
      sparkData: generateSparkData(10, 8),
      delay: 75,
      icon: (
        <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
    },
    {
      label: "Low Stock Alert",
      value: stats.lowStockCount,
      colorClass: "text-amber-500",
      accentClass: "amber",
      iconBgClass: "bg-amber-50",
      trend: stats.lowStockCount > 0 ? { direction: "up", text: "Needs restock" } : undefined,
      sparkData: generateSparkData(stats.lowStockCount, 3),
      delay: 150,
      icon: (
        <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    {
      label: "Out of Stock",
      value: stats.outOfStockCount,
      colorClass: "text-red-500",
      accentClass: "red",
      iconBgClass: "bg-red-50",
      trend: stats.outOfStockCount > 0 ? { direction: "up", text: "Critical" } : { direction: "down", text: "All stocked" },
      sparkData: generateSparkData(stats.outOfStockCount, 2),
      delay: 225,
      icon: (
        <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
    {
      label: "Inventory Health",
      value: `${healthScore}%`,
      colorClass: healthScore > 80 ? "text-emerald-500" : healthScore > 50 ? "text-amber-500" : "text-red-500",
      accentClass: healthScore > 80 ? "emerald" : healthScore > 50 ? "amber" : "red",
      iconBgClass: healthScore > 80 ? "bg-emerald-50" : healthScore > 50 ? "bg-amber-50" : "bg-red-50",
      trend: healthScore > 80 ? { direction: "up", text: "Healthy" } : healthScore > 50 ? { direction: "down", text: "Needs work" } : { direction: "down", text: "At risk" },
      sparkData: generateSparkData(healthScore, 10),
      delay: 300,
      icon: (
        <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      label: "Avg Price",
      value: `$${stats.averagePrice.toFixed(2)}`,
      colorClass: "text-violet-500",
      accentClass: "violet",
      iconBgClass: "bg-violet-50",
      sparkData: generateSparkData(6, 4),
      delay: 375,
      icon: (
        <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
      {cards.map((card, i) => (
        <StatCard key={i} {...card} />
      ))}
    </div>
  );
}
