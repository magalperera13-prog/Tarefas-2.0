import { formatBRL } from "@/lib/format";
import type { FinanceSummary } from "@/lib/finance";

export function FinanceStatsRail({ summary }: { summary: FinanceSummary }) {
  const profitColor =
    summary.profit > 0 ? "var(--color-accent)" : summary.profit < 0 ? "var(--color-danger)" : "var(--color-text)";
  const margin = summary.margin === null ? "—" : `${summary.margin.toFixed(1).replace(".", ",")}%`;

  const items = [
    { label: "Ganhei", value: formatBRL(summary.income), color: "var(--color-accent)" },
    { label: "Gastei para ganhar", value: formatBRL(summary.cost), color: "var(--color-danger)" },
    { label: "Lucro", value: formatBRL(summary.profit), color: profitColor },
    { label: "Margem de lucro", value: margin, color: profitColor },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border px-3.5 py-3"
          style={{ borderColor: "var(--color-border-soft)", background: "var(--color-bg-elevated)" }}
        >
          <p
            className="truncate font-[family-name:var(--font-display)] text-xl font-semibold tabular sm:text-[22px]"
            style={{ color: item.color }}
          >
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
