import { formatBRL } from "@/lib/format";

export function BalanceTotalCard({ total }: { total: number }) {
  return (
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
  );
}
