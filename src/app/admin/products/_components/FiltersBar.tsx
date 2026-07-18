"use client";

type FilterType = "all" | "low-stock" | "out-of-stock" | "in-stock" | "hidden";
type SortField = "name" | "price" | "inventory" | "category" | "value" | "created";
type ViewMode = "grid" | "table";

interface FiltersBarProps {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  filter: FilterType;
  onFilterChange: (v: FilterType) => void;
  selectedCategory: string;
  onCategoryChange: (v: string) => void;
  allCategories: string[];
  sortBy: SortField;
  onSortByChange: (v: SortField) => void;
  sortOrder: "asc" | "desc";
  onSortOrderToggle: () => void;
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
  totalResults: number;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function FiltersBar({
  searchQuery, onSearchChange, filter, onFilterChange,
  selectedCategory, onCategoryChange, allCategories,
  sortBy, onSortByChange, sortOrder, onSortOrderToggle,
  viewMode, onViewModeChange, totalResults, hasActiveFilters, onClearFilters,
}: FiltersBarProps) {
  return (
    <div className="bento-card">
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, description, category..."
            className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white"
          />
          {searchQuery && (
            <button onClick={() => onSearchChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap">
          {/* Status filter */}
          <div className="relative flex-1 lg:flex-none lg:w-36">
            <select
              value={filter}
              onChange={(e) => onFilterChange(e.target.value as FilterType)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-medium bg-slate-50 focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer hover:border-slate-400"
            >
              <option value="all">All Status</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock (≤5)</option>
              <option value="out-of-stock">Out of Stock</option>
              <option value="hidden">Hidden</option>
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Category */}
          <div className="relative flex-1 lg:flex-none lg:w-40">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-medium bg-slate-50 focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer hover:border-slate-400"
            >
              <option value="all">All Categories</option>
              {allCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Sort */}
          <div className="relative flex-1 lg:flex-none lg:w-32">
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as SortField)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-medium bg-slate-50 focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer hover:border-slate-400"
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="inventory">Stock</option>
              <option value="value">Total Value</option>
              <option value="category">Category</option>
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Sort order */}
          <button
            onClick={onSortOrderToggle}
            className="p-2.5 border border-slate-300 rounded-lg hover:bg-slate-100 hover:border-slate-400 transition-all bg-slate-50"
            title={`Sort ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
          >
            <svg className={`w-4 h-4 text-slate-600 transition-transform ${sortOrder === "desc" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </button>

          {/* View toggle */}
          <div className="flex border border-slate-300 rounded-lg overflow-hidden bg-slate-50">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`p-2.5 transition-all ${viewMode === "grid" ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}
              title="Grid View"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => onViewModeChange("table")}
              className={`p-2.5 transition-all ${viewMode === "table" ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}
              title="Table View"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Active filters */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {hasActiveFilters ? (
            <>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider shrink-0">Filters:</span>
              {filter !== "all" && (
                <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-[11px] font-medium capitalize">
                  {filter.replace("-", " ")}
                  <button onClick={() => onFilterChange("all")} className="hover:text-slate-900">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {selectedCategory !== "all" && (
                <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-[11px] font-medium">
                  {selectedCategory}
                  <button onClick={() => onCategoryChange("all")} className="hover:text-indigo-900">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 bg-violet-50 text-violet-700 px-2.5 py-1 rounded-full text-[11px] font-medium">
                  &ldquo;{searchQuery}&rdquo;
                  <button onClick={() => onSearchChange("")} className="hover:text-violet-900">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              <button onClick={onClearFilters} className="text-[11px] font-medium text-slate-500 hover:text-slate-700 underline ml-1">
                Clear all
              </button>
            </>
          ) : (
            <span className="text-xs text-slate-400">No active filters</span>
          )}
        </div>
        <span className="text-xs font-medium text-slate-500 shrink-0 ml-4">
          <span className="font-semibold text-slate-800">{totalResults}</span> product{totalResults !== 1 ? "s" : ""}
          {hasActiveFilters && <span className="text-slate-400"> found</span>}
        </span>
      </div>
    </div>
  );
}
