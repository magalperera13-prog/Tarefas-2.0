"use client";

import { useEffect, useRef, useState } from "react";
import type { Task } from "@/lib/types";
import { formatTime, formatDateBR } from "@/lib/date";

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => void;
  onSaveEdit: (task: Task, changes: { title: string; description: string | null }) => void;
  onDeleteRequest: (task: Task) => void;
  /** Quando true (histórico), mostra também o status "não concluída" em vez de ocultar. */
  showPendingBadge?: boolean;
  /** Quando definido (tela Hoje), mostra que essa pendência é de um dia anterior. */
  overdueSince?: string;
}

export function TaskItem({
  task,
  onToggle,
  onSaveEdit,
  onDeleteRequest,
  showPendingBadge,
  overdueSince,
}: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.title);
  const [draftDescription, setDraftDescription] = useState(task.description ?? "");
  const titleRef = useRef<HTMLInputElement>(null);
  const completed = task.status === "completed";

  useEffect(() => {
    if (editing) {
      titleRef.current?.focus();
      titleRef.current?.select();
    }
  }, [editing]);

  function startEditing() {
    setDraftTitle(task.title);
    setDraftDescription(task.description ?? "");
    setEditing(true);
  }

  function commitEdit() {
    const title = draftTitle.trim();
    const description = draftDescription.trim();
    setEditing(false);
    if (!title) {
      setDraftTitle(task.title);
      return;
    }
    if (title !== task.title || description !== (task.description ?? "")) {
      onSaveEdit(task, { title, description: description || null });
    }
  }

  function cancelEdit() {
    setDraftTitle(task.title);
    setDraftDescription(task.description ?? "");
    setEditing(false);
  }

  if (editing) {
    return (
      <div
        className="rounded-xl border px-3.5 py-3"
        style={{ borderColor: "var(--color-accent)", background: "var(--color-bg-elevated)" }}
      >
        <input
          ref={titleRef}
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) commitEdit();
            if (e.key === "Escape") cancelEdit();
          }}
          className="w-full rounded-md border-0 bg-transparent px-0 py-0.5 text-[15px] outline-none"
          style={{ color: "var(--color-text)" }}
          placeholder="Nome da tarefa"
        />
        <textarea
          value={draftDescription}
          onChange={(e) => setDraftDescription(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") cancelEdit();
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) commitEdit();
          }}
          rows={2}
          placeholder="Descrição opcional — por exemplo, por que ainda não foi feita"
          className="mt-1.5 w-full resize-none rounded-md border-0 bg-transparent px-0 py-0.5 text-[12.5px] outline-none placeholder:text-[var(--color-text-faint)]"
          style={{ color: "var(--color-text-muted)" }}
        />
        <div className="mt-2 flex justify-end gap-2">
          <button
            onClick={cancelEdit}
            className="rounded-lg px-2.5 py-1 text-xs font-medium transition hover:opacity-80"
            style={{ color: "var(--color-text-muted)" }}
          >
            Cancelar
          </button>
          <button
            onClick={commitEdit}
            className="rounded-lg px-2.5 py-1 text-xs font-semibold transition hover:opacity-90"
            style={{ background: "var(--color-accent)", color: "#062017" }}
          >
            Salvar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group flex items-start gap-3 rounded-xl border px-3.5 py-3 transition"
      style={{ borderColor: "var(--color-border-soft)", background: "var(--color-bg-elevated)" }}
    >
      <button
        onClick={() => onToggle(task)}
        aria-label={completed ? "Marcar como não concluída" : "Marcar como concluída"}
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition"
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
        <button
          onClick={startEditing}
          className="block max-w-full truncate text-left text-[15px] leading-tight"
          style={{
            color: completed ? "var(--color-text-faint)" : "var(--color-text)",
            textDecoration: completed ? "line-through" : "none",
          }}
          title="Clique para editar"
        >
          {task.title}
        </button>

        {task.description && (
          <p className="mt-1 line-clamp-2 text-[12.5px] leading-snug" style={{ color: "var(--color-text-muted)" }}>
            {task.description}
          </p>
        )}

        <p className="mt-1 font-[family-name:var(--font-mono)] text-[11px] tabular" style={{ color: "var(--color-text-faint)" }}>
          {completed ? (
            <>concluída às {formatTime(task.completed_at ?? task.updated_at)}</>
          ) : overdueSince ? (
            <span style={{ color: "var(--color-pending)" }}>atrasada desde {formatDateBR(overdueSince)}</span>
          ) : showPendingBadge ? (
            <span style={{ color: "var(--color-pending)" }}>não concluída</span>
          ) : (
            <>adicionada às {formatTime(task.created_at)}</>
          )}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
        <button
          onClick={startEditing}
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
