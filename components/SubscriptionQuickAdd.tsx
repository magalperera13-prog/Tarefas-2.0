"use client";

import { useState } from "react";

export function SubscriptionQuickAdd({
  onAdd,
}: {
  onAdd: (name: string, monthlyAmount: number, dueDayLabel: string | null) => Promise<void> | void;
}) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const parsedAmount = Number(amount.replace(",", "."));
  const canSubmit = name.trim().length > 0 && parsedAmount > 0 && !submitting;

  async function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    const n = name.trim();
    const value = parsedAmount;
    const due = dueDay.trim() || null;
    setName("");
    setAmount("");
    setDueDay("");
    try {
      await onAdd(n, value, due);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="flex flex-col gap-2 rounded-2xl border p-2 shadow-sm sm:flex-row sm:items-center sm:gap-2 sm:p-2.5"
      style={{ borderColor: "var(--color-border)", background: "var(--color-bg-elevated)" }}
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        placeholder="Nome da assinatura"
        className="min-w-0 flex-1 bg-transparent px-2.5 py-2 text-[15px] outline-none placeholder:text-[var(--color-text-faint)]"
        aria-label="Nome da assinatura"
      />
      <div className="flex items-center gap-2">
        <input
          value={dueDay}
          onChange={(e) => setDueDay(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="Vencimento (opcional)"
          className="w-32 min-w-0 rounded-xl border bg-transparent px-2.5 py-2 text-[13px] outline-none placeholder:text-[var(--color-text-faint)]"
          style={{ borderColor: "var(--color-border)", background: "var(--color-bg-inset)" }}
          aria-label="Vencimento"
        />
        <div
          className="flex min-w-0 items-center gap-1 rounded-xl border px-2.5 sm:w-28"
          style={{ borderColor: "var(--color-border)", background: "var(--color-bg-inset)" }}
        >
          <span className="text-[13px]" style={{ color: "var(--color-text-faint)" }}>
            R$
          </span>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            inputMode="decimal"
            placeholder="0,00"
            className="min-w-0 flex-1 bg-transparent py-2 text-[15px] outline-none placeholder:text-[var(--color-text-faint)]"
            aria-label="Valor mensal"
          />
        </div>
        <button
          onClick={submit}
          disabled={!canSubmit}
          className="shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-40"
          style={{ background: "var(--color-accent)", color: "#062017" }}
        >
          Adicionar
        </button>
      </div>
    </div>
  );
}
