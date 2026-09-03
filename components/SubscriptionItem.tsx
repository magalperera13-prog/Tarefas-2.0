"use client";

import { useEffect, useRef, useState } from "react";
import type { Subscription, SubscriptionPayment } from "@/lib/types";
import { formatBRL } from "@/lib/format";
import { addOneMonthToDateString, formatDateBR } from "@/lib/date";

interface SubscriptionEditChanges {
  name: string;
  monthly_amount: number;
  due_day_label: string | null;
  observation: string | null;
  renewal_type: "fixed_day" | "payment_date";
}

interface SubscriptionItemProps {
  subscription: Subscription;
  isPaidInViewedMonth: boolean;
  viewedMonthPayment: SubscriptionPayment | null;
  mostRecentPaidDate: string | null;
  onToggleStatus: (subscription: Subscription) => void;
  onTogglePaid: (subscription: Subscription) => void;
  onSaveEdit: (
    subscription: Subscription,
    changes: SubscriptionEditChanges,
    paidDateForViewedMonth: string | null,
    paymentAmountForViewedMonth: number | null
  ) => void;
  onDeleteRequest: (subscription: Subscription) => void;
}

export function SubscriptionItem({
  subscription,
  isPaidInViewedMonth,
  viewedMonthPayment,
  mostRecentPaidDate,
  onToggleStatus,
  onTogglePaid,
  onSaveEdit,
  onDeleteRequest,
}: SubscriptionItemProps) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(subscription.name);
  const [draftAmount, setDraftAmount] = useState(String(subscription.monthly_amount).replace(".", ","));
  const [draftDueDay, setDraftDueDay] = useState(subscription.due_day_label ?? "");
  const [draftObservation, setDraftObservation] = useState(subscription.observation ?? "");
  const [draftRenewalType, setDraftRenewalType] = useState(subscription.renewal_type);
  const [draftPaidDate, setDraftPaidDate] = useState(viewedMonthPayment?.paid_date ?? "");
  const [draftPaymentAmount, setDraftPaymentAmount] = useState(
    String(viewedMonthPayment?.amount ?? subscription.monthly_amount).replace(".", ",")
  );
  const nameRef = useRef<HTMLInputElement>(null);
  const inactive = subscription.status === "inactive";
  const isPaymentBased = subscription.renewal_type === "payment_date";

  useEffect(() => {
    if (editing) {
      nameRef.current?.focus();
      nameRef.current?.select();
    }
  }, [editing]);

  function startEditing() {
    setDraftName(subscription.name);
    setDraftAmount(String(subscription.monthly_amount).replace(".", ","));
    setDraftDueDay(subscription.due_day_label ?? "");
    setDraftObservation(subscription.observation ?? "");
    setDraftRenewalType(subscription.renewal_type);
    setDraftPaidDate(viewedMonthPayment?.paid_date ?? "");
    setDraftPaymentAmount(String(viewedMonthPayment?.amount ?? subscription.monthly_amount).replace(".", ","));
    setEditing(true);
  }

  function commitEdit() {
    const name = draftName.trim();
    const amount = Number(draftAmount.replace(",", "."));
    const dueDay = draftDueDay.trim() || null;
    const observation = draftObservation.trim() || null;
    const paymentAmount = Number(draftPaymentAmount.replace(",", "."));
    setEditing(false);
    if (!name || !(amount > 0)) {
      startEditing();
      return;
    }
    onSaveEdit(
      subscription,
      { name, monthly_amount: amount, due_day_label: dueDay, observation, renewal_type: draftRenewalType },
      draftPaidDate || null,
      draftPaidDate && paymentAmount > 0 ? paymentAmount : null
    );
  }

  function cancelEdit() {
    setEditing(false);
  }

  if (editing) {
    return (
      <div
        className="rounded-xl border px-3.5 py-3"
        style={{ borderColor: "var(--color-accent)", background: "var(--color-bg-elevated)" }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={nameRef}
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && cancelEdit()}
            placeholder="Nome"
            className="min-w-[8rem] flex-1 bg-transparent text-[15px] outline-none"
            style={{ color: "var(--color-text)" }}
          />
          <div className="flex items-center gap-1">
            <span className="text-[12px]" style={{ color: "var(--color-text-faint)" }}>
              R$
            </span>
            <input
              value={draftAmount}
              onChange={(e) => setDraftAmount(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && cancelEdit()}
              inputMode="decimal"
              className="w-16 bg-transparent text-right font-[family-name:var(--font-mono)] text-[13px] tabular outline-none"
              style={{ color: "var(--color-text)" }}
            />
          </div>
        </div>
        <p className="mt-0.5 text-[10.5px]" style={{ color: "var(--color-text-faint)" }}>
          Esse é o valor padrão da assinatura (usado como projeção mensal e como sugestão ao marcar como paga).
        </p>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px]" style={{ color: "var(--color-text-faint)" }}>
            Vencimento:
          </span>
          <button
            onClick={() => setDraftRenewalType("fixed_day")}
            className="rounded-full px-2.5 py-1 text-[11px] font-medium transition"
            style={{
              background: draftRenewalType === "fixed_day" ? "var(--color-accent-soft)" : "transparent",
              color: draftRenewalType === "fixed_day" ? "var(--color-accent)" : "var(--color-text-muted)",
              border: `1px solid ${draftRenewalType === "fixed_day" ? "var(--color-accent)" : "var(--color-border)"}`,
            }}
          >
            Dia fixo
          </button>
          <button
            onClick={() => setDraftRenewalType("payment_date")}
            className="rounded-full px-2.5 py-1 text-[11px] font-medium transition"
            style={{
              background: draftRenewalType === "payment_date" ? "var(--color-accent-soft)" : "transparent",
              color: draftRenewalType === "payment_date" ? "var(--color-accent)" : "var(--color-text-muted)",
              border: `1px solid ${draftRenewalType === "payment_date" ? "var(--color-accent)" : "var(--color-border)"}`,
            }}
          >
            Baseado no pagamento
          </button>
        </div>

        {draftRenewalType === "fixed_day" && (
          <input
            value={draftDueDay}
            onChange={(e) => setDraftDueDay(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && cancelEdit()}
            placeholder='Ex.: "Dia 05" ou "Dia 01-08"'
            className="mt-1.5 w-full rounded-md border-0 bg-transparent px-0 py-0.5 text-[12.5px] outline-none placeholder:text-[var(--color-text-faint)]"
            style={{ color: "var(--color-text-muted)" }}
          />
        )}

        <div className="mt-2 rounded-lg border px-2.5 py-2" style={{ borderColor: "var(--color-border-soft)" }}>
          <p className="mb-1.5 text-[10.5px] font-medium" style={{ color: "var(--color-text-faint)" }}>
            Pagamento deste mês (útil pra corrigir data/valor de fatura variável ou paga em atraso)
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px]" style={{ color: "var(--color-text-faint)" }}>
                Data:
              </span>
              <input
                type="date"
                value={draftPaidDate}
                onChange={(e) => setDraftPaidDate(e.target.value)}
                className="rounded-md border-0 bg-transparent text-[12.5px] outline-none"
                style={{ color: "var(--color-text-muted)" }}
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[11px]" style={{ color: "var(--color-text-faint)" }}>
                Valor pago:
              </span>
              <span className="text-[12px]" style={{ color: "var(--color-text-faint)" }}>
                R$
              </span>
              <input
                value={draftPaymentAmount}
                onChange={(e) => setDraftPaymentAmount(e.target.value)}
                inputMode="decimal"
                className="w-16 bg-transparent font-[family-name:var(--font-mono)] text-[12.5px] tabular outline-none"
                style={{ color: "var(--color-text-muted)" }}
              />
            </div>
            {draftPaidDate && (
              <button
                onClick={() => setDraftPaidDate("")}
                className="text-[11px] underline"
                style={{ color: "var(--color-text-faint)" }}
              >
                limpar
              </button>
            )}
          </div>
        </div>

        <textarea
          value={draftObservation}
          onChange={(e) => setDraftObservation(e.target.value)}
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

  const subtitle = isPaymentBased
    ? mostRecentPaidDate
      ? `Pago em ${formatDateBR(mostRecentPaidDate)} · próx. vencimento estimado: ${formatDateBR(addOneMonthToDateString(mostRecentPaidDate))}`
      : "Renova pelo pagamento — ainda sem pagamento registrado"
    : subscription.due_day_label
      ? `Vencimento: ${subscription.due_day_label}`
      : "Sem data de vencimento definida";

  return (
    <div
      className="group flex items-center gap-3 rounded-xl border px-3.5 py-3 transition"
      style={{
        borderColor: "var(--color-border-soft)",
        background: "var(--color-bg-elevated)",
        opacity: inactive ? 0.55 : 1,
      }}
    >
      <button
        onClick={() => onToggleStatus(subscription)}
        aria-label={inactive ? "Marcar como ativa" : "Marcar como inativa"}
        title={inactive ? "Inativa — clique para reativar" : "Ativa — clique para desativar"}
        className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold transition"
        style={{
          borderColor: inactive ? "var(--color-border)" : "var(--color-accent)",
          color: inactive ? "var(--color-text-faint)" : "var(--color-accent)",
        }}
      >
        {inactive ? "INATIVA" : "ATIVA"}
      </button>

      <div className="min-w-0 flex-1">
        <button
          onClick={startEditing}
          className="block max-w-full truncate text-left text-[15px] leading-tight"
          style={{ color: "var(--color-text)", textDecoration: inactive ? "line-through" : "none" }}
          title="Clique para editar"
        >
          {subscription.name}
        </button>
        <p className="mt-0.5 truncate text-[11px]" style={{ color: "var(--color-text-faint)" }}>
          {subtitle}
          {subscription.observation ? ` · ${subscription.observation}` : ""}
        </p>
      </div>

      <span
        className="hidden shrink-0 font-[family-name:var(--font-mono)] text-[13px] tabular sm:block"
        style={{ color: "var(--color-text)" }}
      >
        {formatBRL(viewedMonthPayment?.amount ?? subscription.monthly_amount)}
      </span>

      <button
        onClick={() => onTogglePaid(subscription)}
        disabled={inactive}
        className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition disabled:opacity-40"
        style={{
          background: isPaidInViewedMonth ? "var(--color-accent-soft)" : "var(--color-bg-inset)",
          color: isPaidInViewedMonth ? "var(--color-accent)" : "var(--color-text-muted)",
          border: `1px solid ${isPaidInViewedMonth ? "var(--color-accent)" : "var(--color-border)"}`,
        }}
      >
        {isPaidInViewedMonth ? "Pago" : "Pendente"}
      </button>

      <button
        onClick={() => onDeleteRequest(subscription)}
        aria-label="Excluir assinatura"
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
  );
}
