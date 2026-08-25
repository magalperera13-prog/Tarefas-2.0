import { formatDateBR, weekdayLabel } from "@/lib/date";
import { formatBRL } from "@/lib/format";
import { ExpenseItem } from "@/components/ExpenseItem";
import type { Expense } from "@/lib/types";

interface ExpenseDayCardProps {
  dateISO: string;
  expenses: Expense[];
  onSaveEdit: (expense: Expense, changes: { description: string; amount: number }) => void;
  onDeleteRequest: (expense: Expense) => void;
}

export function ExpenseDayCard({ dateISO, expenses, onSaveEdit, onDeleteRequest }: ExpenseDayCardProps) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      <div className="mb-2.5 flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className="font-[family-name:var(--font-mono)] text-sm tabular" style={{ color: "var(--color-text)" }}>
            {formatDateBR(dateISO)}
          </span>
          <span className="text-xs capitalize" style={{ color: "var(--color-text-faint)" }}>
            {weekdayLabel(dateISO)}
          </span>
        </div>
        <span className="font-[family-name:var(--font-mono)] text-xs tabular" style={{ color: "var(--color-danger)" }}>
          {formatBRL(total)}
        </span>
      </div>
      <div className="space-y-2">
        {expenses.map((expense) => (
          <ExpenseItem key={expense.id} expense={expense} onSaveEdit={onSaveEdit} onDeleteRequest={onDeleteRequest} />
        ))}
      </div>
    </div>
  );
}
