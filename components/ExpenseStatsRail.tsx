import type { ExpenseStats } from "@/lib/types";
import { formatBRL } from "@/lib/format";

export function ExpenseStatsRail({ stats, monthLabel }: { stats: ExpenseStats; monthLabel: string }) {
  const items = [
    { label: "Gasto hoje", value: formatBRL(stats.totalToday) },
    { label: `Gasto em ${monthLabel}`, value: formatBRL(stats.totalThisMonth) },
    { label: "Média por dia", value: formatBRL(stats.averagePerDay) },
  ];

  return (
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
  );
}
