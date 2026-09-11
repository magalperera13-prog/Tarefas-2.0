"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ToastProvider";
import { BalanceQuickAdd } from "@/components/BalanceQuickAdd";
import { BalanceItem } from "@/components/BalanceItem";
import { BalanceStatsRail } from "@/components/BalanceStatsRail";
import { BalanceGrowthSummary } from "@/components/BalanceGrowthSummary";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { Balance, BalanceSnapshot } from "@/lib/types";
import { currentMonthKey, currentYearMonth, daysElapsedInMonth, todayISODate } from "@/lib/date";

interface BalancesViewProps {
  userId: string;
  initialBalances: Balance[];
  initialSnapshots: BalanceSnapshot[];
}

export function BalancesView({ userId, initialBalances, initialSnapshots }: BalancesViewProps) {
  const supabase = createClient();
  const { showToast } = useToast();
  const [balances, setBalances] = useState<Balance[]>(initialBalances);
  const [snapshots, setSnapshots] = useState<BalanceSnapshot[]>(initialSnapshots);
  const [pendingDelete, setPendingDelete] = useState<Balance | null>(null);
  const todayISO = useMemo(() => todayISODate(), []);
  const monthKey = useMemo(() => currentMonthKey(), []);
  const didInitialSync = useRef(false);

  const total = useMemo(() => balances.reduce((sum, b) => sum + b.amount, 0), [balances]);
  const sorted = useMemo(() => [...balances].sort((a, b) => b.amount - a.amount), [balances]);

  const monthlyTotals = useMemo(() => {
    const byMonth = new Map<string, BalanceSnapshot>();
    for (const s of snapshots) {
      const key = s.snapshot_date.slice(0, 7);
      const current = byMonth.get(key);
      if (!current || s.snapshot_date > current.snapshot_date) byMonth.set(key, s);
    }
    return Array.from(byMonth.entries())
      .map(([key, s]) => ({ monthKey: key, total: s.total_amount, isCurrent: key === monthKey }))
      .sort((a, b) => (a.monthKey < b.monthKey ? 1 : -1))
      .slice(0, 12);
  }, [snapshots, monthKey]);

  const averagePerDay = useMemo(() => {
    const currentIndex = monthlyTotals.findIndex((m) => m.isCurrent);
    if (currentIndex === -1) return null;
    const previous = monthlyTotals[currentIndex + 1];
    if (!previous) return null;
    const { year, month } = currentYearMonth();
    const days = daysElapsedInMonth(year, month) || 1;
    return (monthlyTotals[currentIndex].total - previous.total) / days;
  }, [monthlyTotals]);

  async function syncTodaySnapshot(newTotal: number) {
    const { data, error } = await supabase
      .from("balance_snapshots")
      .upsert(
        { user_id: userId, snapshot_date: todayISO, total_amount: newTotal },
        { onConflict: "user_id,snapshot_date" }
      )
      .select()
      .single();

    if (!error && data) {
      const snapshot = data as BalanceSnapshot;
      setSnapshots((prev) => [...prev.filter((s) => s.snapshot_date !== todayISO), snapshot]);
    }
  }

  useEffect(() => {
    // Garante que exista uma fotografia de hoje assim que a página carrega,
    // mesmo que o usuário não mude nada — assim o "crescimento mensal" não
    // depende de sempre haver uma edição no dia.
    if (didInitialSync.current) return;
    didInitialSync.current = true;
    const todaySnapshot = initialSnapshots.find((s) => s.snapshot_date === todayISO);
    if (!todaySnapshot || todaySnapshot.total_amount !== total) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza a fotografia de hoje com o total já carregado; o setState real só ocorre depois do await dentro de syncTodaySnapshot
      syncTodaySnapshot(total);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAdd(name: string, amount: number) {
    const { data, error } = await supabase
      .from("balances")
      .insert({ name, amount, user_id: userId })
      .select()
      .single();

    if (error || !data) {
      showToast("Não foi possível adicionar", "danger");
      return;
    }
    const newBalance = data as Balance;
    setBalances((prev) => [...prev, newBalance]);
    syncTodaySnapshot(total + newBalance.amount);
    showToast("✓ Adicionado");
  }

  async function handleSaveEdit(balance: Balance, changes: { name: string; amount: number }) {
    setBalances((prev) => prev.map((b) => (b.id === balance.id ? { ...b, ...changes } : b)));
    const { error } = await supabase.from("balances").update(changes).eq("id", balance.id);
    if (error) {
      setBalances((prev) => prev.map((b) => (b.id === balance.id ? balance : b)));
      showToast("Não foi possível salvar", "danger");
      return;
    }
    syncTodaySnapshot(total - balance.amount + changes.amount);
  }

  async function handleDeleteConfirmed() {
    if (!pendingDelete) return;
    const balance = pendingDelete;
    setPendingDelete(null);
    setBalances((prev) => prev.filter((b) => b.id !== balance.id));

    const { error } = await supabase.from("balances").delete().eq("id", balance.id);
    if (error) {
      setBalances((prev) => [...prev, balance]);
      showToast("Não foi possível excluir", "danger");
      return;
    }
    syncTodaySnapshot(total - balance.amount);
    showToast("✓ Excluído");
  }

  return (
    <div className="space-y-6">
      <BalanceStatsRail total={total} averagePerDay={averagePerDay} />
      <BalanceGrowthSummary months={monthlyTotals} />
      <BalanceQuickAdd onAdd={handleAdd} />

      {sorted.length === 0 ? (
        <EmptyState message="Nenhum saldo cadastrado. Adicione o primeiro acima." />
      ) : (
        <div className="space-y-2">
          {sorted.map((balance) => (
            <BalanceItem
              key={balance.id}
              balance={balance}
              onSaveEdit={handleSaveEdit}
              onDeleteRequest={setPendingDelete}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Excluir saldo"
        description={
          pendingDelete ? `Tem certeza que deseja excluir "${pendingDelete.name}"? Essa ação não pode ser desfeita.` : ""
        }
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
