"use client";

import { useState } from "react";
import { formatBRL } from "@/lib/format";
import { parseMoneyField, profitColor, type FinanceEntryInput } from "@/lib/finance";

interface FinanceQuickAddProps {
  todayISO: string;
  onAdd: (data: FinanceEntryInput) => Promise<void> | void;
}

export function FinanceQuickAdd({ todayISO, onAdd }: FinanceQuickAddProps) {
  const [date, setDate] = useState(todayISO);
  const [description, setDescription] = useState("");
  const [revenue, setRevenue] = useState("");
  const [cost, setCost] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const rev = parseMoneyField(revenue);
  const cst = parseMoneyField(cost);
  const valid = rev !== null && cst !== null && (rev > 0 || cst > 0);
  const profit = rev !== null && cst !== null ? Math.round((rev - cst) * 100) / 100 : null;
  const canSubmit = description.trim().length > 0 && valid && date !== "" && !submitting;

  async function submit() {
    if (!canSubmit || rev === null || cst === null) return;
    setSubmitting(true);
    const data: FinanceEntryInput = { entry_date: date, description: description.trim(), revenue: rev, cost: cst };
    setDescription("");
    setRevenue("");
    setCost("");
    try {
      await onAdd(data);
    } finally {
      setSubmitting(false);
    }
  }

  const onEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") submit();
  };
  const field = { borderColor: "var(--color-border)", background: "var(--color-bg-inset)" };

  const money = (label: string, value: string, set: (v: string) => void, color: string) => (
    <label className="block min-w-0">
      <span className="mb-1 block text-[11px] font-medium" style={{ color }}>
        {label}
      </span>
      <div className="flex items-center gap-1.5 rounded-xl border px-3" style={field}>
        <span className="text-[13px]" style={{ color: "var(--color-text-faint)" }}>
          R$
        </span>
        <input
          value={value}
          onChange={(e) => set(e.target.value)}
          onKeyDown={onEnter}
          inputMode="decimal"
          placeholder="0,00"
          className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] outline-none placeholder:text-[var(--color-text-faint)]"
          aria-label={label}
        />
      </div>
    </label>
  );

  return (
    <div
      className="space-y-3 rounded-2xl border p-3 shadow-sm"
      style={{ borderColor: "var(--color-border)", background: "var(--color-bg-elevated)" }}
    >
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={onEnter}
          placeholder="Descrição (ex.: Dia 21/10)"
          className="min-w-0 rounded-xl border px-3 py-2.5 text-[15px] outline-none placeholder:text-[var(--color-text-faint)]"
          style={field}
          aria-label="Descrição"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Data"
          className="rounded-xl border px-2.5 py-2 text-[13px] outline-none"
          style={{ ...field, colorScheme: "dark", color: "var(--color-text)" }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_1fr]">
        {money("Faturamento", revenue, setRevenue, "var(--color-text-muted)")}
        {money("Gastos", cost, setCost, "var(--color-danger)")}
        <div className="col-span-2 sm:col-span-1">
          <span className="mb-1 block text-[11px] font-medium" style={{ color: "var(--color-text-muted)" }}>
            Lucro (faturamento − gastos)
          </span>
          <div
            className="flex min-h-[46px] items-center rounded-xl border px-3 font-[family-name:var(--font-mono)] text-[15px] font-semibold tabular"
            style={{ borderColor: "var(--color-border-soft)", background: "var(--color-bg-inset)", color: profit === null ? "var(--color-text-faint)" : profitColor(profit) }}
          >
            {profit === null ? "—" : formatBRL(profit)}
          </div>
        </div>
      </div>

      <button
        onClick={submit}
        disabled={!canSubmit}
        className="w-full rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:opacity-40"
        style={{ background: "var(--color-accent)", color: "#062017" }}
      >
        Adicionar linha
      </button>
    </div>
  );
}
