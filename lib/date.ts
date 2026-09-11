import { formatInTimeZone, toZonedTime, fromZonedTime } from "date-fns-tz";

export const APP_TIME_ZONE = "America/Sao_Paulo";

const WEEKDAYS_PT = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
];

const WEEKDAYS_PT_SHORT = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

const MONTHS_PT = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

/** "2026-08-20" — data corrente no fuso America/Sao_Paulo. */
export function todayISODate(): string {
  return formatInTimeZone(new Date(), APP_TIME_ZONE, "yyyy-MM-dd");
}

/** "14:32" — horário no fuso America/Sao_Paulo a partir de um timestamp ISO/UTC. */
export function formatTime(isoTimestamp: string): string {
  return formatInTimeZone(new Date(isoTimestamp), APP_TIME_ZONE, "HH:mm");
}

/** "20/08/2026" a partir de "2026-08-20" ou de um timestamp ISO. */
export function formatDateBR(dateOrTimestamp: string): string {
  const d = dateOrTimestamp.length === 10 ? `${dateOrTimestamp}T12:00:00` : dateOrTimestamp;
  return formatInTimeZone(new Date(d), APP_TIME_ZONE, "dd/MM/yyyy");
}

/** Nome do dia da semana em português a partir de "yyyy-MM-dd". */
export function weekdayLabel(dateISO: string, short = false): string {
  const zoned = toZonedTime(`${dateISO}T12:00:00`, APP_TIME_ZONE);
  const list = short ? WEEKDAYS_PT_SHORT : WEEKDAYS_PT;
  return list[zoned.getDay()];
}

/** "20 de agosto" a partir de "yyyy-MM-dd". */
export function dayMonthLabel(dateISO: string): string {
  const zoned = toZonedTime(`${dateISO}T12:00:00`, APP_TIME_ZONE);
  return `${zoned.getDate()} de ${MONTHS_PT[zoned.getMonth()]}`;
}

/** "Agosto de 2026" a partir de year/month (month = 1-12). */
export function monthYearLabel(year: number, month: number): string {
  const name = MONTHS_PT[month - 1];
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} de ${year}`;
}

/** "Agosto 2026" (mais compacto, usado na navegação). */
export function monthYearShort(year: number, month: number): string {
  const name = MONTHS_PT[month - 1];
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${year}`;
}

/** { year, month } (1-12) de hoje no fuso America/Sao_Paulo. */
export function currentYearMonth(): { year: number; month: number } {
  const todayISO = todayISODate();
  const [year, month] = todayISO.split("-").map(Number);
  return { year, month };
}

/** Primeiro e último dia (yyyy-MM-dd) de um mês, inclusive. */
export function monthRange(year: number, month: number): { start: string; end: string } {
  const pad = (n: number) => String(n).padStart(2, "0");
  const start = `${year}-${pad(month)}-01`;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const end = `${year}-${pad(month)}-${pad(lastDay)}`;
  return { start, end };
}

export function addMonths(year: number, month: number, delta: number): { year: number; month: number } {
  const total = year * 12 + (month - 1) + delta;
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}

/** Quantos dias do mês já se passaram (para calcular médias). Mês passado = todos os dias; mês atual = até hoje. */
export function daysElapsedInMonth(year: number, month: number): number {
  const now = currentYearMonth();
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (year === now.year && month === now.month) {
    const todayDay = Number(todayISODate().slice(8, 10));
    return todayDay;
  }
  if (year > now.year || (year === now.year && month > now.month)) return 0;
  return lastDay;
}

/** "2026-09" — mês corrente no fuso America/Sao_Paulo (para controle mensal de assinaturas). */
export function currentMonthKey(): string {
  return todayISODate().slice(0, 7);
}

/** "2026-09" a partir de year/month (month = 1-12). */
export function monthKeyFor(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

/** Soma 1 mês de calendário a "yyyy-MM-dd", ajustando o dia se o mês de destino for mais curto. */
export function addOneMonthToDateString(dateISO: string): string {
  const [y, m, d] = dateISO.split("-").map(Number);
  let targetYear = y;
  let targetMonth = m + 1;
  if (targetMonth > 12) {
    targetMonth = 1;
    targetYear += 1;
  }
  const lastDayOfTargetMonth = new Date(Date.UTC(targetYear, targetMonth, 0)).getUTCDate();
  const day = Math.min(d, lastDayOfTargetMonth);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${targetYear}-${pad(targetMonth)}-${pad(day)}`;
}

export function isSameOrFutureMonth(year: number, month: number): boolean {
  const now = currentYearMonth();
  if (year > now.year) return true;
  if (year === now.year && month >= now.month) return true;
  return false;
}

/** "2026-08-27" — dia (America/Sao_Paulo) em que um timestamp ISO/UTC caiu. */
export function toSaoPauloDateString(isoTimestamp: string): string {
  return formatInTimeZone(new Date(isoTimestamp), APP_TIME_ZONE, "yyyy-MM-dd");
}

/** "2026-08" — mês (America/Sao_Paulo) em que um timestamp ISO/UTC caiu. */
export function monthKeyFromTimestamp(isoTimestamp: string): string {
  return formatInTimeZone(new Date(isoTimestamp), APP_TIME_ZONE, "yyyy-MM");
}

/** Início do dia de hoje (America/Sao_Paulo), como timestamp UTC ISO — usado para
 * comparar contra colunas timestamptz como completed_at. */
export function todayStartUTC(): string {
  return fromZonedTime(`${todayISODate()}T00:00:00`, APP_TIME_ZONE).toISOString();
}

/** Início (inclusive) e fim (exclusivo) de um mês, em America/Sao_Paulo, como
 * timestamps UTC ISO — usado para comparar contra colunas timestamptz (ex.: completed_at). */
export function monthRangeUTC(year: number, month: number): { startUTC: string; endUTCExclusive: string } {
  const pad = (n: number) => String(n).padStart(2, "0");
  const startLocal = `${year}-${pad(month)}-01T00:00:00`;
  const next = addMonths(year, month, 1);
  const endLocal = `${next.year}-${pad(next.month)}-01T00:00:00`;
  return {
    startUTC: fromZonedTime(startLocal, APP_TIME_ZONE).toISOString(),
    endUTCExclusive: fromZonedTime(endLocal, APP_TIME_ZONE).toISOString(),
  };
}
