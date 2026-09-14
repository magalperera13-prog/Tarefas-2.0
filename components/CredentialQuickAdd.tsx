"use client";

import { useState } from "react";

export function CredentialQuickAdd({
  onAdd,
}: {
  onAdd: (serviceName: string, loginIdentifier: string | null, password: string) => Promise<void> | void;
}) {
  const [serviceName, setServiceName] = useState("");
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = serviceName.trim().length > 0 && password.length > 0 && !submitting;

  async function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    const name = serviceName.trim();
    const login = loginIdentifier.trim() || null;
    const pass = password;
    setServiceName("");
    setLoginIdentifier("");
    setPassword("");
    try {
      await onAdd(name, login, pass);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="flex flex-col gap-2 rounded-2xl border p-2.5 shadow-sm"
      style={{ borderColor: "var(--color-border)", background: "var(--color-bg-elevated)" }}
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={serviceName}
          onChange={(e) => setServiceName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Serviço ou site (ex.: Netflix)"
          className="min-w-0 flex-1 rounded-xl border bg-transparent px-2.5 py-2 text-[14px] outline-none placeholder:text-[var(--color-text-faint)]"
          style={{ borderColor: "var(--color-border)", background: "var(--color-bg-inset)" }}
        />
        <input
          value={loginIdentifier}
          onChange={(e) => setLoginIdentifier(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="E-mail ou usuário"
          className="min-w-0 flex-1 rounded-xl border bg-transparent px-2.5 py-2 text-[14px] outline-none placeholder:text-[var(--color-text-faint)]"
          style={{ borderColor: "var(--color-border)", background: "var(--color-bg-inset)" }}
        />
      </div>
      <div className="flex items-center gap-2">
        <div
          className="relative flex min-w-0 flex-1 items-center rounded-xl border"
          style={{ borderColor: "var(--color-border)", background: "var(--color-bg-inset)" }}
        >
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            type={showPassword ? "text" : "password"}
            placeholder="Senha"
            className="min-w-0 flex-1 bg-transparent px-2.5 py-2 pr-9 text-[14px] outline-none placeholder:text-[var(--color-text-faint)]"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            className="absolute right-2 rounded p-1 transition hover:opacity-80"
            style={{ color: "var(--color-text-faint)" }}
          >
            {showPassword ? (
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
        <button
          onClick={submit}
          disabled={!canSubmit}
          className="shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-40"
          style={{ background: "var(--color-brand)", color: "#fff8f3" }}
        >
          Adicionar
        </button>
      </div>
    </div>
  );
}
