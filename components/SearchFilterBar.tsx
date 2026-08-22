"use client";

import { forwardRef } from "react";
import type { HistoryFilter } from "@/lib/types";

interface SearchFilterBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  filter: HistoryFilter;
  onFilterChange: (value: HistoryFilter) => void;
}

const FILTERS: { value: HistoryFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "completed", label: "Concluídas" },
  { value: "pending", label: "Pendentes" },
];

export const SearchFilterBar = forwardRef<HTMLInputElement, SearchFilterBarProps>(function SearchFilterBar(
  { query, onQueryChange, filter, onFilterChange },
  ref
) {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
      <div
        className="flex items-center gap-2 rounded-xl border px-3 py-2 sm:max-w-xs sm:flex-1"
        style={{ borderColor: "var(--color-border)", background: "var(--color-bg-elevated)" }}
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="none" style={{ color: "var(--color-text-faint)" }}>
          <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M17 17l-3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <input
          ref={ref}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Pesquisar no histórico…"
          className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-[var(--color-text-faint)]"
          aria-label="Pesquisar no histórico"
        />
        <kbd
          className="hidden shrink-0 rounded border px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[10px] sm:block"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-faint)" }}
        >
          Ctrl K
        </kbd>
      </div>

      <div
        className="flex items-center gap-0.5 self-start rounded-full border p-0.5"
        style={{ borderColor: "var(--color-border)", background: "var(--color-bg-elevated)" }}
      >
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => onFilterChange(f.value)}
            className="rounded-full px-3 py-1.5 text-xs font-medium transition"
            style={{
              background: filter === f.value ? "var(--color-accent)" : "transparent",
              color: filter === f.value ? "#062017" : "var(--color-text-muted)",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
});
