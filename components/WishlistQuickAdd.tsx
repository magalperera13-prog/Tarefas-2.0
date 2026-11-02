"use client";

import { useState } from "react";
import type { WishlistTier } from "@/lib/types";
import { WISHLIST_TIERS, parseOptionalPrice } from "@/lib/wishlist";

export interface WishlistInput {
  title: string;
  price: number | null;
  tier: WishlistTier;
}

interface WishlistQuickAddProps {
  onAdd: (data: WishlistInput) => Promise<void> | void;
}

export function WishlistQuickAdd({ onAdd }: WishlistQuickAddProps) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [tier, setTier] = useState<WishlistTier>("medium");
  const [submitting, setSubmitting] = useState(false);

  const parsed = parseOptionalPrice(price);
  const canSubmit = title.trim().length > 0 && parsed !== undefined && !submitting;

  async function submit() {
    if (!canSubmit || parsed === undefined) return;
    setSubmitting(true);
    const data: WishlistInput = { title: title.trim(), price: parsed, tier };
    setTitle("");
    setPrice("");
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

  return (
    <div
      className="space-y-3 rounded-2xl border p-3 shadow-sm"
      style={{ borderColor: "var(--color-border)", background: "var(--color-bg-elevated)" }}
    >
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Faixa de preço">
        {WISHLIST_TIERS.map((t) => {
          const active = t.value === tier;
          return (
            <button
              key={t.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setTier(t.value)}
              className="rounded-full border px-3.5 py-1 text-xs font-semibold transition"
              style={{
                borderColor: active ? t.color : "var(--color-border)",
                background: active ? t.soft : "transparent",
                color: active ? t.color : "var(--color-text-muted)",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={onEnter}
        placeholder="O que você precisa comprar?"
        className="w-full rounded-xl border px-3 py-2.5 text-[15px] outline-none placeholder:text-[var(--color-text-faint)]"
        style={field}
        aria-label="Item"
      />

      <div className="flex gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-xl border px-3" style={field}>
          <span className="text-[13px]" style={{ color: "var(--color-text-faint)" }}>
            R$
          </span>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onKeyDown={onEnter}
            inputMode="decimal"
            placeholder="Preço estimado (opcional)"
            className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] outline-none placeholder:text-[var(--color-text-faint)]"
            aria-label="Preço estimado"
          />
        </div>
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
