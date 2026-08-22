"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ToastProvider";
import { QuickAdd } from "@/components/QuickAdd";
import { TaskItem } from "@/components/TaskItem";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { StatsRail } from "@/components/StatsRail";
import type { Task } from "@/lib/types";
import { todayISODate, monthYearShort, currentYearMonth } from "@/lib/date";

interface TodayBoardProps {
  userId: string;
  initialTasks: Task[];
  initialCompletedThisMonth: number;
}

export function TodayBoard({ userId, initialTasks, initialCompletedThisMonth }: TodayBoardProps) {
  const supabase = createClient();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [completedThisMonth, setCompletedThisMonth] = useState(initialCompletedThisMonth);
  const [pendingDelete, setPendingDelete] = useState<Task | null>(null);

  const todayISO = useMemo(() => todayISODate(), []);
  const { year, month } = useMemo(() => currentYearMonth(), []);

  const completedToday = tasks.filter((t) => t.status === "completed").length;
  const pendingToday = tasks.length - completedToday;

  async function handleAdd(title: string) {
    const { data, error } = await supabase
      .from("tasks")
      .insert({ title, user_id: userId, task_date: todayISO, status: "pending" })
      .select()
      .single();

    if (error || !data) {
      showToast("Não foi possível adicionar a tarefa", "danger");
      return;
    }
    setTasks((prev) => [data as Task, ...prev]);
    showToast("✓ Tarefa adicionada");
  }

  async function handleToggle(task: Task) {
    const completing = task.status !== "completed";
    const patch = completing
      ? { status: "completed" as const, completed_at: new Date().toISOString() }
      : { status: "pending" as const, completed_at: null };

    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, ...patch } : t)));
    setCompletedThisMonth((prev) => prev + (completing ? 1 : -1));

    const { error } = await supabase.from("tasks").update(patch).eq("id", task.id);
    if (error) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      setCompletedThisMonth((prev) => prev - (completing ? 1 : -1));
      showToast("Não foi possível atualizar a tarefa", "danger");
      return;
    }
    showToast(completing ? "✓ Tarefa concluída" : "Tarefa reaberta");
  }

  async function handleRename(task: Task, newTitle: string) {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, title: newTitle } : t)));
    const { error } = await supabase.from("tasks").update({ title: newTitle }).eq("id", task.id);
    if (error) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      showToast("Não foi possível renomear a tarefa", "danger");
    }
  }

  async function handleDeleteConfirmed() {
    if (!pendingDelete) return;
    const task = pendingDelete;
    setPendingDelete(null);
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    if (task.status === "completed") setCompletedThisMonth((prev) => prev - 1);

    const { error } = await supabase.from("tasks").delete().eq("id", task.id);
    if (error) {
      setTasks((prev) => [task, ...prev]);
      if (task.status === "completed") setCompletedThisMonth((prev) => prev + 1);
      showToast("Não foi possível excluir a tarefa", "danger");
      return;
    }
    showToast("✓ Tarefa excluída");
  }

  const sorted = [...tasks].sort((a, b) => {
    if (a.status !== b.status) return a.status === "completed" ? 1 : -1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-6">
      <StatsRail
        monthLabel={monthYearShort(year, month)}
        stats={{
          today: tasks.length,
          completedToday,
          pendingToday,
          completedThisMonth,
        }}
      />

      <QuickAdd onAdd={handleAdd} />

      <div>
        <h2 className="mb-3 font-[family-name:var(--font-display)] text-sm font-semibold tracking-wide" style={{ color: "var(--color-text-muted)" }}>
          TAREFAS DO DIA
        </h2>

        {sorted.length === 0 ? (
          <EmptyState message="Nenhuma tarefa para hoje. Adicione a primeira acima." />
        ) : (
          <div className="space-y-2">
            {sorted.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onRename={handleRename}
                onDeleteRequest={setPendingDelete}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Excluir tarefa"
        description={pendingDelete ? `Tem certeza que deseja excluir "${pendingDelete.title}"? Essa ação não pode ser desfeita.` : ""}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
