"use client";

import { useState } from "react";
import type { WishlistItem } from "@/lib/types";
import { WISHLIST_TIERS, parseOptionalPrice, priceToField, tierInfo } from "@/lib/wishlist";
import { formatBRL } from "@/lib/format";
import type { WishlistInput } from "@/components/WishlistQuickAdd";

interface WishlistItemRowProps {
  item: WishlistItem;
  onToggleBought: (item: WishlistItem) => void;
  onSaveEdit: (item: WishlistItem, changes: WishlistInput) => void;
  onDeleteRequest: (item: WishlistItem) => void;
}

export function WishlistItemRow({ item, onToggleBought, onSaveEdit, onDeleteRequest }: WishlistItemRowProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [price, setPrice] = useState(priceToField(item.price));
  const [tier, setTier] = useState(item.tier);

  const info = tierInfo(item.tier);

  function startEditing() {
    setTitle(item.title);
    setPrice(priceToField(item.price));
    setTier(item.tier);
    setEditing(true);
  }

  function commit() {
    const t = title.trim();
    const p = parseOptionalPrice(price);
    if (!t || p === undefined) return; // mantém aberto até estar válido
    setEditing(false);
    if (t !== item.title || p !== item.price || tier !== item.tier) {
      onSaveEdit(item, { title: t, price: p, tier });
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
        <div className="flex flex-wrap gap-1.5">
          {WISHLIST_TIERS.map((t) => {
            const active = t.value === tier;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setTier(t.value)}
                className="rounded-full border px-3 py-0.5 text-[11px] font-semibold transition"
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
        <div className="grid grid-cols-[1fr_8rem] gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={onKey}
            aria-label="Item"
            className="min-w-0 rounded-lg border px-2.5 py-1.5 text-[14px] outline-none"
            style={field}
          />
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onKeyDown={onKey}
            inputMode="decimal"
            aria-label="Preço estimado"
            placeholder="R$ 0,00"
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
    <div className="group flex items-center gap-3 px-3.5 py-3">
      <button
        onClick={() => onToggleBought(item)}
        role="checkbox"
        aria-checked={item.is_bought}
        aria-label={item.is_bought ? "Desmarcar como comprado" : "Marcar como comprado"}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition"
        style={{
          borderColor: item.is_bought ? "var(--color-accent)" : info.color,
          background: item.is_bought ? "var(--color-accent)" : "transparent",
        }}
      >
        {item.is_bought && (
          <svg viewBox="0 0 20 20" className="h-3 w-3" fill="none">
            <path d="M5 10.5l3.2 3.2L15 6.8" stroke="#062017" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <button
        type="button"
        onClick={startEditing}
        className="min-w-0 flex-1 text-left text-[14.5px] leading-snug transition hover:opacity-80"
        style={{
          color: item.is_bought ? "var(--color-text-faint)" : "var(--color-text)",
          textDecoration: item.is_bought ? "line-through" : "none",
        }}
        title="Clique para editar"
      >
        <span className="line-clamp-2 block">{item.title}</span>
      </button>

      <span
        className="shrink-0 font-[family-name:var(--font-mono)] text-[13px] tabular"
        style={{ color: item.is_bought ? "var(--color-text-faint)" : item.price === null ? "var(--color-text-faint)" : "var(--color-text)" }}
      >
        {item.price === null ? "—" : formatBRL(item.price)}
      </span>

      <button
        onClick={() => onDeleteRequest(item)}
        aria-label="Excluir item"
        className="shrink-0 rounded-lg p-1 transition hover:bg-white/5 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
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
