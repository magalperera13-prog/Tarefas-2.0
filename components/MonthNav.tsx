import { monthYearShort, isSameOrFutureMonth } from "@/lib/date";

interface MonthNavProps {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}

export function MonthNav({ year, month, onChange }: MonthNavProps) {
  const prev = () => onChange(month === 1 ? year - 1 : year, month === 1 ? 12 : month - 1);
  const next = () => onChange(month === 12 ? year + 1 : year, month === 12 ? 1 : month + 1);
  const disableNext = isSameOrFutureMonth(year, month);

  return (
    <div className="flex items-center justify-center gap-3">
      <button
        onClick={prev}
        aria-label="Mês anterior"
        className="rounded-full border p-2 transition hover:opacity-80"
        style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
          <path d="M12 4.5L6.5 10l5.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <span className="min-w-[9rem] text-center font-[family-name:var(--font-display)] text-sm font-semibold">
        {monthYearShort(year, month)}
      </span>
      <button
        onClick={next}
        disabled={disableNext}
        aria-label="Próximo mês"
        className="rounded-full border p-2 transition hover:opacity-80 disabled:opacity-30"
        style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
          <path d="M8 4.5L13.5 10 8 15.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
