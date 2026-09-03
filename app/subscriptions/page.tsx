import { requireOwner } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
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
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <AppHeader userEmail={user.email} />
      <SubscriptionsView userId={user.id} initialSubscriptions={initialSubscriptions} />
    </main>
  );
}
