"use client";

import { useEffect, useRef, useState } from "react";
import type { Credential, CredentialCategory } from "@/lib/types";
import { CREDENTIAL_CATEGORIES } from "@/lib/credential-categories";
import { useToast } from "@/components/ToastProvider";
import { ConfirmDialog } from "@/components/ConfirmDialog";

type CredentialChanges = {
  service_name: string;
  login_identifier: string | null;
  password: string;
  notes: string | null;
  category: CredentialCategory;
};

interface CredentialItemProps {
  credential: Credential;
  onSaveEdit: (credential: Credential, changes: CredentialChanges) => void;
  onDeleteRequest: (credential: Credential) => void;
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const { showToast } = useToast();
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        showToast(`✓ ${label} copiado`);
      }}
      aria-label={`Copiar ${label.toLowerCase()}`}
      title={`Copiar ${label.toLowerCase()}`}
      className="shrink-0 rounded-lg p-1.5 transition hover:bg-white/5"
      style={{ color: "var(--color-text-muted)" }}
    >
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
        <rect x="7" y="7" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M13 7V5a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </button>
  );
}

export function CredentialItem({ credential, onSaveEdit, onDeleteRequest }: CredentialItemProps) {
  const [editing, setEditing] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [draftServiceName, setDraftServiceName] = useState(credential.service_name);
  const [draftLogin, setDraftLogin] = useState(credential.login_identifier ?? "");
  const [draftPassword, setDraftPassword] = useState(credential.password);
  const [draftNotes, setDraftNotes] = useState(credential.notes ?? "");
  const [draftCategory, setDraftCategory] = useState<CredentialCategory>(credential.category);
  const [showDraftPassword, setShowDraftPassword] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<CredentialChanges | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      nameRef.current?.focus();
      nameRef.current?.select();
    }
  }, [editing]);

  function startEditing() {
    setDraftServiceName(credential.service_name);
    setDraftLogin(credential.login_identifier ?? "");
    setDraftPassword(credential.password);
    setDraftNotes(credential.notes ?? "");
    setDraftCategory(credential.category);
    setEditing(true);
  }

  function requestSave() {
    const serviceName = draftServiceName.trim();
    const login = draftLogin.trim() || null;
    const password = draftPassword;
    const notes = draftNotes.trim() || null;
    if (!serviceName || !password) return;
    // Não salva direto — pede confirmação antes, pra evitar trocar a senha
    // sem querer com um clique acidental.
    setPendingChanges({ service_name: serviceName, login_identifier: login, password, notes, category: draftCategory });
  }

  function confirmSave() {
    if (!pendingChanges) return;
    onSaveEdit(credential, pendingChanges);
    setPendingChanges(null);
    setEditing(false);
  }

  function cancelEdit() {
    setEditing(false);
    setPendingChanges(null);
  }

  if (editing) {
    return (
      <>
        <div
          className="rounded-xl border px-3.5 py-3"
          style={{ borderColor: "var(--color-accent)", background: "var(--color-bg-elevated)" }}
        >
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              ref={nameRef}
              value={draftServiceName}
              onChange={(e) => setDraftServiceName(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && cancelEdit()}
              placeholder="Serviço ou site"
              className="min-w-0 flex-1 rounded-md border-0 bg-transparent text-[14px] outline-none"
              style={{ color: "var(--color-text)" }}
            />
            <input
              value={draftLogin}
              onChange={(e) => setDraftLogin(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && cancelEdit()}
              placeholder="E-mail ou usuário"
              className="min-w-0 flex-1 rounded-md border-0 bg-transparent text-[14px] outline-none"
              style={{ color: "var(--color-text-muted)" }}
            />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {CREDENTIAL_CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setDraftCategory(c.value)}
                className="rounded-full px-2.5 py-1 text-[11px] font-medium transition"
                style={{
                  background: draftCategory === c.value ? "var(--color-accent-soft)" : "transparent",
                  color: draftCategory === c.value ? "var(--color-accent)" : "var(--color-text-muted)",
                  border: `1px solid ${draftCategory === c.value ? "var(--color-accent)" : "var(--color-border)"}`,
                }}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="relative mt-2 flex items-center">
            <input
              value={draftPassword}
              onChange={(e) => setDraftPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && cancelEdit()}
              type={showDraftPassword ? "text" : "password"}
              placeholder="Senha"
              className="w-full min-w-0 rounded-md border-0 bg-transparent pr-8 text-[14px] outline-none font-[family-name:var(--font-mono)]"
              style={{ color: "var(--color-text)" }}
            />
            <button
              type="button"
              onClick={() => setShowDraftPassword((v) => !v)}
              aria-label={showDraftPassword ? "Ocultar senha" : "Mostrar senha"}
              className="absolute right-0 rounded p-1"
              style={{ color: "var(--color-text-faint)" }}
            >
              {showDraftPassword ? (
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
                  <path d="M3 10s2.7-5 7-5 7 5 7 5-2.7 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
                  <path d="M3 10s2.7-5 7-5c1.4 0 2.6.4 3.6 1M17 10s-2.7 5-7 5c-1.4 0-2.6-.4-3.6-1M3 3l14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>
          <textarea
            value={draftNotes}
            onChange={(e) => setDraftNotes(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && cancelEdit()}
            rows={2}
            placeholder="Observação opcional"
            className="mt-2 w-full resize-none rounded-md border-0 bg-transparent px-0 py-0.5 text-[12.5px] outline-none placeholder:text-[var(--color-text-faint)]"
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
              onClick={requestSave}
              className="rounded-lg px-2.5 py-1 text-xs font-semibold transition hover:opacity-90"
              style={{ background: "var(--color-accent)", color: "#062017" }}
            >
              Salvar
            </button>
          </div>
        </div>

        <ConfirmDialog
          open={!!pendingChanges}
          title="Confirmar alteração"
          description={`Tem certeza que deseja salvar as alterações em "${draftServiceName.trim() || credential.service_name}"? Isso vai substituir os dados salvos, incluindo a senha.`}
          confirmLabel="Confirmar"
          onConfirm={confirmSave}
          onCancel={() => setPendingChanges(null)}
        />
      </>
    );
  }

  return (
    <div
      className="group rounded-xl border px-3.5 py-3 transition"
      style={{ borderColor: "var(--color-border-soft)", background: "var(--color-bg-elevated)" }}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          onClick={startEditing}
          className="min-w-0 truncate text-left text-[15px] font-medium"
          style={{ color: "var(--color-text)" }}
          title="Clique para editar"
        >
          {credential.service_name}
        </button>
        <button
          onClick={() => onDeleteRequest(credential)}
          aria-label="Excluir credencial"
          className="shrink-0 rounded-lg p-1.5 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100 hover:bg-white/5"
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

      {credential.login_identifier && (
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="min-w-0 truncate text-[12.5px]" style={{ color: "var(--color-text-muted)" }}>
            {credential.login_identifier}
          </span>
          <CopyButton value={credential.login_identifier} label="E-mail" />
        </div>
      )}

      <div className="mt-1 flex items-center gap-1.5">
        <span
          className="min-w-0 flex-1 truncate font-[family-name:var(--font-mono)] text-[13px] tabular"
          style={{ color: "var(--color-text-muted)" }}
        >
          {revealed ? credential.password : "•".repeat(Math.min(credential.password.length, 14))}
        </span>
        <button
          onClick={() => setRevealed((v) => !v)}
          aria-label={revealed ? "Ocultar senha" : "Mostrar senha"}
          className="shrink-0 rounded-lg p-1.5 transition hover:bg-white/5"
          style={{ color: "var(--color-text-muted)" }}
        >
          {revealed ? (
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
              <path d="M3 10s2.7-5 7-5c1.4 0 2.6.4 3.6 1M17 10s-2.7 5-7 5c-1.4 0-2.6-.4-3.6-1M3 3l14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
              <path d="M3 10s2.7-5 7-5 7 5 7 5-2.7 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          )}
        </button>
        <CopyButton value={credential.password} label="Senha" />
      </div>

      {credential.notes && (
        <p className="mt-1.5 text-[12px]" style={{ color: "var(--color-text-faint)" }}>
          {credential.notes}
        </p>
      )}
    </div>
  );
}
