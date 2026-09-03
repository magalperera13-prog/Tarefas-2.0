"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ToastProvider";
import { SubscriptionQuickAdd } from "@/components/SubscriptionQuickAdd";
import { SubscriptionItem } from "@/components/SubscriptionItem";
import { SubscriptionStatsRail } from "@/components/SubscriptionStatsRail";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { Subscription } from "@/lib/types";
import { currentMonthKey, todayISODate } from "@/lib/date";

interface SubscriptionsViewProps {
  userId: string;
  initialSubscriptions: Subscription[];
}

export function SubscriptionsView({ userId, initialSubscriptions }: SubscriptionsViewProps) {
  const supabase = createClient();
  const { showToast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions);
  const [pendingDelete, setPendingDelete] = useState<Subscription | null>(null);
  const monthKey = useMemo(() => currentMonthKey(), []);

  const stats = useMemo(() => {
    const active = subscriptions.filter((s) => s.status === "active");
    const totalMonthly = active.reduce((sum, s) => sum + s.monthly_amount, 0);
    const totalPaidThisMonth = active
      .filter((s) => s.last_paid_date?.startsWith(monthKey))
      .reduce((sum, s) => sum + s.monthly_amount, 0);
    return { totalMonthly, totalPaidThisMonth, totalYearlyEstimate: totalMonthly * 12 };
  }, [subscriptions, monthKey]);

  const sorted = useMemo(() => {
    return [...subscriptions].sort((a, b) => {
      if (a.status !== b.status) return a.status === "active" ? -1 : 1;
      return a.name.localeCompare(b.name, "pt-BR");
    });
  }, [subscriptions]);

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
    const isPaid = subscription.last_paid_date?.startsWith(monthKey) ?? false;
    const newValue = isPaid ? null : todayISODate();
    setSubscriptions((prev) => prev.map((s) => (s.id === subscription.id ? { ...s, last_paid_date: newValue } : s)));

    const { error } = await supabase.from("subscriptions").update({ last_paid_date: newValue }).eq("id", subscription.id);
    if (error) {
      setSubscriptions((prev) => prev.map((s) => (s.id === subscription.id ? subscription : s)));
      showToast("Não foi possível atualizar o pagamento", "danger");
      return;
    }
    showToast(isPaid ? "Marcada como pendente" : "✓ Marcada como paga");
  }

  async function handleSaveEdit(
    subscription: Subscription,
    changes: {
      name: string;
      monthly_amount: number;
      due_day_label: string | null;
      observation: string | null;
      renewal_type: "fixed_day" | "payment_date";
      last_paid_date: string | null;
    }
  ) {
    setSubscriptions((prev) => prev.map((s) => (s.id === subscription.id ? { ...s, ...changes } : s)));
    const { error } = await supabase.from("subscriptions").update(changes).eq("id", subscription.id);
    if (error) {
      setSubscriptions((prev) => prev.map((s) => (s.id === subscription.id ? subscription : s)));
      showToast("Não foi possível salvar a assinatura", "danger");
    }
  }

  async function handleDeleteConfirmed() {
    if (!pendingDelete) return;
    const subscription = pendingDelete;
    setPendingDelete(null);
    setSubscriptions((prev) => prev.filter((s) => s.id !== subscription.id));

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

      {sorted.length === 0 ? (
        <EmptyState message="Nenhuma assinatura cadastrada. Adicione a primeira acima." />
      ) : (
        <div className="space-y-2">
          {sorted.map((subscription) => (
            <SubscriptionItem
              key={subscription.id}
              subscription={subscription}
              isPaidThisMonth={subscription.last_paid_date?.startsWith(monthKey) ?? false}
              onToggleStatus={handleToggleStatus}
              onTogglePaid={handleTogglePaid}
              onSaveEdit={handleSaveEdit}
              onDeleteRequest={setPendingDelete}
            />
          ))}
        </div>
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
