import type { SubscriptionStats } from "@/lib/types";
import { formatBRL } from "@/lib/format";

export function SubscriptionStatsRail({ stats }: { stats: SubscriptionStats }) {
  const items = [
    { label: "Total mensal", value: formatBRL(stats.totalMonthly), color: "var(--color-text)" },
    { label: "Total pago no mês", value: formatBRL(stats.totalPaidThisMonth), color: "var(--color-accent)" },
    { label: "Total anual estimado", value: formatBRL(stats.totalYearlyEstimate), color: "var(--color-danger)" },
  ];

  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border px-3.5 py-3"
          style={{ borderColor: "var(--color-border-soft)", background: "var(--color-bg-elevated)" }}
        >
          <p className="font-[family-name:var(--font-display)] text-2xl font-semibold tabular" style={{ color: item.color }}>
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
