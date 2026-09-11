"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ToastProvider";
import { MonthNav } from "@/components/MonthNav";
import { SearchFilterBar } from "@/components/SearchFilterBar";
import { DayCard } from "@/components/DayCard";
import { MonthlyCompletedSummary } from "@/components/MonthlyCompletedSummary";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { Task } from "@/lib/types";
import {
  currentYearMonth,
  monthKeyFromTimestamp,
  monthRangeUTC,
  monthYearLabel,
  toSaoPauloDateString,
  todayStartUTC,
} from "@/lib/date";

/** Dia (America/Sao_Paulo) em que a tarefa foi de fato concluída — é essa data,
 * não a de criação, que manda no Histórico e no resumo de produtividade. */
function completionDay(task: Task): string {
  return task.completed_at ? toSaoPauloDateString(task.completed_at) : task.task_date;
}

function completionMonthKey(task: Task): string {
  return task.completed_at ? monthKeyFromTimestamp(task.completed_at) : task.task_date.slice(0, 7);
}

export function HistoryView() {
  const supabase = createClient();
  const { showToast } = useToast();

  const initial = currentYearMonth();
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Task | null>(null);
  const [monthlySummary, setMonthlySummary] = useState<{ monthKey: string; count: number }[]>([]);
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
    // Resumo de produtividade por mês — busca uma vez, independente do mês navegado.
    // Conta pela data em que a tarefa foi CONCLUÍDA, não em que foi criada; e
    // exclui o que foi concluído hoje (hoje ainda "pertence" à tela Hoje).
    supabase
      .from("tasks")
      .select("completed_at, task_date")
      .eq("status", "completed")
      .lt("completed_at", todayStartUTC())
      .then(({ data, error }) => {
        if (error || !data) return;
        const counts = new Map<string, number>();
        for (const row of data as { completed_at: string | null; task_date: string }[]) {
          const key = row.completed_at ? monthKeyFromTimestamp(row.completed_at) : row.task_date.slice(0, 7);
          counts.set(key, (counts.get(key) ?? 0) + 1);
        }
        const summary = Array.from(counts.entries())
          .map(([monthKey, count]) => ({ monthKey, count }))
          .sort((a, b) => (a.monthKey < b.monthKey ? 1 : -1))
          .slice(0, 12);
        setMonthlySummary(summary);
      });
  }, [supabase]);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- início intencional do carregamento ao trocar de mês
    setLoading(true);

    const { startUTC, endUTCExclusive } = monthRangeUTC(year, month);
    const upperBound = endUTCExclusive < todayStartUTC() ? endUTCExclusive : todayStartUTC();

    // O Histórico mostra o que foi CONCLUÍDO dentro do mês navegado (pela data
    // real de conclusão, não pela data em que a tarefa foi criada), e nunca o
    // que foi concluído hoje (isso ainda fica só na tela Hoje).
    supabase
      .from("tasks")
      .select("*")
      .eq("status", "completed")
      .gte("completed_at", startUTC)
      .lt("completed_at", upperBound)
      .order("completed_at", { ascending: false })
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
    if (!q) return tasks;
    return tasks.filter((t) => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q));
  }, [tasks, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of filtered) {
      const key = completionDay(task);
      const list = map.get(key) ?? [];
      list.push(task);
      map.set(key, list);
    }
    return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  function adjustMonthlySummary(monthKey: string, delta: number) {
    setMonthlySummary((prev) => {
      const existing = prev.find((e) => e.monthKey === monthKey);
      if (existing) {
        return prev.map((e) => (e.monthKey === monthKey ? { ...e, count: e.count + delta } : e));
      }
      if (delta <= 0) return prev;
      return [...prev, { monthKey, count: delta }].sort((a, b) => (a.monthKey < b.monthKey ? 1 : -1)).slice(0, 12);
    });
  }

  async function handleToggle(task: Task) {
    // Aqui só existem tarefas concluídas, então "desmarcar" sempre reabre —
    // e some da lista, já que o Histórico não mostra pendentes.
    const patch = { status: "pending" as const, completed_at: null };

    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    adjustMonthlySummary(completionMonthKey(task), -1);
    const { error } = await supabase.from("tasks").update(patch).eq("id", task.id);
    if (error) {
      setTasks((prev) => [task, ...prev]);
      adjustMonthlySummary(completionMonthKey(task), 1);
      showToast("Não foi possível atualizar a tarefa", "danger");
      return;
    }
    showToast("Tarefa reaberta");
  }

  async function handleSaveEdit(task: Task, changes: { title: string; description: string | null }) {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, ...changes } : t)));
    const { error } = await supabase.from("tasks").update(changes).eq("id", task.id);
    if (error) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      showToast("Não foi possível salvar a tarefa", "danger");
    }
  }

  async function handleDeleteConfirmed() {
    if (!pendingDelete) return;
    const task = pendingDelete;
    setPendingDelete(null);
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    adjustMonthlySummary(completionMonthKey(task), -1);
    const { error } = await supabase.from("tasks").delete().eq("id", task.id);
    if (error) {
      setTasks((prev) => [task, ...prev]);
      adjustMonthlySummary(completionMonthKey(task), 1);
      showToast("Não foi possível excluir a tarefa", "danger");
      return;
    }
    showToast("✓ Tarefa excluída");
  }

  return (
    <div className="space-y-6">
      <MonthlyCompletedSummary data={monthlySummary} />
      <MonthNav year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
      <SearchFilterBar ref={searchRef} query={query} onQueryChange={setQuery} />

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl" style={{ background: "var(--color-bg-elevated)" }} />
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <EmptyState
          message={
            query
              ? "Nenhuma tarefa encontrada com esses critérios."
              : `Nenhuma tarefa concluída em ${monthYearLabel(year, month)}.`
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
              onSaveEdit={handleSaveEdit}
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
