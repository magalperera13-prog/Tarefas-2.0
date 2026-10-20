"use client";

import { useState } from "react";
import type { PixKeyType } from "@/lib/types";
import { PIX_KEY_TYPES } from "@/lib/pix";

interface PixQuickAddProps {
  existingBanks: string[];
  onAdd: (data: { bank_name: string; key_type: PixKeyType; key_value: string }) => Promise<void> | void;
}

export function PixQuickAdd({ existingBanks, onAdd }: PixQuickAddProps) {
  const [bank, setBank] = useState("");
  const [type, setType] = useState<PixKeyType>("cpf");
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const placeholder = PIX_KEY_TYPES.find((t) => t.value === type)?.placeholder ?? "";
  const canSubmit = bank.trim().length > 0 && value.trim().length > 0 && !submitting;

  async function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    const data = { bank_name: bank.trim(), key_type: type, key_value: value.trim() };
    // Mantém o banco preenchido: é comum cadastrar várias chaves do mesmo banco em sequência.
    setValue("");
    try {
      await onAdd(data);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="space-y-3 rounded-2xl border p-3 shadow-sm"
      style={{ borderColor: "var(--color-border)", background: "var(--color-bg-elevated)" }}
    >
      <input
        value={bank}
        onChange={(e) => setBank(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        list="pix-banks"
        placeholder="Banco (ex.: Nubank, Inter, Itaú)"
        className="w-full rounded-xl border px-3 py-2.5 text-[15px] outline-none placeholder:text-[var(--color-text-faint)]"
        style={{ borderColor: "var(--color-border)", background: "var(--color-bg-inset)" }}
        aria-label="Banco"
      />
      <datalist id="pix-banks">
        {existingBanks.map((b) => (
          <option key={b} value={b} />
        ))}
      </datalist>

      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Tipo de chave">
        {PIX_KEY_TYPES.map((t) => {
          const active = t.value === type;
          return (
            <button
              key={t.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setType(t.value)}
              className="rounded-full border px-3 py-1 text-xs font-medium transition"
              style={{
                borderColor: active ? "var(--color-accent)" : "var(--color-border)",
                background: active ? "var(--color-accent-soft)" : "transparent",
                color: active ? "var(--color-accent)" : "var(--color-text-muted)",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-xl border px-3 py-2.5 font-[family-name:var(--font-mono)] text-[14px] outline-none placeholder:text-[var(--color-text-faint)]"
          style={{ borderColor: "var(--color-border)", background: "var(--color-bg-inset)" }}
          aria-label="Chave Pix"
        />
        <button
          onClick={submit}
          disabled={!canSubmit}
          className="shrink-0 rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:opacity-40"
          style={{ background: "var(--color-accent)", color: "#062017" }}
        >
          Adicionar
        </button>
      </div>
    </div>
  );
}
