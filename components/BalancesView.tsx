"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ToastProvider";
import { BalanceQuickAdd } from "@/components/BalanceQuickAdd";
import { BalanceItem } from "@/components/BalanceItem";
import { BalanceTotalCard } from "@/components/BalanceTotalCard";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { Balance } from "@/lib/types";

interface BalancesViewProps {
  userId: string;
  initialBalances: Balance[];
}

export function BalancesView({ userId, initialBalances }: BalancesViewProps) {
  const supabase = createClient();
  const { showToast } = useToast();
  const [balances, setBalances] = useState<Balance[]>(initialBalances);
  const [pendingDelete, setPendingDelete] = useState<Balance | null>(null);

  const total = useMemo(() => balances.reduce((sum, b) => sum + b.amount, 0), [balances]);

  const sorted = useMemo(() => [...balances].sort((a, b) => b.amount - a.amount), [balances]);

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
    setBalances((prev) => [...prev, data as Balance]);
    showToast("✓ Adicionado");
  }

  async function handleSaveEdit(balance: Balance, changes: { name: string; amount: number }) {
    setBalances((prev) => prev.map((b) => (b.id === balance.id ? { ...b, ...changes } : b)));
    const { error } = await supabase.from("balances").update(changes).eq("id", balance.id);
    if (error) {
      setBalances((prev) => prev.map((b) => (b.id === balance.id ? balance : b)));
      showToast("Não foi possível salvar", "danger");
    }
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
    showToast("✓ Excluído");
  }

  return (
    <div className="space-y-6">
      <BalanceTotalCard total={total} />
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
