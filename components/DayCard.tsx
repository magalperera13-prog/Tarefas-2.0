import { formatDateBR, weekdayLabel } from "@/lib/date";
import { TaskItem } from "@/components/TaskItem";
import type { Task } from "@/lib/types";

interface DayCardProps {
  dateISO: string;
  tasks: Task[];
  onToggle: (task: Task) => void;
  onSaveEdit: (task: Task, changes: { title: string; description: string | null }) => void;
  onDeleteRequest: (task: Task) => void;
}

export function DayCard({ dateISO, tasks, onToggle, onSaveEdit, onDeleteRequest }: DayCardProps) {
  const completed = tasks.filter((t) => t.status === "completed").length;
  const pct = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <div className="flex gap-3">
      <div
        className="day-progress-rail w-1 shrink-0 rounded-full"
        style={{ "--pct": `${pct}%` } as React.CSSProperties}
        aria-hidden
      />
      <div className="min-w-0 flex-1 pb-1">
        <div className="mb-2.5 flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="font-[family-name:var(--font-mono)] text-sm tabular" style={{ color: "var(--color-text)" }}>
              {formatDateBR(dateISO)}
            </span>
            <span className="text-xs capitalize" style={{ color: "var(--color-text-faint)" }}>
              {weekdayLabel(dateISO)}
            </span>
          </div>
          <span className="font-[family-name:var(--font-mono)] text-xs tabular" style={{ color: "var(--color-text-muted)" }}>
            {completed}/{tasks.length}
          </span>
        </div>
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onSaveEdit={onSaveEdit}
              onDeleteRequest={onDeleteRequest}
              showPendingBadge
            />
          ))}
        </div>
      </div>
    </div>
  );
}
