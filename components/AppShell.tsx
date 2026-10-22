"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  TodayIcon,
  HistoryIcon,
  ExpensesIcon,
  SubscriptionsIcon,
  BalanceIcon,
  PixIcon,
  FinanceIcon,
  FitnessIcon,
  MoreIcon,
  CredentialsIcon,
  LogoutIcon,
} from "@/components/icons";

// inBar: aparece direto na barra inferior do celular. As demais ficam no botão "Mais".
const NAV_ITEMS = [
  { href: "/", label: "Hoje", Icon: TodayIcon, inBar: true },
  { href: "/history", label: "Histórico", Icon: HistoryIcon, inBar: true },
  { href: "/expenses", label: "Gastos", Icon: ExpensesIcon, inBar: true },
  { href: "/finance", label: "Financeiro", Icon: FinanceIcon, inBar: true },
  { href: "/fitness", label: "Fitness", Icon: FitnessIcon, inBar: true },
  { href: "/subscriptions", label: "Assinaturas", Icon: SubscriptionsIcon, inBar: false },
  { href: "/balance", label: "Saldo", Icon: BalanceIcon, inBar: false },
  { href: "/pix", label: "Pix", Icon: PixIcon, inBar: false },
  { href: "/credentials", label: "Senhas", Icon: CredentialsIcon, inBar: false },
];

const BAR_ITEMS = NAV_ITEMS.filter((i) => i.inBar);
const MORE_ITEMS = NAV_ITEMS.filter((i) => !i.inBar);

export function AppShell({ userEmail, children }: { userEmail?: string | null; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = MORE_ITEMS.some((i) => i.href === pathname);

  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moreOpen]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-dvh lg:flex">
      <aside
        className="hidden w-60 shrink-0 flex-col border-r px-4 py-6 lg:flex"
        style={{ borderColor: "var(--color-border)", background: "var(--color-bg-elevated)" }}
      >
        <div className="mb-8 flex items-center gap-2.5 px-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-semibold"
            style={{ borderColor: "var(--color-border)", background: "var(--color-bg-inset)", color: "var(--color-accent)" }}
          >
            ✓
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-base font-semibold tracking-tight">Minhas Tarefas</h1>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition"
                style={{
                  background: active ? "var(--color-accent-soft)" : "transparent",
                  color: active ? "var(--color-accent)" : "var(--color-text-muted)",
                }}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          title={userEmail ?? "Sair"}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-white/5"
          style={{ color: "var(--color-text-muted)" }}
        >
          <LogoutIcon className="h-[18px] w-[18px] shrink-0" />
          Sair
        </button>
      </aside>

      <div className="flex-1">
        <div
          className="flex items-center justify-between border-b px-4 py-3 lg:hidden"
          style={{ borderColor: "var(--color-border)", background: "var(--color-bg-elevated)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-semibold"
              style={{ borderColor: "var(--color-border)", background: "var(--color-bg-inset)", color: "var(--color-accent)" }}
            >
              ✓
            </div>
            <span className="font-[family-name:var(--font-display)] text-[15px] font-semibold tracking-tight">
              Minhas Tarefas
            </span>
          </div>
          <button
            onClick={handleLogout}
            aria-label="Sair da conta"
            title={userEmail ?? "Sair"}
            className="rounded-full border p-2 transition hover:opacity-80"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
          >
            <LogoutIcon className="h-4 w-4" />
          </button>
        </div>

        <main className="mx-auto max-w-3xl px-4 pb-24 pt-6 sm:px-6 sm:pt-10 lg:pb-10">{children}</main>

        {moreOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setMoreOpen(false)}
            aria-hidden="true"
          />
        )}

        <nav
          className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t px-1 pt-1.5 lg:hidden"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-bg-elevated)",
            paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))",
          }}
        >
          {moreOpen && (
            <div
              className="absolute inset-x-0 bottom-full grid grid-cols-4 gap-1 rounded-t-2xl border-t px-3 pb-3 pt-3"
              style={{ borderColor: "var(--color-border)", background: "var(--color-bg-elevated)" }}
            >
              {MORE_ITEMS.map(({ href, label, Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMoreOpen(false)}
                    className="flex min-w-0 flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-medium transition"
                    style={{
                      color: active ? "var(--color-accent)" : "var(--color-text-muted)",
                      background: active ? "var(--color-accent-soft)" : "transparent",
                    }}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="max-w-full truncate">{label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {BAR_ITEMS.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMoreOpen(false)}
                className="flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg py-1 text-[10px] font-medium transition"
                style={{ color: active ? "var(--color-accent)" : "var(--color-text-muted)" }}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMoreOpen((open) => !open)}
            aria-expanded={moreOpen}
            aria-label="Mais abas"
            className="flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg py-1 text-[10px] font-medium transition"
            style={{ color: moreActive || moreOpen ? "var(--color-accent)" : "var(--color-text-muted)" }}
          >
            <MoreIcon className="h-5 w-5" />
            Mais
          </button>
        </nav>
      </div>
    </div>
  );
}
