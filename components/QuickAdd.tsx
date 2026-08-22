"use client";

import { useState } from "react";

export function QuickAdd({ onAdd }: { onAdd: (title: string) => Promise<void> | void }) {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    const title = value.trim();
    if (!title || submitting) return;
    setSubmitting(true);
    setValue("");
    try {
      await onAdd(title);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="flex items-center gap-2 rounded-2xl border p-2 shadow-sm sm:gap-3 sm:p-2.5"
      style={{ borderColor: "var(--color-border)", background: "var(--color-bg-elevated)" }}
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        placeholder="O que precisa ser feito?"
        className="min-w-0 flex-1 bg-transparent px-2.5 py-2 text-[15px] outline-none placeholder:text-[var(--color-text-faint)]"
        aria-label="O que precisa ser feito?"
      />
      <button
        onClick={submit}
        disabled={!value.trim() || submitting}
        className="shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-40"
        style={{ background: "var(--color-accent)", color: "#062017" }}
      >
        Adicionar
      </button>
    </div>
  );
}
