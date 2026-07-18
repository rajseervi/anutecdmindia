"use client";

interface BulkActionsBarProps {
  selectedCount: number;
  onHide: () => void;
  onShow: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onClear: () => void;
}

export function BulkActionsBar({ selectedCount, onHide, onShow, onDelete, onDuplicate, onClear }: BulkActionsBarProps) {
  return (
    <div className="fixed bottom-4 sm:bottom-6 left-2 right-2 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-20 bg-white border border-slate-200 rounded-2xl shadow-2xl px-3 sm:px-5 py-2.5 sm:py-3 flex flex-wrap items-center gap-2 sm:gap-4 animate-fadeInUp backdrop-blur-xl bg-white/95 max-w-[calc(100vw-1rem)] sm:max-w-none">
      <span className="text-xs sm:text-sm font-semibold text-slate-800 w-full sm:w-auto text-center sm:text-left">
        <span className="text-indigo-600 bg-indigo-50 px-1.5 sm:px-2 py-0.5 rounded-lg">{selectedCount}</span> selected
      </span>
      <div className="hidden sm:block h-6 w-px bg-slate-200" />
      <div className="flex gap-1.5 sm:gap-2 w-full sm:w-auto justify-center sm:justify-start">
        <button onClick={onShow}
          className="px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 active:scale-95 transition-all">
          Show
        </button>
        <button onClick={onHide}
          className="px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 active:scale-95 transition-all">
          Hide
        </button>
        <button onClick={onDuplicate}
          className="px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 active:scale-95 transition-all">
          Duplicate
        </button>
        <button onClick={onDelete}
          className="px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 active:scale-95 transition-all">
          Delete
        </button>
        <button onClick={onClear}
          className="px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-200 active:scale-95 transition-all">
          Clear
        </button>
      </div>
    </div>
  );
}
