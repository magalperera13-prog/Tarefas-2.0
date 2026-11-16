import type { VibeforceQueueStatus } from "@/lib/types";

/** Abaixo (ou igual) a esse número de dias, mostramos o aviso e criamos a tarefa. */
export const VIBEFORCE_LOW_DAYS = 2;

/** Título fixo da tarefa automática — a checagem de duplicidade usa exatamente este texto. */
export const VIBEFORCE_TASK_TITLE = "VIDEOS VIBE FORCE ACABANDO";

export function isVibeforceQueueLow(status: VibeforceQueueStatus | null): status is VibeforceQueueStatus {
  return status !== null && status.dias_restantes <= VIBEFORCE_LOW_DAYS;
}

/** "Falta 1 dia" / "Faltam 2 dias" / "Faltam 0 dias". */
export function remainingDaysLabel(dias: number): string {
  return dias === 1 ? "Falta 1 dia" : `Faltam ${dias} dias`;
}

export function vibeforceTaskDescription(status: VibeforceQueueStatus): string {
  return `${remainingDaysLabel(status.dias_restantes)} — ${status.videos_prontos} vídeos prontos, ${status.cadencia_dia}/dia`;
}
