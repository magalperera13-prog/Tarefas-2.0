import type { ExpenseStats } from "@/lib/types";
import type { CategoryTotal } from "@/lib/expense-categories";
import { formatBRL } from "@/lib/format";

interface ExpenseStatsRailProps {
  stats: ExpenseStats;
  monthLabel: string;
  categories: CategoryTotal[];
}

export function ExpenseStatsRail({ stats, monthLabel, categories }: ExpenseStatsRailProps) {
  const items = [
    { label: "Gasto hoje", value: formatBRL(stats.totalToday) },
    { label: `Gasto em ${monthLabel}`, value: formatBRL(stats.totalThisMonth) },
    { label: "Média por dia", value: formatBRL(stats.averagePerDay) },
  ];

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border px-3.5 py-3"
            style={{ borderColor: "var(--color-border-soft)", background: "var(--color-bg-elevated)" }}
          >
            <p className="font-[family-name:var(--font-display)] text-2xl font-semibold tabular" style={{ color: "var(--color-danger)" }}>
              {item.value}
            </p>
            <p className="mt-0.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
              {item.label}
            </p>
          </div>
        ))}
      </div>

      <div
        className="rounded-xl border px-3.5 py-3"
        style={{ borderColor: "var(--color-border-soft)", background: "var(--color-bg-elevated)" }}
      >
        <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-faint)" }}>
          Por categoria em {monthLabel}
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
          {categories.map((c) => (
            <div key={c.label} className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: c.color }} aria-hidden="true" />
                <span className="truncate text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {c.label}
                </span>
              </div>
              <p
                className="mt-0.5 truncate font-[family-name:var(--font-mono)] text-[15px] font-semibold tabular"
                style={{ color: c.total > 0 ? "var(--color-text)" : "var(--color-text-faint)" }}
              >
                {formatBRL(c.total)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
