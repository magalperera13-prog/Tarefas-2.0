"use client";

import { useState } from "react";
import type { FinanceKind } from "@/lib/types";
import type { FinanceEntryInput } from "@/lib/finance";
import { parseBRLAmount } from "@/lib/format";

interface FinanceQuickAddProps {
  todayISO: string;
  knownProjects: string[];
  onAdd: (data: FinanceEntryInput) => Promise<void> | void;
}

const KINDS: { value: FinanceKind; label: string }[] = [
  { value: "income", label: "Ganho" },
  { value: "cost", label: "Gasto" },
];

export function FinanceQuickAdd({ todayISO, knownProjects, onAdd }: FinanceQuickAddProps) {
  const [kind, setKind] = useState<FinanceKind>("income");
  const [date, setDate] = useState(todayISO);
  const [description, setDescription] = useState("");
  const [project, setProject] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const parsed = parseBRLAmount(amount);
  const canSubmit =
    description.trim().length > 0 && amount.trim() !== "" && parsed > 0 && date !== "" && !submitting;

  async function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    const data: FinanceEntryInput = {
      kind,
      entry_date: date,
      description: description.trim(),
      project: project.trim() || null,
      amount: parsed,
    };
    // Mantém tipo, data e projeto: é comum lançar vários itens seguidos do mesmo projeto.
    setDescription("");
    setAmount("");
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
  const accent = kind === "income" ? "var(--color-accent)" : "var(--color-danger)";

  return (
    <div
      className="space-y-3 rounded-2xl border p-3 shadow-sm"
      style={{ borderColor: "var(--color-border)", background: "var(--color-bg-elevated)" }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1.5" role="radiogroup" aria-label="Tipo de lançamento">
          {KINDS.map((k) => {
            const active = k.value === kind;
            const color = k.value === "income" ? "var(--color-accent)" : "var(--color-danger)";
            return (
              <button
                key={k.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setKind(k.value)}
                className="rounded-full border px-3.5 py-1 text-xs font-semibold transition"
                style={{
                  borderColor: active ? color : "var(--color-border)",
                  background: active ? (k.value === "income" ? "var(--color-accent-soft)" : "var(--color-danger-soft)") : "transparent",
                  color: active ? color : "var(--color-text-muted)",
                }}
              >
                {k.label}
              </button>
            );
          })}
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Data"
          className="rounded-lg border px-2.5 py-1 text-[13px] outline-none"
          style={{ ...field, colorScheme: "dark", color: "var(--color-text)" }}
        />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_11rem]">
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={onEnter}
          placeholder={kind === "income" ? "O que você ganhou?" : "Com o que você gastou?"}
          className="min-w-0 rounded-xl border px-3 py-2.5 text-[15px] outline-none placeholder:text-[var(--color-text-faint)]"
          style={field}
          aria-label="Descrição"
        />
        <input
          value={project}
          onChange={(e) => setProject(e.target.value)}
          onKeyDown={onEnter}
          list="finance-projects"
          placeholder="Projeto (opcional)"
          className="min-w-0 rounded-xl border px-3 py-2.5 text-[15px] outline-none placeholder:text-[var(--color-text-faint)]"
          style={field}
          aria-label="Projeto"
        />
        <datalist id="finance-projects">
          {knownProjects.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
      </div>

      <div className="flex gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-xl border px-3" style={field}>
          <span className="text-[13px]" style={{ color: "var(--color-text-faint)" }}>
            R$
          </span>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={onEnter}
            inputMode="decimal"
            placeholder="0,00"
            className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] outline-none placeholder:text-[var(--color-text-faint)]"
            aria-label="Valor"
          />
        </div>
        <button
          onClick={submit}
          disabled={!canSubmit}
          className="shrink-0 rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:opacity-40"
          style={{ background: accent, color: kind === "income" ? "#062017" : "#fff" }}
        >
          Adicionar
        </button>
      </div>
    </div>
  );
}
