"use client";

import { useState } from "react";
import type { PixKey, PixKeyType } from "@/lib/types";
import { PIX_KEY_TYPES, pixTypeLabel } from "@/lib/pix";
import { useToast } from "@/components/ToastProvider";

export type PixKeyChanges = {
  bank_name: string;
  key_type: PixKeyType;
  key_value: string;
  notes: string | null;
};

interface PixKeyItemProps {
  pixKey: PixKey;
  onSaveEdit: (pixKey: PixKey, changes: PixKeyChanges) => void;
  onDeleteRequest: (pixKey: PixKey) => void;
}

export function PixKeyItem({ pixKey, onSaveEdit, onDeleteRequest }: PixKeyItemProps) {
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [draftBank, setDraftBank] = useState(pixKey.bank_name);
  const [draftType, setDraftType] = useState<PixKeyType>(pixKey.key_type);
  const [draftValue, setDraftValue] = useState(pixKey.key_value);
  const [draftNotes, setDraftNotes] = useState(pixKey.notes ?? "");

  function startEditing() {
    setDraftBank(pixKey.bank_name);
    setDraftType(pixKey.key_type);
    setDraftValue(pixKey.key_value);
    setDraftNotes(pixKey.notes ?? "");
    setEditing(true);
  }

  function commitEdit() {
    const bank_name = draftBank.trim();
    const key_value = draftValue.trim();
    const notes = draftNotes.trim() || null;
    if (!bank_name || !key_value) return;
    setEditing(false);
    if (
      bank_name !== pixKey.bank_name ||
      draftType !== pixKey.key_type ||
      key_value !== pixKey.key_value ||
      notes !== pixKey.notes
    ) {
      onSaveEdit(pixKey, { bank_name, key_type: draftType, key_value, notes });
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(pixKey.key_value);
      showToast("✓ Chave Pix copiada");
    } catch {
      showToast("Não foi possível copiar", "danger");
    }
  }

  if (editing) {
    return (
      <div
        className="space-y-2.5 rounded-xl border px-3.5 py-3"
        style={{ borderColor: "var(--color-accent)", background: "var(--color-bg-elevated)" }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setEditing(false);
        }}
      >
        <input
          value={draftBank}
          onChange={(e) => setDraftBank(e.target.value)}
          placeholder="Banco"
          aria-label="Banco"
          className="w-full bg-transparent text-[15px] outline-none"
          style={{ color: "var(--color-text)" }}
        />
        <div className="flex flex-wrap gap-1.5">
          {PIX_KEY_TYPES.map((t) => {
            const active = t.value === draftType;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setDraftType(t.value)}
                className="rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition"
                style={{
                  borderColor: active ? "var(--color-accent)" : "var(--color-border)",
                  background: active ? "var(--color-accent-soft)" : "transparent",
                  color: active ? "var(--color-accent)" : "var(--color-text-muted)",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        <input
          value={draftValue}
          onChange={(e) => setDraftValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitEdit();
          }}
          placeholder="Chave Pix"
          aria-label="Chave Pix"
          className="w-full bg-transparent font-[family-name:var(--font-mono)] text-[14px] outline-none"
          style={{ color: "var(--color-text)" }}
        />
        <input
          value={draftNotes}
          onChange={(e) => setDraftNotes(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitEdit();
          }}
          placeholder="Observação opcional (ex.: conta PJ, usar para clientes)"
          aria-label="Observação"
          className="w-full bg-transparent text-[12.5px] outline-none placeholder:text-[var(--color-text-faint)]"
          style={{ color: "var(--color-text-muted)" }}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setEditing(false)}
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
      className="group flex items-center gap-3 rounded-xl border px-3.5 py-3"
      style={{ borderColor: "var(--color-border-soft)", background: "var(--color-bg-elevated)" }}
    >
      <span
        className="shrink-0 rounded-md px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide"
        style={{ background: "var(--color-bg-inset)", color: "var(--color-text-muted)" }}
      >
        {pixTypeLabel(pixKey.key_type)}
      </span>

      <div className="min-w-0 flex-1">
        <p className="break-all font-[family-name:var(--font-mono)] text-[14px] leading-snug" style={{ color: "var(--color-text)" }}>
          {pixKey.key_value}
        </p>
        {pixKey.notes && (
          <p className="mt-0.5 text-[12px] leading-snug" style={{ color: "var(--color-text-muted)" }}>
            {pixKey.notes}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        <button
          onClick={copy}
          aria-label="Copiar chave Pix"
          title="Copiar chave Pix"
          className="rounded-lg p-1.5 transition hover:bg-white/5"
          style={{ color: "var(--color-accent)" }}
        >
          <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none">
            <rect x="7" y="7" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
            <path d="M13 7V5a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
        <div className="flex items-center gap-0.5 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <button
            onClick={startEditing}
            aria-label="Editar chave"
            className="rounded-lg p-1.5 transition hover:bg-white/5"
            style={{ color: "var(--color-text-muted)" }}
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
              <path d="M13.5 3.5l3 3L7 16H4v-3l9.5-9.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={() => onDeleteRequest(pixKey)}
            aria-label="Excluir chave"
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
    </div>
  );
}
