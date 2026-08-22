"use client";

import { useEffect, useRef, useState } from "react";
import type { Task } from "@/lib/types";
import { formatTime } from "@/lib/date";

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => void;
  onRename: (task: Task, newTitle: string) => void;
  onDeleteRequest: (task: Task) => void;
  /** Quando true (histórico), mostra também o status "não concluída" em vez de ocultar. */
  showPendingBadge?: boolean;
}

export function TaskItem({ task, onToggle, onRename, onDeleteRequest, showPendingBadge }: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const completed = task.status === "completed";

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function commitRename() {
    const title = draft.trim();
    setEditing(false);
    if (title && title !== task.title) {
      onRename(task, title);
    } else {
      setDraft(task.title);
    }
  }

  return (
    <div
      className="group flex items-center gap-3 rounded-xl border px-3.5 py-3 transition"
      style={{ borderColor: "var(--color-border-soft)", background: "var(--color-bg-elevated)" }}
    >
      <button
        onClick={() => onToggle(task)}
        aria-label={completed ? "Marcar como não concluída" : "Marcar como concluída"}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition"
        style={{
          borderColor: completed ? "var(--color-accent)" : "var(--color-border)",
          background: completed ? "var(--color-accent)" : "transparent",
        }}
      >
        {completed && (
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
            <path d="M3.5 8.5l3 3 6-7" stroke="#062017" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") {
                setDraft(task.title);
                setEditing(false);
              }
            }}
            className="w-full rounded-md border bg-transparent px-1.5 py-0.5 text-[15px] outline-none"
            style={{ borderColor: "var(--color-accent)" }}
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="block max-w-full truncate text-left text-[15px] leading-tight"
            style={{
              color: completed ? "var(--color-text-faint)" : "var(--color-text)",
              textDecoration: completed ? "line-through" : "none",
            }}
            title="Clique para editar"
          >
            {task.title}
          </button>
        )}
        <p className="mt-0.5 font-[family-name:var(--font-mono)] text-[11px] tabular" style={{ color: "var(--color-text-faint)" }}>
          {completed ? (
            <>concluída às {formatTime(task.completed_at ?? task.updated_at)}</>
          ) : showPendingBadge ? (
            <span style={{ color: "var(--color-pending)" }}>não concluída</span>
          ) : (
            <>adicionada às {formatTime(task.created_at)}</>
          )}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
        <button
          onClick={() => setEditing(true)}
          aria-label="Editar tarefa"
          className="rounded-lg p-1.5 transition hover:bg-white/5"
          style={{ color: "var(--color-text-muted)" }}
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
            <path
              d="M13.5 3.5l3 3L7 16H4v-3l9.5-9.5z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          onClick={() => onDeleteRequest(task)}
          aria-label="Excluir tarefa"
          className="rounded-lg p-1.5 transition hover:bg-white/5"
          style={{ color: "var(--color-text-muted)" }}
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
            <path
              d="M5 6.5h10M8.5 6.5V5a1 1 0 011-1h1a1 1 0 011 1v1.5M8 9.5v4M12 9.5v4M6 6.5l.6 8a1 1 0 001 .9h4.8a1 1 0 001-.9l.6-8"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
