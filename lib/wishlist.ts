import type { WishlistItem, WishlistTier } from "@/lib/types";

export const WISHLIST_TIERS: { value: WishlistTier; label: string; hint: string; color: string; soft: string }[] = [
  {
    value: "cheap",
    label: "Barato",
    hint: "Cabe no bolso sem pesar",
    color: "var(--color-accent)",
    soft: "var(--color-accent-soft)",
  },
  {
    value: "medium",
    label: "Mais ou menos",
    hint: "Precisa de um pouco de planejamento",
    color: "var(--color-pending)",
    soft: "color-mix(in srgb, var(--color-pending) 16%, transparent)",
  },
  {
    value: "expensive",
    label: "Caro",
    hint: "Exige juntar dinheiro",
    color: "var(--color-danger)",
    soft: "var(--color-danger-soft)",
  },
];

export function tierInfo(tier: WishlistTier) {
  return WISHLIST_TIERS.find((t) => t.value === tier) ?? WISHLIST_TIERS[1];
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export interface TierSummary {
  tier: WishlistTier;
  /** Itens ainda não comprados. */
  pending: WishlistItem[];
  bought: WishlistItem[];
  /** Soma dos preços estimados dos itens ainda não comprados. */
  total: number;
  /** Itens pendentes sem preço informado. */
  withoutPrice: number;
}

export function summarizeWishlist(items: WishlistItem[]): { tiers: TierSummary[]; total: number; pendingCount: number } {
  const tiers = WISHLIST_TIERS.map((t) => {
    const mine = items
      .filter((i) => i.tier === t.value)
      .sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
    const pending = mine.filter((i) => !i.is_bought);
    const bought = mine.filter((i) => i.is_bought);
    return {
      tier: t.value,
      pending,
      bought,
      total: round2(pending.reduce((sum, i) => sum + (Number(i.price) || 0), 0)),
      withoutPrice: pending.filter((i) => i.price === null).length,
    };
  });
  return {
    tiers,
    total: round2(tiers.reduce((sum, t) => sum + t.total, 0)),
    pendingCount: tiers.reduce((sum, t) => sum + t.pending.length, 0),
  };
}

/** Preço opcional digitado: vazio = null; inválido = undefined. */
export function parseOptionalPrice(raw: string): number | null | undefined {
  const t = raw.trim();
  if (t === "") return null;
  const n = Number(t.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export function priceToField(n: number | null): string {
  return n === null || n === undefined ? "" : String(n).replace(".", ",");
}
