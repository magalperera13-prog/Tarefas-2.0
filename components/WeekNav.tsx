import { addDaysToDateString, dayMonthLabel } from "@/lib/date";

interface WeekNavProps {
  mondayISO: string;
  currentMondayISO: string;
  onChange: (mondayISO: string) => void;
}

export function WeekNav({ mondayISO, currentMondayISO, onChange }: WeekNavProps) {
  const sundayISO = addDaysToDateString(mondayISO, 6);
  const isCurrentWeek = mondayISO === currentMondayISO;
  const disableNext = mondayISO >= currentMondayISO;

  return (
    <div className="flex items-center justify-center gap-3">
      <button
        onClick={() => onChange(addDaysToDateString(mondayISO, -7))}
        aria-label="Semana anterior"
        className="rounded-full border p-2 transition hover:opacity-80"
        style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
          <path d="M12 4.5L6.5 10l5.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <span className="min-w-[11rem] text-center font-[family-name:var(--font-display)] text-sm font-semibold">
        {isCurrentWeek ? "Esta semana" : `${dayMonthLabel(mondayISO)} – ${dayMonthLabel(sundayISO)}`}
      </span>
      <button
        onClick={() => onChange(addDaysToDateString(mondayISO, 7))}
        disabled={disableNext}
        aria-label="Próxima semana"
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
