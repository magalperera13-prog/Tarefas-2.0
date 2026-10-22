import type { FinanceEntry } from "@/lib/types";

/** Campos editáveis de uma linha (usado ao adicionar e ao editar). */
export interface FinanceEntryInput {
  entry_date: string;
  description: string;
  revenue: number;
  cost: number;
}

export interface FinanceSummary {
  revenue: number;
  cost: number;
  profit: number;
  /** Lucro / faturamento, em %. null quando não houve faturamento. */
  margin: number | null;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Lucro de uma linha: faturamento - gastos. */
export function entryProfit(e: { revenue: number; cost: number }): number {
  return round2(e.revenue - e.cost);
}

export function summarizeFinance(entries: Pick<FinanceEntry, "revenue" | "cost">[]): FinanceSummary {
  let revenue = 0;
  let cost = 0;
  for (const e of entries) {
    revenue += Number(e.revenue) || 0;
    cost += Number(e.cost) || 0;
  }
  const profit = round2(revenue - cost);
  return {
    revenue: round2(revenue),
    cost: round2(cost),
    profit,
    margin: revenue > 0 ? (profit / revenue) * 100 : null,
  };
}

/**
 * Lê um campo de dinheiro digitado ("1.890,50", "620", vazio).
 * Vazio vale 0; texto inválido ou negativo devolve null.
 */
export function parseMoneyField(raw: string): number | null {
  const t = raw.trim();
  if (t === "") return 0;
  const n = Number(t.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Valor para preencher um campo de edição ("1890,5"; 0 vira vazio). */
export function moneyToField(n: number): string {
  return n ? String(n).replace(".", ",") : "";
}

export function profitColor(n: number): string {
  return n > 0 ? "var(--color-accent)" : n < 0 ? "var(--color-danger)" : "var(--color-text)";
}

/** Garante números válidos mesmo se o banco ainda estiver no formato antigo. */
export function normalizeEntry(row: FinanceEntry): FinanceEntry {
  return { ...row, revenue: Number(row.revenue) || 0, cost: Number(row.cost) || 0 };
}
