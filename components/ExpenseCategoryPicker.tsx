"use client";

import type { ExpenseCategory } from "@/lib/types";
import { EXPENSE_CATEGORIES, NO_CATEGORY_COLOR, categoryInfo } from "@/lib/expense-categories";

interface ExpenseCategoryPickerProps {
  value: ExpenseCategory | null;
  onChange: (value: ExpenseCategory | null) => void;
  className?: string;
}

/** Seletor em forma de etiqueta. Usa o menu nativo, que funciona bem no celular. */
export function ExpenseCategoryPicker({ value, onChange, className = "" }: ExpenseCategoryPickerProps) {
  const info = categoryInfo(value);
  const color = info?.color ?? NO_CATEGORY_COLOR;

  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange((e.target.value || null) as ExpenseCategory | null)}
      aria-label="Categoria do gasto"
      className={`cursor-pointer appearance-none rounded-full border px-2.5 py-0.5 text-center text-[11px] font-semibold outline-none transition hover:opacity-90 ${className}`}
      style={{
        borderColor: info ? color : "var(--color-border)",
        background: info ? `color-mix(in srgb, ${color} 14%, transparent)` : "transparent",
        color: info ? color : "var(--color-text-faint)",
        colorScheme: "dark",
      }}
    >
      <option value="">{info ? "Sem categoria" : "+ Categoria"}</option>
      {EXPENSE_CATEGORIES.map((c) => (
        <option key={c.value} value={c.value}>
          {c.label}
        </option>
      ))}
    </select>
  );
}
