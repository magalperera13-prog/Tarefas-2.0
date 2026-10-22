import { formatBRL } from "@/lib/format";
import { NO_PROJECT_LABEL, type ProjectSummary } from "@/lib/finance";

export function FinanceProjectSummary({ projects }: { projects: ProjectSummary[] }) {
  // Só vale mostrar quando há pelo menos um projeto de verdade — se tudo está
  // "sem projeto", o resumo de cima já diz tudo.
  if (!projects.some((p) => p.project !== NO_PROJECT_LABEL)) return null;

  return (
    <div
      className="rounded-xl border px-4 py-3.5"
      style={{ borderColor: "var(--color-border-soft)", background: "var(--color-bg-elevated)" }}
    >
      <h2
        className="mb-2.5 font-[family-name:var(--font-display)] text-xs font-semibold tracking-wide"
        style={{ color: "var(--color-text-muted)" }}
      >
        LUCRO POR PROJETO
      </h2>
      <div className="divide-y" style={{ borderColor: "var(--color-border-soft)" }}>
        {projects.map((p) => (
          <div key={p.project} className="flex items-center justify-between gap-3 py-2" style={{ borderColor: "var(--color-border-soft)" }}>
            <div className="min-w-0">
              <p className="truncate text-[14px]" style={{ color: "var(--color-text)" }}>
                {p.project}
              </p>
              <p className="mt-0.5 font-[family-name:var(--font-mono)] text-[11px] tabular" style={{ color: "var(--color-text-faint)" }}>
                <span className="whitespace-nowrap">ganhou {formatBRL(p.income)}</span>
                <span aria-hidden="true"> · </span>
                <span className="whitespace-nowrap">gastou {formatBRL(p.cost)}</span>
              </p>
            </div>
            <p
              className="shrink-0 font-[family-name:var(--font-mono)] text-[14px] font-semibold tabular"
              style={{ color: p.profit > 0 ? "var(--color-accent)" : p.profit < 0 ? "var(--color-danger)" : "var(--color-text-muted)" }}
            >
              {formatBRL(p.profit)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
