"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ToastProvider";
import { SubscriptionQuickAdd } from "@/components/SubscriptionQuickAdd";
import { SubscriptionItem } from "@/components/SubscriptionItem";
import { SubscriptionStatsRail } from "@/components/SubscriptionStatsRail";
import { MonthNav } from "@/components/MonthNav";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { Subscription, SubscriptionPayment } from "@/lib/types";
import { addOneMonthToDateString, currentYearMonth, monthKeyFor, monthYearLabel, todayISODate } from "@/lib/date";
import { extractDueDay } from "@/lib/subscriptions";

interface SubscriptionsViewProps {
  userId: string;
  initialSubscriptions: Subscription[];
  initialPayments: SubscriptionPayment[];
}

export function SubscriptionsView({ userId, initialSubscriptions, initialPayments }: SubscriptionsViewProps) {
  const supabase = createClient();
  const { showToast } = useToast();

  const current = useMemo(() => currentYearMonth(), []);
  const todayISO = useMemo(() => todayISODate(), []);

  const [year, setYear] = useState(current.year);
  const [month, setMonth] = useState(current.month);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions);
  // Todo o histórico de pagamentos já vem de uma vez (o volume é pequeno para
  // um app pessoal) — navegar entre meses só filtra o que já está em memória,
  // sem precisar buscar de novo no banco a cada troca.
  const [payments, setPayments] = useState<SubscriptionPayment[]>(initialPayments);
  const [pendingDelete, setPendingDelete] = useState<Subscription | null>(null);

  const viewedMonthKey = useMemo(() => monthKeyFor(year, month), [year, month]);
  const isViewingCurrentMonth = year === current.year && month === current.month;

  const stats = useMemo(() => {
    const active = subscriptions.filter((s) => s.status === "active");
    const totalMonthly = active.reduce((sum, s) => sum + s.monthly_amount, 0);
    const totalPaidThisMonth = payments
      .filter((p) => p.month_key === viewedMonthKey)
      .reduce((sum, p) => sum + p.amount, 0);
    return { totalMonthly, totalPaidThisMonth, totalYearlyEstimate: totalMonthly * 12 };
  }, [subscriptions, payments, viewedMonthKey]);

  const mostRecentPaidDateBySubscription = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of payments) {
      const cur = map.get(p.subscription_id);
      if (!cur || p.paid_date > cur) map.set(p.subscription_id, p.paid_date);
    }
    return map;
  }, [payments]);

  const sorted = useMemo(() => {
    const sortDay = (s: Subscription): number => {
      if (s.renewal_type === "fixed_day") return extractDueDay(s.due_day_label) ?? Infinity;
      const paid = mostRecentPaidDateBySubscription.get(s.id);
      return paid ? Number(addOneMonthToDateString(paid).slice(8, 10)) : Infinity;
    };
    return [...subscriptions].sort((a, b) => {
      if (a.status !== b.status) return a.status === "active" ? -1 : 1;
      const dayA = sortDay(a);
      const dayB = sortDay(b);
      if (dayA !== dayB) return dayA - dayB;
      return a.name.localeCompare(b.name, "pt-BR");
    });
  }, [subscriptions, mostRecentPaidDateBySubscription]);

  async function handleAdd(name: string, monthlyAmount: number, dueDayLabel: string | null) {
    const { data, error } = await supabase
      .from("subscriptions")
      .insert({ name, monthly_amount: monthlyAmount, due_day_label: dueDayLabel, user_id: userId, status: "active" })
      .select()
      .single();

    if (error || !data) {
      showToast("Não foi possível adicionar a assinatura", "danger");
      return;
    }
    setSubscriptions((prev) => [...prev, data as Subscription]);
    showToast("✓ Assinatura adicionada");
  }

  async function handleToggleStatus(subscription: Subscription) {
    const newStatus = subscription.status === "active" ? "inactive" : "active";
    setSubscriptions((prev) => prev.map((s) => (s.id === subscription.id ? { ...s, status: newStatus } : s)));

    const { error } = await supabase.from("subscriptions").update({ status: newStatus }).eq("id", subscription.id);
    if (error) {
      setSubscriptions((prev) => prev.map((s) => (s.id === subscription.id ? subscription : s)));
      showToast("Não foi possível atualizar a assinatura", "danger");
      return;
    }
    showToast(newStatus === "active" ? "Assinatura reativada" : "Assinatura marcada como inativa");
  }

  async function handleTogglePaid(subscription: Subscription) {
    const existing = payments.find((p) => p.subscription_id === subscription.id && p.month_key === viewedMonthKey);

    if (existing) {
      setPayments((prev) => prev.filter((p) => p.id !== existing.id));
      const { error } = await supabase.from("subscription_payments").delete().eq("id", existing.id);
      if (error) {
        setPayments((prev) => [...prev, existing]);
        showToast("Não foi possível atualizar o pagamento", "danger");
        return;
      }
      showToast("Marcada como pendente");
      return;
    }

    const paidDate = isViewingCurrentMonth ? todayISO : `${viewedMonthKey}-01`;
    const { data, error } = await supabase
      .from("subscription_payments")
      .insert({
        user_id: userId,
        subscription_id: subscription.id,
        month_key: viewedMonthKey,
        paid_date: paidDate,
        amount: subscription.monthly_amount,
      })
      .select()
      .single();

    if (error || !data) {
      showToast("Não foi possível registrar o pagamento", "danger");
      return;
    }
    setPayments((prev) => [...prev, data as SubscriptionPayment]);
    showToast("✓ Marcada como paga");
  }

  async function handleSaveEdit(
    subscription: Subscription,
    changes: {
      name: string;
      monthly_amount: number;
      due_day_label: string | null;
      observation: string | null;
      renewal_type: "fixed_day" | "payment_date";
    },
    paidDateForViewedMonth: string | null,
    paymentAmountForViewedMonth: number | null
  ) {
    setSubscriptions((prev) => prev.map((s) => (s.id === subscription.id ? { ...s, ...changes } : s)));
    const { error } = await supabase.from("subscriptions").update(changes).eq("id", subscription.id);
    if (error) {
      setSubscriptions((prev) => prev.map((s) => (s.id === subscription.id ? subscription : s)));
      showToast("Não foi possível salvar a assinatura", "danger");
      return;
    }

    const existing = payments.find((p) => p.subscription_id === subscription.id && p.month_key === viewedMonthKey);

    if (!paidDateForViewedMonth) {
      if (existing) {
        setPayments((prev) => prev.filter((p) => p.id !== existing.id));
        await supabase.from("subscription_payments").delete().eq("id", existing.id);
      }
      showToast("✓ Assinatura salva");
      return;
    }

    const { data, error: upsertError } = await supabase
      .from("subscription_payments")
      .upsert(
        {
          user_id: userId,
          subscription_id: subscription.id,
          month_key: viewedMonthKey,
          paid_date: paidDateForViewedMonth,
          amount: paymentAmountForViewedMonth ?? changes.monthly_amount,
        },
        { onConflict: "subscription_id,month_key" }
      )
      .select()
      .single();

    if (upsertError || !data) {
      showToast("Assinatura salva, mas não foi possível atualizar o pagamento", "danger");
      return;
    }
    const payment = data as SubscriptionPayment;
    setPayments((prev) => [...prev.filter((p) => p.id !== payment.id), payment]);
    showToast("✓ Assinatura salva");
  }

  async function handleDeleteConfirmed() {
    if (!pendingDelete) return;
    const subscription = pendingDelete;
    setPendingDelete(null);
    setSubscriptions((prev) => prev.filter((s) => s.id !== subscription.id));
    setPayments((prev) => prev.filter((p) => p.subscription_id !== subscription.id));

    const { error } = await supabase.from("subscriptions").delete().eq("id", subscription.id);
    if (error) {
      setSubscriptions((prev) => [...prev, subscription]);
      showToast("Não foi possível excluir a assinatura", "danger");
      return;
    }
    showToast("✓ Assinatura excluída");
  }

  return (
    <div className="space-y-6">
      <SubscriptionStatsRail stats={stats} />
      <SubscriptionQuickAdd onAdd={handleAdd} />
      <MonthNav year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />

      {sorted.length === 0 ? (
        <EmptyState message="Nenhuma assinatura cadastrada. Adicione a primeira acima." />
      ) : (
        <div className="space-y-2">
          {sorted.map((subscription) => {
            const viewedPayment =
              payments.find((p) => p.subscription_id === subscription.id && p.month_key === viewedMonthKey) ?? null;
            return (
              <SubscriptionItem
                key={subscription.id}
                subscription={subscription}
                isPaidInViewedMonth={!!viewedPayment}
                viewedMonthPayment={viewedPayment}
                mostRecentPaidDate={mostRecentPaidDateBySubscription.get(subscription.id) ?? null}
                onToggleStatus={handleToggleStatus}
                onTogglePaid={handleTogglePaid}
                onSaveEdit={handleSaveEdit}
                onDeleteRequest={setPendingDelete}
              />
            );
          })}
        </div>
      )}

      {sorted.length > 0 && (
        <p className="text-center text-[11px]" style={{ color: "var(--color-text-faint)" }}>
          Mostrando o status de pagamento de {monthYearLabel(year, month)}
        </p>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Excluir assinatura"
        description={
          pendingDelete ? `Tem certeza que deseja excluir "${pendingDelete.name}"? Essa ação não pode ser desfeita.` : ""
        }
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
