"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ToastProvider";
import { MonthNav } from "@/components/MonthNav";
import { SearchFilterBar } from "@/components/SearchFilterBar";
import { DayCard } from "@/components/DayCard";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { HistoryFilter, Task } from "@/lib/types";
import { currentYearMonth, monthRange, monthYearLabel, todayISODate } from "@/lib/date";

export function HistoryView() {
  const supabase = createClient();
  const { showToast } = useToast();

  const initial = currentYearMonth();
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const [pendingDelete, setPendingDelete] = useState<Task | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- início intencional do carregamento ao trocar de mês
    setLoading(true);

    const { start, end } = monthRange(year, month);
    const todayISO = todayISODate();

    supabase
      .from("tasks")
      .select("*")
      .gte("task_date", start)
      .lte("task_date", end)
      .lt("task_date", todayISO) // tarefas de hoje ficam só em "Tarefas do dia", não no histórico ainda
      .order("task_date", { ascending: false })
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          showToast("Não foi possível carregar o histórico", "danger");
          setTasks([]);
        } else {
          setTasks((data ?? []) as Task[]);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      if (filter === "completed" && t.status !== "completed") return false;
      if (filter === "pending" && t.status !== "pending") return false;
      if (q && !t.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [tasks, filter, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of filtered) {
      const list = map.get(task.task_date) ?? [];
      list.push(task);
      map.set(task.task_date, list);
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  async function handleToggle(task: Task) {
    const completing = task.status !== "completed";
    const patch = completing
      ? { status: "completed" as const, completed_at: new Date().toISOString() }
      : { status: "pending" as const, completed_at: null };

    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, ...patch } : t)));
    const { error } = await supabase.from("tasks").update(patch).eq("id", task.id);
    if (error) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
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
    const { error } = await supabase.from("tasks").delete().eq("id", task.id);
    if (error) {
      setTasks((prev) => [task, ...prev]);
      showToast("Não foi possível excluir a tarefa", "danger");
      return;
    }
    showToast("✓ Tarefa excluída");
  }

  return (
    <div className="space-y-6">
      <MonthNav year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
      <SearchFilterBar ref={searchRef} query={query} onQueryChange={setQuery} filter={filter} onFilterChange={setFilter} />

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl" style={{ background: "var(--color-bg-elevated)" }} />
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <EmptyState
          message={
            query || filter !== "all"
              ? "Nenhuma tarefa encontrada com esses critérios."
              : `Nenhuma tarefa registrada em ${monthYearLabel(year, month)}.`
          }
        />
      ) : (
        <div className="space-y-6">
          {grouped.map(([dateISO, dayTasks]) => (
            <DayCard
              key={dateISO}
              dateISO={dateISO}
              tasks={dayTasks}
              onToggle={handleToggle}
              onRename={handleRename}
              onDeleteRequest={setPendingDelete}
            />
          ))}
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
