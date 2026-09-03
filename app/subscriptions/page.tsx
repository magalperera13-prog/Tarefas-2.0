import { requireOwner } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { SubscriptionsView } from "@/components/SubscriptionsView";
import type { Subscription } from "@/lib/types";

export default async function SubscriptionsPage() {
  const { supabase, user } = await requireOwner();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .order("name", { ascending: true });

  const initialSubscriptions = (error ? [] : data ?? []) as Subscription[];

  return (
    <AppShell userEmail={user.email}>
      <SubscriptionsView userId={user.id} initialSubscriptions={initialSubscriptions} />
    </AppShell>
  );
}
