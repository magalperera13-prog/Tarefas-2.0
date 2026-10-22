import { requireOwner } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { FinanceView } from "@/components/FinanceView";
import { currentYearMonth, monthRange, todayISODate } from "@/lib/date";
import { normalizeEntry } from "@/lib/finance";
import type { FinanceEntry } from "@/lib/types";

export default async function FinancePage() {
  const { supabase, user } = await requireOwner();

  const { year, month } = currentYearMonth();
  const { start, end } = monthRange(year, month);

  const monthRes = await supabase
    .from("finance_entries")
    .select("*")
    .gte("entry_date", start)
    .lte("entry_date", end)
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false });

  const initialEntries = ((monthRes.error ? [] : monthRes.data ?? []) as FinanceEntry[]).map(normalizeEntry);

  return (
    <AppShell userEmail={user.email}>
      <FinanceView
        userId={user.id}
        initialEntries={initialEntries}
        todayISO={todayISODate()}
      />
    </AppShell>
  );
}
