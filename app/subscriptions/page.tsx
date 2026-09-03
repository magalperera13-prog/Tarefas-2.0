import { requireOwner } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { SubscriptionsView } from "@/components/SubscriptionsView";
import type { Subscription, SubscriptionPayment } from "@/lib/types";

export default async function SubscriptionsPage() {
  const { supabase, user } = await requireOwner();

  const [subscriptionsRes, paymentsRes] = await Promise.all([
    supabase.from("subscriptions").select("*").order("name", { ascending: true }),
    supabase.from("subscription_payments").select("*"),
  ]);

  const initialSubscriptions = (subscriptionsRes.error ? [] : subscriptionsRes.data ?? []) as Subscription[];
  const initialPayments = (paymentsRes.error ? [] : paymentsRes.data ?? []) as SubscriptionPayment[];

  return (
    <AppShell userEmail={user.email}>
      <SubscriptionsView
        userId={user.id}
        initialSubscriptions={initialSubscriptions}
        initialPayments={initialPayments}
      />
    </AppShell>
  );
}
