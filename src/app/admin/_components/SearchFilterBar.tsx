"use client";

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  allCategories: string[];
  sortBy: "name" | "price" | "inventory" | "category";
  onSortByChange: (value: "name" | "price" | "inventory" | "category") => void;
  sortOrder: "asc" | "desc";
  onSortOrderToggle: () => void;
  totalResults: number;
  isLoading: boolean;
}

export default function SearchFilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  allCategories,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderToggle,
  totalResults,
  isLoading,
}: SearchFilterBarProps) {
  const hasActiveFilters = selectedCategory !== "all" || searchQuery.trim().length > 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
      {/* Search + filters row */}
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
        <div className="relative flex-1 w-full">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:flex-none lg:w-44">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-medium bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none transition-all cursor-pointer hover:border-slate-400"
            >
              <option value="all">All Categories</option>
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="relative flex-1 lg:flex-none lg:w-32">
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as "name" | "price" | "inventory" | "category")}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-medium bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none transition-all cursor-pointer hover:border-slate-400"
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="inventory">Stock</option>
              <option value="category">Category</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <button
            onClick={onSortOrderToggle}
            className="p-2.5 border border-slate-300 rounded-lg hover:bg-slate-100 hover:border-slate-400 transition-all bg-slate-50"
            title={`Sort ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
          >
            <svg className={`w-4 h-4 text-slate-600 transition-transform ${sortOrder === "desc" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Active filters + results — moved into a single row */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {hasActiveFilters && (
            <>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider shrink-0">Filters:</span>
              {selectedCategory !== "all" && (
                <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-[11px] font-medium border border-indigo-200">
                  {selectedCategory}
                  <button onClick={() => onCategoryChange("all")} className="hover:text-indigo-900 transition-colors">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1.5 bg-violet-50 text-violet-700 px-2.5 py-1 rounded-full text-[11px] font-medium border border-violet-200">
                  &ldquo;{searchQuery}&rdquo;
                  <button onClick={() => onSearchChange("")} className="hover:text-violet-900 transition-colors">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              <button
                onClick={() => { onSearchChange(""); onCategoryChange("all"); }}
                className="text-[11px] font-medium text-slate-500 hover:text-slate-700 underline ml-1 transition-colors"
              >
                Clear all
              </button>
            </>
          )}
        </div>
        <span className="text-xs font-medium text-slate-500 shrink-0 ml-4">
          <span className="font-semibold text-slate-800">{totalResults}</span> product{totalResults !== 1 ? "s" : ""}
          {hasActiveFilters && <span className="text-slate-400"> filtered</span>}
        </span>
      </div>
    </div>
  );
}
