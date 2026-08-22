"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ToastProvider";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const { showToast } = useToast();

  const [status, setStatus] = useState<"checking" | "ready" | "invalid">("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setStatus(session ? "ready" : "invalid");
    });
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (error) {
      setError("Não foi possível atualizar a senha. Tente solicitar um novo link.");
      return;
    }

    showToast("✓ Senha atualizada");
    router.push("/");
    router.refresh();
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
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">Nova senha</h1>
        </div>

        <div
          className="rounded-2xl border p-6 shadow-xl"
          style={{ borderColor: "var(--color-border)", background: "var(--color-bg-elevated)" }}
        >
          {status === "checking" && (
            <p className="text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
              Verificando o link…
            </p>
          )}

          {status === "invalid" && (
            <div className="text-center">
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                Este link de recuperação é inválido ou expirou.
              </p>
              <a
                href="/login"
                className="mt-4 inline-block text-sm font-medium transition hover:opacity-80"
                style={{ color: "var(--color-accent)" }}
              >
                Voltar para o login
              </a>
            </div>
          )}

          {status === "ready" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="mb-1.5 block text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
                  Nova senha
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2"
                  style={{ borderColor: "var(--color-border)", background: "var(--color-bg-inset)", color: "var(--color-text)" }}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
                  Confirmar nova senha
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2"
                  style={{ borderColor: "var(--color-border)", background: "var(--color-bg-inset)", color: "var(--color-text)" }}
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--color-danger-soft)", color: "var(--color-danger)" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg py-2.5 text-sm font-semibold transition disabled:opacity-60"
                style={{ background: "var(--color-accent)", color: "#062017" }}
              >
                {submitting ? "Salvando…" : "Salvar nova senha"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
