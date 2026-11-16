import type { VibeforceQueueStatus } from "@/lib/types";
import { isVibeforceQueueLow, remainingDaysLabel } from "@/lib/vibeforce";

export function VibeforceQueueAlert({ status }: { status: VibeforceQueueStatus | null }) {
  if (!isVibeforceQueueLow(status)) return null;

  return (
    <div
      className="mb-5 rounded-xl border px-4 py-3"
      style={{ borderColor: "var(--color-pending)", background: "var(--color-pending-soft)" }}
      role="status"
    >
      <p className="text-sm font-semibold" style={{ color: "var(--color-pending)" }}>
        ⚠️ {remainingDaysLabel(status.dias_restantes)} de vídeos da Vibe Force
      </p>
      <p className="mt-1 text-[13px]" style={{ color: "var(--color-text-muted)" }}>
        {status.videos_prontos} prontos, {status.cadencia_dia}/dia
      </p>
    </div>
  );
}
