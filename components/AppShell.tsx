"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TodayIcon, HistoryIcon, ExpensesIcon, SubscriptionsIcon, BalanceIcon, LogoutIcon } from "@/components/icons";

const NAV_ITEMS = [
  { href: "/", label: "Hoje", Icon: TodayIcon },
  { href: "/history", label: "Histórico", Icon: HistoryIcon },
  { href: "/expenses", label: "Gastos", Icon: ExpensesIcon },
  { href: "/subscriptions", label: "Assinaturas", Icon: SubscriptionsIcon },
  { href: "/balance", label: "Saldo", Icon: BalanceIcon },
];

export function AppShell({ userEmail, children }: { userEmail?: string | null; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

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

        <nav
          className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t px-1 pt-1.5 lg:hidden"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-bg-elevated)",
            paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))",
          }}
        >
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1 text-[10px] font-medium transition"
                style={{ color: active ? "var(--color-accent)" : "var(--color-text-muted)" }}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
