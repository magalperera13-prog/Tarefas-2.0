import { requireOwner } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { TodayBoard } from "@/components/TodayBoard";
import { todayISODate, monthRange, currentYearMonth } from "@/lib/date";
import type { Task } from "@/lib/types";

export default async function HomePage() {
  const { supabase, user } = await requireOwner();

  const todayISO = todayISODate();
  const { year, month } = currentYearMonth();
  const { start, end } = monthRange(year, month);

  const [todayTasksRes, overdueTasksRes, completedThisMonthRes] = await Promise.all([
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
      .gte("task_date", start)
      .lte("task_date", end),
  ]);

  const initialTasks = (todayTasksRes.data ?? []) as Task[];
  const initialOverdueTasks = (overdueTasksRes.data ?? []) as Task[];
  const initialCompletedThisMonth = completedThisMonthRes.count ?? 0;
  const ownerName = process.env.NEXT_PUBLIC_OWNER_NAME || "Magal";

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <AppHeader userEmail={user.email} />
      <p className="mb-5 font-[family-name:var(--font-display)] text-lg font-semibold">
        Olá, {ownerName} 👋
      </p>
      <TodayBoard
        userId={user.id}
        initialTasks={initialTasks}
        initialOverdueTasks={initialOverdueTasks}
        initialCompletedThisMonth={initialCompletedThisMonth}
      />
    </main>
  );
}
