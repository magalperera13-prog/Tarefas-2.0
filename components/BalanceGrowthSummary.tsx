import { formatBRL } from "@/lib/format";
import { monthYearShort } from "@/lib/date";

interface MonthTotal {
  monthKey: string;
  total: number;
  isCurrent: boolean;
}

export function BalanceGrowthSummary({ months }: { months: MonthTotal[] }) {
  if (months.length === 0) return null;

  return (
    <div
      className="rounded-xl border p-4"
      style={{ borderColor: "var(--color-border-soft)", background: "var(--color-bg-elevated)" }}
    >
      <h2
        className="mb-3 font-[family-name:var(--font-display)] text-sm font-semibold tracking-wide"
        style={{ color: "var(--color-text-muted)" }}
      >
        CRESCIMENTO MENSAL
      </h2>
      <div className="space-y-2.5">
        {months.map((m, i) => {
          const prev = months[i + 1]; // lista vem do mais recente pro mais antigo
          const delta = prev ? m.total - prev.total : null;
          const pct = prev && prev.total !== 0 && delta !== null ? (delta / Math.abs(prev.total)) * 100 : null;
          const [y, mo] = m.monthKey.split("-").map(Number);
          const positive = delta !== null && delta >= 0;

          return (
            <div key={m.monthKey} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <span className="text-xs capitalize" style={{ color: "var(--color-text-muted)" }}>
                {monthYearShort(y, mo)}
                {m.isCurrent ? " (até agora)" : ""}
              </span>
              <div className="flex items-center gap-2">
                <span
                  className="font-[family-name:var(--font-mono)] text-[13px] tabular"
                  style={{ color: "var(--color-text)" }}
                >
                  {formatBRL(m.total)}
                </span>
                {delta !== null ? (
                  <span
                    className="font-[family-name:var(--font-mono)] text-[12px] tabular"
                    style={{ color: positive ? "var(--color-accent)" : "var(--color-danger)" }}
                  >
                    {positive ? "▲" : "▼"} {formatBRL(Math.abs(delta))}
                    {pct !== null ? ` (${positive ? "+" : "-"}${Math.abs(pct).toFixed(1)}%)` : ""}
                  </span>
                ) : (
                  <span className="text-[12px]" style={{ color: "var(--color-text-faint)" }}>
                    —
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
