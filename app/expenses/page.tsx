import { requireOwner } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { ExpensesView } from "@/components/ExpensesView";
import { currentYearMonth, monthRange, todayISODate } from "@/lib/date";
import type { Expense } from "@/lib/types";

export default async function ExpensesPage() {
  const { supabase, user } = await requireOwner();

  const todayISO = todayISODate();
  const { year, month } = currentYearMonth();
  const { start, end } = monthRange(year, month);

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .gte("expense_date", start)
    .lte("expense_date", end)
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });

  const initialExpenses = (error ? [] : data ?? []) as Expense[];
  const initialTotalToday = initialExpenses
    .filter((e) => e.expense_date === todayISO)
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <AppShell userEmail={user.email}>
      <ExpensesView userId={user.id} initialExpenses={initialExpenses} initialTotalToday={initialTotalToday} />
    </AppShell>
  );
}
