"use client";

interface CategoryAnalysis {
  name: string;
  count: number;
  totalValue: number;
  averagePrice: number;
  lowStockCount: number;
  percentage: number;
  color: string;
}

function DonutChart({ categories, total }: { categories: CategoryAnalysis[]; total: number }) {
  return (
    <div className="flex flex-col items-center">
      <svg width="260" height="260" viewBox="0 0 260 260" className="mb-6">
        <g transform="translate(130, 130)">
          {(() => {
            let currentAngle = -90;
            return categories.slice(0, 6).map((cat, index) => {
              const angle = (cat.percentage / 100) * 360;
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              currentAngle = endAngle;

              const startRad = (startAngle * Math.PI) / 180;
              const endRad = (endAngle * Math.PI) / 180;

              const outerRadius = 110;
              const innerRadius = 65;

              const x1 = Math.cos(startRad) * outerRadius;
              const y1 = Math.sin(startRad) * outerRadius;
              const x2 = Math.cos(endRad) * outerRadius;
              const y2 = Math.sin(endRad) * outerRadius;
              const x3 = Math.cos(endRad) * innerRadius;
              const y3 = Math.sin(endRad) * innerRadius;
              const x4 = Math.cos(startRad) * innerRadius;
              const y4 = Math.sin(startRad) * innerRadius;

              const largeArc = angle > 180 ? 1 : 0;

              const pathData = [
                `M ${x1} ${y1}`,
                `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}`,
                `L ${x3} ${y3}`,
                `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
                "Z",
              ].join(" ");

              return (
                <path
                  key={index}
                  d={pathData}
                  fill={cat.color}
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                  style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}
                />
              );
            });
          })()}
          {/* If there are more than 6 categories, show "Other" */}
          {categories.length > 6 && (
            (() => {
              const other = categories.slice(6);
              const otherPercentage = other.reduce((s, c) => s + c.percentage, 0);
              const angle = (otherPercentage / 100) * 360;
              const currentAngle = categories.slice(0, 6).reduce((s, c) => s + (c.percentage / 100) * 360, -90);
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;

              const startRad = (startAngle * Math.PI) / 180;
              const endRad = (endAngle * Math.PI) / 180;
              const outerRadius = 110;
              const innerRadius = 65;

              const x1 = Math.cos(startRad) * outerRadius;
              const y1 = Math.sin(startRad) * outerRadius;
              const x2 = Math.cos(endRad) * outerRadius;
              const y2 = Math.sin(endRad) * outerRadius;
              const x3 = Math.cos(endRad) * innerRadius;
              const y3 = Math.sin(endRad) * innerRadius;
              const x4 = Math.cos(startRad) * innerRadius;
              const y4 = Math.sin(startRad) * innerRadius;

              const largeArc = angle > 180 ? 1 : 0;

              const pathData = [
                `M ${x1} ${y1}`,
                `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}`,
                `L ${x3} ${y3}`,
                `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
                "Z",
              ].join(" ");
              return (
                <path
                  d={pathData}
                  fill="#94a3b8"
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                  style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}
                />
              );
            })()
          )}
          <circle cx="0" cy="0" r="60" fill="white" />
          <text x="0" y="-5" textAnchor="middle" className="text-2xl font-bold fill-gray-900">
            {total}
          </text>
          <text x="0" y="15" textAnchor="middle" className="text-xs fill-gray-500">
            Total Products
          </text>
        </g>
      </svg>
      <div className="grid grid-cols-2 gap-2 w-full">
        {categories.slice(0, 6).map((cat, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
            <span className="text-xs text-gray-600 truncate">
              {cat.name} ({cat.percentage.toFixed(1)}%)
            </span>
          </div>
        ))}
        {categories.length > 6 && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: "#94a3b8" }} />
            <span className="text-xs text-gray-600 truncate">
              Others ({categories.slice(6).reduce((s, c) => s + c.percentage, 0).toFixed(1)}%)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function BarChart({ categories }: { categories: CategoryAnalysis[] }) {
  const maxCount = Math.max(...categories.map((c) => c.count));

  return (
    <div className="space-y-3">
      {categories.slice(0, 10).map((cat, index) => {
        const widthPercentage = (cat.count / maxCount) * 100;
        return (
          <div key={index} className="group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 truncate max-w-[160px]">{cat.name}</span>
              <span className="text-sm font-bold text-gray-900">{cat.count}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out group-hover:opacity-80"
                style={{ width: `${widthPercentage}%`, backgroundColor: cat.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CategoryTable({ categories }: { categories: CategoryAnalysis[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Products</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Value</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg Price</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Low Stock</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Share</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat, index) => (
            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="font-medium text-gray-900 text-sm">{cat.name}</span>
                </div>
              </td>
              <td className="text-right py-3 px-4 text-sm text-gray-700 font-semibold">{cat.count}</td>
              <td className="text-right py-3 px-4 text-sm text-gray-700">
                ${cat.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="text-right py-3 px-4 text-sm text-gray-700">${cat.averagePrice.toFixed(2)}</td>
              <td className="text-right py-3 px-4">
                {cat.lowStockCount > 0 ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    {cat.lowStockCount}
                  </span>
                ) : (
                  <span className="text-gray-300 text-sm">—</span>
                )}
              </td>
              <td className="text-right py-3 px-4">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-600 w-10 text-right">{cat.percentage.toFixed(1)}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CategoryAnalytics({ categories }: { categories: CategoryAnalysis[] }) {
  if (categories.length === 0) return null;

  const total = categories.reduce((s, c) => s + c.count, 0);

  return (
    <div className="space-y-6 mb-8">
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            Category Manufacturer
          </h3>
          <DonutChart categories={categories} total={total} />
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Products by Category
          </h3>
          <BarChart categories={categories} />
        </div>
      </div>

      {/* Detail table */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Category Analytics
        </h3>
        <CategoryTable categories={categories} />
      </div>
    </div>
  );
}
