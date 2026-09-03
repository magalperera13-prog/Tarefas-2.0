"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ToastProvider";
import { ExpenseQuickAdd } from "@/components/ExpenseQuickAdd";
import { ExpenseStatsRail } from "@/components/ExpenseStatsRail";
import { ExpenseDayCard } from "@/components/ExpenseDayCard";
import { MonthNav } from "@/components/MonthNav";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { Expense } from "@/lib/types";
import { currentYearMonth, daysElapsedInMonth, monthRange, monthYearLabel, monthYearShort, todayISODate } from "@/lib/date";

interface ExpensesViewProps {
  userId: string;
  initialExpenses: Expense[];
  initialTotalToday: number;
}

export function ExpensesView({ userId, initialExpenses, initialTotalToday }: ExpensesViewProps) {
  const supabase = createClient();
  const { showToast } = useToast();

  const current = useMemo(() => currentYearMonth(), []);
  const todayISO = useMemo(() => todayISODate(), []);

  const [year, setYear] = useState(current.year);
  const [month, setMonth] = useState(current.month);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [totalToday, setTotalToday] = useState(initialTotalToday);
  const [loading, setLoading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null);

  const isViewingCurrentMonth = year === current.year && month === current.month;

  // Total e média sempre refletem o MÊS QUE ESTÁ SENDO VISUALIZADO, não o mês
  // atual do calendário — só "Gasto hoje" fica fixo no dia real de hoje.
  const monthTotal = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);
  const monthAverage = useMemo(() => {
    const days = daysElapsedInMonth(year, month) || 1;
    return monthTotal / days;
  }, [monthTotal, year, month]);

  const isFirstRender = useRef(true);

  useEffect(() => {
    // A primeira renderização já veio pronta do servidor (mês atual) — só
    // buscamos de novo a partir da segunda troca de mês em diante. Antes,
    // esse "pulo" era condicionado a "está vendo o mês atual?", o que fazia
    // a lista ficar presa nos dados do mês anterior ao voltar para o mês
    // atual pela navegação. Agora ele só se aplica à primeira montagem.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    let cancelled = false;
    setLoading(true);

    const { start, end } = monthRange(year, month);
    supabase
      .from("expenses")
      .select("*")
      .gte("expense_date", start)
      .lte("expense_date", end)
      .order("expense_date", { ascending: false })
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          showToast("Não foi possível carregar os gastos", "danger");
          setExpenses([]);
        } else {
          setExpenses((data ?? []) as Expense[]);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  function adjustTotalToday(deltaAmount: number, expenseDate: string) {
    if (expenseDate !== todayISO) return;
    setTotalToday((prev) => prev + deltaAmount);
  }

  async function handleAdd(description: string, amount: number) {
    const { data, error } = await supabase
      .from("expenses")
      .insert({ description, amount, user_id: userId, expense_date: todayISO })
      .select()
      .single();

    if (error || !data) {
      showToast("Não foi possível adicionar o gasto", "danger");
      return;
    }
    const expense = data as Expense;
    adjustTotalToday(expense.amount, expense.expense_date);
    if (isViewingCurrentMonth) {
      setExpenses((prev) => [expense, ...prev]);
    }
    showToast("✓ Gasto adicionado");
  }

  async function handleSaveEdit(expense: Expense, changes: { description: string; amount: number }) {
    setExpenses((prev) => prev.map((e) => (e.id === expense.id ? { ...e, ...changes } : e)));
    adjustTotalToday(changes.amount - expense.amount, expense.expense_date);

    const { error } = await supabase.from("expenses").update(changes).eq("id", expense.id);
    if (error) {
      setExpenses((prev) => prev.map((e) => (e.id === expense.id ? expense : e)));
      adjustTotalToday(expense.amount - changes.amount, expense.expense_date);
      showToast("Não foi possível salvar o gasto", "danger");
    }
  }

  async function handleDeleteConfirmed() {
    if (!pendingDelete) return;
    const expense = pendingDelete;
    setPendingDelete(null);
    setExpenses((prev) => prev.filter((e) => e.id !== expense.id));
    adjustTotalToday(-expense.amount, expense.expense_date);

    const { error } = await supabase.from("expenses").delete().eq("id", expense.id);
    if (error) {
      setExpenses((prev) => [expense, ...prev]);
      adjustTotalToday(expense.amount, expense.expense_date);
      showToast("Não foi possível excluir o gasto", "danger");
      return;
    }
    showToast("✓ Gasto excluído");
  }

  const grouped = useMemo(() => {
    const map = new Map<string, Expense[]>();
    for (const expense of expenses) {
      const list = map.get(expense.expense_date) ?? [];
      list.push(expense);
      map.set(expense.expense_date, list);
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [expenses]);

  return (
    <div className="space-y-6">
      <ExpenseStatsRail
        stats={{ totalToday, totalThisMonth: monthTotal, averagePerDay: monthAverage }}
        monthLabel={monthYearShort(year, month)}
      />
      <ExpenseQuickAdd onAdd={handleAdd} />
      <MonthNav year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl" style={{ background: "var(--color-bg-elevated)" }} />
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <EmptyState message={`Nenhum gasto registrado em ${monthYearLabel(year, month)}.`} />
      ) : (
        <div className="space-y-6">
          {grouped.map(([dateISO, dayExpenses]) => (
            <ExpenseDayCard
              key={dateISO}
              dateISO={dateISO}
              expenses={dayExpenses}
              onSaveEdit={handleSaveEdit}
              onDeleteRequest={setPendingDelete}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Excluir gasto"
        description={pendingDelete ? `Tem certeza que deseja excluir "${pendingDelete.description}"? Essa ação não pode ser desfeita.` : ""}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
