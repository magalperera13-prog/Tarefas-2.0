"use client";

import { useState } from "react";
import type { FinanceEntry } from "@/lib/types";
import { entryProfit, moneyToField, parseMoneyField, profitColor, type FinanceEntryInput } from "@/lib/finance";
import { formatBRL } from "@/lib/format";

/** Colunas da tabela no desktop; no celular cada linha vira duas (descrição / valores). */
export const FINANCE_COLS = "sm:grid sm:grid-cols-[48px_minmax(0,1fr)_112px_112px_112px_28px] sm:items-center sm:gap-3";

interface FinanceEntryRowProps {
  entry: FinanceEntry;
  onSaveEdit: (entry: FinanceEntry, changes: FinanceEntryInput) => void;
  onDeleteRequest: (entry: FinanceEntry) => void;
}

function shortDate(iso: string): string {
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
}

export function FinanceEntryRow({ entry, onSaveEdit, onDeleteRequest }: FinanceEntryRowProps) {
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(entry.entry_date);
  const [description, setDescription] = useState(entry.description);
  const [revenue, setRevenue] = useState(moneyToField(entry.revenue));
  const [cost, setCost] = useState(moneyToField(entry.cost));

  const profit = entryProfit(entry);

  function startEditing() {
    setDate(entry.entry_date);
    setDescription(entry.description);
    setRevenue(moneyToField(entry.revenue));
    setCost(moneyToField(entry.cost));
    setEditing(true);
  }

  function commit() {
    const rev = parseMoneyField(revenue);
    const cst = parseMoneyField(cost);
    const desc = description.trim();
    if (!desc || rev === null || cst === null || !(rev > 0 || cst > 0) || !date) return; // mantém aberto até estar válido
    setEditing(false);
    if (date !== entry.entry_date || desc !== entry.description || rev !== entry.revenue || cst !== entry.cost) {
      onSaveEdit(entry, { entry_date: date, description: desc, revenue: rev, cost: cst });
    }
  }

  if (editing) {
    const field = { borderColor: "var(--color-border)", background: "var(--color-bg-inset)", color: "var(--color-text)" };
    const onKey = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") commit();
      if (e.key === "Escape") setEditing(false);
    };
    const rev = parseMoneyField(revenue);
    const cst = parseMoneyField(cost);
    const live = rev !== null && cst !== null ? Math.round((rev - cst) * 100) / 100 : null;
    return (
      <div className="space-y-2 px-3.5 py-3" style={{ background: "var(--color-bg-inset)" }}>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={onKey}
            aria-label="Descrição"
            placeholder="Descrição"
            className="min-w-0 rounded-lg border px-2.5 py-1.5 text-[14px] outline-none"
            style={field}
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-label="Data"
            className="rounded-lg border px-2 py-1 text-[12.5px] outline-none"
            style={{ ...field, colorScheme: "dark" }}
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <label className="min-w-0">
            <span className="mb-0.5 block text-[10.5px]" style={{ color: "var(--color-text-muted)" }}>
              Faturamento
            </span>
            <input
              value={revenue}
              onChange={(e) => setRevenue(e.target.value)}
              onKeyDown={onKey}
              inputMode="decimal"
              aria-label="Faturamento"
              placeholder="0,00"
              className="w-full min-w-0 rounded-lg border px-2 py-1.5 text-right font-[family-name:var(--font-mono)] text-[13.5px] outline-none"
              style={field}
            />
          </label>
          <label className="min-w-0">
            <span className="mb-0.5 block text-[10.5px]" style={{ color: "var(--color-danger)" }}>
              Gastos
            </span>
            <input
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              onKeyDown={onKey}
              inputMode="decimal"
              aria-label="Gastos"
              placeholder="0,00"
              className="w-full min-w-0 rounded-lg border px-2 py-1.5 text-right font-[family-name:var(--font-mono)] text-[13.5px] outline-none"
              style={field}
            />
          </label>
          <div className="min-w-0">
            <span className="mb-0.5 block text-[10.5px]" style={{ color: "var(--color-text-muted)" }}>
              Lucro
            </span>
            <p
              className="truncate py-1.5 text-right font-[family-name:var(--font-mono)] text-[13.5px] font-semibold tabular"
              style={{ color: live === null ? "var(--color-text-faint)" : profitColor(live) }}
            >
              {live === null ? "—" : formatBRL(live)}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setEditing(false)}
            className="rounded-lg px-2.5 py-1 text-xs font-medium transition hover:opacity-80"
            style={{ color: "var(--color-text-muted)" }}
          >
            Cancelar
          </button>
          <button
            onClick={commit}
            className="rounded-lg px-2.5 py-1 text-xs font-semibold transition hover:opacity-90"
            style={{ background: "var(--color-accent)", color: "#062017" }}
          >
            Salvar
          </button>
        </div>
      </div>
    );
  }

  const num = "font-[family-name:var(--font-mono)] text-[13px] tabular sm:text-right";
  const label = "mb-0.5 block text-[10px] font-semibold uppercase tracking-wide sm:hidden";

  return (
    <div className={`group grid grid-cols-[44px_minmax(0,1fr)_28px] items-start gap-x-3 gap-y-2 px-3.5 py-3 ${FINANCE_COLS}`}>
      <span className="pt-0.5 font-[family-name:var(--font-mono)] text-[12px] sm:pt-0" style={{ color: "var(--color-text-faint)" }}>
        {shortDate(entry.entry_date)}
      </span>
      <button
        type="button"
        onClick={startEditing}
        className="min-w-0 text-left text-[14px] leading-snug transition hover:opacity-80"
        style={{ color: "var(--color-text)" }}
        title="Clique para editar"
      >
        <span className="line-clamp-2 block">{entry.description}</span>
      </button>

      <div className="col-span-3 col-start-1 row-start-2 grid grid-cols-3 gap-2 pl-[56px] sm:contents">
        <div className="min-w-0">
          <span className={label} style={{ color: "var(--color-text-faint)" }}>
            Faturamento
          </span>
          <p className={`${num} truncate`} style={{ color: "var(--color-text)" }}>
            {formatBRL(entry.revenue)}
          </p>
        </div>
        <div className="min-w-0">
          <span className={label} style={{ color: "var(--color-text-faint)" }}>
            Gastos
          </span>
          <p className={`${num} truncate`} style={{ color: entry.cost > 0 ? "var(--color-danger)" : "var(--color-text-muted)" }}>
            {formatBRL(entry.cost)}
          </p>
        </div>
        <div className="min-w-0">
          <span className={label} style={{ color: "var(--color-text-faint)" }}>
            Lucro
          </span>
          <p className={`${num} truncate font-semibold`} style={{ color: profitColor(profit) }}>
            {formatBRL(profit)}
          </p>
        </div>
      </div>

      <button
        onClick={() => onDeleteRequest(entry)}
        aria-label="Excluir linha"
        className="col-start-3 row-start-1 rounded-lg p-1 transition hover:bg-white/5 sm:col-start-auto sm:row-start-auto sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
        style={{ color: "var(--color-text-muted)" }}
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
          <path
            d="M5 6.5h10M8.5 6.5V5a1 1 0 011-1h1a1 1 0 011 1v1.5M8 9.5v4M12 9.5v4M6 6.5l.6 8a1 1 0 001 .9h4.8a1 1 0 001-.9l.6-8"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
