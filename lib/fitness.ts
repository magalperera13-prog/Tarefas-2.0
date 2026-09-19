import { addDaysToDateString, daysBetween, weekdayIndex } from "@/lib/date";

/**
 * Divisão semanal fixa da área Fitness. Chave = índice do dia da semana
 * (0 = domingo .. 6 = sábado, igual a Date.getDay()). Não existe "descanso":
 * todos os 7 dias têm um treino programado.
 */
export const WORKOUT_SPLIT_BY_WEEKDAY: Record<number, string> = {
  0: "Bíceps + Cardio + Perna", // domingo
  1: "Peito + Tríceps", // segunda
  2: "Costas + Abdômen", // terça
  3: "Bíceps + Cardio + Perna", // quarta
  4: "Peito + Tríceps", // quinta
  5: "Costas + Abdômen", // sexta
  6: "Bíceps + Cardio + Perna", // sábado
};

/** Meta semanal padrão — 7 treinos (todos os dias, sem descanso programado). */
export const WEEKLY_GOAL = 7;

/** Quantos dias olhar para trás ao calcular streak / métrica de 3 dias / média. */
const LOOKBACK_DAYS = 180;

export function workoutForWeekday(dateISO: string): string {
  return WORKOUT_SPLIT_BY_WEEKDAY[weekdayIndex(dateISO)];
}

/** As 7 datas (segunda a domingo) da semana que contém `mondayISO`. */
export function weekDates(mondayISO: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDaysToDateString(mondayISO, i));
}

export type DayWorkoutStatus = "completed" | "missed" | "pending";

/** Status de um dia: "completed" (treinado), "missed" (não treinado, já passou)
 * ou "pending" (hoje ou futuro, ainda em aberto). */
export function dayStatus(dateISO: string, todayISO: string, logged: boolean): DayWorkoutStatus {
  if (logged) return "completed";
  return dateISO < todayISO ? "missed" : "pending";
}

/**
 * Sequência atual de dias treinados seguidos. Conta a partir de hoje se hoje já
 * foi treinado; caso contrário conta a partir de ontem (hoje ainda está em
 * aberto, então não quebra a sequência até o dia terminar).
 */
export function computeCurrentStreak(loggedDates: Set<string>, todayISO: string): number {
  let streak = 0;
  let cursor = loggedDates.has(todayISO) ? todayISO : addDaysToDateString(todayISO, -1);
  while (loggedDates.has(cursor)) {
    streak += 1;
    cursor = addDaysToDateString(cursor, -1);
  }
  return streak;
}

/**
 * Dias desde a última vez em que ocorreu uma sequência de 3+ dias seguidos sem
 * treinar. Retorna null se isso nunca aconteceu (ou se ainda não há nenhum
 * treino registrado, ou seja, o acompanhamento nem começou). `sinceISO` é a
 * data do primeiro treino já registrado — dias antes dela não contam como
 * "não treinado", pois o acompanhamento ainda não existia. Hoje só entra na
 * conta se já foi treinado (dia em aberto não conta nem quebra).
 */
export function computeDaysSinceLastThreeMiss(
  loggedDates: Set<string>,
  todayISO: string,
  sinceISO: string | null,
  lookbackDays: number = LOOKBACK_DAYS
): number | null {
  if (!sinceISO) return null;
  const earliestWindow = addDaysToDateString(todayISO, -lookbackDays);
  let cursor = sinceISO > earliestWindow ? sinceISO : earliestWindow;
  let missRun = 0;
  let lastQualifying: string | null = null;

  while (cursor <= todayISO) {
    const isPast = cursor < todayISO;
    const logged = loggedDates.has(cursor);

    if (logged) {
      missRun = 0;
    } else if (isPast) {
      missRun += 1;
      if (missRun >= 3) lastQualifying = cursor;
    }
    // Hoje ainda não treinado: dia em aberto, não conta como falha nem reseta.

    cursor = addDaysToDateString(cursor, 1);
  }

  return lastQualifying === null ? null : daysBetween(lastQualifying, todayISO);
}

/** Quantos treinos foram feitos dentro das datas fornecidas (ex.: a semana atual). */
export function countLoggedInRange(loggedDates: Set<string>, dates: string[]): number {
  return dates.filter((d) => loggedDates.has(d)).length;
}

/**
 * Média de treinos por semana, com base no primeiro registro encontrado até
 * hoje. Retorna 0 se não houver nenhum treino registrado ainda.
 */
export function computeAveragePerWeek(loggedDates: Set<string>, firstLoggedDateISO: string | null, todayISO: string): number {
  if (!firstLoggedDateISO || loggedDates.size === 0) return 0;
  const totalDays = Math.max(1, daysBetween(firstLoggedDateISO, todayISO) + 1);
  const weeks = Math.max(1, totalDays / 7);
  return loggedDates.size / weeks;
}
