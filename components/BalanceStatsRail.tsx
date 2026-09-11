import { formatBRL } from "@/lib/format";

interface BalanceStatsRailProps {
  total: number;
  averagePerDay: number | null;
}

export function BalanceStatsRail({ total, averagePerDay }: BalanceStatsRailProps) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      <div
        className="rounded-xl border px-4 py-4"
        style={{ borderColor: "var(--color-border-soft)", background: "var(--color-bg-elevated)" }}
      >
        <p
          className="font-[family-name:var(--font-display)] text-3xl font-semibold tabular"
          style={{ color: total < 0 ? "var(--color-danger)" : "var(--color-accent)" }}
        >
          {formatBRL(total)}
        </p>
        <p className="mt-0.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
          Saldo total
        </p>
      </div>

      <div
        className="rounded-xl border px-4 py-4"
        style={{ borderColor: "var(--color-border-soft)", background: "var(--color-bg-elevated)" }}
      >
        <p
          className="font-[family-name:var(--font-display)] text-3xl font-semibold tabular"
          style={{
            color:
              averagePerDay === null
                ? "var(--color-text-faint)"
                : averagePerDay < 0
                  ? "var(--color-danger)"
                  : "var(--color-accent)",
          }}
        >
          {averagePerDay === null ? "—" : `${averagePerDay >= 0 ? "+" : "-"}${formatBRL(Math.abs(averagePerDay))}`}
        </p>
        <p className="mt-0.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
          Média de aumento por dia (este mês)
        </p>
      </div>
    </div>
  );
}
