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
  initialOverdueTasks: Task[];
  initialCompletedThisMonth: number;
}

export function TodayBoard({
  userId,
  initialTasks,
  initialOverdueTasks,
  initialCompletedThisMonth,
}: TodayBoardProps) {
  const supabase = createClient();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>(initialOverdueTasks);
  const [completedThisMonth, setCompletedThisMonth] = useState(initialCompletedThisMonth);
  const [pendingDelete, setPendingDelete] = useState<Task | null>(null);

  const todayISO = useMemo(() => todayISODate(), []);
  const { year, month } = useMemo(() => currentYearMonth(), []);

  const completedToday = tasks.filter((t) => t.status === "completed").length;
  const pendingToday = tasks.length - completedToday;

  async function handleAdd(title: string) {
    const { data, error } = await supabase
      .from("tasks")
      .insert({ title, user_id: userId, task_date: todayISO, status: "pending", is_blocked: false })
      .select()
      .single();

    if (error || !data) {
      showToast("Não foi possível adicionar a tarefa", "danger");
      return;
    }
    setTasks((prev) => [data as Task, ...prev]);
    showToast("✓ Tarefa adicionada");
  }

  async function handleToggle(task: Task, list: "today" | "overdue") {
    const completing = task.status !== "completed";
    const patch = completing
      ? { status: "completed" as const, completed_at: new Date().toISOString(), is_blocked: false }
      : { status: "pending" as const, completed_at: null };

    if (list === "today") {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, ...patch } : t)));
    } else {
      // Uma pendência atrasada some da lista assim que é concluída — ela passa
      // a fazer parte do histórico do dia em que foi concluída, não da tela Hoje.
      setOverdueTasks((prev) => prev.filter((t) => t.id !== task.id));
    }
    // Marcar ou desmarcar como concluída sempre acontece agora, no mês atual —
    // "Concluídas no mês" sempre reflete quando a tarefa foi de fato concluída.
    setCompletedThisMonth((prev) => prev + (completing ? 1 : -1));

    const { error } = await supabase.from("tasks").update(patch).eq("id", task.id);
    if (error) {
      if (list === "today") {
        setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      } else {
        setOverdueTasks((prev) => [...prev, task]);
      }
      setCompletedThisMonth((prev) => prev - (completing ? 1 : -1));
      showToast("Não foi possível atualizar a tarefa", "danger");
      return;
    }
    showToast(completing ? "✓ Tarefa concluída" : "Tarefa reaberta");
  }

  async function handleToggleBlock(task: Task, list: "today" | "overdue") {
    const nextBlocked = !task.is_blocked;
    const setter = list === "today" ? setTasks : setOverdueTasks;
    setter((prev) => prev.map((t) => (t.id === task.id ? { ...t, is_blocked: nextBlocked } : t)));

    const { error } = await supabase.from("tasks").update({ is_blocked: nextBlocked }).eq("id", task.id);
    if (error) {
      setter((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      showToast("Não foi possível atualizar a tarefa", "danger");
      return;
    }
    showToast(nextBlocked ? "Tarefa movida para Aguardando algo" : "Tarefa de volta às listas normais");
  }

  async function handleSaveEdit(
    task: Task,
    changes: { title: string; description: string | null },
    list: "today" | "overdue"
  ) {
    const setter = list === "today" ? setTasks : setOverdueTasks;
    setter((prev) => prev.map((t) => (t.id === task.id ? { ...t, ...changes } : t)));
    const { error } = await supabase.from("tasks").update(changes).eq("id", task.id);
    if (error) {
      setter((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      showToast("Não foi possível salvar a tarefa", "danger");
    }
  }

  async function handleDeleteConfirmed() {
    if (!pendingDelete) return;
    const task = pendingDelete;
    const list: "today" | "overdue" = tasks.some((t) => t.id === task.id) ? "today" : "overdue";
    setPendingDelete(null);

    if (list === "today") {
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } else {
      setOverdueTasks((prev) => prev.filter((t) => t.id !== task.id));
    }
    if (task.status === "completed") {
      setCompletedThisMonth((prev) => prev - 1);
    }

    const { error } = await supabase.from("tasks").delete().eq("id", task.id);
    if (error) {
      if (list === "today") {
        setTasks((prev) => [task, ...prev]);
      } else {
        setOverdueTasks((prev) => [...prev, task]);
      }
      if (task.status === "completed") {
        setCompletedThisMonth((prev) => prev + 1);
      }
      showToast("Não foi possível excluir a tarefa", "danger");
      return;
    }
    showToast("✓ Tarefa excluída");
  }

  const isActiveBlocked = (t: Task) => t.is_blocked && t.status === "pending";

  const sortedToday = tasks
    .filter((t) => !isActiveBlocked(t))
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "completed" ? 1 : -1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const sortedOverdue = overdueTasks
    .filter((t) => !isActiveBlocked(t))
    .sort((a, b) => (a.task_date < b.task_date ? -1 : 1));

  const blockedItems = useMemo(() => {
    const fromToday = tasks.filter(isActiveBlocked).map((task) => ({ task, list: "today" as const }));
    const fromOverdue = overdueTasks.filter(isActiveBlocked).map((task) => ({ task, list: "overdue" as const }));
    return [...fromToday, ...fromOverdue].sort(
      (a, b) => new Date(a.task.created_at).getTime() - new Date(b.task.created_at).getTime()
    );
  }, [tasks, overdueTasks]);

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

      {sortedOverdue.length > 0 && (
        <div>
          <h2
            className="mb-3 font-[family-name:var(--font-display)] text-sm font-semibold tracking-wide"
            style={{ color: "var(--color-pending)" }}
          >
            PENDENTES ({sortedOverdue.length})
          </h2>
          <div className="space-y-2">
            {sortedOverdue.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                overdueSince={task.task_date}
                onToggle={(t) => handleToggle(t, "overdue")}
                onSaveEdit={(t, changes) => handleSaveEdit(t, changes, "overdue")}
                onDeleteRequest={setPendingDelete}
                onToggleBlock={(t) => handleToggleBlock(t, "overdue")}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2
          className="mb-3 font-[family-name:var(--font-display)] text-sm font-semibold tracking-wide"
          style={{ color: "var(--color-text-muted)" }}
        >
          TAREFAS DO DIA
        </h2>

        {sortedToday.length === 0 ? (
          <EmptyState message="Nenhuma tarefa para hoje. Adicione a primeira acima." />
        ) : (
          <div className="space-y-2">
            {sortedToday.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={(t) => handleToggle(t, "today")}
                onSaveEdit={(t, changes) => handleSaveEdit(t, changes, "today")}
                onDeleteRequest={setPendingDelete}
                onToggleBlock={(t) => handleToggleBlock(t, "today")}
              />
            ))}
          </div>
        )}
      </div>

      {blockedItems.length > 0 && (
        <div>
          <h2
            className="mb-3 font-[family-name:var(--font-display)] text-sm font-semibold tracking-wide"
            style={{ color: "var(--color-text-muted)" }}
          >
            AGUARDANDO ALGO ({blockedItems.length})
          </h2>
          <div className="space-y-2">
            {blockedItems.map(({ task, list }) => (
              <TaskItem
                key={task.id}
                task={task}
                overdueSince={list === "overdue" ? task.task_date : undefined}
                onToggle={(t) => handleToggle(t, list)}
                onSaveEdit={(t, changes) => handleSaveEdit(t, changes, list)}
                onDeleteRequest={setPendingDelete}
                onToggleBlock={(t) => handleToggleBlock(t, list)}
              />
            ))}
          </div>
        </div>
      )}

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
