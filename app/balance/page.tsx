import { requireOwner } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { BalancesView } from "@/components/BalancesView";
import type { Balance } from "@/lib/types";

export default async function BalancePage() {
  const { supabase, user } = await requireOwner();

  const { data, error } = await supabase.from("balances").select("*");
  const initialBalances = (error ? [] : data ?? []) as Balance[];

  return (
    <AppShell userEmail={user.email}>
      <BalancesView userId={user.id} initialBalances={initialBalances} />
    </AppShell>
  );
}
