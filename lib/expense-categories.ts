import type { Expense, ExpenseCategory } from "@/lib/types";

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string; color: string }[] = [
  { value: "filha", label: "Filha", color: "#f472b6" },
  { value: "alimentacao", label: "Alimentação", color: "#fb923c" },
  { value: "lazer", label: "Lazer", color: "#60a5fa" },
  { value: "casa", label: "Compras da casa", color: "#a78bfa" },
  { value: "assinatura", label: "Assinatura", color: "#2dd4bf" },
  { value: "vaidade", label: "Vaidade pessoal", color: "#facc15" },
];

export const NO_CATEGORY_COLOR = "var(--color-text-faint)";

export function categoryInfo(value: ExpenseCategory | null | undefined) {
  return EXPENSE_CATEGORIES.find((c) => c.value === value) ?? null;
}

export interface CategoryTotal {
  value: ExpenseCategory | null;
  label: string;
  color: string;
  total: number;
  count: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Total por categoria (as 6 sempre aparecem) + "Sem categoria", só quando houver gastos nela. */
export function summarizeByCategory(expenses: Pick<Expense, "amount" | "category">[]): CategoryTotal[] {
  const rows: CategoryTotal[] = EXPENSE_CATEGORIES.map((c) => ({ ...c, total: 0, count: 0 }));
  const none: CategoryTotal = { value: null, label: "Sem categoria", color: NO_CATEGORY_COLOR, total: 0, count: 0 };
  for (const e of expenses) {
    const row = rows.find((r) => r.value === e.category) ?? none;
    row.total += Number(e.amount) || 0;
    row.count += 1;
  }
  for (const r of [...rows, none]) r.total = round2(r.total);
  return none.count > 0 ? [...rows, none] : rows;
}
