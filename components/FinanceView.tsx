"use client";

import { useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ToastProvider";
import { FinanceQuickAdd } from "@/components/FinanceQuickAdd";
import { FinanceStatsRail } from "@/components/FinanceStatsRail";
import { FinanceEntryRow, FINANCE_COLS } from "@/components/FinanceEntryRow";
import { MonthNav } from "@/components/MonthNav";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { FinanceEntry } from "@/lib/types";
import { profitColor, summarizeFinance, type FinanceEntryInput } from "@/lib/finance";
import { formatBRL } from "@/lib/format";
import { currentYearMonth, monthKeyFor, monthRange, monthYearLabel } from "@/lib/date";

interface FinanceViewProps {
  userId: string;
  initialEntries: FinanceEntry[];
  todayISO: string;
}

function sortEntries(list: FinanceEntry[]): FinanceEntry[] {
  return [...list].sort((a, b) => {
    if (a.entry_date !== b.entry_date) return a.entry_date < b.entry_date ? 1 : -1;
    return a.created_at < b.created_at ? 1 : -1;
  });
}

export function FinanceView({ userId, initialEntries, todayISO }: FinanceViewProps) {
  const supabase = createClient();
  const { showToast } = useToast();

  const current = useMemo(() => currentYearMonth(), []);
  const [year, setYear] = useState(current.year);
  const [month, setMonth] = useState(current.month);
  const [entries, setEntries] = useState<FinanceEntry[]>(initialEntries);
  const [loading, setLoading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<FinanceEntry | null>(null);
  const requestId = useRef(0);

  const viewedMonthKey = monthKeyFor(year, month);
  const summary = useMemo(() => summarizeFinance(entries), [entries]);
  const sorted = useMemo(() => sortEntries(entries), [entries]);

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
      showToast("Não foi possível adicionar a linha", "danger");
      return;
    }
    const entry = data as FinanceEntry;
    if (entry.entry_date.slice(0, 7) === viewedMonthKey) {
      setEntries((prev) => [...prev, entry]);
      showToast("✓ Linha adicionada");
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
      showToast("Não foi possível salvar a linha", "danger");
      return;
    }
    showToast(leavesMonth ? "✓ Movido para outro mês" : "✓ Linha atualizada");
  }

  async function handleDeleteConfirmed() {
    if (!pendingDelete) return;
    const entry = pendingDelete;
    setPendingDelete(null);
    setEntries((prev) => prev.filter((e) => e.id !== entry.id));
    const { error } = await supabase.from("finance_entries").delete().eq("id", entry.id);
    if (error) {
      setEntries((prev) => [...prev, entry]);
      showToast("Não foi possível excluir a linha", "danger");
      return;
    }
    showToast("✓ Linha excluída");
  }

  return (
    <div className="space-y-6">
      <FinanceStatsRail summary={summary} />
      <FinanceQuickAdd todayISO={todayISO} onAdd={handleAdd} />
      <MonthNav year={year} month={month} onChange={changeMonth} />

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl" style={{ background: "var(--color-bg-elevated)" }} />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState message={`Nenhuma linha em ${monthYearLabel(year, month)}.`} />
      ) : (
        <>
          <div
            className="overflow-hidden rounded-xl border"
            style={{ borderColor: "var(--color-border-soft)", background: "var(--color-bg-elevated)" }}
          >
            <div
              className={`hidden border-b px-3.5 py-2 text-[10.5px] font-semibold uppercase tracking-wide ${FINANCE_COLS}`}
              style={{ borderColor: "var(--color-border-soft)", color: "var(--color-text-faint)" }}
            >
              <span>Data</span>
              <span>Descrição</span>
              <span className="text-right">Faturamento</span>
              <span className="text-right">Gastos</span>
              <span className="text-right">Lucro</span>
              <span />
            </div>
            <div className="divide-y" style={{ borderColor: "var(--color-border-soft)" }}>
              {sorted.map((entry) => (
                <div key={entry.id} style={{ borderColor: "var(--color-border-soft)" }}>
                  <FinanceEntryRow
                    entry={entry}
                    onSaveEdit={handleSaveEdit}
                    onDeleteRequest={setPendingDelete}
                  />
                </div>
              ))}
            </div>
            <div
              className={`grid grid-cols-3 gap-2 border-t px-3.5 py-2.5 text-[13px] ${FINANCE_COLS}`}
              style={{ borderColor: "var(--color-border-soft)", background: "var(--color-bg-inset)" }}
            >
              <span className="col-span-3 font-medium sm:col-span-2" style={{ color: "var(--color-text-muted)" }}>
                Total do mês
              </span>
              <span className="font-[family-name:var(--font-mono)] font-semibold tabular sm:text-right">
                <span className="block text-[10px] font-semibold uppercase tracking-wide sm:hidden" style={{ color: "var(--color-text-faint)" }}>Faturamento</span>
                {formatBRL(summary.revenue)}
              </span>
              <span className="font-[family-name:var(--font-mono)] font-semibold tabular sm:text-right" style={{ color: "var(--color-danger)" }}>
                <span className="block text-[10px] font-semibold uppercase tracking-wide sm:hidden" style={{ color: "var(--color-text-faint)" }}>Gastos</span>
                {formatBRL(summary.cost)}
              </span>
              <span className="font-[family-name:var(--font-mono)] font-semibold tabular sm:text-right" style={{ color: profitColor(summary.profit) }}>
                <span className="block text-[10px] font-semibold uppercase tracking-wide sm:hidden" style={{ color: "var(--color-text-faint)" }}>Lucro</span>
                {formatBRL(summary.profit)}
              </span>
            </div>
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Excluir linha"
        description={
          pendingDelete
            ? `Tem certeza que deseja excluir "${pendingDelete.description}" (lucro de ${formatBRL(pendingDelete.revenue - pendingDelete.cost)})? Essa ação não pode ser desfeita.`
            : ""
        }
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
