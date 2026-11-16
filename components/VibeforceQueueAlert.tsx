import type { VibeforceQueueStatus } from "@/lib/types";
import { isVibeforceQueueLow, remainingDaysLabel } from "@/lib/vibeforce";

// Amarelo e preto: as cores da Vibe Force, para diferenciar do aviso de assinaturas.
const VIBEFORCE_YELLOW = "#facc15";
const VIBEFORCE_BLACK = "#0a0a0a";

export function VibeforceQueueAlert({ status }: { status: VibeforceQueueStatus | null }) {
  if (!isVibeforceQueueLow(status)) return null;

  return (
    <div
      className="mb-5 rounded-xl border px-4 py-3"
      style={{ borderColor: VIBEFORCE_BLACK, background: VIBEFORCE_YELLOW, color: VIBEFORCE_BLACK }}
      role="status"
    >
      <p className="text-sm font-bold">
        ⚠️ {remainingDaysLabel(status.dias_restantes)} de vídeos da Vibe Force
      </p>
      <p className="mt-1 text-[13px] font-medium" style={{ opacity: 0.75 }}>
        {status.videos_prontos} prontos, {status.cadencia_dia}/dia
      </p>
    </div>
  );
}
