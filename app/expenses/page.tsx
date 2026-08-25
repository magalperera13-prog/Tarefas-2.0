import { requireOwner } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { ExpensesView } from "@/components/ExpensesView";
import { currentYearMonth, daysElapsedInMonth, monthRange, todayISODate } from "@/lib/date";
import type { Expense, ExpenseStats } from "@/lib/types";

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
  const totalThisMonth = initialExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalToday = initialExpenses.filter((e) => e.expense_date === todayISO).reduce((sum, e) => sum + e.amount, 0);
  const days = daysElapsedInMonth(year, month) || 1;

  const initialStats: ExpenseStats = {
    totalToday,
    totalThisMonth,
    averagePerDay: totalThisMonth / days,
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <AppHeader userEmail={user.email} />
      <ExpensesView userId={user.id} initialExpenses={initialExpenses} initialStats={initialStats} />
    </main>
  );
}
