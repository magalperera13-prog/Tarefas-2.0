import { addOneMonthToDateString, monthKeyFor } from "@/lib/date";
import type { Subscription, SubscriptionPayment } from "@/lib/types";

export interface DueSubscription {
  subscription: Subscription;
  dueDate: string; // yyyy-MM-dd, estimado
  daysUntil: number; // negativo = atrasada, 0 = vence hoje, positivo = faltam N dias
}

/** Extrai um número de dia (1-31) de um texto tipo "Dia 05" ou "Dia 01-08". */
export function extractDueDay(label: string | null): number | null {
  if (!label) return null;
  const match = label.match(/\d+/);
  return match ? Number(match[0]) : null;
}

function clampDateForMonth(year: number, month: number, day: number): string {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const d = Math.min(day, lastDay);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${year}-${pad(month)}-${pad(d)}`;
}

/**
 * Assinaturas ativas, ainda não pagas no mês atual, com vencimento estimado
 * dentro da janela informada (já atrasadas, vencendo hoje, ou nos próximos
 * `windowDays` dias). Ordenado da mais urgente para a menos urgente.
 */
export function getDueSoonSubscriptions(
  subscriptions: Subscription[],
  payments: SubscriptionPayment[],
  todayISO: string,
  windowDays = 5
): DueSubscription[] {
  const [ty, tm] = todayISO.split("-").map(Number);
  const currentKey = monthKeyFor(ty, tm);

  const paidThisMonthIds = new Set(payments.filter((p) => p.month_key === currentKey).map((p) => p.subscription_id));

  const mostRecentPaidBySub = new Map<string, string>();
  for (const p of payments) {
    const cur = mostRecentPaidBySub.get(p.subscription_id);
    if (!cur || p.paid_date > cur) mostRecentPaidBySub.set(p.subscription_id, p.paid_date);
  }

  const result: DueSubscription[] = [];

  for (const s of subscriptions) {
    if (s.status !== "active") continue;
    if (paidThisMonthIds.has(s.id)) continue;

    let dueDate: string | null = null;
    if (s.renewal_type === "fixed_day") {
      const day = extractDueDay(s.due_day_label);
      if (day) dueDate = clampDateForMonth(ty, tm, day);
    } else {
      const lastPaid = mostRecentPaidBySub.get(s.id);
      if (lastPaid) dueDate = addOneMonthToDateString(lastPaid);
    }

    if (!dueDate) continue;

    const daysUntil = Math.round((Date.parse(dueDate) - Date.parse(todayISO)) / 86400000);
    if (daysUntil <= windowDays) {
      result.push({ subscription: s, dueDate, daysUntil });
    }
  }

  return result.sort((a, b) => a.daysUntil - b.daysUntil);
}
