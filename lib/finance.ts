import type { FinanceEntry, FinanceKind } from "@/lib/types";

export const NO_PROJECT_LABEL = "Sem projeto";

/** Campos editáveis de um lançamento (usado ao adicionar e ao editar). */
export interface FinanceEntryInput {
  kind: FinanceKind;
  entry_date: string;
  description: string;
  project: string | null;
  amount: number;
}

export interface ProjectSummary {
  project: string;
  income: number;
  cost: number;
  profit: number;
}

export interface FinanceSummary {
  income: number;
  cost: number;
  profit: number;
  /** Lucro / ganho, em %. null quando não houve ganho no período. */
  margin: number | null;
  byProject: ProjectSummary[];
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Normaliza o nome do projeto para agrupar ("vibe force" = "Vibe Force "). */
export function projectKey(project: string | null | undefined): string {
  return (project ?? "").trim().toLowerCase();
}

export function summarizeFinance(entries: FinanceEntry[]): FinanceSummary {
  let income = 0;
  let cost = 0;
  const map = new Map<string, { label: string; income: number; cost: number }>();

  for (const e of entries) {
    const key = projectKey(e.project);
    const row = map.get(key) ?? { label: key ? (e.project ?? "").trim() : NO_PROJECT_LABEL, income: 0, cost: 0 };
    if (e.kind === "income") {
      income += e.amount;
      row.income += e.amount;
    } else {
      cost += e.amount;
      row.cost += e.amount;
    }
    map.set(key, row);
  }

  const byProject = Array.from(map.values())
    .map((r) => ({
      project: r.label,
      income: round2(r.income),
      cost: round2(r.cost),
      profit: round2(r.income - r.cost),
    }))
    // Projetos mais lucrativos primeiro; "Sem projeto" sempre por último.
    .sort((a, b) => {
      if (a.project === NO_PROJECT_LABEL) return 1;
      if (b.project === NO_PROJECT_LABEL) return -1;
      return b.profit - a.profit;
    });

  const profit = round2(income - cost);
  return {
    income: round2(income),
    cost: round2(cost),
    profit,
    margin: income > 0 ? (profit / income) * 100 : null,
    byProject,
  };
}

/** Nomes de projeto distintos já usados (para sugerir ao digitar), em ordem alfabética. */
export function distinctProjects(entries: { project: string | null }[]): string[] {
  const seen = new Map<string, string>();
  for (const e of entries) {
    const key = projectKey(e.project);
    if (key && !seen.has(key)) seen.set(key, (e.project ?? "").trim());
  }
  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b, "pt-BR"));
}
