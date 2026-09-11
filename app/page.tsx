import { requireOwner } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { TodayBoard } from "@/components/TodayBoard";
import { SubscriptionsDueAlert } from "@/components/SubscriptionsDueAlert";
import { todayISODate, monthRangeUTC, currentYearMonth } from "@/lib/date";
import { getDueSoonSubscriptions } from "@/lib/subscriptions";
import type { Subscription, SubscriptionPayment, Task } from "@/lib/types";

export default async function HomePage() {
  const { supabase, user } = await requireOwner();

  const todayISO = todayISODate();
  const { year, month } = currentYearMonth();
  const { startUTC, endUTCExclusive } = monthRangeUTC(year, month);

  const [todayTasksRes, overdueTasksRes, completedThisMonthRes, subscriptionsRes, subscriptionPaymentsRes] =
    await Promise.all([
      supabase
        .from("tasks")
        .select("*")
        .eq("task_date", todayISO)
        .order("created_at", { ascending: false }),
      supabase
        .from("tasks")
        .select("*")
        .eq("status", "pending")
        .lt("task_date", todayISO)
        .order("task_date", { ascending: true }),
      supabase
        .from("tasks")
        .select("id", { count: "exact", head: true })
        .eq("status", "completed")
        .gte("completed_at", startUTC)
        .lt("completed_at", endUTCExclusive),
      supabase.from("subscriptions").select("*").eq("status", "active"),
      supabase.from("subscription_payments").select("*"),
    ]);

  const initialTasks = (todayTasksRes.data ?? []) as Task[];
  const initialOverdueTasks = (overdueTasksRes.data ?? []) as Task[];
  const initialCompletedThisMonth = completedThisMonthRes.count ?? 0;
  const ownerName = process.env.NEXT_PUBLIC_OWNER_NAME || "Magal";

  const subscriptions = (subscriptionsRes.data ?? []) as Subscription[];
  const subscriptionPayments = (subscriptionPaymentsRes.data ?? []) as SubscriptionPayment[];
  const dueSoonSubscriptions = getDueSoonSubscriptions(subscriptions, subscriptionPayments, todayISO);

  return (
    <AppShell userEmail={user.email}>
      <p className="mb-5 font-[family-name:var(--font-display)] text-lg font-semibold">
        Olá, {ownerName} 👋
      </p>
      <SubscriptionsDueAlert items={dueSoonSubscriptions} />
      <TodayBoard
        userId={user.id}
        initialTasks={initialTasks}
        initialOverdueTasks={initialOverdueTasks}
        initialCompletedThisMonth={initialCompletedThisMonth}
      />
    </AppShell>
  );
}
