import { requireOwner } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { BalancesView } from "@/components/BalancesView";
import type { Balance, BalanceSnapshot } from "@/lib/types";

export default async function BalancePage() {
  const { supabase, user } = await requireOwner();

  const [balancesRes, snapshotsRes] = await Promise.all([
    supabase.from("balances").select("*"),
    supabase.from("balance_snapshots").select("*").order("snapshot_date", { ascending: false }).limit(400),
  ]);

  const initialBalances = (balancesRes.error ? [] : balancesRes.data ?? []) as Balance[];
  const initialSnapshots = (snapshotsRes.error ? [] : snapshotsRes.data ?? []) as BalanceSnapshot[];

  return (
    <AppShell userEmail={user.email}>
      <BalancesView userId={user.id} initialBalances={initialBalances} initialSnapshots={initialSnapshots} />
    </AppShell>
  );
}
