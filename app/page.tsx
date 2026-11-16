import { requireOwner } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { TodayBoard } from "@/components/TodayBoard";
import { SubscriptionsDueAlert } from "@/components/SubscriptionsDueAlert";
import { VibeforceQueueAlert } from "@/components/VibeforceQueueAlert";
import { todayISODate, monthRangeUTC, currentYearMonth } from "@/lib/date";
import { getDueSoonSubscriptions } from "@/lib/subscriptions";
import {
  VIBEFORCE_TASK_TITLE,
  isVibeforceQueueLow,
  vibeforceTaskDescription,
} from "@/lib/vibeforce";
import type { Subscription, SubscriptionPayment, Task, VibeforceQueueStatus } from "@/lib/types";

export default async function HomePage() {
  const { supabase, user } = await requireOwner();

  const todayISO = todayISODate();
  const { year, month } = currentYearMonth();
  const { startUTC, endUTCExclusive } = monthRangeUTC(year, month);

  const [todayTasksRes, overdueTasksRes, completedThisMonthRes, subscriptionsRes, subscriptionPaymentsRes, queueRes] =
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
      supabase.from("vibeforce_queue_status").select("*").maybeSingle(),
    ]);

  const initialTasks = (todayTasksRes.data ?? []) as Task[];

  // Fila de vídeos da Vibe Force (sincronizada pelo painel Publicador).
  const queueStatus = (queueRes.error ? null : queueRes.data) as VibeforceQueueStatus | null;

  // Tarefa automática: quando faltam poucos dias, cria UMA tarefa pendente para hoje.
  // initialTasks já traz todas as tarefas de hoje (concluídas ou não), então se uma com esse
  // título exato existir, não criamos outra. O índice único do banco cobre o caso de duas
  // telas abrindo ao mesmo tempo (a segunda inserção é recusada e simplesmente ignorada).
  if (isVibeforceQueueLow(queueStatus) && !initialTasks.some((t) => t.title === VIBEFORCE_TASK_TITLE)) {
    const { data: created } = await supabase
      .from("tasks")
      .insert({
        user_id: user.id,
        title: VIBEFORCE_TASK_TITLE,
        description: vibeforceTaskDescription(queueStatus),
        task_date: todayISO,
        status: "pending",
        is_blocked: false,
      })
      .select()
      .single();
    if (created) initialTasks.unshift(created as Task);
  }
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
      <VibeforceQueueAlert status={queueStatus} />
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
