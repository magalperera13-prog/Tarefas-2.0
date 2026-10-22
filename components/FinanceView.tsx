"use client";

import { useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ToastProvider";
import { FinanceQuickAdd } from "@/components/FinanceQuickAdd";
import { FinanceStatsRail } from "@/components/FinanceStatsRail";
import { FinanceProjectSummary } from "@/components/FinanceProjectSummary";
import { FinanceEntryRow } from "@/components/FinanceEntryRow";
import { MonthNav } from "@/components/MonthNav";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { FinanceEntry } from "@/lib/types";
import { projectKey, summarizeFinance, type FinanceEntryInput } from "@/lib/finance";
import { formatBRL } from "@/lib/format";
import { currentYearMonth, monthKeyFor, monthRange, monthYearLabel } from "@/lib/date";

interface FinanceViewProps {
  userId: string;
  initialEntries: FinanceEntry[];
  initialProjects: string[];
  todayISO: string;
}

function sortEntries(list: FinanceEntry[]): FinanceEntry[] {
  return [...list].sort((a, b) => {
    if (a.entry_date !== b.entry_date) return a.entry_date < b.entry_date ? 1 : -1;
    return a.created_at < b.created_at ? 1 : -1;
  });
}

export function FinanceView({ userId, initialEntries, initialProjects, todayISO }: FinanceViewProps) {
  const supabase = createClient();
  const { showToast } = useToast();

  const current = useMemo(() => currentYearMonth(), []);
  const [year, setYear] = useState(current.year);
  const [month, setMonth] = useState(current.month);
  const [entries, setEntries] = useState<FinanceEntry[]>(initialEntries);
  const [knownProjects, setKnownProjects] = useState<string[]>(initialProjects);
  const [loading, setLoading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<FinanceEntry | null>(null);
  const requestId = useRef(0);

  const viewedMonthKey = monthKeyFor(year, month);
  const summary = useMemo(() => summarizeFinance(entries), [entries]);
  const sorted = useMemo(() => sortEntries(entries), [entries]);

  function rememberProject(project: string | null) {
    if (!project) return;
    const key = projectKey(project);
    setKnownProjects((prev) =>
      prev.some((p) => projectKey(p) === key) ? prev : [...prev, project].sort((a, b) => a.localeCompare(b, "pt-BR"))
    );
  }

  async function changeMonth(y: number, m: number) {
    setYear(y);
    setMonth(m);
    setLoading(true);
    const id = ++requestId.current;
    const { start, end } = monthRange(y, m);
    const { data, error } = await supabase
      .from("finance_entries")
      .select("*")
      .gte("entry_date", start)
      .lte("entry_date", end)
      .order("entry_date", { ascending: false })
      .order("created_at", { ascending: false });
    if (id !== requestId.current) return; // o usuário já foi para outro mês
    if (error) {
      showToast("Não foi possível carregar o mês", "danger");
      setEntries([]);
    } else {
      setEntries((data ?? []) as FinanceEntry[]);
    }
    setLoading(false);
  }

  async function handleAdd(input: FinanceEntryInput) {
    const { data, error } = await supabase
      .from("finance_entries")
      .insert({ ...input, user_id: userId })
      .select()
      .single();
    if (error || !data) {
      showToast("Não foi possível adicionar o lançamento", "danger");
      return;
    }
    const entry = data as FinanceEntry;
    rememberProject(entry.project);
    if (entry.entry_date.slice(0, 7) === viewedMonthKey) {
      setEntries((prev) => [...prev, entry]);
      showToast("✓ Lançamento adicionado");
    } else {
      showToast("✓ Adicionado em outro mês");
    }
  }

  async function handleSaveEdit(entry: FinanceEntry, changes: FinanceEntryInput) {
    const leavesMonth = changes.entry_date.slice(0, 7) !== viewedMonthKey;
    setEntries((prev) =>
      leavesMonth ? prev.filter((e) => e.id !== entry.id) : prev.map((e) => (e.id === entry.id ? { ...e, ...changes } : e))
    );
    const { error } = await supabase.from("finance_entries").update(changes).eq("id", entry.id);
    if (error) {
      setEntries((prev) => (prev.some((e) => e.id === entry.id) ? prev.map((e) => (e.id === entry.id ? entry : e)) : [...prev, entry]));
      showToast("Não foi possível salvar o lançamento", "danger");
      return;
    }
    rememberProject(changes.project);
    showToast(leavesMonth ? "✓ Movido para outro mês" : "✓ Lançamento atualizado");
  }

  async function handleDeleteConfirmed() {
    if (!pendingDelete) return;
    const entry = pendingDelete;
    setPendingDelete(null);
    setEntries((prev) => prev.filter((e) => e.id !== entry.id));
    const { error } = await supabase.from("finance_entries").delete().eq("id", entry.id);
    if (error) {
      setEntries((prev) => [...prev, entry]);
      showToast("Não foi possível excluir o lançamento", "danger");
      return;
    }
    showToast("✓ Lançamento excluído");
  }

  return (
    <div className="space-y-6">
      <FinanceStatsRail summary={summary} />
      <FinanceQuickAdd todayISO={todayISO} knownProjects={knownProjects} onAdd={handleAdd} />
      <MonthNav year={year} month={month} onChange={changeMonth} />

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl" style={{ background: "var(--color-bg-elevated)" }} />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState message={`Nenhum lançamento em ${monthYearLabel(year, month)}.`} />
      ) : (
        <>
          <FinanceProjectSummary projects={summary.byProject} />

          <div
            className="overflow-hidden rounded-xl border"
            style={{ borderColor: "var(--color-border-soft)", background: "var(--color-bg-elevated)" }}
          >
            <div
              className="flex items-center gap-3 border-b px-3.5 py-2 text-[10.5px] font-semibold uppercase tracking-wide"
              style={{ borderColor: "var(--color-border-soft)", color: "var(--color-text-faint)" }}
            >
              <span className="w-11 shrink-0">Data</span>
              <span className="flex-1">Descrição</span>
              <span className="pr-9 text-right">Valor</span>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--color-border-soft)" }}>
              {sorted.map((entry) => (
                <div key={entry.id} style={{ borderColor: "var(--color-border-soft)" }}>
                  <FinanceEntryRow
                    entry={entry}
                    knownProjects={knownProjects}
                    onSaveEdit={handleSaveEdit}
                    onDeleteRequest={setPendingDelete}
                  />
                </div>
              ))}
            </div>
            <div
              className="flex items-center justify-between gap-3 border-t px-3.5 py-2.5 text-[13px]"
              style={{ borderColor: "var(--color-border-soft)", background: "var(--color-bg-inset)" }}
            >
              <span style={{ color: "var(--color-text-muted)" }}>Lucro do mês</span>
              <span
                className="font-[family-name:var(--font-mono)] font-semibold tabular"
                style={{
                  color: summary.profit > 0 ? "var(--color-accent)" : summary.profit < 0 ? "var(--color-danger)" : "var(--color-text)",
                }}
              >
                {formatBRL(summary.profit)}
              </span>
            </div>
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Excluir lançamento"
        description={
          pendingDelete
            ? `Tem certeza que deseja excluir "${pendingDelete.description}" (${formatBRL(pendingDelete.amount)})? Essa ação não pode ser desfeita.`
            : ""
        }
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
