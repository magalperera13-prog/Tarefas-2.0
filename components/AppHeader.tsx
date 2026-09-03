"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AppHeader({ userEmail }: { userEmail?: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const tabs = [
    { href: "/", label: "Hoje" },
    { href: "/history", label: "Histórico" },
    { href: "/expenses", label: "Gastos" },
    { href: "/subscriptions", label: "Assinaturas" },
  ];

  return (
    <header className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center justify-between gap-2.5 sm:justify-start">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-semibold"
            style={{ borderColor: "var(--color-border)", background: "var(--color-bg-elevated)", color: "var(--color-accent)" }}
          >
            ✓
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">Minhas Tarefas</h1>
        </div>
        <button
          onClick={handleLogout}
          title={userEmail ?? "Sair"}
          aria-label="Sair da conta"
          className="rounded-full border p-2 transition hover:opacity-80 sm:hidden"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
            <path
              d="M8 4H5a1 1 0 00-1 1v10a1 1 0 001 1h3M13 13l3.5-3.5L13 6M16 9.5H7"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-1">
        <nav
          className="flex flex-1 items-center gap-0.5 overflow-x-auto rounded-full border p-0.5 sm:flex-none"
          style={{ borderColor: "var(--color-border)", background: "var(--color-bg-elevated)" }}
        >
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition sm:px-3.5"
                style={{
                  background: active ? "var(--color-accent)" : "transparent",
                  color: active ? "#062017" : "var(--color-text-muted)",
                }}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={handleLogout}
          title={userEmail ?? "Sair"}
          aria-label="Sair da conta"
          className="hidden shrink-0 rounded-full border p-2 transition hover:opacity-80 sm:block"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
            <path
              d="M8 4H5a1 1 0 00-1 1v10a1 1 0 001 1h3M13 13l3.5-3.5L13 6M16 9.5H7"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
