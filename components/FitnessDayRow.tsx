"use client";

import type { DayWorkoutStatus } from "@/lib/fitness";

const STATUS_LABEL: Record<DayWorkoutStatus, string> = {
  completed: "Treinado",
  missed: "Não treinado",
  pending: "Pendente",
};

interface FitnessDayRowProps {
  dateISO: string;
  weekdayShort: string;
  workoutLabel: string;
  status: DayWorkoutStatus;
  isToday: boolean;
  onToggle: (dateISO: string) => void;
}

export function FitnessDayRow({ dateISO, weekdayShort, workoutLabel, status, isToday, onToggle }: FitnessDayRowProps) {
  const completed = status === "completed";
  const statusColor =
    status === "completed" ? "var(--color-accent)" : status === "missed" ? "var(--color-danger)" : "var(--color-pending)";

  return (
    <div
      className="flex items-center gap-3 rounded-xl border px-3.5 py-3"
      style={{
        borderColor: isToday ? "var(--color-accent)" : "var(--color-border-soft)",
        background: "var(--color-bg-elevated)",
      }}
    >
      <button
        onClick={() => onToggle(dateISO)}
        aria-label={completed ? "Marcar como não treinado" : "Marcar como treinado"}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition"
        style={{
          borderColor: completed ? "var(--color-accent)" : "var(--color-border)",
          background: completed ? "var(--color-accent)" : "transparent",
        }}
      >
        {completed && (
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
            <path d="M3.5 8.5l3 3 6-7" stroke="#062017" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[11px] font-semibold uppercase"
        style={{
          background: "var(--color-bg-inset)",
          color: isToday ? "var(--color-accent)" : "var(--color-text-muted)",
        }}
      >
        {weekdayShort}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className="truncate text-[15px] leading-tight"
          style={{ color: completed ? "var(--color-text-faint)" : "var(--color-text)", textDecoration: completed ? "line-through" : "none" }}
        >
          {workoutLabel}
        </p>
        <p className="mt-1 font-[family-name:var(--font-mono)] text-[11px] tabular" style={{ color: statusColor }}>
          {STATUS_LABEL[status]}
        </p>
      </div>
    </div>
  );
}
