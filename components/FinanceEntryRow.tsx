"use client";

import { useState } from "react";
import type { FinanceEntry, FinanceKind } from "@/lib/types";
import type { FinanceEntryInput } from "@/lib/finance";
import { formatBRL, parseBRLAmount } from "@/lib/format";

interface FinanceEntryRowProps {
  entry: FinanceEntry;
  knownProjects: string[];
  onSaveEdit: (entry: FinanceEntry, changes: FinanceEntryInput) => void;
  onDeleteRequest: (entry: FinanceEntry) => void;
}

function shortDate(iso: string): string {
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
}

export function FinanceEntryRow({ entry, knownProjects, onSaveEdit, onDeleteRequest }: FinanceEntryRowProps) {
  const [editing, setEditing] = useState(false);
  const [kind, setKind] = useState<FinanceKind>(entry.kind);
  const [date, setDate] = useState(entry.entry_date);
  const [description, setDescription] = useState(entry.description);
  const [project, setProject] = useState(entry.project ?? "");
  const [amount, setAmount] = useState(String(entry.amount).replace(".", ","));

  const isIncome = entry.kind === "income";

  function startEditing() {
    setKind(entry.kind);
    setDate(entry.entry_date);
    setDescription(entry.description);
    setProject(entry.project ?? "");
    setAmount(String(entry.amount).replace(".", ","));
    setEditing(true);
  }

  function commit() {
    const parsed = parseBRLAmount(amount);
    const desc = description.trim();
    if (!desc || !(parsed > 0) || !date) return; // mantém aberto até estar válido
    setEditing(false);
    const proj = project.trim() || null;
    if (
      kind !== entry.kind ||
      date !== entry.entry_date ||
      desc !== entry.description ||
      proj !== entry.project ||
      parsed !== entry.amount
    ) {
      onSaveEdit(entry, { kind, entry_date: date, description: desc, project: proj, amount: parsed });
    }
  }

  if (editing) {
    const field = { borderColor: "var(--color-border)", background: "var(--color-bg-inset)", color: "var(--color-text)" };
    const onKey = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") commit();
      if (e.key === "Escape") setEditing(false);
    };
    return (
      <div className="space-y-2 px-3.5 py-3" style={{ background: "var(--color-bg-inset)" }}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1.5">
            {(["income", "cost"] as const).map((k) => {
              const active = k === kind;
              const color = k === "income" ? "var(--color-accent)" : "var(--color-danger)";
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className="rounded-full border px-3 py-0.5 text-[11px] font-semibold transition"
                  style={{
                    borderColor: active ? color : "var(--color-border)",
                    color: active ? color : "var(--color-text-muted)",
                    background: "transparent",
                  }}
                >
                  {k === "income" ? "Ganho" : "Gasto"}
                </button>
              );
            })}
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-label="Data"
            className="rounded-lg border px-2 py-0.5 text-[12.5px] outline-none"
            style={{ ...field, colorScheme: "dark" }}
          />
        </div>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={onKey}
          aria-label="Descrição"
          placeholder="Descrição"
          className="w-full rounded-lg border px-2.5 py-1.5 text-[14px] outline-none"
          style={field}
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            value={project}
            onChange={(e) => setProject(e.target.value)}
            onKeyDown={onKey}
            list="finance-projects-edit"
            aria-label="Projeto"
            placeholder="Projeto (opcional)"
            className="min-w-0 rounded-lg border px-2.5 py-1.5 text-[14px] outline-none"
            style={field}
          />
          <datalist id="finance-projects-edit">
            {knownProjects.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={onKey}
            inputMode="decimal"
            aria-label="Valor"
            placeholder="0,00"
            className="min-w-0 rounded-lg border px-2.5 py-1.5 text-right font-[family-name:var(--font-mono)] text-[14px] outline-none"
            style={field}
          />
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

  return (
    <div className="group flex items-center gap-3 px-3.5 py-2.5">
      <span className="w-11 shrink-0 font-[family-name:var(--font-mono)] text-[12px] tabular" style={{ color: "var(--color-text-faint)" }}>
        {shortDate(entry.entry_date)}
      </span>

      <button onClick={startEditing} className="min-w-0 flex-1 text-left" title="Clique para editar">
        <span className="line-clamp-2 block text-[14px] leading-snug" style={{ color: "var(--color-text)" }}>
          {entry.description}
        </span>
        {entry.project && (
          <span className="block truncate text-[11.5px]" style={{ color: "var(--color-text-muted)" }}>
            {entry.project}
          </span>
        )}
      </button>

      <span
        className="shrink-0 font-[family-name:var(--font-mono)] text-[14px] tabular"
        style={{ color: isIncome ? "var(--color-accent)" : "var(--color-danger)" }}
      >
        {isIncome ? "+" : "−"} {formatBRL(entry.amount)}
      </span>

      <button
        onClick={() => onDeleteRequest(entry)}
        aria-label="Excluir lançamento"
        className="shrink-0 rounded-lg p-1.5 transition hover:bg-white/5 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
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
