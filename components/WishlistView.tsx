"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ToastProvider";
import { WishlistQuickAdd, type WishlistInput } from "@/components/WishlistQuickAdd";
import { WishlistItemRow } from "@/components/WishlistItemRow";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { WishlistItem } from "@/lib/types";
import { WISHLIST_TIERS, summarizeWishlist } from "@/lib/wishlist";
import { formatBRL } from "@/lib/format";

interface WishlistViewProps {
  userId: string;
  initialItems: WishlistItem[];
}

function normalize(row: WishlistItem): WishlistItem {
  return { ...row, price: row.price === null || row.price === undefined ? null : Number(row.price) };
}

export function WishlistView({ userId, initialItems }: WishlistViewProps) {
  const supabase = createClient();
  const { showToast } = useToast();
  const [items, setItems] = useState<WishlistItem[]>(initialItems);
  const [pendingDelete, setPendingDelete] = useState<WishlistItem | null>(null);

  const summary = useMemo(() => summarizeWishlist(items), [items]);

  async function handleAdd(input: WishlistInput) {
    const { data, error } = await supabase
      .from("wishlist_items")
      .insert({ ...input, user_id: userId })
      .select()
      .single();
    if (error || !data) {
      showToast("Não foi possível adicionar o item", "danger");
      return;
    }
    setItems((prev) => [...prev, normalize(data as WishlistItem)]);
    showToast("✓ Item adicionado");
  }

  async function handleToggleBought(item: WishlistItem) {
    const changes = { is_bought: !item.is_bought, bought_at: item.is_bought ? null : new Date().toISOString() };
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, ...changes } : i)));
    const { error } = await supabase.from("wishlist_items").update(changes).eq("id", item.id);
    if (error) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
      showToast("Não foi possível atualizar o item", "danger");
      return;
    }
    showToast(changes.is_bought ? "✓ Marcado como comprado" : "Voltou para a lista");
  }

  async function handleSaveEdit(item: WishlistItem, changes: WishlistInput) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, ...changes } : i)));
    const { error } = await supabase.from("wishlist_items").update(changes).eq("id", item.id);
    if (error) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
      showToast("Não foi possível salvar o item", "danger");
      return;
    }
    showToast("✓ Item atualizado");
  }

  async function handleDeleteConfirmed() {
    if (!pendingDelete) return;
    const item = pendingDelete;
    setPendingDelete(null);
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    const { error } = await supabase.from("wishlist_items").delete().eq("id", item.id);
    if (error) {
      setItems((prev) => [...prev, item]);
      showToast("Não foi possível excluir o item", "danger");
      return;
    }
    showToast("✓ Item excluído");
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <div
          className="rounded-xl border px-3.5 py-3"
          style={{ borderColor: "var(--color-border-soft)", background: "var(--color-bg-elevated)" }}
        >
          <p className="truncate font-[family-name:var(--font-display)] text-xl font-semibold tabular sm:text-[22px]">
            {formatBRL(summary.total)}
          </p>
          <p className="mt-0.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
            Total a comprar · {summary.pendingCount} {summary.pendingCount === 1 ? "item" : "itens"}
          </p>
        </div>
        {summary.tiers.map((t) => {
          const info = WISHLIST_TIERS.find((x) => x.value === t.tier)!;
          return (
            <div
              key={t.tier}
              className="rounded-xl border px-3.5 py-3"
              style={{ borderColor: "var(--color-border-soft)", background: "var(--color-bg-elevated)" }}
            >
              <p
                className="truncate font-[family-name:var(--font-display)] text-xl font-semibold tabular sm:text-[22px]"
                style={{ color: info.color }}
              >
                {formatBRL(t.total)}
              </p>
              <p className="mt-0.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
                {info.label} · {t.pending.length}
              </p>
            </div>
          );
        })}
      </div>

      <WishlistQuickAdd onAdd={handleAdd} />

      <div className="space-y-6">
        {WISHLIST_TIERS.map((info) => {
          const t = summary.tiers.find((x) => x.tier === info.value)!;
          const rows = [...t.pending, ...t.bought];
          return (
            <section key={info.value} aria-label={info.label}>
              <div className="mb-2.5 flex items-baseline justify-between gap-3">
                <h2
                  className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-wide"
                  style={{ color: info.color }}
                >
                  {info.label.toUpperCase()}
                </h2>
                <span className="text-xs tabular" style={{ color: "var(--color-text-muted)" }}>
                  {t.pending.length > 0 ? formatBRL(t.total) : ""}
                  {t.withoutPrice > 0 ? ` · ${t.withoutPrice} sem preço` : ""}
                </span>
              </div>
              {rows.length === 0 ? (
                <div
                  className="rounded-xl border border-dashed px-4 py-5 text-center text-[13px]"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text-faint)" }}
                >
                  Nada aqui ainda. {info.hint}.
                </div>
              ) : (
                <div
                  className="divide-y overflow-hidden rounded-xl border"
                  style={{ borderColor: "var(--color-border-soft)", background: "var(--color-bg-elevated)" }}
                >
                  {rows.map((item) => (
                    <div key={item.id} style={{ borderColor: "var(--color-border-soft)" }}>
                      <WishlistItemRow
                        item={item}
                        onToggleBought={handleToggleBought}
                        onSaveEdit={handleSaveEdit}
                        onDeleteRequest={setPendingDelete}
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Excluir item"
        description={pendingDelete ? `Tem certeza que deseja excluir "${pendingDelete.title}" da lista? Essa ação não pode ser desfeita.` : ""}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
