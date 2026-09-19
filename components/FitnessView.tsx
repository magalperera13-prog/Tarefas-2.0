"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ToastProvider";
import { FitnessStatsRail } from "@/components/FitnessStatsRail";
import { FitnessDayRow } from "@/components/FitnessDayRow";
import { WeekNav } from "@/components/WeekNav";
import type { WorkoutLog } from "@/lib/types";
import { mondayOfWeek, weekdayLabel } from "@/lib/date";
import {
  weekDates,
  workoutForWeekday,
  dayStatus,
  computeCurrentStreak,
  computeDaysSinceLastThreeMiss,
  countLoggedInRange,
  computeAveragePerWeek,
} from "@/lib/fitness";

interface FitnessViewProps {
  userId: string;
  initialLogs: WorkoutLog[];
  todayISO: string;
}

export function FitnessView({ userId, initialLogs, todayISO }: FitnessViewProps) {
  const supabase = createClient();
  const { showToast } = useToast();
  const [logs, setLogs] = useState<WorkoutLog[]>(initialLogs);

  const currentMonday = useMemo(() => mondayOfWeek(todayISO), [todayISO]);
  const [viewMonday, setViewMonday] = useState(currentMonday);

  const loggedDates = useMemo(() => new Set(logs.map((l) => l.workout_date)), [logs]);
  const firstLoggedDateISO = useMemo(
    () => logs.reduce<string | null>((min, l) => (min === null || l.workout_date < min ? l.workout_date : min), null),
    [logs]
  );

  const currentWeekDates = useMemo(() => weekDates(currentMonday), [currentMonday]);
  const viewWeekDates = useMemo(() => weekDates(viewMonday), [viewMonday]);

  const weekCount = countLoggedInRange(loggedDates, currentWeekDates);
  const streak = computeCurrentStreak(loggedDates, todayISO);
  const averagePerWeek = computeAveragePerWeek(loggedDates, firstLoggedDateISO, todayISO);
  const daysSinceThreeMiss = computeDaysSinceLastThreeMiss(loggedDates, todayISO, firstLoggedDateISO);

  // Primeiro dia desta semana, antes de hoje, que ainda não foi treinado.
  const overdueDay = currentWeekDates.find((d) => d < todayISO && !loggedDates.has(d));

  const todayCardMessage = overdueDay
    ? `Você tem um treino pendente de ${capitalize(weekdayLabel(overdueDay))}.`
    : loggedDates.has(todayISO)
      ? "Treino de hoje concluído ✓"
      : "Seu treino de hoje está esperando por você.";

  async function toggleDay(dateISO: string) {
    const alreadyLogged = loggedDates.has(dateISO);

    if (alreadyLogged) {
      const existing = logs.find((l) => l.workout_date === dateISO);
      setLogs((prev) => prev.filter((l) => l.workout_date !== dateISO));
      const { error } = await supabase.from("workout_logs").delete().eq("workout_date", dateISO).eq("user_id", userId);
      if (error) {
        if (existing) setLogs((prev) => [...prev, existing]);
        showToast("Não foi possível atualizar o treino", "danger");
        return;
      }
      showToast("Treino desmarcado");
    } else {
      const { data, error } = await supabase
        .from("workout_logs")
        .insert({ user_id: userId, workout_date: dateISO })
        .select()
        .single();
      if (error || !data) {
        showToast("Não foi possível registrar o treino", "danger");
        return;
      }
      setLogs((prev) => [...prev, data as WorkoutLog]);
      showToast("✓ Treino registrado");
    }
  }

  return (
    <div className="space-y-6">
      <div
        className="rounded-xl border px-4 py-4"
        style={{ borderColor: "var(--color-border-soft)", background: "var(--color-bg-elevated)" }}
      >
        <h2
          className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-wide"
          style={{ color: "var(--color-text-muted)" }}
        >
          TREINO DE HOJE
        </h2>
        <p className="mt-2 text-[15px]" style={{ color: "var(--color-text)" }}>
          {capitalize(weekdayLabel(todayISO))} · {workoutForWeekday(todayISO)}
        </p>
        <p className="mt-1 text-[13px]" style={{ color: "var(--color-text-muted)" }}>
          {todayCardMessage}
        </p>
      </div>

      <FitnessStatsRail
        weekCount={weekCount}
        streak={streak}
        averagePerWeek={averagePerWeek}
        daysSinceThreeMiss={daysSinceThreeMiss}
      />

      <WeekNav mondayISO={viewMonday} currentMondayISO={currentMonday} onChange={setViewMonday} />

      <div className="space-y-2">
        {viewWeekDates.map((dateISO) => (
          <FitnessDayRow
            key={dateISO}
            dateISO={dateISO}
            weekdayShort={weekdayLabel(dateISO, true)}
            workoutLabel={workoutForWeekday(dateISO)}
            status={dayStatus(dateISO, todayISO, loggedDates.has(dateISO))}
            isToday={dateISO === todayISO}
            onToggle={toggleDay}
          />
        ))}
      </div>
    </div>
  );
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
