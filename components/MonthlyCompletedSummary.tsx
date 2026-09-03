import { monthYearShort } from "@/lib/date";

interface MonthlyCompletedSummaryProps {
  data: { monthKey: string; count: number }[];
}

export function MonthlyCompletedSummary({ data }: MonthlyCompletedSummaryProps) {
  if (data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.count));

  return (
    <div
      className="rounded-xl border p-4"
      style={{ borderColor: "var(--color-border-soft)", background: "var(--color-bg-elevated)" }}
    >
      <h2
        className="mb-3 font-[family-name:var(--font-display)] text-sm font-semibold tracking-wide"
        style={{ color: "var(--color-text-muted)" }}
      >
        TAREFAS CONCLUÍDAS POR MÊS
      </h2>
      <div className="space-y-2">
        {data.map(({ monthKey, count }) => {
          const [y, m] = monthKey.split("-").map(Number);
          const isBest = count === max && max > 0;
          const pct = max > 0 ? Math.max((count / max) * 100, 4) : 0;
          return (
            <div key={monthKey} className="flex items-center gap-3">
              <span
                className="w-20 shrink-0 text-xs capitalize"
                style={{ color: isBest ? "var(--color-accent)" : "var(--color-text-muted)" }}
              >
                {monthYearShort(y, m)}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: "var(--color-bg-inset)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: isBest ? "var(--color-accent)" : "var(--color-border)" }}
                />
              </div>
              <span
                className="w-6 shrink-0 text-right font-[family-name:var(--font-mono)] text-xs tabular"
                style={{ color: isBest ? "var(--color-accent)" : "var(--color-text)" }}
              >
                {count}
              </span>
              <span className="w-4 shrink-0 text-xs">{isBest ? "🏆" : ""}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
