"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const searchParams = useSearchParams();
  const unauthorized = searchParams.get("error") === "unauthorized";

  const [view, setView] = useState<"signin" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/");
      router.refresh();
    } catch {
      // Mensagem genérica: não confirma se o e-mail existe ou se foi a senha que errou.
      setError("E-mail ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setInfo("Se esse e-mail estiver cadastrado, um link de recuperação foi enviado.");
    } catch {
      setInfo("Se esse e-mail estiver cadastrado, um link de recuperação foi enviado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div
            className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl border text-lg font-semibold"
            style={{ borderColor: "var(--color-border)", background: "var(--color-bg-elevated)", color: "var(--color-accent)" }}
          >
            ✓
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
            Minhas Tarefas
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: "var(--color-text-muted)" }}>
            {view === "signin" ? "Entre na sua conta para continuar." : "Digite seu e-mail para recuperar o acesso."}
          </p>
        </div>

        <form
          onSubmit={view === "signin" ? handleSignIn : handleForgotPassword}
          className="rounded-2xl border p-6 shadow-xl"
          style={{ borderColor: "var(--color-border)", background: "var(--color-bg-elevated)" }}
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2"
                style={{ borderColor: "var(--color-border)", background: "var(--color-bg-inset)", color: "var(--color-text)" }}
                placeholder="voce@exemplo.com"
              />
            </div>

            {view === "signin" && (
              <div>
                <label htmlFor="password" className="mb-1.5 block text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2.5 pr-10 text-sm outline-none transition focus:ring-2"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-bg-inset)", color: "var(--color-text)" }}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 transition hover:opacity-80"
                    style={{ color: "var(--color-text-faint)" }}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
                        <path
                          d="M3 10s2.7-5 7-5 7 5 7 5-2.7 5-7 5-7-5-7-5z"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.4" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
                        <path
                          d="M3 10s2.7-5 7-5c1.4 0 2.6.4 3.6 1M17 10s-2.7 5-7 5c-1.4 0-2.6-.4-3.6-1M3 3l14 14"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {unauthorized && view === "signin" && (
            <p className="mt-4 rounded-lg px-3 py-2 text-sm" style={{ background: "var(--color-danger-soft)", color: "var(--color-danger)" }}>
              Este acesso não está autorizado.
            </p>
          )}
          {error && (
            <p className="mt-4 rounded-lg px-3 py-2 text-sm" style={{ background: "var(--color-danger-soft)", color: "var(--color-danger)" }}>
              {error}
            </p>
          )}
          {info && (
            <p className="mt-4 rounded-lg px-3 py-2 text-sm" style={{ background: "var(--color-accent-soft)", color: "var(--color-accent)" }}>
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-lg py-2.5 text-sm font-semibold transition disabled:opacity-60"
            style={{ background: "var(--color-accent)", color: "#062017" }}
          >
            {loading ? "Aguarde…" : view === "signin" ? "Entrar" : "Enviar link de recuperação"}
          </button>

          <button
            type="button"
            onClick={() => {
              setView(view === "signin" ? "forgot" : "signin");
              setError(null);
              setInfo(null);
            }}
            className="mt-3 w-full text-center text-xs transition hover:opacity-80"
            style={{ color: "var(--color-text-muted)" }}
          >
            {view === "signin" ? "Esqueci minha senha" : "Voltar para o login"}
          </button>
        </form>
      </div>
    </div>
  );
}
