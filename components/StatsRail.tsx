import type { DashboardStats } from "@/lib/types";

export function StatsRail({ stats, monthLabel }: { stats: DashboardStats; monthLabel: string }) {
  const items = [
    { label: "Hoje", value: stats.today, color: "var(--color-text)" },
    { label: "Concluídas hoje", value: stats.completedToday, color: "var(--color-accent)" },
    { label: "Pendentes", value: stats.pendingToday, color: "var(--color-pending)" },
    { label: `Concluídas em ${monthLabel}`, value: stats.completedThisMonth, color: "var(--color-accent)" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
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
