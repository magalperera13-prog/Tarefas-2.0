import Link from "next/link";
import { formatBRL } from "@/lib/format";
import type { DueSubscription } from "@/lib/subscriptions";

export function SubscriptionsDueAlert({ items }: { items: DueSubscription[] }) {
  if (items.length === 0) return null;

  return (
    <Link
      href="/subscriptions"
      className="mb-5 block rounded-xl border px-4 py-3 transition hover:opacity-90"
      style={{ borderColor: "var(--color-pending)", background: "var(--color-pending-soft)" }}
    >
      <p className="text-sm font-semibold" style={{ color: "var(--color-pending)" }}>
        {items.length === 1 ? "1 assinatura vencendo" : `${items.length} assinaturas vencendo`}
      </p>
      <ul className="mt-1.5 space-y-0.5">
        {items.slice(0, 5).map(({ subscription, daysUntil }) => (
          <li key={subscription.id} className="text-[13px]" style={{ color: "var(--color-text-muted)" }}>
            {subscription.name} · {formatBRL(subscription.monthly_amount)} ·{" "}
            {daysUntil < 0
              ? `atrasada há ${Math.abs(daysUntil)} dia${Math.abs(daysUntil) > 1 ? "s" : ""}`
              : daysUntil === 0
                ? "vence hoje"
                : `vence em ${daysUntil} dia${daysUntil > 1 ? "s" : ""}`}
          </li>
        ))}
      </ul>
    </Link>
  );
}
