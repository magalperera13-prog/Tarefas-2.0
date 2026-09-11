"use client";

import { useState } from "react";

export function BalanceQuickAdd({
  onAdd,
}: {
  onAdd: (name: string, amount: number) => Promise<void> | void;
}) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const parsedAmount = Number(amount.replace(",", "."));
  const canSubmit = name.trim().length > 0 && !Number.isNaN(parsedAmount) && amount.trim() !== "" && !submitting;

  async function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    const n = name.trim();
    const value = parsedAmount;
    setName("");
    setAmount("");
    try {
      await onAdd(n, value);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="flex flex-col gap-2 rounded-2xl border p-2 shadow-sm sm:flex-row sm:items-center sm:gap-3 sm:p-2.5"
      style={{ borderColor: "var(--color-border)", background: "var(--color-bg-elevated)" }}
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        placeholder="Onde está esse dinheiro? (ex.: Nubank, Investimento X)"
        className="min-w-0 flex-1 bg-transparent px-2.5 py-2 text-[15px] outline-none placeholder:text-[var(--color-text-faint)]"
        aria-label="Nome do saldo"
      />
      <div className="flex items-center gap-2">
        <div
          className="flex min-w-0 flex-1 items-center gap-1 rounded-xl border px-2.5 sm:w-32"
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
            aria-label="Valor"
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
