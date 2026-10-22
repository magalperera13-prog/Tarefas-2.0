import { requireOwner } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { FinanceView } from "@/components/FinanceView";
import { currentYearMonth, monthRange, todayISODate } from "@/lib/date";
import { distinctProjects } from "@/lib/finance";
import type { FinanceEntry } from "@/lib/types";

export default async function FinancePage() {
  const { supabase, user } = await requireOwner();

  const { year, month } = currentYearMonth();
  const { start, end } = monthRange(year, month);

  const [monthRes, projectsRes] = await Promise.all([
    supabase
      .from("finance_entries")
      .select("*")
      .gte("entry_date", start)
      .lte("entry_date", end)
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false }),
    // Nomes de projeto de todos os meses, só para sugerir ao digitar.
    supabase.from("finance_entries").select("project").not("project", "is", null).limit(2000),
  ]);

  const initialEntries = (monthRes.error ? [] : monthRes.data ?? []) as FinanceEntry[];
  const initialProjects = distinctProjects(projectsRes.error ? [] : projectsRes.data ?? []);

  return (
    <AppShell userEmail={user.email}>
      <FinanceView
        userId={user.id}
        initialEntries={initialEntries}
        initialProjects={initialProjects}
        todayISO={todayISODate()}
      />
    </AppShell>
  );
}
