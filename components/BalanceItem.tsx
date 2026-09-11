"use client";

import { useEffect, useRef, useState } from "react";
import type { Balance } from "@/lib/types";
import { formatBRL } from "@/lib/format";

interface BalanceItemProps {
  balance: Balance;
  onSaveEdit: (balance: Balance, changes: { name: string; amount: number }) => void;
  onDeleteRequest: (balance: Balance) => void;
}

export function BalanceItem({ balance, onSaveEdit, onDeleteRequest }: BalanceItemProps) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(balance.name);
  const [draftAmount, setDraftAmount] = useState(String(balance.amount).replace(".", ","));
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      nameRef.current?.focus();
      nameRef.current?.select();
    }
  }, [editing]);

  function startEditing() {
    setDraftName(balance.name);
    setDraftAmount(String(balance.amount).replace(".", ","));
    setEditing(true);
  }

  function commitEdit() {
    const name = draftName.trim();
    const amount = Number(draftAmount.replace(",", "."));
    setEditing(false);
    if (!name || Number.isNaN(amount)) {
      startEditing();
      return;
    }
    if (name !== balance.name || amount !== balance.amount) {
      onSaveEdit(balance, { name, amount });
    }
  }

  function cancelEdit() {
    setEditing(false);
  }

  if (editing) {
    return (
      <div
        className="flex items-center gap-2 rounded-xl border px-3.5 py-2.5"
        style={{ borderColor: "var(--color-accent)", background: "var(--color-bg-elevated)" }}
      >
        <input
          ref={nameRef}
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitEdit();
            if (e.key === "Escape") cancelEdit();
          }}
          className="min-w-0 flex-1 bg-transparent text-[14px] outline-none"
          style={{ color: "var(--color-text)" }}
        />
        <div className="flex items-center gap-1">
          <span className="text-[12px]" style={{ color: "var(--color-text-faint)" }}>
            R$
          </span>
          <input
            value={draftAmount}
            onChange={(e) => setDraftAmount(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitEdit();
              if (e.key === "Escape") cancelEdit();
            }}
            inputMode="decimal"
            className="w-20 bg-transparent text-right font-[family-name:var(--font-mono)] text-[13px] tabular outline-none"
            style={{ color: "var(--color-text)" }}
          />
        </div>
        <button
          onClick={commitEdit}
          className="rounded-lg px-2 py-1 text-xs font-semibold transition hover:opacity-90"
          style={{ background: "var(--color-accent)", color: "#062017" }}
        >
          Salvar
        </button>
      </div>
    );
  }

  return (
    <div
      className="group flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition"
      style={{ borderColor: "var(--color-border-soft)", background: "var(--color-bg-elevated)" }}
    >
      <button
        onClick={startEditing}
        className="min-w-0 flex-1 truncate text-left text-[14px]"
        style={{ color: "var(--color-text)" }}
        title="Clique para editar"
      >
        {balance.name}
      </button>
      <span
        className="font-[family-name:var(--font-mono)] text-[14px] tabular"
        style={{ color: balance.amount < 0 ? "var(--color-danger)" : "var(--color-accent)" }}
      >
        {formatBRL(balance.amount)}
      </span>
      <button
        onClick={() => onDeleteRequest(balance)}
        aria-label="Excluir saldo"
        className="shrink-0 rounded-lg p-1.5 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100 hover:bg-white/5"
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
